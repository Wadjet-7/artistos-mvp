import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { fetchMyThreads } from "../lib/support"
import HelpPanel from "./HelpPanel"

function PaletteIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Palette body */}
      <path d="M16 3C9 3 3 9 3 16c0 7 6 13 13 13 1.5 0 2.5-1 2.5-2.3 0-.6-.2-1.1-.6-1.5-.3-.4-.5-.9-.5-1.5 0-1.3 1-2.3 2.3-2.3H23c4.4 0 6-2.8 6-6C29 8.5 23.2 3 16 3z"
        fill="white" fillOpacity="0.95" />
      {/* Paint dots */}
      <circle cx="10" cy="13" r="2.5" fill="#C4705A" />
      <circle cx="15" cy="9" r="2.5" fill="#C9A84C" />
      <circle cx="21" cy="11" r="2.5" fill="#2D4A35" />
      <circle cx="11" cy="20" r="2" fill="#B5651D" />
    </svg>
  )
}

export default function FloatingAssistant() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    fetchMyThreads(user.id).then(threads => {
      setUnread(threads.reduce((s, t) => s + (t.unread_for_user || 0), 0))
    }).catch(() => {})
  }, [user?.id, open])

  // Show tooltip after 3 seconds on first visit
  useEffect(() => {
    try {
      if (localStorage.getItem("aos_help_seen")) return
    } catch { return }
    const timer = setTimeout(() => {
      setShowTooltip(true)
      try { localStorage.setItem("aos_help_seen", "1") } catch {}
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-dismiss tooltip after 8 seconds
  useEffect(() => {
    if (!showTooltip) return
    const timer = setTimeout(() => setShowTooltip(false), 8000)
    return () => clearTimeout(timer)
  }, [showTooltip])

  if (!user) return null

  return (
    <>
      {/* Floating button */}
      <div className="fixed z-40" style={{ bottom: 24, right: 24 }}>
        {/* Tooltip bubble */}
        {showTooltip && !open && !dismissed && (
          <div className="absolute bottom-full right-0 mb-3" style={{ width: 220, animation: "assistantFadeUp 0.4s ease-out" }}>
            <div className="relative rounded-xl px-4 py-3 shadow-lg" style={{ background: "#0E0C0A", color: "#FAF8F5" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowTooltip(false); setDismissed(true) }}
                className="absolute top-1.5 right-1.5 p-0.5 rounded hover:bg-white/10"
              >
                <X size={12} style={{ color: "#A89F94" }} />
              </button>
              <p className="text-xs font-medium mb-0.5" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14 }}>
                Hey there, artist!
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "#A89F94" }}>
                I'm your studio assistant. Ask me anything about ArtistOS — pricing, grants, how-tos!
              </p>
              <div className="absolute -bottom-1.5 right-7 w-3 h-3 rotate-45" style={{ background: "#0E0C0A" }} />
            </div>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => { setOpen(true); setShowTooltip(false) }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="group relative flex items-center justify-center transition-all duration-300 active:scale-95"
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #B5651D 0%, #D4854A 60%, #C9A84C 100%)",
            boxShadow: hovering
              ? "0 8px 32px rgba(181, 101, 29, 0.45), 0 0 0 4px rgba(181, 101, 29, 0.12)"
              : "0 4px 20px rgba(181, 101, 29, 0.3)",
            transform: hovering ? "scale(1.1) rotate(-5deg)" : "scale(1)",
            animation: !hovering && !open ? "assistantBreathe 4s ease-in-out infinite" : "none",
          }}
          title="Ask ArtistOS"
        >
          <div style={{ transform: hovering ? "rotate(8deg)" : "none", transition: "transform 0.3s ease" }}>
            <PaletteIcon size={30} />
          </div>

          {/* Unread badge */}
          {unread > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
              style={{ background: "#C4705A", border: "2.5px solid #FAF8F5" }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}

          {/* Sparkle accents */}
          {!open && (
            <>
              <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full" style={{
                background: "#C9A84C",
                animation: "assistantSparkle 3s ease-in-out infinite",
                animationDelay: "0s",
              }} />
              <span className="absolute top-0 -right-2 w-1.5 h-1.5 rounded-full" style={{
                background: "#C4705A",
                animation: "assistantSparkle 3s ease-in-out infinite",
                animationDelay: "1s",
              }} />
              <span className="absolute -bottom-1 left-1 w-1.5 h-1.5 rounded-full" style={{
                background: "#2D4A35",
                animation: "assistantSparkle 3s ease-in-out infinite",
                animationDelay: "2s",
              }} />
            </>
          )}
        </button>
      </div>

      <HelpPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}
