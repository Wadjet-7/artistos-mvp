import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { supabase, logActivity } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Modal from "../components/Modal"

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
  return "badge-grey"
}

const statusBadge = (status) => {
  const s = (status || "").toLowerCase()
  if (s === "published") return "badge-forest"
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

const emptyForm = {
  platform: "Instagram",
  content: "",
  artwork_title: "",
  scheduled_date: "",
  status: "draft",
}

export default function SocialScheduler() {
  const { user } = useAuth()
  const [postList, setPostList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Current month calendar calculations
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

  // Compute days with posts from real data
  const hasPostDays = postList
    .filter((p) => p.scheduled_date)
    .map((p) => {
      const d = new Date(p.scheduled_date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
        ? d.getDate()
        : null
    })
    .filter(Boolean)

  /* ---- fetch posts from Supabase ---- */
  const fetchPosts = useCallback(async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: true })

    if (!error && data) setPostList(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  /* ---- open modal for new post ---- */
  const openNew = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setModalOpen(true)
  }

  /* ---- open modal for editing ---- */
  const openEdit = (post) => {
    setEditingId(post.id)
    setForm({
      platform: post.platform || "Instagram",
      content: post.content || "",
      artwork_title: post.artwork_title || "",
      scheduled_date: post.scheduled_date
        ? new Date(post.scheduled_date).toISOString().slice(0, 16)
        : "",
      status: post.status || "draft",
    })
    setModalOpen(true)
  }

  /* ---- close modal ---- */
  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm({ ...emptyForm })
  }

  /* ---- save (create or update) ---- */
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
        // Update
        const { error } = await supabase
          .from("scheduled_posts")
          .update(record)
          .eq("id", editingId)

        if (error) throw error
        await logActivity(user.id, "social", `Updated scheduled post "${form.artwork_title || "Untitled"}" on ${form.platform}`)
      } else {
        // Create
        const { error } = await supabase
          .from("scheduled_posts")
          .insert(record)

        if (error) throw error
        await logActivity(user.id, "social", `Scheduled new post "${form.artwork_title || "Untitled"}" on ${form.platform}`)
      }

      closeModal()
      await fetchPosts()
      toast.success(editingId ? "Post updated!" : "Post scheduled!")
    } catch (err) {
      console.error("Failed to save post:", err)
      toast.error("Failed to save post: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- delete ---- */
  const handleDelete = async (post) => {
    if (!confirm(`Delete scheduled post "${post.artwork_title || "Untitled"}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", post.id)

      if (error) throw error
      setPostList((prev) => prev.filter((p) => p.id !== post.id))
      await logActivity(user.id, "social", `Deleted scheduled post "${post.artwork_title || "Untitled"}" from ${post.platform}`)
      toast.success("Post deleted")
    } catch (err) {
      console.error("Failed to delete:", err)
      toast.error("Failed to delete post: " + (err.message || "Unknown error"))
    }
  }

  return (
    <div className="space-y-5">
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
            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
              {dayLabels.map((d) => (
                <div
                  key={d}
                  style={{
                    textAlign: "center",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#A89F94",
                    padding: "6px 0",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOffset }, (_, i) => (
                <div key={"empty-" + i} className="cal-day" style={{ visibility: "hidden" }} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const isToday = day === currentDay
                const hasPost = hasPostDays.includes(day)
                const classes = ["cal-day", isToday && "today", hasPost && "has-post"]
                  .filter(Boolean)
                  .join(" ")
                return (
                  <div key={day} className={classes}>
                    {day}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginTop: "16px",
                paddingTop: "14px",
                borderTop: "1px solid #F2EDE6",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#A89F94" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#B5651D", display: "inline-block" }} />
                Scheduled post
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#A89F94" }}>
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                    background: "#0E0C0A",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "9px",
                    fontWeight: 600,
                  }}
                >
                  {currentDay}
                </span>
                Today
              </div>
            </div>
          </div>
        </div>

        {/* Right: Platform Stats */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Platform Stats</div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {platformStats.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: "12px", fontFamily: "'DM Mono', monospace", color: "#A89F94" }}>
                      {p.followers}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${p.percentage}%`, background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Divider + summary stats */}
            <div
              style={{
                borderTop: "1px solid #F2EDE6",
                marginTop: "20px",
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                { label: "Avg. reach", value: "2,840/post" },
                { label: "Avg. engagement", value: "4.2%" },
                { label: "Best time", value: "Tue 7pm" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#A89F94" }}>{s.label}</span>
                  <span style={{ fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Scheduled Posts */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Upcoming Scheduled Posts</div>
          <span className="badge-grey">{postList.length} posts</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "#B5651D" }} />
                <p className="text-sm" style={{ color: "#A89F94" }}>Loading posts...</p>
              </div>
            </div>
          ) : postList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>No scheduled posts yet</p>
              <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>
                Create your first post to start scheduling content
              </p>
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
                  {postList.map((post) => (
                    <tr key={post.id}>
                      <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{post.artwork_title || "Untitled"}</td>
                      <td>
                        <span
                          style={{
                            display: "block",
                            maxWidth: "240px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "#A89F94",
                          }}
                        >
                          {post.content}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${platformBadge(post.platform)}`}>{post.platform}</span>
                      </td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {formatDate(post.scheduled_date)}
                      </td>
                      <td>
                        <span className={`badge ${statusBadge(post.status)}`}>{post.status}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => openEdit(post)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid #E8E2DA",
                              background: "transparent",
                              cursor: "pointer",
                              color: "#A89F94",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B5651D"; e.currentTarget.style.color = "#B5651D" }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E2DA"; e.currentTarget.style.color = "#A89F94" }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid #E8E2DA",
                              background: "transparent",
                              cursor: "pointer",
                              color: "#A89F94",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e53e3e"; e.currentTarget.style.color = "#e53e3e" }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E2DA"; e.currentTarget.style.color = "#A89F94" }}
                          >
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

      {/* New / Edit Post Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? "Edit Post" : "New Post"}>
        <div className="space-y-4">
          <div>
            <label className="form-label">Platform</label>
            <select
              className="form-select"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              <option>Instagram</option>
              <option>Facebook</option>
              <option>Twitter/X</option>
              <option>LinkedIn</option>
            </select>
          </div>

          <div>
            <label className="form-label">Artwork Title</label>
            <input
              className="form-input"
              placeholder="e.g. Solstice No. 4"
              value={form.artwork_title}
              onChange={(e) => setForm({ ...form, artwork_title: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Content / Caption</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Write your post caption..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ resize: "vertical" }}
            />
          </div>

          <div>
            <label className="form-label">Scheduled Date</label>
            <input
              className="form-input"
              type="datetime-local"
              value={form.scheduled_date}
              onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={handleSave}
              disabled={submitting || !form.content.trim()}
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Saving...</>
              ) : editingId ? (
                <>Update Post</>
              ) : (
                <>Create Post</>
              )}
            </button>
            <button className="btn-secondary flex-1" onClick={closeModal} disabled={submitting}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
