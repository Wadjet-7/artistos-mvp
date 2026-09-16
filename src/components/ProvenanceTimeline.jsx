import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import {
  Palette, CalendarDays, BookOpen, DollarSign, Package,
  Share2, ClipboardCheck, Wrench, BadgeCheck,
  Plus, Pencil, Trash2, Loader2
} from "lucide-react"
import toast from "react-hot-toast"
import Modal from "./Modal"

/* ------------------------------------------------------------------ */
/*  Event-type config                                                  */
/* ------------------------------------------------------------------ */
const EVENT_TYPES = [
  { value: "created",          label: "Created",          Icon: Palette },
  { value: "exhibited",        label: "Exhibited",        Icon: CalendarDays },
  { value: "published",        label: "Published",        Icon: BookOpen },
  { value: "sold",             label: "Sold",             Icon: DollarSign },
  { value: "consigned",        label: "Consigned",        Icon: Package },
  { value: "loaned",           label: "Loaned",           Icon: Share2 },
  { value: "condition_report", label: "Condition Report",  Icon: ClipboardCheck },
  { value: "restored",         label: "Restored",         Icon: Wrench },
  { value: "appraised",        label: "Appraised",        Icon: BadgeCheck },
]

const typeMap = Object.fromEntries(EVENT_TYPES.map(t => [t.value, t]))

function iconFor(eventType) {
  const entry = typeMap[eventType]
  if (!entry) return Palette
  return entry.Icon
}

function labelFor(eventType) {
  return typeMap[eventType]?.label || eventType
}

/* ------------------------------------------------------------------ */
/*  Blank form state                                                   */
/* ------------------------------------------------------------------ */
const BLANK = {
  event_type: "exhibited",
  event_date: "",
  party_name: "",
  location: "",
  notes: "",
}

/* ------------------------------------------------------------------ */
/*  ProvenanceTimeline                                                 */
/* ------------------------------------------------------------------ */
export default function ProvenanceTimeline({ artworkId, userId, canEdit }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  /* ---- Fetch ---- */
  useEffect(() => {
    if (!artworkId) return
    fetchEvents()
  }, [artworkId])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from("artwork_provenance")
      .select("*")
      .eq("artwork_id", artworkId)
      .order("event_date", { ascending: false })

    if (error) {
      console.error("Provenance fetch error:", error)
      toast.error("Could not load provenance")
    } else {
      setEvents(data || [])
    }
    setLoading(false)
  }

  /* ---- Open modal ---- */
  function openAdd() {
    setEditing(null)
    setForm(BLANK)
    setModalOpen(true)
  }

  function openEdit(ev) {
    setEditing(ev)
    setForm({
      event_type: ev.event_type,
      event_date: ev.event_date || "",
      party_name: ev.party_name || "",
      location: ev.location || "",
      notes: ev.notes || "",
    })
    setModalOpen(true)
  }

  /* ---- Save (create / update) ---- */
  async function handleSave(e) {
    e.preventDefault()
    if (!form.event_date) {
      toast.error("Date is required")
      return
    }
    setSaving(true)

    if (editing) {
      const { error } = await supabase
        .from("artwork_provenance")
        .update({
          event_type: form.event_type,
          event_date: form.event_date,
          party_name: form.party_name,
          location: form.location,
          notes: form.notes,
        })
        .eq("id", editing.id)

      if (error) {
        toast.error("Could not update event")
        console.error(error)
      } else {
        toast.success("Event updated")
        setModalOpen(false)
        fetchEvents()
      }
    } else {
      const { error } = await supabase
        .from("artwork_provenance")
        .insert({
          artwork_id: artworkId,
          user_id: userId,
          event_type: form.event_type,
          event_date: form.event_date,
          party_name: form.party_name,
          location: form.location,
          notes: form.notes,
        })

      if (error) {
        toast.error("Could not add event")
        console.error(error)
      } else {
        toast.success("Event added")
        setModalOpen(false)
        fetchEvents()
      }
    }
    setSaving(false)
  }

  /* ---- Delete ---- */
  async function handleDelete(id) {
    if (!window.confirm("Delete this provenance event?")) return
    const { error } = await supabase
      .from("artwork_provenance")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Could not delete event")
      console.error(error)
    } else {
      toast.success("Event deleted")
      fetchEvents()
    }
  }

  /* ---- Helpers ---- */
  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function formatDate(d) {
    if (!d) return ""
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    })
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={22} className="animate-spin" style={{ color: "#B5651D" }} />
      </div>
    )
  }

  /* ---- Render ---- */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold" style={{ color: "#0E0C0A" }}>
          Provenance
        </h3>
        {canEdit && (
          <button onClick={openAdd} className="btn-copper flex items-center gap-1.5"
            style={{ fontSize: 13, padding: "6px 14px" }}>
            <Plus size={15} /> Add Event
          </button>
        )}
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="text-center py-8 rounded-xl" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
          <ClipboardCheck size={28} className="mx-auto mb-2" style={{ color: "#A89F94" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>
            No provenance events recorded yet.
          </p>
        </div>
      )}

      {/* Timeline */}
      {events.length > 0 && (
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-[13px] top-2 bottom-2 w-px" style={{ background: "#E8E2DA" }} />

          {events.map((ev, i) => {
            const Icon = iconFor(ev.event_type)
            return (
              <div key={ev.id} className="relative mb-6 last:mb-0">
                {/* Dot */}
                <div className="absolute -left-8 top-0.5 w-[26px] h-[26px] rounded-full flex items-center justify-center"
                  style={{ background: "#FAF8F5", border: "2px solid #B5651D" }}>
                  <Icon size={13} style={{ color: "#B5651D" }} />
                </div>

                {/* Card */}
                <div className="rounded-xl p-4" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "#E8E2DA", color: "#0E0C0A" }}>
                          {labelFor(ev.event_type)}
                        </span>
                        <span className="text-xs" style={{ color: "#A89F94" }}>
                          {formatDate(ev.event_date)}
                        </span>
                      </div>
                      {ev.party_name && (
                        <p className="text-sm font-medium mt-1.5" style={{ color: "#0E0C0A" }}>
                          {ev.party_name}
                        </p>
                      )}
                      {ev.location && (
                        <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>
                          {ev.location}
                        </p>
                      )}
                      {ev.notes && (
                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#6B6560" }}>
                          {ev.notes}
                        </p>
                      )}
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEdit(ev)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "#A89F94" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#E8E2DA"; e.currentTarget.style.color = "#0E0C0A" }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A89F94" }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(ev.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "#A89F94" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#E8E2DA"; e.currentTarget.style.color = "#C4705A" }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A89F94" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "Edit Provenance Event" : "Add Provenance Event"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>
              Event Type
            </label>
            <select className="form-input w-full" value={form.event_type}
              onChange={e => set("event_type", e.target.value)}>
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>
              Date <span style={{ color: "#C4705A" }}>*</span>
            </label>
            <input type="date" className="form-input w-full" value={form.event_date}
              onChange={e => set("event_date", e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>
              Party / Person
            </label>
            <input type="text" className="form-input w-full" placeholder="e.g. Gagosian Gallery"
              value={form.party_name} onChange={e => set("party_name", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>
              Location
            </label>
            <input type="text" className="form-input w-full" placeholder="e.g. New York, NY"
              value={form.location} onChange={e => set("location", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>
              Notes
            </label>
            <textarea className="form-input w-full" rows={3} placeholder="Additional details..."
              value={form.notes} onChange={e => set("notes", e.target.value)}
              style={{ resize: "vertical" }} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 20px" }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {editing ? "Update Event" : "Add Event"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
