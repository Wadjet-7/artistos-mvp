import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase, logActivity } from "../lib/supabase"
import Modal from "../components/Modal"
import ConfirmModal from "../components/ConfirmModal"
import toast from "react-hot-toast"
import { Package, Plus, Trash2, Edit2, Loader2, ArrowLeftRight, Calendar, Percent } from "lucide-react"
import { FeatureGate } from "../components/UpgradePrompt"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDate(d) {
  if (!d) return "--"
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const statusColors = {
  active: "badge-forest",
  returned: "badge-gold",
  sold: "badge-copper",
  expired: "badge-rose",
}

const emptyForm = {
  artwork_id: "",
  gallery_name: "",
  contact_name: "",
  contact_email: "",
  start_date: "",
  end_date: "",
  commission_rate: "0",
  terms: "",
  status: "active",
  notes: "",
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Consignments() {
  return (
    <FeatureGate feature="consignments">
      <ConsignmentsContent />
    </FeatureGate>
  )
}

function ConsignmentsContent() {
  const { user } = useAuth()
  const [consignments, setConsignments] = useState([])
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState("all")
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [conRes, artRes] = await Promise.all([
      supabase.from("consignments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("artworks").select("id, title, image_url").eq("user_id", user.id).order("title"),
    ])
    setConsignments(conRes.data || [])
    setArtworks(artRes.data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  /* ---- computed stats ---- */
  const activeCount = consignments.filter(c => c.status === "active").length
  const totalRate = consignments.filter(c => c.status === "active").reduce((s, c) => s + (parseFloat(c.commission_rate) || 0), 0)
  const avgRate = activeCount > 0 ? (totalRate / activeCount).toFixed(0) : 0

  /* ---- filtered list ---- */
  const filtered = filter === "all" ? consignments : consignments.filter(c => c.status === filter)

  /* ---- modal helpers ---- */
  const openCreate = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (c) => {
    setEditingId(c.id)
    setForm({
      artwork_id: c.artwork_id || "",
      gallery_name: c.gallery_name || "",
      contact_name: c.contact_name || "",
      contact_email: c.contact_email || "",
      start_date: c.start_date || "",
      end_date: c.end_date || "",
      commission_rate: c.commission_rate != null ? String(c.commission_rate) : "0",
      terms: c.terms || "",
      status: c.status || "active",
      notes: c.notes || "",
    })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(emptyForm) }

  /* ---- save ---- */
  const handleSave = async () => {
    if (!form.gallery_name.trim()) return toast.error("Gallery name is required")
    setSubmitting(true)

    const payload = {
      user_id: user.id,
      artwork_id: form.artwork_id || null,
      gallery_name: form.gallery_name.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      commission_rate: parseFloat(form.commission_rate) || 0,
      terms: form.terms.trim(),
      status: form.status,
      notes: form.notes.trim(),
    }

    try {
      if (editingId) {
        const { error } = await supabase.from("consignments").update(payload).eq("id", editingId)
        if (error) throw error
        toast.success("Consignment updated")
        await logActivity(user.id, "consignment", `Updated consignment at ${payload.gallery_name}`)
      } else {
        const { error } = await supabase.from("consignments").insert(payload)
        if (error) throw error
        toast.success("Consignment created")
        await logActivity(user.id, "consignment", `Created consignment at ${payload.gallery_name}`)
      }
      closeModal()
      fetchData()
    } catch (err) {
      toast.error("Failed to save: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- delete ---- */
  const handleConfirmDelete = async () => {
    const c = confirmTarget
    setConfirmTarget(null)
    try {
      const { error } = await supabase.from("consignments").delete().eq("id", c.id)
      if (error) throw error
      setConsignments(prev => prev.filter(x => x.id !== c.id))
      toast.success("Consignment deleted")
    } catch (err) {
      toast.error("Failed to delete")
    }
  }

  /* ---- get artwork title by id ---- */
  const getArtworkTitle = (id) => artworks.find(a => a.id === id)?.title || "Unlinked"

  const filters = ["all", "active", "returned", "sold", "expired"]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#0E0C0A" }}>Consignment Tracker</h2>
          <p className="text-xs mt-1" style={{ color: "#A89F94" }}>Track artworks placed with galleries and dealers</p>
        </div>
        <button onClick={openCreate} className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 16px" }}>
          <Plus size={15} /> New Consignment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card copper">
          <div className="stat-label">Active Consignments</div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-delta up">{consignments.length} total</div>
          <div className="stat-icon"><Package size={18} /></div>
        </div>
        <div className="stat-card forest">
          <div className="stat-label">Avg Commission Rate</div>
          <div className="stat-value">{avgRate}%</div>
          <div className="stat-delta up">across active consignments</div>
          <div className="stat-icon"><Percent size={18} /></div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Galleries</div>
          <div className="stat-value">{new Set(consignments.map(c => c.gallery_name)).size}</div>
          <div className="stat-delta up">unique galleries</div>
          <div className="stat-icon"><ArrowLeftRight size={18} /></div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={"filter-pill" + (filter === f ? " active" : "")}
            style={{ textTransform: "capitalize" }}>
            {f === "all" ? `All (${consignments.length})` : `${f} (${consignments.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "white", border: "1px solid #E8E2DA" }}>
          <Package size={36} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
          <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: "#0E0C0A" }}>
            {consignments.length === 0 ? "No consignments yet" : "No matching consignments"}
          </h3>
          <p className="text-sm mb-4" style={{ color: "#A89F94" }}>
            {consignments.length === 0 ? "Track your gallery placements and consignment terms." : "Try a different filter."}
          </p>
          {consignments.length === 0 && (
            <button onClick={openCreate} className="btn-copper" style={{ fontSize: 13, padding: "8px 20px" }}>Add First Consignment</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl p-4" style={{ border: "1px solid #E8E2DA" }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{c.gallery_name}</h3>
                  {c.contact_name && <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>{c.contact_name}</p>}
                </div>
                <span className={`badge ${statusColors[c.status] || "badge-grey"}`} style={{ textTransform: "capitalize" }}>{c.status}</span>
              </div>

              {c.artwork_id && (
                <p className="text-xs mb-2" style={{ color: "#B5651D" }}>
                  Artwork: {getArtworkTitle(c.artwork_id)}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2" style={{ color: "#A89F94" }}>
                <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(c.start_date)} — {formatDate(c.end_date)}</span>
                <span className="flex items-center gap-1"><Percent size={11} /> {c.commission_rate}% commission</span>
              </div>

              {c.terms && <p className="text-xs mb-2 line-clamp-2" style={{ color: "#A89F94" }}>{c.terms}</p>}
              {c.notes && <p className="text-xs mb-3 italic" style={{ color: "#C5BDB3" }}>{c.notes}</p>}

              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(c)} className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "#F2EDE6", color: "#0E0C0A" }}>Edit</button>
                <button onClick={() => setConfirmTarget(c)} className="text-[11px] font-medium px-2 py-1.5 rounded-lg transition-colors ml-auto"
                  style={{ color: "#C4705A" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Edit Consignment" : "New Consignment"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Gallery / Dealer *</label>
              <input type="text" value={form.gallery_name} onChange={e => setForm(f => ({ ...f, gallery_name: e.target.value }))}
                placeholder="e.g. Whitfield Gallery" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Artwork</label>
              <select value={form.artwork_id} onChange={e => setForm(f => ({ ...f, artwork_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "#E8E2DA" }}>
                <option value="">-- Select artwork --</option>
                {artworks.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Contact Name</label>
              <input type="text" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                placeholder="Contact person" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Contact Email</label>
              <input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                placeholder="email@gallery.com" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Commission %</label>
              <input type="number" min="0" max="100" value={form.commission_rate}
                onChange={e => setForm(f => ({ ...f, commission_rate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "#E8E2DA" }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "#E8E2DA" }}>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Terms</label>
            <textarea value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))}
              placeholder="Commission terms, shipping responsibilities, insurance..." rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: "#E8E2DA" }} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Additional notes..." rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: "#E8E2DA" }} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={closeModal} className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>Cancel</button>
            <button onClick={handleSave} disabled={submitting} className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 20px" }}>
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editingId ? "Save Changes" : "Create Consignment"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Consignment?"
        message={`Delete consignment at "${confirmTarget?.gallery_name}"? This cannot be undone.`}
      />
    </div>
  )
}
