import { useState } from "react"
import { FileText, Send, Eye } from "lucide-react"
import { recentContracts } from "../data/mockData"

/* ------------------------------------------------------------------ */
/*  Contract Generator — form + live preview + recent table           */
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

const defaultForm = {
  template: "Commission Agreement",
  clientName: "David Kim",
  clientEmail: "",
  artworkTitle: "",
  price: "",
  paymentTerms: "50% deposit, 50% on completion",
  completionDate: "",
}

export default function Contracts() {
  const [form, setForm] = useState(defaultForm)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  /* Format today as fallback display */
  const displayDate = form.completionDate
    ? new Date(form.completionDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "___________"

  const displayPrice = form.price ? `$${Number(form.price).toLocaleString()}` : "$___"

  /* Deposit calculation for preview */
  const depositText = (() => {
    const p = Number(form.price) || 0
    if (form.paymentTerms.startsWith("50%")) return `$${(p * 0.5).toLocaleString()} due upon signing, $${(p * 0.5).toLocaleString()} upon completion`
    if (form.paymentTerms.startsWith("Full")) return `${displayPrice} due upon signing`
    if (form.paymentTerms.startsWith("3 equal")) return `3 payments of $${Math.round(p / 3).toLocaleString()}`
    return `${displayPrice} due within 30 days of delivery`
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "#0E0C0A" }}>Contract Generator</h1>
        <p style={{ fontSize: 13, color: "#A89F94", marginTop: 2 }}>Create, preview, and send contracts for signing</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* -------- LEFT: Create Contract Form -------- */}
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
            <div className="grid grid-cols-2 gap-4">
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
              <button className="btn-secondary flex-1 justify-center">
                <Eye size={15} />
                Preview PDF
              </button>
              <button className="btn-copper flex-1 justify-center">
                <Send size={15} />
                Send for Signing
              </button>
            </div>
          </div>
        </div>

        {/* -------- RIGHT COLUMN -------- */}
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
                  ("Client") and <span className="contract-field">Maya Chen</span> ("Artist").
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContracts.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{c.client}</td>
                      <td>{c.type}</td>
                      <td><span className={"badge " + c.statusColor}>{c.status}</span></td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{c.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
