import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase, logActivity } from "../lib/supabase"
import Modal from "../components/Modal"
import ConfirmModal from "../components/ConfirmModal"
import toast from "react-hot-toast"
import {
  UserCircle, Plus, Search, Phone, Mail, Building2, Tag,
  CalendarClock, DollarSign, Loader2, Trash2, Edit3, StickyNote
} from "lucide-react"
import PageError from "../components/PageError"
import { LimitBanner } from "../components/UpgradePrompt"
import { isAtLimit, normalizePlan } from "../lib/plans"

/* ------------------------------------------------------------------ */
/*  Contact type badges                                                */
/* ------------------------------------------------------------------ */
const typeConfig = {
  collector: { label: "Collector", bg: "#F5E6D8", color: "#B5651D" },
  gallery:   { label: "Gallery",   bg: "#E8F5E9", color: "#2D4A35" },
  advisor:   { label: "Advisor",   bg: "#EDE9FE", color: "#6B21A8" },
  collaborator: { label: "Collaborator", bg: "#E0F2FE", color: "#0369A1" },
  press:     { label: "Press",     bg: "#FEF3C7", color: "#92400E" },
  other:     { label: "Other",     bg: "#F2EDE6", color: "#A89F94" },
}

const typeOptions = Object.keys(typeConfig)

