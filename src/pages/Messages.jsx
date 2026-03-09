import { useState, useRef, useEffect } from "react"
import { conversations } from "../data/mockData"

export default function Messages() {
  const [selectedId, setSelectedId] = useState("david")
  const [convoState, setConvoState] = useState(
    conversations.reduce((acc, c) => {
      acc[c.id] = [...c.messages]
      return acc
    }, {})
  )
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const messagesEndRef = useRef(null)

  const selected = conversations.find((c) => c.id === selectedId)
  const messages = convoState[selectedId] || []

  const filteredConversations = conversations.filter((c) =>
    search === "" || c.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length, selectedId])

  function handleSend() {
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHour = hours % 12 || 12
    const timeStr = `${displayHour}:${minutes} ${ampm}`

    setConvoState((prev) => ({
      ...prev,
      [selectedId]: [
        ...prev[selectedId],
        { from: "me", text, time: timeStr },
      ],
    }))
    setDraft("")
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
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
        {/* Search */}
        <div style={{ padding: "14px 14px 10px" }}>
          <input
            className="form-input"
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: 12.5, padding: "8px 12px" }}
          />
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
                  background: convo.gradient,
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
                {convo.initial}
                {convo.online && (
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
                    {convo.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#A89F94",
                      fontFamily: "'DM Mono', monospace",
                      flexShrink: 0,
                    }}
                  >
                    {convo.time}
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
                    {convo.preview}
                  </div>
                  {convo.unread > 0 && (
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
                      {convo.unread}
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
        {selected && (
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
                background: selected.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {selected.initial}
            </div>
            <div>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#0E0C0A",
                }}
              >
                {selected.name}
              </div>
              <div style={{ fontSize: 11, color: "#A89F94", marginTop: 1 }}>
                {selected.online ? (
                  <span style={{ color: "#4A7A57" }}>Online</span>
                ) : (
                  "Offline"
                )}
              </div>
            </div>
          </div>
        )}

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
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  msg.from === "me" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius:
                    msg.from === "me"
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                  background:
                    msg.from === "me" ? "#0E0C0A" : "#F2EDE6",
                  color: msg.from === "me" ? "white" : "#0E0C0A",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                <div>{msg.text}</div>
                <div
                  style={{
                    fontSize: 10,
                    marginTop: 4,
                    opacity: 0.55,
                    fontFamily: "'DM Mono', monospace",
                    textAlign: msg.from === "me" ? "right" : "left",
                  }}
                >
                  {msg.time}
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
          <button className="btn-primary" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
