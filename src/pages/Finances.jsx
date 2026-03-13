import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Edit2, CheckCircle, Loader2, DollarSign, Download, FileText, Receipt, TrendingDown, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"
import { supabase, logActivity } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Modal from "../components/Modal"
import ConfirmModal from "../components/ConfirmModal"
import { generateInvoicePDF } from "../components/InvoicePDF"
import PageError from "../components/PageError"
import { LimitBanner } from "../components/UpgradePrompt"
import { isAtLimit, normalizePlan } from "../lib/plans"

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const emptyInvoiceForm = {
  client_name: "",
  client_email: "",
  description: "",
  amount: "",
  status: "draft",
  due_date: "",
}

const emptyExpenseForm = {
  description: "",
  amount: "",
  date: "",
  category: "other",
  notes: "",
}

const statusBadge = {
  paid: "badge-forest",
  pending: "badge-gold",
  overdue: "badge-rose",
  draft: "badge-grey",
}

const categoryLabels = {
  materials: "Materials",
  studio: "Studio",
  shipping: "Shipping",
  marketing: "Marketing",
  travel: "Travel",
  equipment: "Equipment",
  insurance: "Insurance",
  fees: "Fees",
  other: "Other",
}

const categoryColors = {
  materials: "#B5651D",
  studio: "#2D4A35",
  shipping: "#4A7C8B",
  marketing: "#7B5EA7",
  travel: "#C4705A",
  equipment: "#D4A843",
  insurance: "#5A8F7B",
  fees: "#8B6F4E",
  other: "#A89F94",
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatCurrency(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return "$0.00"
  return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return "--"
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function Finances() {
  const { user } = useAuth()
  const [tab, setTab] = useState("invoices")
  const [invoiceList, setInvoiceList] = useState([])
  const [expenseList, setExpenseList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm)
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [confirmType, setConfirmType] = useState("invoice")
  const [artistProfile, setArtistProfile] = useState({})
  const [expenseFilter, setExpenseFilter] = useState("all")
  const [fetchError, setFetchError] = useState(false)

  /* ---- fetch all data ---- */
  const fetchData = useCallback(async () => {
    if (!user?.id) return
    setFetchError(false)
    try {
      const [invRes, expRes, profileRes] = await Promise.all([
        supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("profiles").select("name, location, email").eq("id", user.id).single(),
      ])

      if (invRes.error) throw invRes.error
      if (invRes.data) setInvoiceList(invRes.data)
      if (!expRes.error && expRes.data) setExpenseList(expRes.data)
      if (profileRes.data) setArtistProfile(profileRes.data)
    } catch (err) {
      console.error("[Finances] fetch error:", err)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  /* ============================================================ */
  /*  COMPUTED STATS                                               */
  /* ============================================================ */
  const totalRevenue = invoiceList.filter(i => i.status === "paid").reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const pendingAmount = invoiceList.filter(i => i.status === "pending").reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const totalExpenses = expenseList.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const netProfit = totalRevenue - totalExpenses
  const overdueCount = invoiceList.filter(i => i.status === "overdue").length

  /* ---- expense breakdown by category ---- */
  const expenseByCategory = expenseList.reduce((acc, e) => {
    const cat = e.category || "other"
    acc[cat] = (acc[cat] || 0) + (parseFloat(e.amount) || 0)
    return acc
  }, {})

  const filteredExpenses = expenseFilter === "all"
    ? expenseList
    : expenseList.filter(e => e.category === expenseFilter)

  /* ============================================================ */
  /*  INVOICE CRUD                                                 */
  /* ============================================================ */
  const openCreateInvoice = () => { setEditingId(null); setInvoiceForm(emptyInvoiceForm); setTab("invoices"); setModalOpen(true) }
  const openEditInvoice = (inv) => {
    setEditingId(inv.id)
    setInvoiceForm({
      client_name: inv.client_name || "",
      client_email: inv.client_email || "",
      description: inv.description || "",
      amount: inv.amount != null ? String(inv.amount) : "",
      status: inv.status || "draft",
      due_date: inv.due_date || "",
    })
    setModalOpen(true)
  }

  const handleSaveInvoice = async () => {
    if (!invoiceForm.client_name.trim() || !invoiceForm.amount) return
    setSubmitting(true)
    try {
      const record = {
        client_name: invoiceForm.client_name.trim(),
        client_email: invoiceForm.client_email.trim() || null,
        description: invoiceForm.description.trim(),
        amount: parseFloat(invoiceForm.amount) || 0,
        status: invoiceForm.status,
        due_date: invoiceForm.due_date || null,
      }
      if (editingId) {
        const { error } = await supabase.from("invoices").update(record).eq("id", editingId)
        if (error) throw error
        await logActivity(user.id, "invoice", `Updated invoice for ${record.client_name}`)
      } else {
        const { error } = await supabase.from("invoices").insert({ ...record, user_id: user.id })
        if (error) throw error
        await logActivity(user.id, "invoice", `Created invoice for ${record.client_name}`)
      }
      closeModal()
      await fetchData()
      toast.success(editingId ? "Invoice updated!" : "Invoice created!")
    } catch (err) {
      toast.error("Failed to save invoice: " + (err.message || "Unknown error"))
    } finally { setSubmitting(false) }
  }

  const handleMarkPaid = async (id) => {
    try {
      const { error } = await supabase.from("invoices").update({ status: "paid", paid_date: new Date().toISOString().split("T")[0] }).eq("id", id)
      if (error) throw error
      const inv = invoiceList.find(i => i.id === id)
      await logActivity(user.id, "invoice", `Marked invoice for ${inv?.client_name || "client"} as paid`)
      await fetchData()
      toast.success("Invoice marked as paid!")
    } catch (err) { toast.error("Failed to mark as paid") }
  }

  const handleExportCSV = () => {
    if (invoiceList.length === 0) return toast.error("No invoices to export")
    const headers = ["Client", "Description", "Amount", "Due Date", "Status", "Paid Date"]
    const rows = invoiceList.map(inv => [
      `"${(inv.client_name || "").replace(/"/g, '""')}"`,
      `"${(inv.description || "").replace(/"/g, '""')}"`,
      inv.amount || 0, inv.due_date || "", inv.status || "", inv.paid_date || "",
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success("Invoices exported!")
  }

  /* ============================================================ */
  /*  EXPENSE CRUD                                                 */
  /* ============================================================ */
  const openCreateExpense = () => { setEditingId(null); setExpenseForm(emptyExpenseForm); setTab("expenses"); setModalOpen(true) }
  const openEditExpense = (exp) => {
    setEditingId(exp.id)
    setExpenseForm({
      description: exp.description || "",
      amount: exp.amount != null ? String(exp.amount) : "",
      date: exp.date || "",
      category: exp.category || "other",
      notes: exp.notes || "",
    })
    setModalOpen(true)
  }

  const handleSaveExpense = async () => {
    if (!expenseForm.description.trim() || !expenseForm.amount) return
    setSubmitting(true)
    try {
      const record = {
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount) || 0,
        date: expenseForm.date || null,
        category: expenseForm.category,
        notes: expenseForm.notes.trim(),
      }
      if (editingId) {
        const { error } = await supabase.from("expenses").update(record).eq("id", editingId)
        if (error) throw error
        await logActivity(user.id, "expense", `Updated expense: ${record.description}`)
      } else {
        const { error } = await supabase.from("expenses").insert({ ...record, user_id: user.id })
        if (error) throw error
        await logActivity(user.id, "expense", `Added expense: ${record.description}`)
      }
      closeModal()
      await fetchData()
      toast.success(editingId ? "Expense updated!" : "Expense added!")
    } catch (err) {
      toast.error("Failed to save expense: " + (err.message || "Unknown error"))
    } finally { setSubmitting(false) }
  }

  const handleExportExpenseCSV = () => {
    if (expenseList.length === 0) return toast.error("No expenses to export")
    const headers = ["Description", "Amount", "Date", "Category", "Notes"]
    const rows = expenseList.map(e => [
      `"${(e.description || "").replace(/"/g, '""')}"`,
      e.amount || 0, e.date || "", e.category || "", `"${(e.notes || "").replace(/"/g, '""')}"`,
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success("Expenses exported!")
  }

  /* ============================================================ */
  /*  SHARED                                                       */
  /* ============================================================ */
  const closeModal = () => { setModalOpen(false); setEditingId(null); setInvoiceForm(emptyInvoiceForm); setExpenseForm(emptyExpenseForm) }

  const handleDelete = (item, type) => { setConfirmTarget(item); setConfirmType(type) }

  const handleConfirmDelete = async () => {
    const item = confirmTarget
    const type = confirmType
    setConfirmTarget(null)
    try {
      const table = type === "invoice" ? "invoices" : "expenses"
      const { error } = await supabase.from(table).delete().eq("id", item.id)
      if (error) throw error
      if (type === "invoice") {
        setInvoiceList(prev => prev.filter(i => i.id !== item.id))
        await logActivity(user.id, "invoice", `Deleted invoice for ${item.client_name}`)
      } else {
        setExpenseList(prev => prev.filter(e => e.id !== item.id))
        await logActivity(user.id, "expense", `Deleted expense: ${item.description}`)
      }
      toast.success(`${type === "invoice" ? "Invoice" : "Expense"} deleted!`)
    } catch (err) {
      toast.error("Failed to delete")
    }
  }

  /* ============================================================ */
  /*  STATS                                                        */
  /* ============================================================ */
  const stats = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), delta: `${invoiceList.filter(i => i.status === "paid").length} paid invoices`, up: true, icon: <DollarSign size={18} />, variant: "copper" },
    { label: "Total Expenses", value: formatCurrency(totalExpenses), delta: `${expenseList.length} transactions`, up: false, icon: <TrendingDown size={18} />, variant: "rose" },
    { label: "Net Profit", value: formatCurrency(netProfit), delta: netProfit >= 0 ? "Positive cash flow" : "Negative cash flow", up: netProfit >= 0, icon: <DollarSign size={18} />, variant: netProfit >= 0 ? "forest" : "rose" },
    { label: "Pending", value: formatCurrency(pendingAmount), delta: overdueCount > 0 ? `${overdueCount} overdue` : "All clear", up: overdueCount === 0, icon: <Receipt size={18} />, variant: "gold" },
  ]

  if (fetchError && !loading) {
    return <PageError message="Could not load your financial data. Please check your connection and try again." onRetry={() => { setLoading(true); fetchData() }} />
  }

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.up ? "up" : "down"}`}>{s.delta}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Overdue invoices banner */}
      {overdueCount > 0 && (
        <div className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          style={{ background: "#FFF0ED", border: "1px solid #F0B5A5" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#F5E2DC" }}>
            <AlertTriangle size={18} style={{ color: "#C4705A" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>
              {overdueCount} overdue invoice{overdueCount > 1 ? "s" : ""} totaling {formatCurrency(
                invoiceList.filter(i => i.status === "overdue").reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
              )}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>
              Send reminders to collect outstanding payments
            </p>
          </div>
          <button
            onClick={async () => {
              const overdue = invoiceList.filter(i => i.status === "overdue")
              let sent = 0
              for (const inv of overdue) {
                if (!inv.client_email) {
                  toast(`No email for ${inv.client_name} — skipped`, { icon: "⚠️" })
                  continue
                }
                try {
                  const { error } = await supabase.functions.invoke("send-email", {
                    body: {
                      to: inv.client_email,
                      type: "invoice_reminder",
                      data: {
                        artistName: user?.name || "ArtistOS",
                        description: inv.description || "Art Commission",
                        amount: String(Number(inv.amount).toLocaleString()),
                        dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "",
                      },
                    },
                  })
                  if (error) throw error
                  sent++
                } catch {
                  toast.error(`Failed to email ${inv.client_name}`)
                }
              }
              if (sent > 0) {
                toast.success(`Sent ${sent} reminder${sent > 1 ? "s" : ""} successfully`)
                await logActivity(user?.id, "invoice", `Sent ${sent} overdue invoice reminder${sent > 1 ? "s" : ""}`)
              } else if (overdue.every(i => !i.client_email)) {
                toast("No client emails on file — add emails to invoices to send reminders", { icon: "📧" })
              }
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"
            style={{ background: "#C4705A", color: "white" }}
          >
            Send Reminders
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "#F2EDE6" }}>
        <button onClick={() => setTab("invoices")}
          className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
          style={{
            background: tab === "invoices" ? "white" : "transparent",
            color: tab === "invoices" ? "#0E0C0A" : "#A89F94",
            boxShadow: tab === "invoices" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}>
          Invoices ({invoiceList.length})
        </button>
        <button onClick={() => setTab("expenses")}
          className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
          style={{
            background: tab === "expenses" ? "white" : "transparent",
            color: tab === "expenses" ? "#0E0C0A" : "#A89F94",
            boxShadow: tab === "expenses" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}>
          Expenses ({expenseList.length})
        </button>
      </div>

      {/* Plan limit banner (invoices) */}
      {tab === "invoices" && <LimitBanner resource="invoices" currentCount={invoiceList.length} label="invoices" />}

      {/* ============================================================ */}
      {/*  INVOICES TAB                                                */}
      {/* ============================================================ */}
      {tab === "invoices" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Invoices</div>
            <div className="flex gap-2">
              <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={handleExportCSV}>
                <Download size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Export CSV
              </button>
              <button className="btn-copper" style={{ fontSize: 12, padding: "6px 14px" }} onClick={openCreateInvoice}>
                <Plus size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> New Invoice
              </button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "#B5651D" }} />
                  <p className="text-sm" style={{ color: "#A89F94" }}>Loading invoices...</p>
                </div>
              </div>
            )}

            {!loading && invoiceList.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <DollarSign size={32} style={{ color: "#A89F94", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>No invoices yet</p>
                <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>Create your first invoice to start tracking revenue</p>
                <button className="btn-copper" style={{ marginTop: 16 }} onClick={openCreateInvoice}>
                  <Plus size={15} style={{ marginRight: 4, verticalAlign: "middle" }} /> Create First Invoice
                </button>
              </div>
            )}

            {!loading && invoiceList.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Client</th><th>Description</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {invoiceList.map(inv => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{inv.client_name}</td>
                        <td style={{ color: "#A89F94" }}>{inv.description || "--"}</td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, whiteSpace: "nowrap" }}>{formatCurrency(inv.amount)}</td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, whiteSpace: "nowrap", color: "#A89F94" }}>{formatDate(inv.due_date)}</td>
                        <td><span className={`badge ${statusBadge[inv.status] || "badge-grey"}`}>{inv.status}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button onClick={() => generateInvoicePDF({ invoice: inv, artistName: artistProfile.name, artistLocation: artistProfile.location, artistEmail: artistProfile.email || user?.email })}
                              title="Download PDF" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "#B5651D"} onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                              <FileText size={15} />
                            </button>
                            <button onClick={() => openEditInvoice(inv)} title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "#B5651D"} onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                              <Edit2 size={15} />
                            </button>
                            {(inv.status === "pending" || inv.status === "overdue") && (
                              <button onClick={() => handleMarkPaid(inv.id)} title="Mark as Paid" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#2D4A35"} onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                                <CheckCircle size={15} />
                              </button>
                            )}
                            <button onClick={() => handleDelete(inv, "invoice")} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "#C4705A"} onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  EXPENSES TAB                                                */}
      {/* ============================================================ */}
      {tab === "expenses" && (
        <>
          {/* Category breakdown */}
          {Object.keys(expenseByCategory).length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Expense Breakdown</div>
              </div>
              <div className="card-body">
                <div className="space-y-2">
                  {Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: categoryColors[cat] || "#A89F94" }} />
                      <span className="text-xs font-medium flex-1" style={{ color: "#0E0C0A" }}>{categoryLabels[cat] || cat}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#F2EDE6", maxWidth: 200 }}>
                        <div className="h-full rounded-full" style={{
                          width: `${totalExpenses > 0 ? (amount / totalExpenses * 100) : 0}%`,
                          background: categoryColors[cat] || "#A89F94",
                        }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: "#A89F94", fontFamily: "'DM Mono', monospace" }}>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expenses table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Expenses</div>
              <div className="flex gap-2">
                <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={handleExportExpenseCSV}>
                  <Download size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Export CSV
                </button>
                <button className="btn-copper" style={{ fontSize: 12, padding: "6px 14px" }} onClick={openCreateExpense}>
                  <Plus size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Add Expense
                </button>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              <button onClick={() => setExpenseFilter("all")} className={"filter-pill" + (expenseFilter === "all" ? " active" : "")}>
                All ({expenseList.length})
              </button>
              {Object.keys(categoryLabels).map(cat => {
                const count = expenseList.filter(e => e.category === cat).length
                if (count === 0) return null
                return (
                  <button key={cat} onClick={() => setExpenseFilter(cat)}
                    className={"filter-pill" + (expenseFilter === cat ? " active" : "")}>
                    {categoryLabels[cat]} ({count})
                  </button>
                )
              })}
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "#B5651D" }} />
                    <p className="text-sm" style={{ color: "#A89F94" }}>Loading expenses...</p>
                  </div>
                </div>
              )}

              {!loading && expenseList.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 24px" }}>
                  <Receipt size={32} style={{ color: "#A89F94", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>No expenses yet</p>
                  <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>Track your art business expenses for tax time</p>
                  <button className="btn-copper" style={{ marginTop: 16 }} onClick={openCreateExpense}>
                    <Plus size={15} style={{ marginRight: 4, verticalAlign: "middle" }} /> Add First Expense
                  </button>
                </div>
              )}

              {!loading && filteredExpenses.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Description</th><th>Amount</th><th>Date</th><th>Category</th><th>Notes</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map(exp => (
                        <tr key={exp.id}>
                          <td style={{ fontWeight: 500 }}>{exp.description}</td>
                          <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, whiteSpace: "nowrap", color: "#C4705A" }}>
                            -{formatCurrency(exp.amount)}
                          </td>
                          <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, whiteSpace: "nowrap", color: "#A89F94" }}>{formatDate(exp.date)}</td>
                          <td>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: "#F2EDE6", color: categoryColors[exp.category] || "#A89F94" }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColors[exp.category] || "#A89F94" }} />
                              {categoryLabels[exp.category] || exp.category}
                            </span>
                          </td>
                          <td style={{ color: "#A89F94", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.notes || "--"}</td>
                          <td>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button onClick={() => openEditExpense(exp)} title="Edit"
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#B5651D"} onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                                <Edit2 size={15} />
                              </button>
                              <button onClick={() => handleDelete(exp, "expense")} title="Delete"
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.color = "#C4705A"} onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/*  INVOICE MODAL                                               */}
      {/* ============================================================ */}
      {tab === "invoices" && (
        <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Edit Invoice" : "New Invoice"}>
          <div className="space-y-4">
            <div>
              <label className="form-label">Client Name</label>
              <input className="form-input" placeholder="e.g. Sarah Mitchell" value={invoiceForm.client_name}
                onChange={e => setInvoiceForm({ ...invoiceForm, client_name: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Client Email <span className="text-xs font-normal" style={{ color: "#A89F94" }}>(for reminders)</span></label>
              <input className="form-input" type="email" placeholder="e.g. sarah@example.com" value={invoiceForm.client_email}
                onChange={e => setInvoiceForm({ ...invoiceForm, client_email: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="e.g. Portrait Commission - Oil on Canvas" value={invoiceForm.description}
                onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Amount (USD)</label>
                <input className="form-input" type="number" step="0.01" min="0" placeholder="2400.00" value={invoiceForm.amount}
                  onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={invoiceForm.due_date}
                  onChange={e => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-select" value={invoiceForm.status}
                onChange={e => setInvoiceForm({ ...invoiceForm, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleSaveInvoice}
                disabled={submitting || !invoiceForm.client_name.trim() || !invoiceForm.amount}>
                {submitting ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editingId ? "Update Invoice" : "Create Invoice"}
              </button>
              <button className="btn-secondary flex-1" onClick={closeModal} disabled={submitting}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/*  EXPENSE MODAL                                               */}
      {/* ============================================================ */}
      {tab === "expenses" && (
        <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Edit Expense" : "Add Expense"}>
          <div className="space-y-4">
            <div>
              <label className="form-label">Description *</label>
              <input className="form-input" placeholder="e.g. Oil paints — cadmium set" value={expenseForm.description}
                onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Amount (USD) *</label>
                <input className="form-input" type="number" step="0.01" min="0" placeholder="189.50" value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={expenseForm.date}
                  onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-select" value={expenseForm.category}
                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} placeholder="Additional details..." value={expenseForm.notes}
                onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} style={{ resize: "none" }} />
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleSaveExpense}
                disabled={submitting || !expenseForm.description.trim() || !expenseForm.amount}>
                {submitting ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editingId ? "Update Expense" : "Add Expense"}
              </button>
              <button className="btn-secondary flex-1" onClick={closeModal} disabled={submitting}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${confirmType === "invoice" ? "Invoice" : "Expense"}?`}
        message={confirmType === "invoice"
          ? `Are you sure you want to delete the invoice for "${confirmTarget?.client_name}"? This cannot be undone.`
          : `Are you sure you want to delete "${confirmTarget?.description}"? This cannot be undone.`}
      />
    </div>
  )
}