/* ------------------------------------------------------------------ */
/*  Contact card                                                       */
/* ------------------------------------------------------------------ */
function ContactCard({ contact, onEdit, onDelete }) {
  const tc = typeConfig[contact.contact_type] || typeConfig.other
  const initials = contact.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"

  // Generate a consistent gradient from the name
  const hue = contact.name?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360 || 0

  const isOverdue = contact.next_followup && new Date(contact.next_followup) < new Date()
  const isSoon = contact.next_followup && !isOverdue &&
    (new Date(contact.next_followup) - new Date()) < 3 * 24 * 60 * 60 * 1000

  return (
    <div className="bg-white rounded-xl overflow-hidden transition-shadow hover:shadow-md" style={{ border: "1px solid #E8E2DA" }}>
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, hsl(${hue}, 45%, 55%), hsl(${(hue + 40) % 360}, 50%, 45%))`, color: "white" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate" style={{ color: "#0E0C0A" }}>{contact.name}</h3>
            {contact.company && (
              <p className="text-xs truncate" style={{ color: "#A89F94" }}>{contact.company}</p>
            )}
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: tc.bg, color: tc.color }}>
            {tc.label}
          </span>
        </div>

        {/* Contact details */}
        <div className="space-y-1.5 mb-3">
          {contact.email && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#A89F94" }}>
              <Mail size={12} /> <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#A89F94" }}>
              <Phone size={12} /> {contact.phone}
            </div>
          )}
        </div>

        {/* Notes preview */}
        {contact.notes && (
          <p className="text-xs line-clamp-2 mb-3 px-2 py-1.5 rounded-lg" style={{ color: "#A89F94", background: "#FAF8F5" }}>
            {contact.notes}
          </p>
        )}

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {contact.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "#F2EDE6", color: "#A89F94" }}>
                {tag}
              </span>
            ))}
            {contact.tags.length > 4 && (
              <span className="text-[10px] px-1.5 py-0.5" style={{ color: "#A89F94" }}>+{contact.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Bottom meta */}
        <div className="flex items-center gap-3 text-[11px] mb-3" style={{ color: "#A89F94" }}>
          {contact.total_purchases > 0 && (
            <span className="flex items-center gap-1 font-medium" style={{ color: "#2D4A35" }}>
              <DollarSign size={11} /> {contact.total_purchases.toLocaleString()}
            </span>
          )}
          {contact.last_contacted && (
            <span className="flex items-center gap-1">
              Last: {new Date(contact.last_contacted).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
          {contact.next_followup && (
            <span className={`flex items-center gap-1 font-medium ${isOverdue ? "text-red-500" : isSoon ? "text-amber-600" : ""}`}
              style={!isOverdue && !isSoon ? { color: "#A89F94" } : {}}>
              <CalendarClock size={11} />
              {isOverdue ? "Overdue" : new Date(contact.next_followup).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid #F2EDE6" }}>
          <button onClick={() => onEdit(contact)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
            <Edit3 size={11} /> Edit
          </button>
          <button onClick={() => onDelete(contact)}
            className="text-[11px] font-medium px-2 py-1.5 rounded-lg transition-colors ml-auto"
            style={{ color: "#C4705A" }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Contacts page                                                 */
/* ------------------------------------------------------------------ */
export default function Contacts() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editContact, setEditContact] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [tagInput, setTagInput] = useState("")

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    contact_type: "collector", notes: "", tags: [],
    next_followup: "", total_purchases: ""
  })

  const [fetchError, setFetchError] = useState(false)

  const fetchContacts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(false)
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error("[Contacts] fetch error:", err)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", company: "", contact_type: "collector", notes: "", tags: [], next_followup: "", total_purchases: "" })
    setEditContact(null)
    setTagInput("")
  }

  const openCreate = () => { resetForm(); setModalOpen(true) }

  const openEdit = (contact) => {
    setEditContact(contact)
    setForm({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      contact_type: contact.contact_type || "collector",
      notes: contact.notes || "",
      tags: contact.tags || [],
      next_followup: contact.next_followup || "",
      total_purchases: contact.total_purchases?.toString() || ""
    })
    setTagInput("")
    setModalOpen(true)
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }))
    }
    setTagInput("")
  }

  const handleRemoveTag = (tag) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Name is required")

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      contact_type: form.contact_type,
      notes: form.notes.trim(),
      tags: form.tags,
      next_followup: form.next_followup || null,
      total_purchases: parseFloat(form.total_purchases) || 0,
      last_contacted: editContact?.last_contacted || new Date().toISOString().split("T")[0]
    }

    if (editContact) {
      const { error } = await supabase.from("contacts").update(payload).eq("id", editContact.id)
      if (error) return toast.error("Failed to update contact")
      toast.success("Contact updated")
      await logActivity(user.id, "contact", `Updated contact "${form.name}"`)
    } else {
      const { error } = await supabase.from("contacts").insert(payload)
      if (error) return toast.error("Failed to add contact")
      toast.success("Contact added")
      await logActivity(user.id, "contact", `Added contact "${form.name}"`)
    }
    setModalOpen(false)
    resetForm()
    fetchContacts()
  }

  const handleDelete = async () => {
    if (!confirmTarget) return
    await supabase.from("contacts").delete().eq("id", confirmTarget.id)
    toast.success("Contact deleted")
    setConfirmTarget(null)
    fetchContacts()
  }

  // Filtered contacts
  const filtered = contacts.filter(c => {
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchType = filterType === "all" || c.contact_type === filterType
    return matchSearch && matchType
  })

  // Count by type
  const typeCounts = { all: contacts.length }
  contacts.forEach(c => { typeCounts[c.contact_type] = (typeCounts[c.contact_type] || 0) + 1 })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#0E0C0A" }}>Contacts</h2>
          <p className="text-xs mt-1" style={{ color: "#A89F94" }}>Manage your collectors, galleries, and collaborators</p>
        </div>
        <button onClick={openCreate} className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 16px" }}>
          <Plus size={15} /> Add Contact
        </button>
      </div>

      {/* Plan limit banner */}
      <LimitBanner resource="contacts" currentCount={contacts.length} label="contacts" />

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts by name, email, company, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none"
            style={{ borderColor: "#E8E2DA", background: "white" }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "collector", label: "Collectors" },
            { key: "gallery", label: "Galleries" },
            { key: "advisor", label: "Advisors" },
            { key: "collaborator", label: "Collaborators" },
            { key: "press", label: "Press" },
          ].map(f => (
            <button key={f.key}
              className={"filter-pill" + (filterType === f.key ? " active" : "")}
              onClick={() => setFilterType(f.key)}>
              {f.label} {typeCounts[f.key] ? `(${typeCounts[f.key]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {fetchError && !loading && (
        <PageError message="Could not load your contacts. Please check your connection and try again." onRetry={fetchContacts} />
      )}

      {/* Loading */}
      {!fetchError && loading ? (
        <div className="text-center py-16">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading contacts...</p>
        </div>
      ) : !fetchError && filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "white", border: "1px solid #E8E2DA" }}>
          <UserCircle size={36} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
          <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: "#0E0C0A" }}>
            {contacts.length === 0 ? "No contacts yet" : "No matches found"}
          </h3>
          <p className="text-sm mb-4" style={{ color: "#A89F94" }}>
            {contacts.length === 0 ? "Add your first collector, gallery, or collaborator." : "Try adjusting your search or filters."}
          </p>
          {contacts.length === 0 && (
            <button onClick={openCreate} className="btn-copper" style={{ fontSize: 13, padding: "8px 20px" }}>Add Your First Contact</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={openEdit}
              onDelete={c => setConfirmTarget(c)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editContact ? "Edit Contact" : "Add Contact"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Type</label>
              <select value={form.contact_type} onChange={e => setForm(f => ({ ...f, contact_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }}>
                {typeOptions.map(t => (
                  <option key={t} value={t}>{typeConfig[t].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 123-4567" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Company</label>
              <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder="Gallery or company name" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Total Purchases ($)</label>
              <input type="text" value={form.total_purchases} onChange={e => setForm(f => ({ ...f, total_purchases: e.target.value }))}
                placeholder="0" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Follow-up Date</label>
            <input type="date" value={form.next_followup} onChange={e => setForm(f => ({ ...f, next_followup: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#E8E2DA" }} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Add notes about this contact..." rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ borderColor: "#E8E2DA" }} />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                  style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddTag() } }}
                placeholder="Add tag and press Enter..."
                className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
              <button onClick={handleAddTag} className="px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: "#F2EDE6", color: "#0E0C0A" }}>Add</button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setModalOpen(false); resetForm() }} className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>Cancel</button>
            <button onClick={handleSave} className="btn-copper" style={{ fontSize: 13, padding: "8px 20px" }}>
              {editContact ? "Save Changes" : "Add Contact"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
        title="Delete Contact?"
        message={`Are you sure you want to delete "${confirmTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
