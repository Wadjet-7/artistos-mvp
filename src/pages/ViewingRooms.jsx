import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase, logActivity } from "../lib/supabase"
import Modal from "../components/Modal"
import toast from "react-hot-toast"
import { Eye, Plus, Copy, Trash2, ExternalLink, Lock, Globe, Loader2, Mail } from "lucide-react"
import PageError from "../components/PageError"
import paintAbstract from "../utils/paintAbstract"
import { LimitBanner } from "../components/UpgradePrompt"
import { isAtLimit, normalizePlan } from "../lib/plans"
import { sendViewingRoomEmail } from "../lib/email"

/* ------------------------------------------------------------------ */
/*  Artwork thumbnail with canvas fallback                             */
/* ------------------------------------------------------------------ */
function MiniArtwork({ artwork, selected, onToggle }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!artwork.image_url && canvasRef.current) {
      canvasRef.current.width = 120; canvasRef.current.height = 120
      paintAbstract(canvasRef.current, artwork.id?.charCodeAt(0) || 1)
    }
  }, [artwork])

  return (
    <button onClick={() => onToggle(artwork.id)}
      className={`relative rounded-lg overflow-hidden transition-all ${selected ? "ring-2 ring-offset-2" : "opacity-70 hover:opacity-100"}`}
      style={{ ringColor: "#B5651D", width: 100, height: 100 }}>
      {artwork.image_url
        ? <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
        : <canvas ref={canvasRef} className="w-full h-full object-cover block" />}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(181,101,29,0.4)" }}>
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-full" style={{ background: "#B5651D" }} />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[9px] font-medium text-white truncate"
        style={{ background: "rgba(0,0,0,0.6)" }}>{artwork.title}</div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Generate slug from title                                           */
/* ------------------------------------------------------------------ */
function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6)
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function ViewingRooms() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRoom, setEditRoom] = useState(null)
  const [sendingEmail, setSendingEmail] = useState(null) // room id being sent
  const [fetchError, setFetchError] = useState(false)

  // Form state
  const [form, setForm] = useState({ title: "", description: "", recipientName: "", recipientEmail: "", artworkIds: [] })

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(false)
    try {
      const [roomsRes, artRes] = await Promise.all([
        supabase.from("viewing_rooms").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("artworks").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      ])
      if (roomsRes.error) throw roomsRes.error
      setRooms(roomsRes.data || [])
      setArtworks(artRes.data || [])
    } catch (err) {
      console.error("[ViewingRooms] fetch error:", err)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setForm({ title: "", description: "", recipientName: "", recipientEmail: "", artworkIds: [] })
    setEditRoom(null)
  }

  const openCreate = () => { resetForm(); setModalOpen(true) }
  const openEdit = (room) => {
    setEditRoom(room)
    setForm({
      title: room.title,
      description: room.description || "",
      recipientName: room.recipient_name || "",
      recipientEmail: room.recipient_email || "",
      artworkIds: room.artwork_ids || []
    })
    setModalOpen(true)
  }

  const toggleArtwork = (id) => {
    setForm(prev => ({
      ...prev,
      artworkIds: prev.artworkIds.includes(id)
        ? prev.artworkIds.filter(a => a !== id)
        : [...prev.artworkIds, id]
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required")
    if (form.artworkIds.length === 0) return toast.error("Select at least one artwork")

    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      recipient_name: form.recipientName.trim(),
      recipient_email: form.recipientEmail.trim(),
      artwork_ids: form.artworkIds,
      is_published: editRoom?.is_published || false,
      slug: editRoom?.slug || generateSlug(form.title)
    }

    if (editRoom) {
      const { error } = await supabase.from("viewing_rooms").update(payload).eq("id", editRoom.id)
      if (error) return toast.error("Failed to update")
      toast.success("Viewing room updated")
      await logActivity(user.id, "viewing_room", `Updated viewing room "${form.title}"`)
    } else {
      const { error } = await supabase.from("viewing_rooms").insert(payload)
      if (error) return toast.error("Failed to create")
      toast.success("Viewing room created")
      await logActivity(user.id, "viewing_room", `Created viewing room "${form.title}"`)
    }
    setModalOpen(false)
    resetForm()
    fetchData()
  }

  const togglePublish = async (room) => {
    const { error } = await supabase.from("viewing_rooms").update({ is_published: !room.is_published }).eq("id", room.id)
    if (error) return toast.error("Failed to update")
    toast.success(room.is_published ? "Room unpublished" : "Room published")
    fetchData()
  }

  const deleteRoom = async (room) => {
    if (!confirm(`Delete "${room.title}"?`)) return
    await supabase.from("viewing_rooms").delete().eq("id", room.id)
    toast.success("Room deleted")
    fetchData()
  }

  const copyLink = (slug) => {
    const url = `${window.location.origin}/view/${slug}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied!")
  }

  const handleSendEmail = async (room) => {
    if (!room.recipient_email) {
      toast.error("No recipient email set. Edit the room to add one.")
      return
    }
    setSendingEmail(room.id)
    try {
      const url = `${window.location.origin}/view/${room.slug}`
      await sendViewingRoomEmail({
        to: room.recipient_email,
        artistName: user?.name || "An artist",
        roomTitle: room.title,
        roomUrl: url,
        message: room.description || "",
      })
      toast.success(`Email sent to ${room.recipient_email}!`)
      await logActivity(user.id, "email", `Sent viewing room email for "${room.title}" to ${room.recipient_email}`)
    } catch (err) {
      console.error("Email send error:", err)
      // Fallback to mailto if edge function fails
      const url = `${window.location.origin}/view/${room.slug}`
      const to = room.recipient_email || ""
      const subject = encodeURIComponent(`Viewing Room: ${room.title}`)
      const body = encodeURIComponent(
        `Hi${room.recipient_name ? ` ${room.recipient_name}` : ""},\n\nI'd like to share a curated selection of my work with you.\n\nView it here: ${url}\n\n${room.description ? `About this collection:\n${room.description}\n\n` : ""}Best regards`
      )
      window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_self")
      toast("Opened email client as fallback", { icon: "📧" })
    } finally {
      setSendingEmail(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#0E0C0A" }}>Viewing Rooms</h2>
          <p className="text-xs mt-1" style={{ color: "#A89F94" }}>Create curated selections for collectors and galleries</p>
        </div>
        <button onClick={openCreate} className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 16px" }}>
          <Plus size={15} /> New Room
        </button>
      </div>

      {/* Plan limit banner */}
      <LimitBanner resource="viewingRooms" currentCount={rooms.length} label="viewing rooms" />

      {/* Error state */}
      {fetchError && !loading && (
        <PageError message="Could not load your viewing rooms. Please check your connection and try again." onRetry={fetchData} />
      )}

      {!fetchError && loading ? (
        <div className="text-center py-16">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading...</p>
        </div>
      ) : !fetchError && rooms.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "white", border: "1px solid #E8E2DA" }}>
          <Eye size={36} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
          <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: "#0E0C0A" }}>No viewing rooms yet</h3>
          <p className="text-sm mb-4" style={{ color: "#A89F94" }}>Create a curated selection to share with collectors.</p>
          <button onClick={openCreate} className="btn-copper" style={{ fontSize: 13, padding: "8px 20px" }}>Create Your First Room</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E8E2DA" }}>
              {/* Preview strip of artwork colors */}
              <div className="h-2 flex">
                {(room.artwork_ids || []).slice(0, 6).map((_, i) => (
                  <div key={i} className="flex-1" style={{ background: `hsl(${(i * 60 + 30) % 360}, 40%, ${45 + i * 5}%)` }} />
                ))}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{room.title}</h3>
                    {room.recipient_name && (
                      <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>For: {room.recipient_name}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${room.is_published ? "badge-forest" : ""}`}
                    style={room.is_published ? {} : { background: "#F2EDE6", color: "#A89F94" }}>
                    {room.is_published ? <><Globe size={10} /> Published</> : <><Lock size={10} /> Draft</>}
                  </span>
                </div>
                {room.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: "#A89F94" }}>{room.description}</p>
                )}
                <p className="text-[11px] mb-3" style={{ color: "#A89F94" }}>
                  <strong style={{ color: "#0E0C0A" }}>{(room.artwork_ids || []).length}</strong> artworks
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => openEdit(room)} className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: "#F2EDE6", color: "#0E0C0A" }}>Edit</button>
                  <button onClick={() => togglePublish(room)} className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: room.is_published ? "#FFF3E8" : "#E8F5E9", color: room.is_published ? "#B5651D" : "#2D4A35" }}>
                    {room.is_published ? "Unpublish" : "Publish"}
                  </button>
                  {room.is_published && (
                    <>
                      <button onClick={() => copyLink(room.slug)} className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
                        <Copy size={11} /> Copy Link
                      </button>
                      <button onClick={() => handleSendEmail(room)}
                        disabled={sendingEmail === room.id}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        style={{ background: "#E8F5E9", color: "#2D4A35" }}>
                        {sendingEmail === room.id ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}
                        {sendingEmail === room.id ? "Sending..." : "Send"}
                      </button>
                      <a href={`/view/${room.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
                        <ExternalLink size={11} /> Preview
                      </a>
                    </>
                  )}
                  <button onClick={() => deleteRoom(room)} className="text-[11px] font-medium px-2 py-1.5 rounded-lg transition-colors ml-auto"
                    style={{ color: "#C4705A" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={editRoom ? "Edit Viewing Room" : "Create Viewing Room"} wide>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Room Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Spring Collection 2026" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: "#E8E2DA" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Recipient Name</label>
              <input type="text" value={form.recipientName} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
                placeholder="Collector or gallery name" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Recipient Email</label>
              <input type="email" value={form.recipientEmail} onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
                placeholder="email@example.com" className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ borderColor: "#E8E2DA" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Add a note for the viewer..." rows={2} className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ borderColor: "#E8E2DA" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#0E0C0A" }}>
              Select Artworks * <span style={{ color: "#A89F94", fontWeight: 400 }}>({form.artworkIds.length} selected)</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-2 rounded-lg" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
              {artworks.map(art => (
                <MiniArtwork key={art.id} artwork={art} selected={form.artworkIds.includes(art.id)} onToggle={toggleArtwork} />
              ))}
              {artworks.length === 0 && (
                <p className="text-xs py-4 text-center w-full" style={{ color: "#A89F94" }}>No artworks yet. Add some in Portfolio first.</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => { setModalOpen(false); resetForm() }} className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>Cancel</button>
            <button onClick={handleSave} className="btn-copper" style={{ fontSize: 13, padding: "8px 20px" }}>
              {editRoom ? "Save Changes" : "Create Room"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
