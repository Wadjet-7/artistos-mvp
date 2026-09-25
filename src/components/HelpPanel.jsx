import { useState, useEffect, useRef, useCallback } from "react"
import { HelpCircle, X, Send, MessageSquare, ChevronLeft, Mail, ExternalLink, Loader2, Sparkles, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react"
import { useLocation } from "react-router-dom"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import {
  fetchMyThreads, fetchThreadMessages, createThread, sendMessage,
  markThreadRead, fetchAppSettings
} from "../lib/support"

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return "Just now"
  if (s < 3600) return Math.floor(s / 60) + "m ago"
  if (s < 86400) return Math.floor(s / 3600) + "h ago"
  if (s < 604800) return Math.floor(s / 86400) + "d ago"
  return new Date(d).toLocaleDateString()
}

export default function HelpPanel({ open, onClose }) {
  const { user } = useAuth()
  const location = useLocation()
  const [helpTab, setHelpTab] = useState("ask")
  const [threads, setThreads] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [newSubject, setNewSubject] = useState("")
  const [newBody, setNewBody] = useState("")
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [settings, setSettings] = useState({})
  const messagesEndRef = useRef(null)
  const [aiMessages, setAiMessages] = useState([])
  const [aiInput, setAiInput] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const aiEndRef = useRef(null)

  const loadThreads = useCallback(async () => {
    if (!user?.id) return
    try {
      const [t, s] = await Promise.all([fetchMyThreads(user.id), fetchAppSettings()])
      setThreads(t)
      setSettings(s)
    } catch { /* silent */ }
  }, [user?.id])

  useEffect(() => { if (open) loadThreads() }, [open, loadThreads])

  const openThread = async (thread) => {
    setActiveThread(thread)
    setLoading(true)
    try {
      const msgs = await fetchThreadMessages(thread.id)
      setMessages(msgs)
      if (thread.unread_for_user > 0) await markThreadRead(thread.id)
      setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread_for_user: 0 } : t))
    } catch { toast.error("Failed to load messages") }
    finally { setLoading(false) }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!activeThread) return
    const channel = supabase.channel(`thread-${activeThread.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `thread_id=eq.${activeThread.id}` },
        (payload) => { setMessages(prev => [...prev, payload.new]) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeThread?.id])

  const handleCreateThread = async () => {
    if (!newSubject.trim() || !newBody.trim()) return
    setSending(true)
    try {
      const thread = await createThread(user.id, newSubject.trim(), newBody.trim())
      setShowNew(false)
      setNewSubject("")
      setNewBody("")
      await loadThreads()
      openThread(thread)
      toast.success("Message sent!")
    } catch { toast.error("Failed to send message") }
    finally { setSending(false) }
  }

  const handleReply = async () => {
    if (!reply.trim() || !activeThread) return
    setSending(true)
    try {
      await sendMessage(activeThread.id, user.id, reply.trim())
      setReply("")
    } catch { toast.error("Failed to send") }
    finally { setSending(false) }
  }

  const handleAskAI = async () => {
    if (!aiInput.trim()) return
    const question = aiInput.trim()
    setAiMessages(prev => [...prev, { role: "user", content: question }])
    setAiInput("")
    setAiLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke("help-agent", {
        body: { messages: [...aiMessages, { role: "user", content: question }], current_path: location.pathname },
      })
      if (error) throw error
      setAiMessages(prev => [...prev, { role: "assistant", content: data.answer, actions: data.actions || [] }])
    } catch {
      setAiMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Try again, or message the team.", actions: [{ type: "talk_to_team" }] }])
    } finally { setAiLoading(false) }
  }

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [aiMessages])

  if (!open) return null

  const unreadTotal = threads.reduce((s, t) => s + (t.unread_for_user || 0), 0)
  const replyTime = settings.reply_time_text || "Larry usually replies within a day."
  const contactEmail = settings.contact_email || "larry@synergysourceadvisors.com"

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.3)" }} onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col" style={{ borderLeft: "1px solid #E8E2DA" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E2DA" }}>
          <div className="flex items-center gap-2">
            {activeThread && (
              <button onClick={() => { setActiveThread(null); setHelpTab("team") }} className="p-1 rounded hover:bg-gray-100 mr-1">
                <ChevronLeft size={18} style={{ color: "#A89F94" }} />
              </button>
            )}
            <HelpCircle size={18} style={{ color: "#B5651D" }} />
            <h2 className="text-base font-semibold" style={{ color: "#0E0C0A" }}>
              {activeThread ? activeThread.subject : "Help & Messages"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} style={{ color: "#A89F94" }} /></button>
        </div>

        {/* Tabs */}
        {!activeThread && (
          <div className="flex px-4 pt-3 gap-1">
            <button onClick={() => setHelpTab("ask")} className="flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              style={{ background: helpTab === "ask" ? "#0E0C0A" : "transparent", color: helpTab === "ask" ? "#FAF8F5" : "#A89F94" }}>
              <Sparkles size={13} /> Ask ArtistOS
            </button>
            <button onClick={() => setHelpTab("team")} className="flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              style={{ background: helpTab === "team" ? "#0E0C0A" : "transparent", color: helpTab === "team" ? "#FAF8F5" : "#A89F94" }}>
              <MessageSquare size={13} /> Team
              {unreadTotal > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#B5651D", color: "white" }}>{unreadTotal}</span>}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* AI Tab */}
          {helpTab === "ask" && !activeThread && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles size={24} className="mx-auto mb-3" style={{ color: "#B5651D" }} />
                    <p className="text-sm font-medium mb-1" style={{ color: "#0E0C0A" }}>Ask ArtistOS</p>
                    <p className="text-xs mb-4" style={{ color: "#A89F94" }}>I can help with how-to questions, pricing, contracts, and more.</p>
                    <div className="space-y-2">
                      {["How do I send an invoice?", "How should I price my work?", "How do I find grants?"].map(q => (
                        <button key={q} onClick={() => { setAiInput(q); setTimeout(handleAskAI, 100) }}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
                          style={{ border: "1px solid #E8E2DA", color: "#0E0C0A" }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%]">
                      <div className="rounded-xl px-4 py-2.5" style={{
                        background: msg.role === "user" ? "#0E0C0A" : "#F2EDE6",
                        color: msg.role === "user" ? "#FAF8F5" : "#0E0C0A",
                      }}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.actions?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {msg.actions.map((a, j) => (
                            <button key={j} onClick={() => {
                              if (a.type === "navigate") { onClose(); window.location.href = a.path }
                              else if (a.type === "open_upgrade") { onClose(); window.location.href = "/upgrade" }
                              else if (a.type === "talk_to_team") { setHelpTab("team"); setShowNew(true) }
                            }} className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium"
                              style={{ background: "#F5E6D8", color: "#B5651D" }}>
                              <ArrowRight size={10} /> {a.type === "talk_to_team" ? "Talk to the team" : a.type === "open_upgrade" ? "View plans" : `Go to ${a.path}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-xl px-4 py-2.5" style={{ background: "#F2EDE6" }}>
                      <Loader2 size={14} className="animate-spin" style={{ color: "#B5651D" }} />
                    </div>
                  </div>
                )}
                <div ref={aiEndRef} />
              </div>
              <div className="p-3" style={{ borderTop: "1px solid #E8E2DA" }}>
                <div className="flex items-center gap-2">
                  <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAskAI()}
                    placeholder="Ask anything about ArtistOS..."
                    className="form-input flex-1 text-sm" />
                  <button onClick={handleAskAI} disabled={aiLoading || !aiInput.trim()} className="btn-copper p-2.5 rounded-lg">
                    {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
                <button onClick={() => { setHelpTab("team"); setShowNew(true) }}
                  className="text-xs mt-2 w-full text-center py-1" style={{ color: "#A89F94" }}>
                  Talk to a person instead
                </button>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {(helpTab === "team" || activeThread) && activeThread ? (
            /* Thread view */
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin" style={{ color: "#B5651D" }} /></div>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[80%] rounded-xl px-4 py-2.5" style={{
                      background: msg.sender_role === "user" ? "#0E0C0A" : "#F2EDE6",
                      color: msg.sender_role === "user" ? "#FAF8F5" : "#0E0C0A",
                    }}>
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                      <p className="text-[10px] mt-1" style={{ opacity: 0.5 }}>{timeAgo(msg.created_at)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 flex items-center gap-2" style={{ borderTop: "1px solid #E8E2DA" }}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReply()}
                  placeholder="Type a message..."
                  className="form-input flex-1 text-sm"
                />
                <button onClick={handleReply} disabled={sending || !reply.trim()} className="btn-copper p-2.5 rounded-lg">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          ) : helpTab === "team" && showNew ? (
            /* New thread form */
            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Subject</label>
                <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="What do you need help with?" className="form-input w-full text-sm" />
              </div>
              <div>
                <label className="form-label">Message</label>
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} rows={4} placeholder="Describe your question or issue..." className="form-input w-full text-sm resize-y" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateThread} disabled={sending} className="btn-copper flex items-center gap-1.5 text-sm px-4 py-2">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send
                </button>
                <button onClick={() => setShowNew(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              </div>
              <p className="text-xs" style={{ color: "#A89F94" }}>{replyTime}</p>
            </div>
          ) : helpTab === "team" ? (
            /* Thread list */
            <div className="p-4 space-y-4">
              {/* Contact card */}
              <div className="rounded-xl p-4" style={{ background: "#FFF8F0", border: "1px solid #F0D9B5" }}>
                <p className="text-sm font-semibold mb-1" style={{ color: "#0E0C0A" }}>Contact Larry</p>
                <p className="text-xs mb-3" style={{ color: "#A89F94" }}>{replyTime}</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setShowNew(true)} className="btn-copper text-xs flex items-center gap-1.5 px-3 py-2 w-full justify-center">
                    <MessageSquare size={12} /> Send a message
                  </button>
                  <a href={`mailto:${contactEmail}?subject=ArtistOS: `} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 w-full justify-center">
                    <Mail size={12} /> Email Larry
                  </a>
                </div>
              </div>

              {/* Thread list */}
              {threads.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#A89F94" }}>Your conversations</h3>
                  <div className="space-y-2">
                    {threads.map(t => (
                      <button key={t.id} onClick={() => openThread(t)}
                        className="w-full text-left rounded-lg p-3 transition-colors hover:bg-gray-50"
                        style={{ border: "1px solid #E8E2DA" }}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium truncate" style={{ color: "#0E0C0A" }}>{t.subject || "Message"}</span>
                          {t.unread_for_user > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#B5651D", color: "white" }}>{t.unread_for_user}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px]" style={{ color: "#A89F94" }}>{t.status}</span>
                          <span className="text-[10px]" style={{ color: "#A89F94" }}>{timeAgo(t.last_message_at)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {threads.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: "#A89F94" }}>No messages yet. Send one to get started.</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function HelpButton() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    fetchMyThreads(user.id).then(threads => {
      setUnread(threads.reduce((s, t) => s + (t.unread_for_user || 0), 0))
    }).catch(() => {})
  }, [user?.id])

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative p-2 rounded-lg transition-colors hover:bg-gray-100" title="Help & Messages">
        <HelpCircle size={18} style={{ color: "#A89F94" }} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: "#B5651D", color: "white" }}>{unread}</span>
        )}
      </button>
      <HelpPanel open={open} onClose={() => { setOpen(false) }} />
    </>
  )
}
