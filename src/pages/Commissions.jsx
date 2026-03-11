import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Edit2, Loader2, CheckCircle } from "lucide-react"
import { supabase, logActivity } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Modal from "../components/Modal"

const defaultForm = {
  client_name: "",
  client_email: "",
  title: "",
  description: "",
  medium: "",
  dimensions: "",
  budget: "",
  deadline: "",
  status: "pending",
  progress: 0,
  milestone: "",
}

const statusBadgeClass = {
  active: "badge-gold",
  review: "badge-copper",
  quoted: "badge-forest",
}

export default function Commissions() {
  const { user } = useAuth()
  const [commissionList, setCommissionList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("active")
  const [form, setForm] = useState(defaultForm)

  /* ---- fetch commissions from Supabase ---- */
  const fetchCommissions = useCallback(async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from("commissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) setCommissionList(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchCommissions()
  }, [fetchCommissions])

  /* ---- compute tab counts dynamically ---- */
  const activeStatuses = ["active", "review", "quoted"]
  const activeItems = commissionList.filter((c) => activeStatuses.includes(c.status))
  const pendingItems = commissionList.filter((c) => c.status === "pending")
  const completedItems = commissionList.filter((c) => c.status === "completed")

  const tabs = [
    { key: "active", label: "Active", count: activeItems.length },
    { key: "pending", label: "Pending", count: pendingItems.length },
    { key: "completed", label: "Completed", count: completedItems.length },
  ]

  /* ---- open modal for new or edit ---- */
  const openNew = () => {
    setEditingId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (commission) => {
    setEditingId(commission.id)
    setForm({
      client_name: commission.client_name || "",
      client_email: commission.client_email || "",
      title: commission.title || "",
      description: commission.description || "",
      medium: commission.medium || "",
      dimensions: commission.dimensions || "",
      budget: commission.budget != null ? String(commission.budget) : "",
      deadline: commission.deadline || "",
      status: commission.status || "pending",
      progress: commission.progress || 0,
      milestone: commission.milestone || "",
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  /* ---- save (create or update) ---- */
  const handleSave = async () => {
    if (!form.title.trim() || !form.client_name.trim()) return
    setSubmitting(true)

    try {
      const payload = {
        client_name: form.client_name.trim(),
        client_email: form.client_email.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        medium: form.medium.trim(),
        dimensions: form.dimensions.trim(),
        budget: parseFloat(form.budget) || 0,
        deadline: form.deadline || null,
        status: form.status,
        progress: parseInt(form.progress) || 0,
        milestone: form.milestone.trim(),
      }

      if (editingId) {
        const { error } = await supabase
          .from("commissions")
          .update(payload)
          .eq("id", editingId)

        if (error) throw error
        await logActivity(user.id, "commission", `Updated commission "${payload.title}" for ${payload.client_name}`)
      } else {
        const { error } = await supabase
          .from("commissions")
          .insert({ ...payload, user_id: user.id })

        if (error) throw error
        await logActivity(user.id, "commission", `Created new commission "${payload.title}" for ${payload.client_name}`)
      }

      closeModal()
      await fetchCommissions()
    } catch (err) {
      console.error("Failed to save commission:", err)
      alert("Failed to save commission: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- delete ---- */
  const handleDelete = async (commission) => {
    if (!confirm(`Delete commission "${commission.title}"? This cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from("commissions")
        .delete()
        .eq("id", commission.id)

      if (error) throw error

      setCommissionList((prev) => prev.filter((c) => c.id !== commission.id))
      await logActivity(user.id, "commission", `Deleted commission "${commission.title}"`)
    } catch (err) {
      console.error("Failed to delete commission:", err)
      alert("Failed to delete commission: " + (err.message || "Unknown error"))
    }
  }

  /* ---- accept pending commission ---- */
  const handleAccept = async (commission) => {
    try {
      const { error } = await supabase
        .from("commissions")
        .update({ status: "active" })
        .eq("id", commission.id)

      if (error) throw error

      setCommissionList((prev) =>
        prev.map((c) => (c.id === commission.id ? { ...c, status: "active" } : c))
      )
      await logActivity(user.id, "commission", `Accepted commission "${commission.title}" from ${commission.client_name}`)
    } catch (err) {
      console.error("Failed to accept commission:", err)
      alert("Failed to accept commission: " + (err.message || "Unknown error"))
    }
  }

  /* ---- helpers ---- */
  const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const totalEarned = completedItems.reduce((sum, c) => sum + (c.budget || 0), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28,
              fontWeight: 600,
              color: "#0E0C0A",
            }}
          >
            Commissions
          </h1>
          <p style={{ fontSize: 13, color: "#A89F94", marginTop: 2 }}>
            Manage your commission requests and active projects
          </p>
        </div>
        <button className="btn-copper" onClick={openNew}>
          <Plus size={16} /> New Commission
        </button>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "inline-flex",
          gap: 2,
          background: "#F2EDE6",
          padding: 4,
          borderRadius: 10,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 20px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
              transition: "all 0.15s",
              fontFamily: "'DM Sans', sans-serif",
              background: activeTab === tab.key ? "white" : "transparent",
              boxShadow:
                activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              color: activeTab === tab.key ? "#0E0C0A" : "#A89F94",
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2
              size={24}
              className="animate-spin mx-auto mb-2"
              style={{ color: "#B5651D" }}
            />
            <p className="text-sm" style={{ color: "#A89F94" }}>
              Loading commissions...
            </p>
          </div>
        </div>
      )}

      {/* ---- Active Tab ---- */}
      {!loading && activeTab === "active" && (
        <>
          {activeItems.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "48px 24px" }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>
                No active commissions
              </p>
              <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>
                Accept pending requests or create a new commission to get started
              </p>
              <button className="btn-copper mt-4" onClick={openNew}>
                <Plus size={15} /> New Commission
              </button>
            </div>
          ) : (
            <div className="card" style={{ overflow: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Description</th>
                    <th>Timeline</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Milestone</th>
                  </tr>
                </thead>
                <tbody>
                  {activeItems.map((c) => (
                    <tr key={c.id}>
                      {/* Client */}
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13.5,
                            color: "#0E0C0A",
                          }}
                        >
                          {c.client_name}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#A89F94",
                            marginTop: 2,
                          }}
                        >
                          {c.client_email}
                        </div>
                      </td>

                      {/* Description */}
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13.5,
                            color: "#0E0C0A",
                          }}
                        >
                          {c.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "#A89F94",
                            marginTop: 2,
                          }}
                        >
                          {c.description}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td>
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 12.5,
                            color: "#0E0C0A",
                          }}
                        >
                          Due {formatDate(c.deadline)}
                        </span>
                      </td>

                      {/* Value */}
                      <td>
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0E0C0A",
                          }}
                        >
                          ${(c.budget || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={"badge " + (statusBadgeClass[c.status] || "badge-gold")}>
                          {c.status}
                        </span>
                      </td>

                      {/* Milestone */}
                      <td>
                        <div style={{ fontSize: 12.5, color: "#0E0C0A" }}>
                          {c.milestone || "—"}
                        </div>
                        <div className="progress-bar" style={{ width: 120 }}>
                          <div
                            className="progress-fill"
                            style={{ width: (c.progress || 0) + "%" }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ---- Pending Tab ---- */}
      {!loading && activeTab === "pending" && (
        <>
          {pendingItems.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "48px 24px" }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>
                No pending requests
              </p>
              <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>
                New commission requests from collectors will appear here
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ paddingBottom: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "#A89F94",
                    marginBottom: 14,
                  }}
                >
                  <strong style={{ color: "#0E0C0A" }}>
                    {pendingItems.length}
                  </strong>{" "}
                  new commission request{pendingItems.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ overflow: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Collector</th>
                      <th>Request</th>
                      <th>Budget</th>
                      <th>Received</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingItems.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 13.5,
                              color: "#0E0C0A",
                            }}
                          >
                            {p.client_name}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 13, color: "#0E0C0A" }}>
                            {p.title}
                            {p.description ? ` — ${p.description}` : ""}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 12.5,
                              color: "#0E0C0A",
                            }}
                          >
                            ${(p.budget || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: 12.5,
                              color: "#A89F94",
                            }}
                          >
                            {formatDate(p.created_at)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn-copper"
                              style={{
                                fontSize: 12,
                                padding: "6px 14px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                              onClick={() => handleAccept(p)}
                            >
                              <CheckCircle size={13} /> Accept
                            </button>
                            <button
                              style={{
                                fontSize: 12,
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "1px solid #E8E2DA",
                                background: "white",
                                color: "#A89F94",
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                              onClick={() => handleDelete(p)}
                            >
                              Decline
                            </button>
                            <button
                              style={{
                                fontSize: 12,
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "1px solid #E8E2DA",
                                background: "white",
                                color: "#A89F94",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                              onClick={() => openEdit(p)}
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ---- Completed Tab ---- */}
      {!loading && activeTab === "completed" && (
        <>
          {completedItems.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: "center", padding: "48px 24px" }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>
                No completed commissions yet
              </p>
              <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>
                Completed commissions will appear here
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 20px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 24,
                      fontWeight: 600,
                      color: "#0E0C0A",
                      marginBottom: 8,
                    }}
                  >
                    {completedItems.length} completed commission
                    {completedItems.length !== 1 ? "s" : ""}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#A89F94",
                      lineHeight: 1.8,
                    }}
                  >
                    ${totalEarned.toLocaleString()} total earned
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ---- Modal ---- */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Commission" : "New Commission"}
        wide
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Client Name</label>
              <input
                className="form-input"
                placeholder="e.g. Sarah Mitchell"
                value={form.client_name}
                onChange={(e) =>
                  setForm({ ...form, client_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label">Client Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="e.g. sarah@example.com"
                value={form.client_email}
                onChange={(e) =>
                  setForm({ ...form, client_email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="form-label">Commission Title</label>
            <input
              className="form-input"
              placeholder="e.g. Portrait Commission - Oil"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Details about the commission request..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Medium</label>
              <input
                className="form-input"
                placeholder="e.g. Oil on Canvas"
                value={form.medium}
                onChange={(e) => setForm({ ...form, medium: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Dimensions</label>
              <input
                className="form-input"
                placeholder='e.g. 24x36"'
                value={form.dimensions}
                onChange={(e) =>
                  setForm({ ...form, dimensions: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Budget (USD)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 3500"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Deadline</label>
              <input
                className="form-input"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="quoted">Quoted</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="form-label">Progress (%)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Milestone</label>
            <input
              className="form-input"
              placeholder="e.g. Initial sketches approved"
              value={form.milestone}
              onChange={(e) => setForm({ ...form, milestone: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="btn-copper flex-1 flex items-center justify-center gap-2"
              onClick={handleSave}
              disabled={submitting || !form.title.trim() || !form.client_name.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving...
                </>
              ) : editingId ? (
                "Update Commission"
              ) : (
                "Create Commission"
              )}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
