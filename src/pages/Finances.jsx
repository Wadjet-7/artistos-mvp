import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Edit2, CheckCircle, Loader2, DollarSign } from "lucide-react"
import toast from "react-hot-toast"
import { supabase, logActivity } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Modal from "../components/Modal"

const emptyForm = {
  client_name: "",
  description: "",
  amount: "",
  status: "draft",
  due_date: "",
}

const statusBadge = {
  paid: "badge-forest",
  pending: "badge-gold",
  overdue: "badge-rose",
  draft: "badge-grey",
}

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

export default function Finances() {
  const { user } = useAuth()
  const [invoiceList, setInvoiceList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)

  /* ---- fetch invoices from Supabase ---- */
  const fetchInvoices = useCallback(async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) setInvoiceList(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  /* ---- computed stats ---- */
  const totalRevenue = invoiceList
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)

  const pendingAmount = invoiceList
    .filter(inv => inv.status === "pending")
    .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)

  const overdueCount = invoiceList.filter(inv => inv.status === "overdue").length

  const totalInvoices = invoiceList.length

  const stats = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), delta: `${invoiceList.filter(i => i.status === "paid").length} paid invoices`, up: true, icon: <DollarSign size={18} />, variant: "copper" },
    { label: "Pending", value: formatCurrency(pendingAmount), delta: `${invoiceList.filter(i => i.status === "pending").length} awaiting payment`, up: true, icon: <DollarSign size={18} />, variant: "forest" },
    { label: "Overdue", value: `${overdueCount}`, delta: overdueCount === 0 ? "All clear" : `${overdueCount} need attention`, up: overdueCount === 0, icon: <DollarSign size={18} />, variant: "rose" },
    { label: "Total Invoices", value: `${totalInvoices}`, delta: `${invoiceList.filter(i => i.status === "draft").length} drafts`, up: true, icon: <DollarSign size={18} />, variant: "gold" },
  ]

  /* ---- open modal for create ---- */
  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  /* ---- open modal for edit ---- */
  const openEdit = (inv) => {
    setEditingId(inv.id)
    setForm({
      client_name: inv.client_name || "",
      description: inv.description || "",
      amount: inv.amount != null ? String(inv.amount) : "",
      status: inv.status || "draft",
      due_date: inv.due_date || "",
    })
    setModalOpen(true)
  }

  /* ---- close modal ---- */
  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  /* ---- save (create or update) ---- */
  const handleSave = async () => {
    if (!form.client_name.trim() || !form.amount) return
    setSubmitting(true)

    try {
      const record = {
        client_name: form.client_name.trim(),
        description: form.description.trim(),
        amount: parseFloat(form.amount) || 0,
        status: form.status,
        due_date: form.due_date || null,
      }

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("invoices")
          .update(record)
          .eq("id", editingId)

        if (error) throw error
        await logActivity(user.id, "invoice", `Updated invoice for ${record.client_name}`)
      } else {
        // Create new
        const { error } = await supabase
          .from("invoices")
          .insert({ ...record, user_id: user.id })

        if (error) throw error
        await logActivity(user.id, "invoice", `Created invoice for ${record.client_name}`)
      }

      closeModal()
      await fetchInvoices()
      toast.success(editingId ? "Invoice updated!" : "Invoice created!")
    } catch (err) {
      console.error("Failed to save invoice:", err)
      toast.error("Failed to save invoice: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- delete ---- */
  const handleDelete = async (inv) => {
    if (!window.confirm(`Delete invoice for "${inv.client_name}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", inv.id)

      if (error) throw error
      setInvoiceList(prev => prev.filter(i => i.id !== inv.id))
      await logActivity(user.id, "invoice", `Deleted invoice for ${inv.client_name}`)
      toast.success("Invoice deleted!")
    } catch (err) {
      console.error("Failed to delete invoice:", err)
      toast.error("Failed to delete invoice: " + (err.message || "Unknown error"))
    }
  }

  /* ---- mark paid shortcut ---- */
  const handleMarkPaid = async (id) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid", paid_date: new Date().toISOString().split("T")[0] })
        .eq("id", id)

      if (error) throw error

      const inv = invoiceList.find(i => i.id === id)
      await logActivity(user.id, "invoice", `Marked invoice for ${inv?.client_name || "client"} as paid`)
      await fetchInvoices()
      toast.success("Invoice marked as paid!")
    } catch (err) {
      console.error("Failed to mark as paid:", err)
      toast.error("Failed to mark as paid: " + (err.message || "Unknown error"))
    }
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

      {/* Invoices card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Invoices</div>
          <button className="btn-copper" style={{ fontSize: 12, padding: "6px 14px" }} onClick={openCreate}>
            <Plus size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
            New Invoice
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "#B5651D" }} />
                <p className="text-sm" style={{ color: "#A89F94" }}>Loading invoices...</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && invoiceList.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>
                <DollarSign size={32} style={{ color: "#A89F94", margin: "0 auto" }} />
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>No invoices yet</p>
              <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>Create your first invoice to start tracking your finances</p>
              <button className="btn-copper" style={{ marginTop: 16 }} onClick={openCreate}>
                <Plus size={15} style={{ marginRight: 4, verticalAlign: "middle" }} /> Create First Invoice
              </button>
            </div>
          )}

          {/* Invoice table */}
          {!loading && invoiceList.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceList.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{inv.client_name}</td>
                      <td style={{ color: "#A89F94" }}>{inv.description || "--"}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {formatCurrency(inv.amount)}
                      </td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, whiteSpace: "nowrap", color: "#A89F94" }}>
                        {formatDate(inv.due_date)}
                      </td>
                      <td>
                        <span className={`badge ${statusBadge[inv.status] || "badge-grey"}`}>{inv.status}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button
                            onClick={() => openEdit(inv)}
                            title="Edit"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#B5651D"}
                            onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                          >
                            <Edit2 size={15} />
                          </button>
                          {(inv.status === "pending" || inv.status === "overdue") && (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              title="Mark as Paid"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "#2D4A35"}
                              onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(inv)}
                            title="Delete"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#A89F94", transition: "color 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C4705A"}
                            onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                          >
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

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Edit Invoice" : "New Invoice"}>
        <div className="space-y-4">
          <div>
            <label className="form-label">Client Name</label>
            <input
              className="form-input"
              placeholder="e.g. Sarah Mitchell"
              value={form.client_name}
              onChange={e => setForm({ ...form, client_name: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <input
              className="form-input"
              placeholder="e.g. Portrait Commission - Oil on Canvas"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Amount (USD)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="2400.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Due Date</label>
              <input
                className="form-input"
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={handleSave}
              disabled={submitting || !form.client_name.trim() || !form.amount}
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Saving...</>
              ) : editingId ? (
                <>Update Invoice</>
              ) : (
                <>Create Invoice</>
              )}
            </button>
            <button className="btn-secondary flex-1" onClick={closeModal} disabled={submitting}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
