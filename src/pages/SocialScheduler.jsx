import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Edit2, Loader2, ExternalLink, Hash, Copy, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { supabase, logActivity } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Modal from "../components/Modal"
import ConfirmModal from "../components/ConfirmModal"

/* ------------------------------------------------------------------ */
/*  Platform config                                                    */
/* ------------------------------------------------------------------ */
const platformStats = [
  { name: "Instagram", followers: "12.4K", percentage: 78, color: "#B5651D" },
  { name: "Twitter/X", followers: "3,210", percentage: 42, color: "#2D4A35" },
  { name: "Facebook", followers: "2,840", percentage: 35, color: "#C4705A" },
]

const platformBadge = (platform) => {
  const p = (platform || "").toLowerCase()
  if (p.includes("instagram")) return "badge-copper"
  if (p.includes("facebook")) return "badge-forest"
  if (p.includes("twitter") || p.includes("x")) return "badge-gold"
  if (p.includes("linkedin")) return "badge-grey"
  return "badge-grey"
}

const statusBadge = (status) => {
  const s = (status || "").toLowerCase()
  if (s === "published") return "badge-forest"
  if (s === "scheduled") return "badge-copper"
  if (s === "draft") return "badge-gold"
  return "badge-grey"
}

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = months[d.getMonth()]
  const day = d.getDate()
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  return `${month} ${day} \u00b7 ${hours}:${minutes} ${ampm}`
}

/* ------------------------------------------------------------------ */
/*  Hashtag generator based on medium/style                            */
/* ------------------------------------------------------------------ */
const hashtagSets = {
  "Oil on Canvas": ["#oilpainting", "#oiloncanvas", "#contemporaryart", "#fineart", "#painting", "#artistlife", "#artcollector"],
  "Acrylic": ["#acrylicpainting", "#acrylicart", "#contemporaryart", "#abstractart", "#painting", "#artforsale"],
  "Mixed Media": ["#mixedmedia", "#mixedmediaart", "#contemporaryart", "#collage", "#assemblage", "#artprocess"],
  "Photography": ["#artphotography", "#fineartphotography", "#photographyart", "#visualart", "#photooftheday"],
  "Sculpture": ["#sculpture", "#sculptureartist", "#contemporarysculpture", "#3dart", "#installation", "#artobject"],
}

const generalTags = ["#art", "#artist", "#artwork", "#studiovisit", "#newwork", "#artgallery", "#instaart", "#artoftheday"]

function generateHashtags(medium, platform) {
  const specific = hashtagSets[medium] || hashtagSets["Oil on Canvas"]
  const mixed = [...specific.slice(0, 4), ...generalTags.slice(0, 4)]
  if (platform?.includes("LinkedIn")) return mixed.slice(0, 5).join(" ")
  return mixed.join(" ")
}

/* ------------------------------------------------------------------ */
/*  Content templates                                                  */
/* ------------------------------------------------------------------ */
const templates = [
  { label: "New Work Announcement", text: "Excited to share my latest piece — \"{title}\". {medium}, {dimensions}.\n\nThis work explores [describe themes]. Available for purchase.\n\n" },
  { label: "Studio Process", text: "A glimpse into the studio today. Working on \"{title}\" — {medium}.\n\nI've been experimenting with [technique/palette]. More to come.\n\n" },
  { label: "Exhibition Promo", text: "Come see \"{title}\" and more at [gallery name], [dates].\n\nOpening reception: [date & time]. All are welcome.\n\n" },
  { label: "Sold / Thank You", text: "Thrilled to announce that \"{title}\" has found a new home! Thank you to [collector/gallery] for supporting my work.\n\n" },
]

/* ------------------------------------------------------------------ */
/*  Post Now — opens platform with pre-filled content                  */
/* ------------------------------------------------------------------ */
function getPostUrl(platform, content) {
  const text = encodeURIComponent(content || "")
  switch ((platform || "").toLowerCase()) {
    case "twitter/x":
      return `https://twitter.com/intent/tweet?text=${text}`
    case "linkedin":
      return `https://www.linkedin.com/feed/?shareActive=true&text=${text}`
    case "facebook":
      return `https://www.facebook.com/`
    case "instagram":
    default:
      return `https://www.instagram.com/`
  }
}

