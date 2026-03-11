import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { Loader2 } from "lucide-react"

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "Just now"
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago"
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago"
  if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago"
  return new Date(date).toLocaleDateString()
}

const commissionEmojis = ["🎨", "🖼️", "🌿"]
const commissionBgs = ["#F5E6D8", "#E8F2EA", "#F5E2DC"]

const activityDotColor = (type) => {
  switch (type) {
    case "commission": return "#B5651D"
    case "invoice": return "#2D4A35"
    case "artwork": return "#C9A84C"
    case "social": return "#C4705A"
    default: return "#A89F94"
  }
}

const statusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "active": return "badge-gold"
    case "review": return "badge-copper"
    case "quoted": return "badge-forest"
    default: return "badge-grey"
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [artworks, setArtworks] = useState([])
  const [commissions, setCommissions] = useState([])
  const [revenue, setRevenue] = useState(0)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [activities, setActivities] = useState([])

  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [artRes, commRes, invRes, actRes] = await Promise.allSettled([
          supabase.from("artworks").select("price, status").eq("user_id", user.id),
          supabase
            .from("commissions")
            .select("*")
            .eq("user_id", user.id)
            .in("status", ["active", "review", "quoted"])
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("invoices")
            .select("amount, status")
            .eq("user_id", user.id)
            .eq("status", "paid"),
          supabase
            .from("activity_log")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ])

        const artData = artRes.status === "fulfilled" ? artRes.value.data || [] : []
        const commData = commRes.status === "fulfilled" ? commRes.value.data || [] : []
        const invData = invRes.status === "fulfilled" ? invRes.value.data || [] : []
        const actData = actRes.status === "fulfilled" ? actRes.value.data || [] : []

        setArtworks(artData)
        setCommissions(commData)
        setRevenue(invData.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0))
        setPortfolioValue(artData.reduce((sum, a) => sum + (Number(a.price) || 0), 0))
        setActivities(actData)
      } catch (err) {
        console.error("[Dashboard] fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin" style={{ color: "#B5651D" }} />
      </div>
    )
  }

  const stats = [
    {
      label: "Total Artworks",
      value: String(artworks.length),
      delta: `${artworks.filter(a => a.status === "Available").length} available`,
      up: true,
      icon: "◻",
      variant: "copper",
    },
    {
      label: "Active Commissions",
      value: String(commissions.length),
      delta: commissions.length > 0 ? `${commissions.length} in progress` : "None active",
      up: commissions.length > 0,
      icon: "◷",
      variant: "forest",
    },
    {
      label: "Revenue",
      value: `$${revenue.toLocaleString()}`,
      delta: "From paid invoices",
      up: revenue > 0,
      icon: "◈",
      variant: "rose",
    },
    {
      label: "Portfolio Value",
      value: `$${portfolioValue.toLocaleString()}`,
      delta: `${artworks.length} artworks total`,
      up: true,
      icon: "◬",
      variant: "gold",
    },
  ]

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.up ? "up" : "down"}`}>{s.delta}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Overview</div>
              <div className="card-subtitle">Sales + commissions, last 6 months</div>
            </div>
            <select className="form-select" style={{ width: "auto", fontSize: "12px", padding: "6px 10px" }}>
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="card-body">
            <svg viewBox="0 0 400 160" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B5651D" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#B5651D" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[130, 100, 70, 40].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#F2EDE6" strokeWidth="1" />
              ))}
              {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m, i) => (
                <text key={m} x={20 + i * 63} y="148" fill="#A89F94" fontSize="10" fontFamily="DM Mono">{m}</text>
              ))}
              <path d="M30,110 C60,105 75,90 100,80 C125,70 145,95 170,75 C195,55 215,65 240,50 C265,35 285,55 310,42 C335,30 355,35 375,25 L375,130 L30,130 Z" fill="url(#chartGrad)" />
              <path d="M30,110 C60,105 75,90 100,80 C125,70 145,95 170,75 C195,55 215,65 240,50 C265,35 285,55 310,42 C335,30 355,35 375,25" fill="none" stroke="#B5651D" strokeWidth="2.5" strokeLinecap="round" />
              {[[30,110],[100,80],[170,75],[240,50],[310,42]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="white" stroke="#B5651D" strokeWidth="2" />
              ))}
              <circle cx="375" cy="25" r="4" fill="#B5651D" stroke="#B5651D" strokeWidth="2" />
              <rect x="330" y="5" width="60" height="22" rx="5" fill="#0E0C0A" />
              <text x="360" y="20" fill="white" fontSize="10" fontFamily="DM Mono" textAnchor="middle">${revenue.toLocaleString()}</text>
            </svg>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Quick Actions</div></div>
          <div className="card-body" style={{ padding: "12px" }}>
            <div className="flex flex-col gap-2">
              {[
                { label: "◱ Generate Contract", to: "/contracts" },
                { label: "◎ Schedule Post", to: "/social" },
                { label: "◻ Upload Artwork", to: "/portfolio" },
                { label: "◬ View Analytics", to: "/analytics" },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.to)} className="btn-secondary text-left w-full justify-start">
                  {a.label}
                </button>
              ))}
              <button onClick={() => navigate("/commissions")} className="btn-copper text-left w-full justify-start">
                ◷ View Commissions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commissions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Active Commissions</div>
            <span className="text-xs font-medium cursor-pointer" style={{ color: "#B5651D" }} onClick={() => navigate("/commissions")}>View all →</span>
          </div>
          <div className="card-body">
            {commissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "#A89F94" }}>No active commissions</p>
              </div>
            ) : (
              commissions.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3.5 py-3.5 cursor-pointer" style={{ borderBottom: i < commissions.length - 1 ? "1px solid #F2EDE6" : "none" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: commissionBgs[i % 3] }}>
                    {commissionEmojis[i % 3]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium">{c.client_name} — {c.title}</div>
                    <div className="text-xs" style={{ color: "#A89F94" }}>{c.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[13px] font-medium">${Number(c.budget || 0).toLocaleString()}</div>
                    <span className={statusBadge(c.status)}>{c.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
            <span className="badge-grey">Live</span>
          </div>
          <div className="card-body">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "#A89F94" }}>No recent activity</p>
              </div>
            ) : (
              activities.map((a, i) => (
                <div key={a.id} className="flex gap-3 items-start py-3" style={{ borderBottom: i < activities.length - 1 ? "1px solid #F2EDE6" : "none" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: activityDotColor(a.activity_type) }} />
                  <div>
                    <div className="text-[13px] leading-relaxed">{a.description}</div>
                    <div className="text-[11px] font-mono mt-0.5" style={{ color: "#A89F94" }}>{timeAgo(a.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Market Insight Banner */}
      <div className="rounded-xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #2D4A35, #1A2E20)", color: "white" }}>
        <div>
          <div className="text-[12px] uppercase tracking-[2px] mb-1.5" style={{ opacity: 0.6 }}>Market Intelligence</div>
          <div className="font-serif text-xl font-normal">
            Abstract art sales are up <strong style={{ color: "#86C996" }}>+23%</strong> this quarter in your region
          </div>
          <div className="text-[13px] mt-1" style={{ opacity: 0.65 }}>
            Your avg. price per sq. inch ($4.80) places you in the top 15% of comparable artists
          </div>
        </div>
        <button onClick={() => navigate("/analytics")} className="whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
          View Full Report →
        </button>
      </div>
    </div>
  )
}
