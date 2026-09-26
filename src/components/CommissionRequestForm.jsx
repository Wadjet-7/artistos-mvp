import { useState } from "react"
import { CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "../lib/supabase"
import Modal from "./Modal"

const BUDGET_OPTIONS = [
  { label: "Under $1,000", value: 750 },
  { label: "$1,000 - $2,500", value: 1750 },
  { label: "$2,500 - $5,000", value: 3750 },
  { label: "$5,000 - $10,000", value: 7500 },
  { label: "$10,000+", value: 15000 },
  { label: "Flexible", value: 0 },
]

const TIMELINE_OPTIONS = [
  { label: "1 - 2 months", days: 60 },
  { label: "2 - 4 months", days: 90 },
  { label: "4 - 6 months", days: 150 },
  { label: "6+ months", days: 210 },
  { label: "Flexible", days: 120 },
]

const MEDIUM_OPTIONS = [
  "Oil on Canvas", "Acrylic", "Mixed Media", "Photography", "Sculpture", "Other", "No preference"
]

const emptyForm = {
  name: "", email: "", title: "", description: "",
  medium: "", dimensions: "", budgetRange: "", timeline: "",
}

export default function CommissionRequestForm({ open, onClose, artistId, artistName }) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = "Name is required"
    if (!form.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email"
    if (!form.title.trim()) e.title = "Title is required"
    if (!form.description.trim()) e.description = "Description is required"
    if (!form.budgetRange) e.budgetRange = "Budget range is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const budgetNum = BUDGET_OPTIONS.find(b => b.label === form.budgetRange)?.value || 0
      const timelineDays = TIMELINE_OPTIONS.find(t => t.label === form.timeline)?.days || 120
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + timelineDays)

      const { data: result, error: rpcError } = await supabase.rpc("submit_commission_request", {
        p_artist_id: artistId,
        p_client_name: form.name.trim(),
        p_client_email: form.email.trim(),
        p_title: form.title.trim(),
        p_description: [
          form.description.trim(),
          "",
          `Budget: ${form.budgetRange}`,
          `Timeline: ${form.timeline || "Flexible"}`,
          `Medium: ${form.medium || "No preference"}`,
          form.dimensions ? `Dimensions: ${form.dimensions.trim()}` : "",
        ].filter(Boolean).join("\n"),
        p_medium: form.medium || null,
        p_dimensions: form.dimensions.trim() || null,
        p_budget: budgetNum,
        p_deadline: deadline.toISOString().split("T")[0],
      })

      if (rpcError) throw rpcError
      if (result && !result.success) throw new Error(result.error || "Request failed")

      setSubmitted(true)
    } catch (err) {
      console.error("Commission request failed:", err)
      setErrors({ submit: "Something went wrong. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setForm(emptyForm)
    setErrors({})
    setSubmitting(false)
    setSubmitted(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Request a Commission" wide>
      {submitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#E8F2EA" }}>
            <CheckCircle size={32} style={{ color: "#2D4A35" }} />
          </div>
          <h3 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#0E0C0A" }}>
            Request Sent!
          </h3>
          <p className="text-sm mb-6" style={{ color: "#A89F94", maxWidth: 360, margin: "0 auto" }}>
            {artistName} will review your commission request and respond at{" "}
            <span style={{ color: "#B5651D" }}>{form.email}</span>.
          </p>
          <button onClick={handleClose} className="btn-primary">Done</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row: Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Your Name *</label>
              <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={e => set("name", e.target.value)} />
              {errors.name && <p className="text-xs mt-1" style={{ color: "#C4705A" }}>{errors.name}</p>}
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="jane@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
              {errors.email && <p className="text-xs mt-1" style={{ color: "#C4705A" }}>{errors.email}</p>}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="form-label">Commission Title *</label>
            <input className="form-input" placeholder="e.g. Abstract Landscape for Living Room" value={form.title} onChange={e => set("title", e.target.value)} />
            {errors.title && <p className="text-xs mt-1" style={{ color: "#C4705A" }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea className="form-input" rows={4} placeholder="Describe what you're looking for: style, colors, mood, subject matter, where it will be displayed..." value={form.description} onChange={e => set("description", e.target.value)} style={{ resize: "vertical" }} />
            {errors.description && <p className="text-xs mt-1" style={{ color: "#C4705A" }}>{errors.description}</p>}
          </div>

          {/* Row: Medium + Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Preferred Medium</label>
              <select className="form-select" value={form.medium} onChange={e => set("medium", e.target.value)}>
                <option value="">Select medium...</option>
                {MEDIUM_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Approximate Dimensions</label>
              <input className="form-input" placeholder='e.g. 36x48 inches' value={form.dimensions} onChange={e => set("dimensions", e.target.value)} />
            </div>
          </div>

          {/* Row: Budget + Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Budget Range *</label>
              <select className="form-select" value={form.budgetRange} onChange={e => set("budgetRange", e.target.value)}>
                <option value="">Select budget...</option>
                {BUDGET_OPTIONS.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
              </select>
              {errors.budgetRange && <p className="text-xs mt-1" style={{ color: "#C4705A" }}>{errors.budgetRange}</p>}
            </div>
            <div>
              <label className="form-label">Desired Timeline</label>
              <select className="form-select" value={form.timeline} onChange={e => set("timeline", e.target.value)}>
                <option value="">Select timeline...</option>
                {TIMELINE_OPTIONS.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="text-sm px-4 py-3 rounded-lg" style={{ background: "#F5E2DC", color: "#C4705A" }}>
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-copper" disabled={submitting}>
              {submitting ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : "Submit Request"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
