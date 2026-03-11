import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Settings, LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { navSections } from "../data/navigation"

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    onClose?.()
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 h-full w-60 flex flex-col z-40 overflow-hidden transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: "#0E0C0A" }}>
      {/* Decorative radial gradient */}
      <div className="absolute -top-20 -right-20 w-56 h-56 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(181,101,29,0.25) 0%, transparent 70%)" }} />

      {/* Logo */}
      <div className="px-6 pt-7 pb-5 relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="font-serif text-[22px] font-semibold tracking-wide" style={{ color: "#FAF8F5" }}>
          ArtistOS
        </div>
        <div className="text-[10px] uppercase tracking-[2px] font-light mt-0.5" style={{ color: "#A89F94" }}>
          Creative Business Platform
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto relative">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="text-[9px] uppercase tracking-[2px] font-medium px-3 pt-4 pb-2"
              style={{ color: "rgba(255,255,255,0.25)" }}>
              {section.label}
            </div>
            {section.items.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-normal transition-all mb-0.5 relative " +
                  (isActive
                    ? "text-copper-light"
                    : "hover:text-white/80")
                }
                style={({ isActive }) => ({
                  background: isActive ? "rgba(181,101,29,0.2)" : "transparent",
                  color: isActive ? "#D4854A" : "rgba(255,255,255,0.55)",
                })}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-sm"
                        style={{ background: "#D4854A" }} />
                    )}
                    <Icon size={16} style={{ opacity: isActive ? 1 : 0.7 }} />
                    <span>{label}</span>
                    {badge && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#C4705A", color: "white" }}>
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <NavLink to="/settings"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors"
          style={{ background: "transparent" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold font-serif"
              style={{ background: "linear-gradient(135deg, #B5651D, #C4705A)" }}>
              {user?.initials || "M"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-normal truncate" style={{ color: "rgba(255,255,255,0.75)" }}>
              {user?.name || "Maya Chen"}
            </p>
            <p className="text-[10px] tracking-wide" style={{ color: "#D4854A" }}>
              {user?.plan || "Artist Pro"}
            </p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg w-full text-[13px] transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
    </>
  )
}
