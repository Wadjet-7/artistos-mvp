import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"
import { X, DollarSign, Hash } from "lucide-react"
import toast from "react-hot-toast"

/* ------------------------------------------------------------------ */
/*  Status colour maps                                                 */
/* ------------------------------------------------------------------ */
const STATUS_BG = {
  available: "#E8E2DA",
  reserved:  "#FBF2DC",
  sold:      "#E8F2EA",
  gifted:    "#F5E6D8",
  damaged:   "#F5E2DC",
}

const STATUS_TEXT = {
  available: "#A89F94",
  reserved:  "#8A6A1A",
  sold:      "#2D4A35",
  gifted:    "#B5651D",
  damaged:   "#C4705A",
}

const STATUS_OPTIONS = ["available", "reserved", "sold", "gifted", "damaged"]

/* ------------------------------------------------------------------ */
/*  EditionsGrid                                                       */
/* ------------------------------------------------------------------ */
export default function EditionsGrid({ artworkId, userId, editionSize, canEdit }) {
  const [copies, setCopies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  // Edit-modal form state
  const [formStatus, setFormStatus] = useState("available")
  const [formOwner, setFormOwner] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formNotes, setFormNotes] = useState("")

  /* ---- Fetch editions ---- */
  const fetchEditions = useCallback(async () => {
    if (!artworkId) return
    setLoading(true)
    const { data, error } = await supabase
      .from("artwork_editions")
      .select("*")
      .eq("artwork_id", artworkId)
      .order("edition_number", { ascending: true, nullsFirst: false })

    if (error) {
      console.error("Failed to load editions:", error)
      toast.error("Could not load editions")
    } else {
      setCopies(data || [])
    }
    setLoading(false)
  }, [artworkId])

  useEffect(() => { fetchEditions() }, [fetchEditions])

  /* ---- Open edit modal ---- */
  const openEdit = (copy) => {
    if (!canEdit) return
    setSelected(copy)
    setFormStatus(copy.status || "available")
    setFormOwner(copy.owner_name || "")
    setFormPrice(copy.sold_price != null ? String(copy.sold_price) : "")
    setFormDate(copy.sold_date || "")
    setFormNotes(copy.notes || "")
  }

  const closeEdit = () => setSelected(null)

  /* ---- Save edition update ---- */
  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase
      .from("artwork_editions")
      .update({
        status: formStatus,
        owner_name: formOwner.trim(),
        sold_price: formPrice ? parseInt(formPrice, 10) : null,
        sold_date: formDate || null,
        notes: formNotes.trim(),
      })
      .eq("id", selected.id)
      .eq("user_id", userId)

    if (error) {
      toast.error("Failed to update edition")
      console.error(error)
    } else {
      toast.success(`Edition ${selected.edition_label} updated`)
      closeEdit()
      fetchEditions()
    }
    setSaving(false)
  }

  /* ---- Summary stats ---- */
  const soldCopies = copies.filter((c) => c.status === "sold")
  const totalRevenue = soldCopies.reduce((sum, c) => sum + (c.sold_price || 0), 0)

  /* ---- Render ---- */
  if (loading) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: "#A89F94" }}>
        Loading editions...
      </div>
    )
  }

  if (copies.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: "#A89F94" }}>
        No edition copies found.
      </div>
    )
  }

  return (
    <div>
      {/* ---- Summary bar ---- */}
      <div
        className="flex items-center gap-4 rounded-xl px-4 py-3 mb-4"
        style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}
      >
        <div className="flex items-center gap-1.5">
          <Hash size={14} style={{ color: "#A89F94" }} />
          <span className="text-sm font-medium" style={{ color: "#0E0C0A" }}>
            {soldCopies.length} of {editionSize || copies.length} sold
          </span>
        </div>
        {totalRevenue > 0 && (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} style={{ color: "#B5651D" }} />
            <span className="text-sm font-medium" style={{ color: "#B5651D" }}>
              ${totalRevenue.toLocaleString()} revenue
            </span>
          </div>
        )}
      </div>

      {/* ---- Edition cards grid ---- */}
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}>
        {copies.map((copy) => {
          const bg = STATUS_BG[copy.status] || STATUS_BG.available
          const fg = STATUS_TEXT[copy.status] || STATUS_TEXT.available
          return (
            <button
              key={copy.id}
              onClick={() => openEdit(copy)}
              className="rounded-xl text-left transition-shadow hover:shadow-md"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8E2DA",
                borderTop: `4px solid ${bg}`,
                cursor: canEdit ? "pointer" : "default",
                padding: "10px 10px 8px",
              }}
            >
              <div className="font-serif text-lg font-semibold leading-tight" style={{ color: "#0E0C0A" }}>
                {copy.edition_label}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wide mt-1" style={{ color: fg }}>
                {copy.status}
              </div>
              {copy.owner_name && (
                <div className="text-[11px] truncate mt-0.5" style={{ color: "#A89F94" }}>
                  {copy.owner_name}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ---- Edit modal ---- */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeEdit}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid #E8E2DA" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white rounded-t-2xl z-10"
              style={{ borderBottom: "1px solid #F2EDE6" }}
            >
              <h2 className="font-serif text-xl font-semibold" style={{ color: "#0E0C0A" }}>
                Edition {selected.edition_label}
              </h2>
              <button
                onClick={closeEdit}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#A89F94" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F2EDE6"; e.currentTarget.style.color = "#0E0C0A" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A89F94" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="form-input w-full"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Owner */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Owner / Buyer Name</label>
                <input
                  type="text"
                  value={formOwner}
                  onChange={(e) => setFormOwner(e.target.value)}
                  placeholder="Collector name"
                  className="form-input w-full"
                />
              </div>

              {/* Price & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Sold Price ($)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Sold Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Any notes about this copy..."
                  rows={3}
                  className="form-input w-full resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeEdit}
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: "8px 16px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-copper"
                  style={{ fontSize: 13, padding: "8px 20px" }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
