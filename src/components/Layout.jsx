import { useState, useRef, useEffect } from "react"
import { Outlet, useLocation, Link } from "react-router-dom"
import Sidebar from "./Sidebar"
import { Bell, Search, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { recentActivity } from "../data/mockData"

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
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(recentActivity.map((a, i) => ({ ...a, id: i, read: false })))
  const notifRef = useRef(null)

  const firstName = user?.name?.split(" ")[0] || "Maya"

  // Override dashboard title with actual user name
  const displayTitle = location.pathname === "/dashboard"
    ? { title: "Good morning,", accent: firstName, suffix: " ✦" }
    : pageInfo

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  return (
    <div className="min-h-screen flex" style={{ background: "#FAF8F5" }}>
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-5"
          style={{ background: "#FAF8F5", borderBottom: "1px solid #E8E2DA" }}>
          <div>
            <h1 className="font-serif text-[26px] font-normal tracking-wide" style={{ color: "#0E0C0A" }}>
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
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
              <input
                type="text"
                placeholder="Search..."
                className="form-input pl-9 pr-4 py-2 text-sm w-56"
                style={{ borderRadius: "10px" }}
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
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#C4705A" }} />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl z-50"
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
                          style={{ background: n.type === "commission" ? "#B5651D" : n.type === "invoice" ? "#2D4A35" : n.type === "view" ? "#C9A84C" : "#C4705A" }} />
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
              {user?.initials || "M"}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
