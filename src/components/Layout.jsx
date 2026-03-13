import { useState, useRef, useEffect } from "react"
import { Outlet, useLocation, Link } from "react-router-dom"
import Sidebar from "./Sidebar"
import { Bell, Search, X, Menu } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import CommandPalette from "./CommandPalette"

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "Just now"
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago"
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago"
  if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago"
  return new Date(date).toLocaleDateString()
}

const notifDotColor = (type) => {
  switch (type) {
    case "commission": return "#B5651D"
    case "invoice": return "#2D4A35"
    case "artwork": return "#C9A84C"
    case "social": return "#C4705A"
    default: return "#A89F94"
  }
}

const pageTitles = {
  "/dashboard": { title: "Good morning,", accent: "Maya", suffix: " ✦" },
  "/portfolio": { title: "My", accent: "Portfolio" },
  "/contracts": { title: "Contract", accent: "Generator" },
  "/social": { title: "Social", accent: "Scheduler" },
  "/finances": { title: "", accent: "Financial", suffix: " Overview" },
  "/analytics": { title: "Market", accent: "Analytics" },
  "/emerging": { title: "", accent: "Emerging", suffix: " Artists to Watch" },
  "/marketplace": { title: "Commission", accent: "Marketplace" },
  "/commissions": { title: "My", accent: "Commissions" },
  "/messages": { title: "", accent: "Messages" },
  "/settings": { title: "", accent: "Settings" },
}

export default function Layout() {
  const location = useLocation()
  const { user } = useAuth()
  const pageInfo = pageTitles[location.pathname] || { title: "ArtistOS", accent: "" }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const notifRef = useRef(null)

  const firstName = user?.name?.split(" ")[0] || "Maya"

  // Override dashboard title with actual user name
  const displayTitle = location.pathname === "/dashboard"
    ? { title: "Good morning,", accent: firstName, suffix: " ✦" }
    : pageInfo

  const unreadCount = notifications.filter(n => !n.read).length

  // Fetch notifications from activity_log
  useEffect(() => {
    if (!user?.id) return

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("activity_log")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) {
          // Silently ignore — table may not exist yet (Phase 2 SQL not run)
          setNotifications([])
          return
        }

        if (data && data.length > 0) {
          setNotifications(
            data.map(item => ({
              id: item.id,
              text: item.description,
              time: timeAgo(item.created_at),
              type: item.activity_type,
              read: false,
            }))
          )
        } else {
          setNotifications([])
        }
      } catch (err) {
        // Silently ignore
        setNotifications([])
      }
    }

    fetchNotifications()
  }, [user?.id])

  // Close notifications on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Ctrl+K / Cmd+K to open command palette
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <div className="min-h-screen flex" style={{ background: "#FAF8F5" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-60 ml-0 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-8 py-4 md:py-5"
          style={{ background: "#FAF8F5", borderBottom: "1px solid #E8E2DA" }}>
          <div className="flex items-center">
            <button
              className="md:hidden p-2 rounded-lg mr-2"
              onClick={() => setSidebarOpen(true)}
              style={{ color: "#0E0C0A" }}
            >
              <Menu size={22} />
            </button>
            <div>
            <h1 className="font-serif text-[20px] md:text-[26px] font-normal tracking-wide" style={{ color: "#0E0C0A" }}>
              {displayTitle.title}{" "}
              <span className="italic" style={{ color: "#B5651D" }}>{displayTitle.accent}</span>
              {displayTitle.suffix || ""}
            </h1>
            {location.pathname === "/dashboard" && (
              <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="md:hidden relative p-2 rounded-lg transition-colors"
              style={{ color: "#A89F94" }}
              onClick={() => setCommandPaletteOpen(true)}
              onMouseEnter={e => e.currentTarget.style.background = "#F2EDE6"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Search size={18} />
            </button>
            <div className="relative hidden md:block cursor-pointer" onClick={() => setCommandPaletteOpen(true)}>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
              <input
                type="text"
                placeholder="Search… ⌘K"
                className="form-input pl-9 pr-4 py-2 text-sm w-56 cursor-pointer"
                style={{ borderRadius: "10px" }}
                readOnly
              />
            </div>
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg transition-colors"
                style={{ color: "#A89F94" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F2EDE6"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                    style={{ background: "#C4705A" }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl z-50"
                  style={{ border: "1px solid #E8E2DA" }}>
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: "1px solid #F2EDE6" }}>
                    <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-medium hover:underline" style={{ color: "#B5651D" }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: "#A89F94" }}>No notifications</p>
                    ) : notifications.map(n => (
                      <div key={n.id}
                        className={"flex items-start gap-3 px-4 py-3 " + (n.read ? "opacity-60" : "")}
                        style={{ borderBottom: "1px solid #F2EDE6" }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: notifDotColor(n.type) }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-snug" style={{ color: "#0E0C0A" }}>{n.text}</p>
                          <p className="text-xs mt-0.5 font-mono" style={{ color: "#A89F94" }}>{n.time}</p>
                        </div>
                        <button onClick={() => dismiss(n.id)}
                          className="flex-shrink-0 mt-0.5 transition-colors"
                          style={{ color: "#E8E2DA" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#A89F94"}
                          onMouseLeave={e => e.currentTarget.style.color = "#E8E2DA"}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link to="/settings"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold font-serif"
              style={{ background: "linear-gradient(135deg, #B5651D, #C4705A)" }}>
              {user?.initials || user?.name?.charAt(0) || "?"}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-7">
          <div key={location.pathname} className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  )
}
