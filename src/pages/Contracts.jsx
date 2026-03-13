import { useState, useEffect, useCallback, useRef } from "react"
import { FileText, Send, Eye, Loader2, Trash2, Upload, Download, File, X } from "lucide-react"
import toast from "react-hot-toast"
import { supabase, logActivity } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import ConfirmModal from "../components/ConfirmModal"

/* ------------------------------------------------------------------ */
/*  Contract Generator — tabs: Create Contract | My Templates          */
/* ------------------------------------------------------------------ */
const templateOptions = [
  "Commission Agreement",
  "Consignment Agreement",
  "Licensing Agreement",
  "Direct Sale Agreement",
]

const paymentOptions = [
  "50% deposit, 50% on completion",
  "Full payment upfront",
  "3 equal installments",
  "Net 30 upon delivery",
]

const categoryOptions = ["General", "Commission", "Consignment", "Licensing", "Sale"]

const defaultForm = {
  template: "Commission Agreement",
  clientName: "",
  clientEmail: "",
  artworkTitle: "",
  price: "",
  paymentTerms: "50% deposit, 50% on completion",
  completionDate: "",
}

const defaultTemplateForm = {
  name: "",
  category: "General",
  description: "",
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1048576).toFixed(1) + " MB"
}

function formatDate(dateStr) {
  if (!dateStr) return "--"
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fileExtension(filename) {
  return filename?.split(".").pop()?.toLowerCase() || ""
}

export default function Contracts() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("create")

  /* ---------- Create Contract state ---------- */
  const [form, setForm] = useState(defaultForm)
  const [contractList, setContractList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)

  /* ---------- My Templates state ---------- */
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [templateFile, setTemplateFile] = useState(null)
  const [templateForm, setTemplateForm] = useState(defaultTemplateForm)
  const [uploadingTemplate, setUploadingTemplate] = useState(false)
  const [confirmTemplateTarget, setConfirmTemplateTarget] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  /* ---------- Contract form helpers ---------- */
  const displayDate = form.completionDate
    ? new Date(form.completionDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "___________"

  const displayPrice = form.price ? `$${Number(form.price).toLocaleString()}` : "$___"

  const depositText = (() => {
    const p = Number(form.price) || 0
    if (form.paymentTerms.startsWith("50%")) return `$${(p * 0.5).toLocaleString()} due upon signing, $${(p * 0.5).toLocaleString()} upon completion`
    if (form.paymentTerms.startsWith("Full")) return `${displayPrice} due upon signing`
    if (form.paymentTerms.startsWith("3 equal")) return `3 payments of $${Math.round(p / 3).toLocaleString()}`
    return `${displayPrice} due within 30 days of delivery`
  })()

  /* ---- Build the preview text (reused for saving + PDF) ---- */
  const buildPreviewText = () => {
    let text = `${form.template || "Commission Agreement"}\n\n`
    text += `This ${form.template || "Commission Agreement"} ("Agreement") is entered into between ${form.clientName || "___________"} ("Client") and ${user?.name || "Artist"} ("Artist").\n\n`
    text += `1. Commissioned Work. The Artist agrees to create the artwork titled "${form.artworkTitle || "___________"}" for the total price of ${displayPrice}.\n\n`
    text += `2. Payment Terms. ${form.paymentTerms}.`
    if (form.price) text += ` Specifically: ${depositText}.`
    text += `\n\n`
    text += `3. Completion Date. The Artist shall deliver the completed work on or before ${displayDate}.\n\n`
    text += `4. Rights & Usage. Upon full payment, the Client receives display rights. Reproduction rights remain with the Artist unless otherwise agreed.`
    if (form.clientEmail) {
      text += `\n\nA copy of this agreement will be sent to ${form.clientEmail} for electronic signature.`
    }
    return text
  }

  /* ================================================================ */
  /*  DATA FETCHING                                                    */
  /* ================================================================ */

  /* ---- Fetch contracts ---- */
  const fetchContracts = useCallback(async () => {
    if (!user?.id) return
    setLoadingData(true)
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (error) throw error
      setContractList(data || [])
    } catch (err) {
      console.error("Failed to fetch contracts:", err)
    } finally {
      setLoadingData(false)
    }
  }, [user?.id])

  /* ---- Fetch templates ---- */
  const fetchTemplates = useCallback(async () => {
    if (!user?.id) return
    setLoadingTemplates(true)
    try {
      const { data, error } = await supabase
        .from("contract_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        // Table may not exist yet — silently ignore
        setTemplates([])
        return
      }
      setTemplates(data || [])
    } catch (err) {
      setTemplates([])
    } finally {
      setLoadingTemplates(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchContracts()
    fetchTemplates()
  }, [fetchContracts, fetchTemplates])

  /* ================================================================ */
  /*  CONTRACT CRUD                                                    */
  /* ================================================================ */

  const handleSave = async () => {
    if (!user?.id) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from("contracts").insert({
        user_id: user.id,
        client_name: form.clientName,
        client_email: form.clientEmail,
        project_title: form.artworkTitle,
        contract_type: form.template,
        end_date: form.completionDate || null,
        value: form.price ? Number(form.price) : null,
        status: "draft",
        payment_terms: form.paymentTerms,
        terms_text: buildPreviewText(),
      })
      if (error) throw error
      await fetchContracts()
      setForm(defaultForm)
      await logActivity(user.id, "contract_created", `Created ${form.template} for ${form.clientName}`)
      toast.success("Contract created!")
    } catch (err) {
      console.error("Failed to save contract:", err)
      toast.error("Failed to save contract: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (contract) => setConfirmTarget(contract)

  const handleConfirmDelete = async () => {
    const contract = confirmTarget
    setConfirmTarget(null)
    try {
      const { error } = await supabase.from("contracts").delete().eq("id", contract.id)
      if (error) throw error
      await fetchContracts()
      await logActivity(user.id, "contract_deleted", `Deleted contract ${contract.id}`)
      toast.success("Contract deleted")
    } catch (err) {
      console.error("Failed to delete contract:", err)
      toast.error("Failed to delete: " + (err.message || "Unknown error"))
    }
  }

  /* ================================================================ */
  /*  PDF EXPORT                                                       */
  /* ================================================================ */

  const handlePreviewPDF = () => {
    const text = buildPreviewText()
    const paragraphs = text.split("\n\n").slice(1)
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast.error("Please allow pop-ups to preview PDF")
      return
    }
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${form.template} — ${form.clientName || "Contract"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500&display=swap');
    body { font-family: 'DM Sans', Georgia, serif; max-width: 680px; margin: 50px auto; padding: 0 24px; color: #333; line-height: 1.85; font-size: 14px; }
    h1 { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; border-bottom: 2px solid #B5651D; padding-bottom: 10px; color: #0E0C0A; margin-bottom: 24px; }
    p { margin: 14px 0; }
    .footer { margin-top: 80px; display: flex; justify-content: space-between; }
    .sig-block { text-align: center; }
    .sig-line { border-top: 1px solid #999; width: 220px; padding-top: 6px; font-size: 12px; color: #666; margin-top: 40px; }
    .date-line { font-size: 11px; color: #999; margin-top: 4px; }
    .header-meta { font-size: 12px; color: #A89F94; margin-bottom: 20px; }
    @media print { body { margin: 30px auto; } }
  </style>
</head>
<body>
  <h1>${form.template || "Commission Agreement"}</h1>
  <div class="header-meta">Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  ${paragraphs.map(p => `<p>${p}</p>`).join("")}
  <div class="footer">
    <div class="sig-block">
      <div class="sig-line">Client: ${form.clientName || "___________"}</div>
      <div class="date-line">Date: ___________</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Artist: ${user?.name || "___________"}</div>
      <div class="date-line">Date: ___________</div>
    </div>
  </div>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 400)
  }

  /* ================================================================ */
  /*  TEMPLATE UPLOAD                                                  */
  /* ================================================================ */

  const handleFileSelect = (file) => {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      toast.error("Please upload a PDF, DOCX, or TXT file")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File must be under 10 MB")
      return
    }
    setTemplateFile(file)
    // Auto-fill name from filename if empty
    if (!templateForm.name) {
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")
      setTemplateForm(prev => ({ ...prev, name: nameWithoutExt }))
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0])
    e.target.value = ""
  }

  const handleTemplateUpload = async () => {
    if (!user?.id || !templateFile || !templateForm.name.trim()) return
    setUploadingTemplate(true)

    try {
      const ext = fileExtension(templateFile.name)
      const fileName = `${user.id}/${Date.now()}.${ext}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("templates")
        .upload(fileName, templateFile, { contentType: templateFile.type })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("templates")
        .getPublicUrl(fileName)

      // Insert metadata
      const { error: dbError } = await supabase.from("contract_templates").insert({
        user_id: user.id,
        name: templateForm.name.trim(),
        category: templateForm.category,
        description: templateForm.description.trim() || null,
        file_url: urlData.publicUrl,
        file_type: ext.toUpperCase(),
        file_size: formatFileSize(templateFile.size),
      })

      if (dbError) throw dbError

      await fetchTemplates()
      setTemplateFile(null)
      setTemplateForm(defaultTemplateForm)
      await logActivity(user.id, "template_uploaded", `Uploaded template: ${templateForm.name}`)
      toast.success("Template uploaded!")
    } catch (err) {
      console.error("Failed to upload template:", err)
      toast.error("Upload failed: " + (err.message || "Unknown error"))
    } finally {
      setUploadingTemplate(false)
    }
  }

  const handleTemplateDelete = (tmpl) => setConfirmTemplateTarget(tmpl)

  const handleConfirmTemplateDelete = async () => {
    const tmpl = confirmTemplateTarget
    setConfirmTemplateTarget(null)
    try {
      // Delete from storage
      if (tmpl.file_url) {
        const path = tmpl.file_url.split("/templates/").pop()
        if (path) await supabase.storage.from("templates").remove([path])
      }
      // Delete from database
      const { error } = await supabase.from("contract_templates").delete().eq("id", tmpl.id)
      if (error) throw error
      await fetchTemplates()
      await logActivity(user.id, "template_deleted", `Deleted template: ${tmpl.name}`)
      toast.success("Template deleted")
    } catch (err) {
      console.error("Failed to delete template:", err)
      toast.error("Failed to delete: " + (err.message || "Unknown error"))
    }
  }

  /* ================================================================ */
  /*  HELPERS                                                          */
  /* ================================================================ */

  const statusBadge = (status) => {
    switch (status) {
      case "signed":    return "badge badge-forest"
      case "draft":     return "badge badge-grey"
      case "active":    return "badge badge-gold"
      case "completed": return "badge badge-copper"
      case "cancelled": return "badge badge-rose"
      default:          return "badge badge-grey"
    }
  }

  const categoryBadge = (cat) => {
    switch (cat) {
      case "Commission":  return "badge badge-copper"
      case "Consignment": return "badge badge-forest"
      case "Licensing":   return "badge badge-gold"
      case "Sale":        return "badge badge-rose"
      default:            return "badge badge-grey"
    }
  }

  const formatAmount = (value) => {
    if (value == null || value === "") return "—"
    return `$${Number(value).toLocaleString()}`
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "#0E0C0A" }}>Contract Generator</h1>
        <p style={{ fontSize: 13, color: "#A89F94", marginTop: 2 }}>Create, preview, and manage your contract templates</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#F2EDE6", width: "fit-content" }}>
        {[
          { key: "create", label: "Create Contract" },
          { key: "templates", label: "My Templates" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
            style={{
              background: activeTab === tab.key ? "white" : "transparent",
              color: activeTab === tab.key ? "#0E0C0A" : "#A89F94",
              boxShadow: activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  TAB 1: CREATE CONTRACT                                       */}
      {/* ============================================================ */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Create Contract Form */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: "#B5651D" }} />
                <span className="card-title">Create Contract</span>
              </div>
            </div>
            <div className="card-body space-y-5">
              {/* Template */}
              <div>
                <label className="form-label">Template</label>
                <select className="form-select" value={form.template} onChange={set("template")}>
                  {templateOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Client Name */}
              <div>
                <label className="form-label">Client Full Name</label>
                <input className="form-input" placeholder="Full name" value={form.clientName} onChange={set("clientName")} />
              </div>

              {/* Client Email */}
              <div>
                <label className="form-label">Client Email</label>
                <input className="form-input" type="email" placeholder="client@example.com" value={form.clientEmail} onChange={set("clientEmail")} />
              </div>

              {/* Artwork + Price side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Artwork Title</label>
                  <input className="form-input" placeholder="e.g. Solstice No. 3" value={form.artworkTitle} onChange={set("artworkTitle")} />
                </div>
                <div>
                  <label className="form-label">Price (USD)</label>
                  <input className="form-input" type="number" placeholder="2,400" value={form.price} onChange={set("price")} />
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="form-label">Payment Terms</label>
                <select className="form-select" value={form.paymentTerms} onChange={set("paymentTerms")}>
                  {paymentOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Completion Date */}
              <div>
                <label className="form-label">Completion Date</label>
                <input className="form-input" type="date" value={form.completionDate} onChange={set("completionDate")} />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1 justify-center" onClick={handlePreviewPDF}>
                  <Eye size={15} />
                  Preview PDF
                </button>
                <button
                  className="btn-copper flex-1 justify-center"
                  onClick={handleSave}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {submitting ? "Saving..." : "Send for Signing"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Contract Preview */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <Eye size={16} style={{ color: "#B5651D" }} />
                  <span className="card-title">Contract Preview</span>
                </div>
                <span className="badge badge-copper" style={{ fontSize: 10 }}>Live</span>
              </div>
              <div className="card-body">
                <div className="contract-preview">
                  <h4>{form.template || "Commission Agreement"}</h4>
                  <p>
                    This {form.template || "Commission Agreement"} ("Agreement") is entered into
                    between <span className="contract-field">{form.clientName || "___________"}</span>{" "}
                    ("Client") and <span className="contract-field">{user?.name || "Artist"}</span> ("Artist").
                  </p>
                  <p style={{ marginTop: 10 }}>
                    <strong>1. Commissioned Work.</strong> The Artist agrees to create the artwork
                    titled "<span className="contract-field">{form.artworkTitle || "___________"}</span>"{" "}
                    for the total price of <span className="contract-field">{displayPrice}</span>.
                  </p>
                  <p style={{ marginTop: 10 }}>
                    <strong>2. Payment Terms.</strong>{" "}
                    <span className="contract-field">{form.paymentTerms}</span>.{" "}
                    {form.price ? <>Specifically: {depositText}.</> : null}
                  </p>
                  <p style={{ marginTop: 10 }}>
                    <strong>3. Completion Date.</strong> The Artist shall deliver the completed work
                    on or before <span className="contract-field">{displayDate}</span>.
                  </p>
                  <p style={{ marginTop: 10 }}>
                    <strong>4. Rights & Usage.</strong> Upon full payment, the Client receives display
                    rights. Reproduction rights remain with the Artist unless otherwise agreed.
                  </p>
                  {form.clientEmail && (
                    <p style={{ marginTop: 10, fontSize: 11, color: "#A89F94" }}>
                      A copy of this agreement will be sent to <span className="contract-field">{form.clientEmail}</span> for electronic signature.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Contracts */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Contracts</span>
                <span style={{ fontSize: 12, color: "#A89F94", cursor: "pointer" }}>View all</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {loadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={20} className="animate-spin" style={{ color: "#B5651D" }} />
                    <span style={{ marginLeft: 8, fontSize: 13, color: "#A89F94" }}>Loading contracts...</span>
                  </div>
                ) : contractList.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <span style={{ fontSize: 13, color: "#A89F94" }}>No contracts yet. Create one above.</span>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Amount</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractList.map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 500 }}>{c.client_name}</td>
                          <td>{c.contract_type}</td>
                          <td><span className={statusBadge(c.status)}>{c.status}</span></td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>{formatAmount(c.value)}</td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => handleDelete(c)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                              title="Delete contract"
                            >
                              <Trash2 size={15} style={{ color: "#C27C7C" }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  TAB 2: MY TEMPLATES                                          */}
      {/* ============================================================ */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Upload Template */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Upload size={16} style={{ color: "#B5651D" }} />
                <span className="card-title">Upload Template</span>
              </div>
            </div>
            <div className="card-body space-y-5">
              {/* Drag & Drop Zone */}
              <div
                className="relative rounded-xl p-6 text-center cursor-pointer transition-colors"
                style={{
                  border: `2px dashed ${dragging ? "#B5651D" : "#E8E2DA"}`,
                  background: dragging ? "rgba(181,101,29,0.04)" : "#FAFAF8",
                }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                {templateFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <File size={24} style={{ color: "#B5651D" }} />
                    <div className="text-left">
                      <p className="text-[13px] font-medium" style={{ color: "#0E0C0A" }}>{templateFile.name}</p>
                      <p className="text-[11px]" style={{ color: "#A89F94" }}>{formatFileSize(templateFile.size)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTemplateFile(null) }}
                      className="p-1 rounded-full transition-colors"
                      style={{ color: "#A89F94" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C4705A"}
                      onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={28} style={{ color: "#A89F94", margin: "0 auto 8px" }} />
                    <p className="text-[13px] font-medium" style={{ color: "#0E0C0A" }}>
                      Drop a file here or <span style={{ color: "#B5651D" }}>browse</span>
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "#A89F94" }}>
                      PDF, DOCX, or TXT — max 10 MB
                    </p>
                  </>
                )}
              </div>

              {/* Template Name */}
              <div>
                <label className="form-label">Template Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Standard Commission Agreement"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categoryOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description (optional)</label>
                <input
                  className="form-input"
                  placeholder="Brief description of this template"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Upload Button */}
              <button
                className="btn-copper w-full justify-center"
                onClick={handleTemplateUpload}
                disabled={uploadingTemplate || !templateFile || !templateForm.name.trim()}
                style={{ opacity: (!templateFile || !templateForm.name.trim()) ? 0.5 : 1 }}
              >
                {uploadingTemplate ? (
                  <><Loader2 size={15} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={15} /> Upload Template</>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Template Library */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: "#B5651D" }} />
                <span className="card-title">Template Library</span>
              </div>
              <span className="text-[12px]" style={{ color: "#A89F94" }}>
                {templates.length} template{templates.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin" style={{ color: "#B5651D" }} />
                  <span style={{ marginLeft: 8, fontSize: 13, color: "#A89F94" }}>Loading templates...</span>
                </div>
              ) : templates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px" }}>
                  <FileText size={32} style={{ color: "#E8E2DA", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>No templates yet</p>
                  <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>
                    Upload your first contract template to get started
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "#F2EDE6" }}>
                  {templates.map(tmpl => (
                    <div key={tmpl.id} className="flex items-center gap-3 px-4 py-3.5 transition-colors"
                      style={{ borderBottom: "1px solid #F2EDE6" }}
                    >
                      {/* File icon */}
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "#F2EDE6" }}>
                        <File size={16} style={{ color: "#B5651D" }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: "#0E0C0A" }}>
                          {tmpl.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={categoryBadge(tmpl.category)} style={{ fontSize: 10 }}>
                            {tmpl.category}
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: "#A89F94" }}>
                            {tmpl.file_type} · {tmpl.file_size}
                          </span>
                        </div>
                        {tmpl.description && (
                          <p className="text-[11px] mt-1 truncate" style={{ color: "#A89F94" }}>{tmpl.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={tmpl.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg transition-colors"
                          title="Download"
                          style={{ color: "#A89F94" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#B5651D"}
                          onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                        >
                          <Download size={15} />
                        </a>
                        <button
                          onClick={() => handleTemplateDelete(tmpl)}
                          className="p-1.5 rounded-lg transition-colors"
                          title="Delete"
                          style={{ color: "#A89F94" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#C4705A"}
                          onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contract delete confirmation */}
      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Contract?"
        message={`Are you sure you want to delete this contract for "${confirmTarget?.client_name}"? This cannot be undone.`}
      />

      {/* Template delete confirmation */}
      <ConfirmModal
        open={!!confirmTemplateTarget}
        onClose={() => setConfirmTemplateTarget(null)}
        onConfirm={handleConfirmTemplateDelete}
        title="Delete Template?"
        message={`Are you sure you want to delete "${confirmTemplateTarget?.name}"? The file will be permanently removed.`}
      />
    </div>
  )
}
