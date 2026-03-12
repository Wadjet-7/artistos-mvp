import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase, logActivity } from "../lib/supabase"
import Modal from "../components/Modal"
import ConfirmModal from "../components/ConfirmModal"
import toast from "react-hot-toast"
import { CalendarDays, Plus, Trash2, Loader2, MapPin, CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDate(d) {
  if (!d) return "--"
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const statusColors = {
  planning: "badge-gold",
  confirmed: "badge-forest",
  active: "badge-copper",
  completed: "badge-grey",
  cancelled: "badge-rose",
}

const emptyForm = {
  title: "",
  venue: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
  artwork_ids: [],
  status: "planning",
  checklist: [],
  notes: "",
}

/* ------------------------------------------------------------------ */
/*  Checklist item                                                     */
/* ------------------------------------------------------------------ */
function ChecklistItem({ item, onToggle, onRemove }) {
  return (
    <div className="flex items-center gap-2 group">
      <button onClick={onToggle} className="flex-shrink-0">
        {item.done
          ? <CheckSquare size={16} style={{ color: "#2D4A35" }} />
          : <Square size={16} style={{ color: "#A89F94" }} />}
      </button>
      <span className={`text-xs flex-1 ${item.done ? "line-through" : ""}`}
        style={{ color: item.done ? "#A89F94" : "#0E0C0A" }}>{item.text}</span>
      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#C4705A" }}>
        <Trash2 size={12} />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function Exhibitions() {
  const { user } = useAuth()
  const [exhibitions, setExhibitions] = useState([])
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState("all")
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [newCheckItem, setNewCheckItem] = useState("")
  const [expanded, setExpanded] = useState({})

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [exRes, artRes] = await Promise.all([
      supabase.from("exhibitions").select("*").eq("user_id", user.id).order("start_date", { ascending: true }),
      supabase.from("artworks").select("id, title, image_url").eq("user_id", user.id).order("title"),
    ])
    setExhibitions(exRes.data || [])
    setArtworks(artRes.data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  /* ---- computed ---- */
  const upcoming = exhibitions.filter(e => e.status === "planning" || e.status === "confirmed")
  const totalChecklist = exhibitions.reduce((s, e) => s + ((e.checklist || []).length), 0)
  const doneChecklist = exhibitions.reduce((s, e) => s + ((e.checklist || []).filter(c => c.done).length), 0)

  /* ---- filtered list ---- */
  const filtered = filter === "all" ? exhibitions : exhibitions.filter(e => e.status === filter)

  /* ---- modal helpers ---- */
  const openCreate = () => { setEditingId(null); setForm(emptyForm); setNewCheckItem(""); setModalOpen(true) }
  const openEdit = (ex) => {
    setEditingId(ex.id)
    setForm({
      title: ex.title || "",
      venue: ex.venue || "",
      location: ex.location || "",
      start_date: ex.start_date || "",
      end_date: ex.end_date || "",
      description: ex.description || "",
      artwork_ids: ex.artwork_ids || [],
      status: ex.status || "planning",
      checklist: ex.checklist || [],
      notes: ex.notes || "",
    })
    setNewCheckItem("")
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm(emptyForm); setNewCheckItem("") }

  /* ---- checklist management in form ---- */
  const addCheckItem = () => {
    if (!newCheckItem.trim()) return
    setForm(f => ({ ...f, checklist: [...f.checklist, { text: newCheckItem.trim(), done: false }] }))
    setNewCheckItem("")
  }
  const toggleCheckItem = (idx) => {
    setForm(f => ({
      ...f,
      checklist: f.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c)
    }))
  }
  const removeCheckItem = (idx) => {
    setForm(f => ({ ...f, checklist: f.checklist.filter((_, i) => i !== idx) }))
  }

  /* ---- toggle artwork selection ---- */
  const toggleArtwork = (id) => {
    setForm(f => ({
      ...f,
      artwork_ids: f.artwork_ids.includes(id)
        ? f.artwork_ids.filter(a => a !== id)
        : [...f.artwork_ids, id]
    }))
  }

  /* ---- save ---- */
  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required")
    setSubmitting(true)

    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      venue: form.venue.trim(),
      location: form.location.trim(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      description: form.description.trim(),
      artwork_ids: form.artwork_ids,
      status: form.status,
      checklist: form.checklist,
      notes: form.notes.trim(),
    }

    try {
      if (editingId) {
        const { error } = await supabase.from("exhibitions").update(payload).eq("id", editingId)
        if (error) throw error
        toast.success("Exhibition updated")
        await logActivity(user.id, "exhibition", `Updated exhibition "${payload.title}"`)
      } else {
        const { error } = await supabase.from("exhibitions").insert(payload)
        if (error) throw error
        toast.success("Exhibition created")
        await logActivity(user.id, "exhibition", `Created exhibition "${payload.title}"`)
      }
      closeModal()
      fetchData()
    } catch (err) {
      toast.error("Failed to save: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- inline checklist toggle (card view) ---- */
  const toggleCardChecklist = async (ex, idx) => {
    const updated = (ex.checklist || []).map((c, i) => i === idx ? { ...c, done: !c.done } : c)
    const { error } = await supabase.from("exhibitions").update({ checklist: updated }).eq("id", ex.id)
    if (error) return toast.error("Failed to update")
    setExhibitions(prev => prev.map(e => e.id === ex.id ? { ...e, checklist: updated } : e))
  }

  /* ---- delete ---- */
  const handleConfirmDelete = async () => {
    const ex = confirmTarget
    setConfirmTarget(null)
    try {
      const { error } = await supabase.from("exhibitions").delete().eq("id", ex.id)
      if (error) throw error
      setExhibitions(prev => prev.filter(e => e.id !== ex.id))
      toast.success("Exhibition deleted")
    } catch (err) {
      toast.error("Failed to delete")
    }
  }

  const getArtworkTitle = (id) => artworks.find(a => a.id === id)?.title || "Unknown"

  const filters = ["all", "planning", "confirmed", "active", "completed", "cancelled"]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#0E0C0A" }}>Exhibition Planner</h2>
          <p className="text-xs mt-1" style={{ color: "#A89F94" }}>Plan and track your exhibitions with checklists</p>
        </div>
        <button onClick={openCreate} className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 16px" }}>
          <Plus size={15} /> New Exhibition
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card copper">
          <div className="stat-label">Total Exhibitions</div>
          <div className="stat-value">{exhibitions.length}</div>
          <div className="stat-delta up">{upcoming.length} upcoming</div>
          <div className="stat-icon"><CalendarDays size={18} /></div>
        </div>
        <div className="stat-card forest">
          <div className="stat-label">Checklist Progress</div>
          <div className="stat-value">{totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0}%</div>
          <div className="stat-delta up">{doneChecklist}/{totalChecklist} tasks done</div>
          <div className="stat-icon"><CheckSquare size={18} /></div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Venues</div>
          <div className="stat-value">{new Set(exhibitions.map(e => e.venue).filter(Boolean)).size}</div>
          <div className="stat-delta up">unique venues</div>
          <div className="stat-icon"><MapPin size={18} /></div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={"filter-pill" + (filter === f ? " active" : "")}
            style={{ textTransform: "capitalize" }}>
            {f === "all" ? `All (${exhibitions.length})` : `${f} (${exhibitions.filter(e => e.status === f).length})`}
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
          <CalendarDays size={36} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
          <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: "#0E0C0A" }}>
            {exhibitions.length === 0 ? "No exhibitions yet" : "No matching exhibitions"}
          </h3>
          <p className="text-sm mb-4" style={{ color: "#A89F94" }}>
            {exhibitions.length === 0 ? "Plan your gallery shows, museum exhibitions, and art fairs." : "Try a different filter."}
          </p>
          {exhibitions.length === 0 && (
            <button onClick={openCreate} className="btn-copper" style={{ fontSize: 13, padding: "8px 20px" }}>Plan Your First Exhibition</button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ex => {
            const checklist = ex.checklist || []
            const done = checklist.filter(c => c.done).length
            const isExpanded = expanded[ex.id]

            return (
              <div key={ex.id} className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E8E2DA" }}>
                {/* Color bar */}
                <div className="h-1.5" style={{
                  background: ex.status === "confirmed" ? "#2D4A35"
                    : ex.status === "active" ? "#B5651D"
                    : ex.status === "completed" ? "#A89F94"
                    : ex.status === "cancelled" ? "#C4705A"
                    : "#D4A843"
                }} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{ex.title}</h3>
                        <span className={`badge ${statusColors[ex.status] || "badge-grey"}`} style={{ textTransform: "capitalize" }}>{ex.status}</span>
                      </div>
                      {(ex.venue || ex.location) && (
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#A89F94" }}>
                          <MapPin size={11} /> {[ex.venue, ex.location].filter(Boolean).join(" — ")}
                        </p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>
                        {formatDate(ex.start_date)} — {formatDate(ex.end_date)}
                      </p>
                    </div>
                  </div>

                  {ex.description && <p className="text-xs mb-2 line-clamp-2" style={{ color: "#A89F94" }}>{ex.description}</p>}

                  {/* Artwork count */}
                  {(ex.artwork_ids || []).length > 0 && (
                    <p className="text-[11px] mb-2" style={{ color: "#B5651D" }}>
                      {ex.artwork_ids.length} artwork{ex.artwork_ids.length !== 1 ? "s" : ""} selected
                    </p>
                  )}

                  {/* Checklist summary + toggle */}
                  {checklist.length > 0 && (
                    <div className="mb-3">
                      <button onClick={() => setExpanded(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                        className="flex items-center gap-2 text-xs font-medium w-full" style={{ color: "#0E0C0A" }}>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#F2EDE6" }}>
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${checklist.length > 0 ? (done / checklist.length * 100) : 0}%`,
                            background: done === checklist.length ? "#2D4A35" : "#B5651D"
                          }} />
                        </div>
                        <span className="text-[11px] whitespace-nowrap" style={{ color: "#A89F94" }}>{done}/{checklist.length}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 pl-1">
                          {checklist.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <button onClick={() => toggleCardChecklist(ex, idx)} className="flex-shrink-0">
                                {item.done
                                  ? <CheckSquare size={14} style={{ color: "#2D4A35" }} />
                                  : <Square size={14} style={{ color: "#A89F94" }} />}
                              </button>
                              <span className={`text-xs ${item.done ? "line-through" : ""}`}
                                style={{ color: item.done ? "#A89F94" : "#0E0C0A" }}>{item.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {ex.notes && <p className="text-xs mb-3 italic" style={{ color: "#C5BDB3" }}>{ex.notes}</p>}

                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(ex)} className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "#F2EDE6", color: "#0E0C0A" }}>Edit</button>
                    <button onClick={() => setConfirmTarget(ex)} className="text-[11px] font-medium px-2 py-1.5 rounded-lg transition-colors ml-auto"
                      style={{ color: "#C4705A" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Edit Exhibition" : "New Exhibition"} wide>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Exhibition Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Urban Landscapes" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#E8E2DA" }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Venue</label>
              <input type="text" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                placeholder="e.g. Whitfield Gallery" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Location</label>
              <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Brooklyn, NY" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
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
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "#E8E2DA" }}>
                <option value="planning">Planning</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Exhibition description..." rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none" style={{ borderColor: "#E8E2DA" }} />
          </div>

          {/* Artwork selection */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#0E0C0A" }}>
              Artworks <span style={{ color: "#A89F94", fontWeight: 400 }}>({form.artwork_ids.length} selected)</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto p-2 rounded-lg" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
              {artworks.map(a => (
                <button key={a.id} onClick={() => toggleArtwork(a.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.artwork_ids.includes(a.id) ? "" : "opacity-60 hover:opacity-100"}`}
                  style={{
                    background: form.artwork_ids.includes(a.id) ? "#F5E6D8" : "#F2EDE6",
                    color: form.artwork_ids.includes(a.id) ? "#B5651D" : "#0E0C0A",
                    border: form.artwork_ids.includes(a.id) ? "1px solid #B5651D" : "1px solid transparent"
                  }}>
                  {a.title}
                </button>
              ))}
              {artworks.length === 0 && <p className="text-xs py-2 text-center w-full" style={{ color: "#A89F94" }}>No artworks yet.</p>}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#0E0C0A" }}>Checklist</label>
            <div className="space-y-1.5 mb-2">
              {form.checklist.map((item, idx) => (
                <ChecklistItem key={idx} item={item} onToggle={() => toggleCheckItem(idx)} onRemove={() => removeCheckItem(idx)} />
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCheckItem()}
                placeholder="Add checklist item..." className="flex-1 px-3 py-1.5 rounded-lg text-xs border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
              <button onClick={addCheckItem} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: "#F2EDE6", color: "#0E0C0A" }}>Add</button>
            </div>
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
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editingId ? "Save Changes" : "Create Exhibition"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Exhibition?"
        message={`Delete "${confirmTarget?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
