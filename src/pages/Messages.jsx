import { useState, useEffect, useRef, useCallback } from "react"
import { Plus, Loader2, Send } from "lucide-react"
import { supabase, logActivity } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Modal from "../components/Modal"

const GRADIENTS = [
  "linear-gradient(135deg, #B5651D, #C9A84C)",
  "linear-gradient(135deg, #4A7A57, #2D4A35)",
  "linear-gradient(135deg, #C4705A, #B5651D)",
  "linear-gradient(135deg, #2D4A35, #4A7A57)",
  "linear-gradient(135deg, #C9A84C, #D4854A)",
  "linear-gradient(135deg, #8A6A1A, #C9A84C)",
  "linear-gradient(135deg, #0E0C0A, #3A3530)",
]

function formatTime(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export default function Messages() {
  const { user } = useAuth()
  const [conversationList, setConversationList] = useState([])
  const [messageMap, setMessageMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const [newConvoModal, setNewConvoModal] = useState(false)
  const [newConvoForm, setNewConvoForm] = useState({
    participant_name: "",
    participant_initial: "",
  })
  const messagesEndRef = useRef(null)

  /* ---- Fetch conversations ---- */
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false })

    if (!error && data) {
      setConversationList(data)
    }
  }, [user?.id])

  /* ---- Fetch messages for a conversation ---- */
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (!error && data) {
      setMessageMap((prev) => ({ ...prev, [conversationId]: data }))
    }
  }, [])

  /* ---- Initial load ---- */
  useEffect(() => {
    if (!user?.id) return
    let mounted = true
    const load = async () => {
      setLoading(true)
      await fetchConversations()
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [user?.id, fetchConversations])

  /* ---- When selectedId changes, fetch messages ---- */
  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId)
    }
  }, [selectedId, fetchMessages])

  /* ---- Auto-scroll to bottom ---- */
  const currentMessages = messageMap[selectedId] || []
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentMessages.length, selectedId])

  /* ---- Derived state ---- */
  const selected = conversationList.find((c) => c.id === selectedId)
  const filteredConversations = conversationList.filter(
    (c) =>
      search === "" ||
      c.participant_name.toLowerCase().includes(search.toLowerCase())
  )

  /* ---- Send message ---- */
  async function handleSend() {
    const text = draft.trim()
    if (!text || !selectedId) return

    setDraft("")

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedId,
      sender: "me",
      content: text,
    })

    if (error) return

    await supabase
      .from("conversations")
      .update({
        last_message: text,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", selectedId)

    await fetchMessages(selectedId)
    await fetchConversations()
    await logActivity(user.id, "message_sent", `Sent message in conversation`)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /* ---- New conversation ---- */
  async function handleNewConversation() {
    const name = newConvoForm.participant_name.trim()
    if (!name || !user?.id) return

    const initial = name.charAt(0).toUpperCase()
    const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        participant_name: name,
        participant_initial: initial,
        participant_gradient: gradient,
      })
      .select()
      .single()

    if (error || !data) return

    setNewConvoModal(false)
    setNewConvoForm({ participant_name: "", participant_initial: "" })
    await fetchConversations()
    setSelectedId(data.id)
    await logActivity(user.id, "conversation_created", `Started conversation with ${name}`)
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 480,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Loader2
            size={28}
            style={{ color: "#B5651D", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}
          />
          <div style={{ fontSize: 13, color: "#A89F94" }}>
            Loading conversations...
          </div>
        </div>
      </div>
    )
  }

  /* ---- Empty state ---- */
  if (conversationList.length === 0) {
    return (
      <>
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 480,
          }}
        >
          <div style={{ textAlign: "center", padding: 40 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 600,
                color: "#0E0C0A",
                marginBottom: 8,
              }}
            >
              No conversations yet
            </div>
            <div
              style={{ fontSize: 13, color: "#A89F94", marginBottom: 20 }}
            >
              Start a conversation to connect with collectors and collaborators.
            </div>
            <button
              className="btn-copper"
              onClick={() => setNewConvoModal(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={15} />
              Start a conversation
            </button>
          </div>
        </div>

        {/* New Conversation Modal */}
        <Modal
          open={newConvoModal}
          onClose={() => setNewConvoModal(false)}
          title="New Conversation"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#0E0C0A",
                  marginBottom: 6,
                }}
              >
                Participant Name
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. David Chen"
                value={newConvoForm.participant_name}
                onChange={(e) =>
                  setNewConvoForm((f) => ({
                    ...f,
                    participant_name: e.target.value,
                  }))
                }
              />
            </div>
            <button className="btn-primary" onClick={handleNewConversation}>
              Start Conversation
            </button>
          </div>
        </Modal>
      </>
    )
  }

  /* ---- Main layout ---- */
  return (
    <>
      <div
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          minHeight: 480,
          overflow: "hidden",
        }}
      >
        {/* Left Panel - Conversation List */}
        <div
          style={{
            borderRight: "1px solid #E8E2DA",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search + New button */}
          <div
            style={{
              padding: "14px 14px 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              className="form-input"
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 12.5, padding: "8px 12px", flex: 1 }}
            />
            <button
              className="btn-copper"
              onClick={() => setNewConvoModal(true)}
              style={{
                fontSize: 11.5,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={13} />
              New
            </button>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredConversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => setSelectedId(convo.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  background:
                    convo.id === selectedId ? "#F2EDE6" : "transparent",
                  borderBottom: "1px solid #F2EDE6",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (convo.id !== selectedId)
                    e.currentTarget.style.background = "#FAF8F5"
                }}
                onMouseLeave={(e) => {
                  if (convo.id !== selectedId)
                    e.currentTarget.style.background = "transparent"
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: convo.participant_gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  {convo.participant_initial}
                  {convo.participant_online && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#4A7A57",
                        border: "2px solid white",
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0E0C0A",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {convo.participant_name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#A89F94",
                        fontFamily: "'DM Mono', monospace",
                        flexShrink: 0,
                      }}
                    >
                      {formatTime(convo.last_message_at)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                      marginTop: 2,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#A89F94",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {convo.last_message || "No messages yet"}
                    </div>
                    {convo.unread_count > 0 && (
                      <div
                        style={{
                          background: "#B5651D",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 700,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {convo.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          {selected ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  borderBottom: "1px solid #F2EDE6",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: selected.participant_gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {selected.participant_initial}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "#0E0C0A",
                    }}
                  >
                    {selected.participant_name}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#A89F94", marginTop: 1 }}
                  >
                    {selected.participant_online ? (
                      <span style={{ color: "#4A7A57" }}>Online</span>
                    ) : (
                      "Offline"
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 20px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.sender === "me" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 14px",
                        borderRadius:
                          msg.sender === "me"
                            ? "14px 14px 4px 14px"
                            : "14px 14px 14px 4px",
                        background:
                          msg.sender === "me" ? "#0E0C0A" : "#F2EDE6",
                        color: msg.sender === "me" ? "white" : "#0E0C0A",
                        fontSize: 13,
                        lineHeight: 1.55,
                      }}
                    >
                      <div>{msg.content}</div>
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 4,
                          opacity: 0.55,
                          fontFamily: "'DM Mono', monospace",
                          textAlign: msg.sender === "me" ? "right" : "left",
                        }}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 20px",
                  borderTop: "1px solid #F2EDE6",
                }}
              >
                <input
                  className="form-input"
                  type="text"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1, fontSize: 13, padding: "10px 14px" }}
                />
                <button
                  className="btn-primary"
                  onClick={handleSend}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center", color: "#A89F94" }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#0E0C0A",
                    marginBottom: 6,
                  }}
                >
                  Select a conversation
                </div>
                <div style={{ fontSize: 13 }}>
                  Choose a conversation from the left to start messaging.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal
        open={newConvoModal}
        onClose={() => setNewConvoModal(false)}
        title="New Conversation"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#0E0C0A",
                marginBottom: 6,
              }}
            >
              Participant Name
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. David Chen"
              value={newConvoForm.participant_name}
              onChange={(e) =>
                setNewConvoForm((f) => ({
                  ...f,
                  participant_name: e.target.value,
                }))
              }
            />
          </div>
          <button className="btn-primary" onClick={handleNewConversation}>
            Start Conversation
          </button>
        </div>
      </Modal>
    </>
  )
}