/* ------------------------------------------------------------------ */
/*  Empty form                                                         */
/* ------------------------------------------------------------------ */
const emptyForm = {
  platform: "Instagram",
  content: "",
  artwork_title: "",
  scheduled_date: "",
  status: "draft",
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function SocialScheduler() {
  const { user } = useAuth()
  const [postList, setPostList] = useState([])
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [confirmTarget, setConfirmTarget] = useState(null)

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDay = now.getDate()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const hasPostDays = postList
    .filter(p => p.scheduled_date)
    .map(p => {
      const d = new Date(p.scheduled_date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth ? d.getDate() : null
    })
    .filter(Boolean)

  /* ---- fetch posts + artworks ---- */
  const fetchData = useCallback(async () => {
    if (!user?.id) return
    const [postRes, artRes] = await Promise.all([
      supabase.from("scheduled_posts").select("*").eq("user_id", user.id).order("scheduled_date", { ascending: true }),
      supabase.from("artworks").select("id, title, medium, dimensions").eq("user_id", user.id).order("created_at", { ascending: false }),
    ])
    if (!postRes.error && postRes.data) setPostList(postRes.data)
    if (!artRes.error && artRes.data) setArtworks(artRes.data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  /* ---- modal helpers ---- */
  const openNew = () => { setEditingId(null); setForm({ ...emptyForm }); setModalOpen(true) }
  const openEdit = (post) => {
    setEditingId(post.id)
    setForm({
      platform: post.platform || "Instagram",
      content: post.content || "",
      artwork_title: post.artwork_title || "",
      scheduled_date: post.scheduled_date ? new Date(post.scheduled_date).toISOString().slice(0, 16) : "",
      status: post.status || "draft",
    })
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditingId(null); setForm({ ...emptyForm }) }

  /* ---- save ---- */
  const handleSave = async () => {
    if (!form.content.trim() || !user?.id) return
    setSubmitting(true)
    try {
      const record = {
        user_id: user.id,
        platform: form.platform,
        content: form.content.trim(),
        artwork_title: form.artwork_title.trim(),
        scheduled_date: form.scheduled_date || null,
        status: form.status,
      }
      if (editingId) {
        const { error } = await supabase.from("scheduled_posts").update(record).eq("id", editingId)
        if (error) throw error
        await logActivity(user.id, "social", `Updated scheduled post "${form.artwork_title || "Untitled"}" on ${form.platform}`)
      } else {
        const { error } = await supabase.from("scheduled_posts").insert(record)
        if (error) throw error
        await logActivity(user.id, "social", `Scheduled new post "${form.artwork_title || "Untitled"}" on ${form.platform}`)
      }
      closeModal()
      await fetchData()
      toast.success(editingId ? "Post updated!" : "Post scheduled!")
    } catch (err) {
      console.error("Failed to save post:", err)
      toast.error("Failed to save post: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- delete ---- */
  const handleDelete = (post) => setConfirmTarget(post)
  const handleConfirmDelete = async () => {
    const post = confirmTarget
    setConfirmTarget(null)
    try {
      const { error } = await supabase.from("scheduled_posts").delete().eq("id", post.id)
      if (error) throw error
      setPostList(prev => prev.filter(p => p.id !== post.id))
      await logActivity(user.id, "social", `Deleted scheduled post "${post.artwork_title || "Untitled"}" from ${post.platform}`)
      toast.success("Post deleted")
    } catch (err) {
      toast.error("Failed to delete post")
    }
  }

  /* ---- copy caption ---- */
  const copyCaption = (content) => {
    navigator.clipboard.writeText(content)
    toast.success("Caption copied!")
  }

  /* ---- apply template ---- */
  const applyTemplate = (template) => {
    const artwork = artworks.find(a => a.title === form.artwork_title) || artworks[0]
    let text = template.text
      .replace("{title}", form.artwork_title || artwork?.title || "Untitled")
      .replace("{medium}", artwork?.medium || "")
      .replace("{dimensions}", artwork?.dimensions || "")
    setForm(f => ({ ...f, content: text }))
  }

  /* ---- add hashtags ---- */
  const addHashtags = () => {
    const artwork = artworks.find(a => a.title === form.artwork_title)
    const tags = generateHashtags(artwork?.medium, form.platform)
    setForm(f => ({ ...f, content: f.content.trim() + "\n\n" + tags }))
    toast.success("Hashtags added!")
  }

  /* ---- upcoming posts (next 7 days) ---- */
  const upcomingPosts = postList.filter(p => {
    if (!p.scheduled_date || p.status === "published") return false
    const d = new Date(p.scheduled_date)
    const diff = (d - now) / 86400000
    return diff >= 0 && diff <= 7
  })

  return (
    <div className="space-y-5">
      {/* Upcoming reminders banner */}
      {upcomingPosts.length > 0 && (
        <div className="rounded-xl px-5 py-4" style={{ background: "linear-gradient(135deg, #B5651D, #D4854A)", color: "white" }}>
          <div className="text-[11px] uppercase tracking-[2px] mb-2" style={{ opacity: 0.7 }}>Upcoming This Week</div>
          <div className="flex flex-wrap gap-3">
            {upcomingPosts.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{p.artwork_title || "Post"}</span>
                <span style={{ opacity: 0.7 }}>·</span>
                <span style={{ opacity: 0.8 }}>{p.platform}</span>
                <span style={{ opacity: 0.7 }}>·</span>
                <span style={{ opacity: 0.8 }}>{formatDate(p.scheduled_date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        {/* Left: Content Calendar */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Content Calendar</div>
              <div className="card-subtitle">{monthNames[currentMonth]} {currentYear}</div>
            </div>
            <button className="btn-copper" style={{ fontSize: "12px", padding: "6px 14px" }} onClick={openNew}>
              + New Post
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
              {dayLabels.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "#A89F94", padding: "6px 0" }}>
                  {d}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {Array.from({ length: firstDayOffset }, (_, i) => (
                <div key={"empty-" + i} className="cal-day" style={{ visibility: "hidden" }} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const isToday = day === currentDay
                const hasPost = hasPostDays.includes(day)
                return (
                  <div key={day} className={["cal-day", isToday && "today", hasPost && "has-post"].filter(Boolean).join(" ")}>
                    {day}
                  </div>
                )
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #F2EDE6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#A89F94" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#B5651D", display: "inline-block" }} />
                Scheduled post
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#A89F94" }}>
                <span style={{ width: "18px", height: "18px", borderRadius: "4px", background: "#0E0C0A", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "9px", fontWeight: 600 }}>
                  {currentDay}
                </span>
                Today
              </div>
            </div>
          </div>
        </div>

        {/* Right: Platform Stats + Smart Tips */}
        <div className="space-y-5">
          <div className="card">
            <div className="card-header"><div className="card-title">Platform Stats</div></div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {platformStats.map(p => (
                  <div key={p.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 500 }}>{p.name}</span>
                      <span style={{ fontSize: "12px", fontFamily: "'DM Mono', monospace", color: "#A89F94" }}>{p.followers}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p.percentage}%`, background: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #F2EDE6", marginTop: "20px", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Avg. reach", value: "2,840/post" },
                  { label: "Avg. engagement", value: "4.2%" },
                  { label: "Best time", value: "Tue 7pm" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                    <span style={{ color: "#A89F94" }}>{s.label}</span>
                    <span style={{ fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Tips */}
          <div className="card">
            <div className="card-header">
              <div className="card-title flex items-center gap-1.5"><Sparkles size={14} style={{ color: "#B5651D" }} /> Smart Tips</div>
            </div>
            <div className="card-body text-xs space-y-3" style={{ color: "#777" }}>
              <div className="p-2.5 rounded-lg" style={{ background: "#FAF8F5" }}>
                <strong style={{ color: "#0E0C0A" }}>Best posting times:</strong> Tue & Thu at 7pm, Sat 11am for highest engagement
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: "#FAF8F5" }}>
                <strong style={{ color: "#0E0C0A" }}>Hashtag tip:</strong> Use 8-12 hashtags on Instagram, 3-5 on Twitter/X, 3 on LinkedIn
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: "#FAF8F5" }}>
                <strong style={{ color: "#0E0C0A" }}>Consistency:</strong> Post 3-4x/week to maintain visibility in art collector feeds
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Posts Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Scheduled Posts</div>
          <span className="badge badge-grey">{postList.length} posts</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "#B5651D" }} />
              <p className="text-sm ml-3" style={{ color: "#A89F94" }}>Loading posts...</p>
            </div>
          ) : postList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>No scheduled posts yet</p>
              <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>Create your first post to start planning content</p>
              <button className="btn-copper" style={{ marginTop: "16px" }} onClick={openNew}>
                <Plus size={15} /> New Post
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Caption</th>
                    <th>Platform</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postList.map(post => (
                    <tr key={post.id}>
                      <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{post.artwork_title || "Untitled"}</td>
                      <td>
                        <span style={{ display: "block", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#A89F94" }}>
                          {post.content}
                        </span>
                      </td>
                      <td><span className={`badge ${platformBadge(post.platform)}`}>{post.platform}</span></td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", whiteSpace: "nowrap" }}>{formatDate(post.scheduled_date)}</td>
                      <td><span className={`badge ${statusBadge(post.status)}`}>{post.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={() => copyCaption(post.content)} title="Copy Caption"
                            style={{ padding: "4px", borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: "#A89F94" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#B5651D"}
                            onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                            <Copy size={13} />
                          </button>
                          <a href={getPostUrl(post.platform, post.content)} target="_blank" rel="noopener noreferrer" title="Post Now"
                            style={{ padding: "4px", borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: "#A89F94", display: "inline-flex" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#2D4A35"}
                            onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                            <ExternalLink size={13} />
                          </a>
                          <button onClick={() => openEdit(post)} title="Edit"
                            style={{ padding: "4px", borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: "#A89F94" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#B5651D"}
                            onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(post)} title="Delete"
                            style={{ padding: "4px", borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: "#A89F94" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C4705A"}
                            onMouseLeave={e => e.currentTarget.style.color = "#A89F94"}>
                            <Trash2 size={13} />
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

      {/* New / Edit Post Modal — Enhanced */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Edit Post" : "New Post"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Platform</label>
              <select className="form-select" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>Twitter/X</option>
                <option>LinkedIn</option>
              </select>
            </div>
            <div>
              <label className="form-label">Artwork</label>
              <select className="form-select" value={form.artwork_title}
                onChange={e => setForm({ ...form, artwork_title: e.target.value })}>
                <option value="">Select artwork...</option>
                {artworks.map(a => <option key={a.id} value={a.title}>{a.title}</option>)}
              </select>
            </div>
          </div>

          {/* Content templates */}
          <div>
            <label className="form-label">Quick Templates</label>
            <div className="flex flex-wrap gap-1.5">
              {templates.map(t => (
                <button key={t.label} onClick={() => applyTemplate(t)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                  style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label" style={{ marginBottom: 0 }}>Caption</label>
              <div className="flex gap-1.5">
                <button onClick={addHashtags} className="text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1"
                  style={{ background: "#FFF3E8", color: "#B5651D" }}>
                  <Hash size={11} /> Add Hashtags
                </button>
                <button onClick={() => copyCaption(form.content)} className="text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1"
                  style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
                  <Copy size={11} /> Copy
                </button>
              </div>
            </div>
            <textarea className="form-input" rows={5} placeholder="Write your post caption..." value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })} style={{ resize: "vertical" }} />
            <div className="text-[11px] mt-1" style={{ color: "#A89F94" }}>
              {form.content.length} characters
              {form.platform === "Twitter/X" && form.content.length > 280 && (
                <span style={{ color: "#C4705A", fontWeight: 600 }}> · Exceeds 280 char limit</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Scheduled Date</label>
              <input className="form-input" type="datetime-local" value={form.scheduled_date}
                onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Post Now shortcut */}
          <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
            <div className="text-xs" style={{ color: "#A89F94" }}>
              Ready to post? Copy your caption and open {form.platform}
            </div>
            <a href={getPostUrl(form.platform, form.content)} target="_blank" rel="noopener noreferrer"
              className="btn-copper flex items-center gap-1.5" style={{ fontSize: 12, padding: "6px 14px" }}>
              <ExternalLink size={13} /> Open {form.platform}
            </a>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={handleSave} disabled={submitting || !form.content.trim()}>
              {submitting ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editingId ? <>Update Post</> : <>Schedule Post</>}
            </button>
            <button className="btn-secondary flex-1" onClick={closeModal} disabled={submitting}>Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!confirmTarget} onClose={() => setConfirmTarget(null)} onConfirm={handleConfirmDelete}
        title="Delete Scheduled Post?" message={`Are you sure you want to delete "${confirmTarget?.artwork_title || "Untitled"}"? This cannot be undone.`} />
    </div>
  )
}
