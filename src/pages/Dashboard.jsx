import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import {
  Loader2, Image, Clock, DollarSign, Palette,
  TrendingUp, TrendingDown, Users, Calendar,
  FileText, BarChart3, Activity, Eye, UserCircle, ScrollText
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts"

/* ================================================================ */
/*  HELPERS                                                          */
/* ================================================================ */

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

const statusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "active":    return "badge badge-gold"
    case "review":    return "badge badge-copper"
    case "quoted":    return "badge badge-forest"
    case "completed": return "badge badge-forest"
    default:          return "badge badge-grey"
  }
}

/* ---- Chart data: group invoices by month ---- */
function groupInvoicesByMonth(invoices, range) {
  const now = new Date()
  let monthsBack = 6
  if (range === "year") monthsBack = 12
  if (range === "all") monthsBack = 24

  const months = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
    })
  }

  invoices
    .filter(inv => inv.status === "paid")
    .forEach(inv => {
      const d = new Date(inv.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const bucket = months.find(m => m.key === key)
      if (bucket) bucket.revenue += Number(inv.amount) || 0
    })

  return months
}

/* ---- Mini Sparkline (inline SVG) ---- */
function MiniSparkline({ data, color = "#B5651D", width = 64, height = 24 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data) || 1
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })
  return (
    <svg width={width} height={height} className="mt-1" style={{ display: "block" }}>
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---- Commission progress mapping ---- */
const statusProgress = {
  draft:     { percent: 0,   step: 0, color: "#A89F94" },
  pending:   { percent: 10,  step: 0, color: "#A89F94" },
  quoted:    { percent: 20,  step: 1, color: "#2D4A35" },
  active:    { percent: 50,  step: 2, color: "#B5651D" },
  review:    { percent: 75,  step: 3, color: "#C9A84C" },
  completed: { percent: 100, step: 4, color: "#4A7A57" },
}

function getStatusInfo(status) {
  return statusProgress[status?.toLowerCase()] || statusProgress.draft
}

function getDeadlineUrgency(deadline) {
  if (!deadline) return null
  const daysLeft = Math.ceil((new Date(deadline) - Date.now()) / 86400000)
  if (daysLeft < 0) return { label: "Overdue", color: "#C4705A", urgent: true }
  if (daysLeft < 7) return { label: `${daysLeft}d left`, color: "#C4705A", urgent: true }
  if (daysLeft < 14) return { label: `${daysLeft}d left`, color: "#C9A84C", urgent: false }
  return { label: `${daysLeft}d left`, color: "#A89F94", urgent: false }
}

/* ---- Activity grouping by date ---- */
function groupActivitiesByDate(activities) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today - 86400000)
  const weekAgo = new Date(today - 7 * 86400000)

  const groups = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This Week", items: [] },
    { label: "Earlier", items: [] },
  ]

  activities.forEach(a => {
    const d = new Date(a.created_at)
    if (d >= today) groups[0].items.push(a)
    else if (d >= yesterday) groups[1].items.push(a)
    else if (d >= weekAgo) groups[2].items.push(a)
    else groups[3].items.push(a)
  })

  return groups.filter(g => g.items.length > 0)
}

const activityIconMap = (type) => {
  switch (type) {
    case "commission":      return { icon: Users, bg: "#F5E6D8", color: "#B5651D" }
    case "invoice":         return { icon: DollarSign, bg: "#E8F2EA", color: "#2D4A35" }
    case "artwork":         return { icon: Image, bg: "#FBF2DC", color: "#8A6A1A" }
    case "social":          return { icon: Calendar, bg: "#F5E2DC", color: "#C4705A" }
    case "contract_created":
    case "contract_deleted":
    case "contract":        return { icon: FileText, bg: "#F2EDE6", color: "#A89F94" }
    case "template_uploaded":
    case "template_deleted": return { icon: FileText, bg: "#F2EDE6", color: "#A89F94" }
    default:                return { icon: Activity, bg: "#F2EDE6", color: "#A89F94" }
  }
}

const activityRoute = (type) => {
  switch (type) {
    case "commission":       return "/commissions"
    case "invoice":          return "/finances"
    case "artwork":          return "/portfolio"
    case "social":           return "/social"
    case "contract_created":
    case "contract_deleted":
    case "contract":
    case "template_uploaded":
    case "template_deleted": return "/contracts"
    default:                 return null
  }
}

const sparklineColors = { copper: "#B5651D", forest: "#2D4A35", rose: "#C4705A", gold: "#C9A84C" }

/* ================================================================ */
/*  CUSTOM TOOLTIP                                                   */
/* ================================================================ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "#0E0C0A", borderRadius: 8, padding: "8px 12px",
      fontSize: 13, fontFamily: "DM Sans", color: "#FAF8F5", border: "none",
      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    }}>
      <div style={{ fontSize: 11, color: "#A89F94", marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>${Number(payload[0].value).toLocaleString()}</div>
    </div>
  )
}

/* ================================================================ */
/*  DASHBOARD COMPONENT                                              */
/* ================================================================ */

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (user && user.onboarding_complete === false) {
      navigate("/onboarding", { replace: true })
    }
  }, [user, navigate])
  const [artworks, setArtworks] = useState([])
  const [commissions, setCommissions] = useState([])
  const [invoices, setInvoices] = useState([])
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [activities, setActivities] = useState([])
  const [chartRange, setChartRange] = useState("6months")

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
            .select("amount, status, created_at")
            .eq("user_id", user.id),
          supabase
            .from("activity_log")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ])

        const artData = artRes.status === "fulfilled" ? artRes.value.data || [] : []
        const commData = commRes.status === "fulfilled" ? commRes.value.data || [] : []
        const invData = invRes.status === "fulfilled" ? invRes.value.data || [] : []
        const actData = actRes.status === "fulfilled" ? actRes.value.data || [] : []

        setArtworks(artData)
        setCommissions(commData)
        setInvoices(invData)
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

  /* ---- Computed data ---- */
  const revenue = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  const chartData = groupInvoicesByMonth(invoices, chartRange)
  const sparklineData = chartData.map(m => m.revenue)

  /* Revenue trend: last 30 days vs prior 30 days */
  const revenueTrend = (() => {
    const now = Date.now()
    const thirtyDays = 30 * 86400 * 1000
    const recent = invoices
      .filter(i => i.status === "paid" && (now - new Date(i.created_at).getTime()) < thirtyDays)
      .reduce((s, i) => s + (Number(i.amount) || 0), 0)
    const prior = invoices
      .filter(i => i.status === "paid" &&
        (now - new Date(i.created_at).getTime()) >= thirtyDays &&
        (now - new Date(i.created_at).getTime()) < thirtyDays * 2)
      .reduce((s, i) => s + (Number(i.amount) || 0), 0)
    if (prior === 0) return null
    return Math.round(((recent - prior) / prior) * 100)
  })()

  const stats = [
    {
      label: "Total Artworks",
      value: String(artworks.length),
      delta: `${artworks.filter(a => a.status === "Available").length} available`,
      up: true,
      icon: <Image size={20} />,
      variant: "copper",
    },
    {
      label: "Active Commissions",
      value: String(commissions.length),
      delta: commissions.length > 0 ? `${commissions.length} in progress` : "None active",
      up: commissions.length > 0,
      icon: <Clock size={20} />,
      variant: "forest",
    },
    {
      label: "Revenue",
      value: `$${revenue.toLocaleString()}`,
      delta: "From paid invoices",
      up: revenue > 0,
      icon: <DollarSign size={20} />,
      variant: "rose",
      trendPercent: revenueTrend,
    },
    {
      label: "Portfolio Value",
      value: `$${portfolioValue.toLocaleString()}`,
      delta: `${artworks.length} artworks total`,
      up: true,
      icon: <Palette size={20} />,
      variant: "gold",
    },
  ]

  /* ================================================================ */
  /*  SKELETON LOADING                                                 */
  /* ================================================================ */
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card" style={{ minHeight: 120 }}>
              <div className="skeleton skeleton-text short" />
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-text" style={{ width: "70%" }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card">
            <div className="card-header"><div className="skeleton skeleton-text" style={{ width: 140 }} /></div>
            <div className="card-body"><div className="skeleton skeleton-chart" /></div>
          </div>
          <div className="card">
            <div className="card-header"><div className="skeleton skeleton-text" style={{ width: 100 }} /></div>
            <div className="card-body" style={{ padding: 12 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 36, marginBottom: 8 }} />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-header"><div className="skeleton skeleton-text" style={{ width: 140 }} /></div>
              <div className="card-body">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="skeleton" style={{ height: 44, marginBottom: 10 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.up ? "up" : "down"}`}>
              {s.trendPercent != null && (
                <span className="inline-flex items-center gap-0.5 mr-1">
                  {s.trendPercent >= 0
                    ? <TrendingUp size={12} style={{ color: "#4A7A57" }} />
                    : <TrendingDown size={12} style={{ color: "#C4705A" }} />
                  }
                  <span style={{ fontSize: 11, fontWeight: 600, color: s.trendPercent >= 0 ? "#4A7A57" : "#C4705A" }}>
                    {s.trendPercent >= 0 ? "+" : ""}{s.trendPercent}%
                  </span>
                </span>
              )}
              {s.delta}
            </div>
            <div className="stat-icon">{s.icon}</div>
            <MiniSparkline data={sparklineData} color={sparklineColors[s.variant] || "#B5651D"} />
          </div>
        ))}
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Overview</div>
              <div className="card-subtitle">Sales + commissions</div>
            </div>
            <select
              className="form-select"
              style={{ width: "auto", fontSize: "12px", padding: "6px 10px" }}
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
            >
              <option value="6months">Last 6 months</option>
              <option value="year">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div className="card-body">
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B5651D" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#B5651D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#A89F94", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                    axisLine={{ stroke: "#F2EDE6" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#A89F94", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}
                    width={50}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B5651D"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={{ fill: "white", stroke: "#B5651D", strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: "#B5651D", stroke: "#B5651D", strokeWidth: 2, r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Quick Actions</div></div>
          <div className="card-body" style={{ padding: "12px" }}>
            <div className="flex flex-col gap-2">
              {[
                { icon: Image, label: "Upload Artwork", to: "/portfolio" },
                { icon: Eye, label: "Viewing Rooms", to: "/viewing-rooms" },
                { icon: FileText, label: "Generate Contract", to: "/contracts" },
                { icon: UserCircle, label: "Manage Contacts", to: "/contacts" },
                { icon: ScrollText, label: "Artist CV", to: "/cv" },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.to)} className="btn-secondary text-left w-full justify-start">
                  <a.icon size={15} style={{ marginRight: 6 }} /> {a.label}
                </button>
              ))}
              <button onClick={() => navigate("/commissions")} className="btn-copper text-left w-full justify-start">
                <Users size={15} style={{ marginRight: 6 }} /> View Commissions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commissions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Commissions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Active Commissions</div>
            <span className="text-xs font-medium cursor-pointer" style={{ color: "#B5651D" }} onClick={() => navigate("/commissions")}>View all →</span>
          </div>
          <div className="card-body">
            {commissions.length === 0 ? (
              <div className="text-center py-8">
                <Users size={28} style={{ color: "#E8E2DA", margin: "0 auto 8px" }} />
                <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>No active commissions</p>
                <p className="text-xs mt-1" style={{ color: "#A89F94" }}>Commission requests will appear here</p>
              </div>
            ) : (
              commissions.map((c, i) => {
                const progress = getStatusInfo(c.status)
                const urgency = getDeadlineUrgency(c.deadline)
                return (
                  <div key={c.id} className="py-3.5 cursor-pointer"
                    style={{ borderBottom: i < commissions.length - 1 ? "1px solid #F2EDE6" : "none" }}
                    onClick={() => navigate("/commissions")}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: commissionBgs[i % 3] }}>
                        {commissionEmojis[i % 3]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-medium truncate">{c.client_name} — {c.title}</div>
                        <div className="text-xs flex items-center gap-2" style={{ color: "#A89F94" }}>
                          <span className="truncate">{c.description}</span>
                          {urgency && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                              style={{
                                background: urgency.urgent ? "#F5E2DC" : "#FBF2DC",
                                color: urgency.color,
                              }}>
                              {urgency.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono text-[13px] font-medium">${Number(c.budget || 0).toLocaleString()}</div>
                        <span className={statusBadge(c.status)}>{c.status}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 ml-[52px]">
                      <div className="progress-bar" style={{ height: 4 }}>
                        <div className="progress-fill"
                          style={{ width: `${progress.percent}%`, background: progress.color, transition: "width 0.4s ease" }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        {["Draft", "Quoted", "Active", "Review", "Done"].map((step, idx) => (
                          <span key={step} className="text-[9px] font-medium"
                            style={{ color: idx <= progress.step ? progress.color : "#E8E2DA" }}>
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
            <span className="badge badge-grey" style={{ fontSize: 10 }}>Live</span>
          </div>
          <div className="card-body">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity size={28} style={{ color: "#E8E2DA", margin: "0 auto 8px" }} />
                <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>No recent activity</p>
                <p className="text-xs mt-1" style={{ color: "#A89F94" }}>Your actions will be logged here</p>
              </div>
            ) : (
              groupActivitiesByDate(activities).map(group => (
                <div key={group.label}>
                  <div className="text-[10px] uppercase tracking-[1.5px] font-semibold py-2"
                    style={{ color: "#A89F94" }}>
                    {group.label}
                  </div>
                  {group.items.map((a, i) => {
                    const { icon: Icon, bg, color } = activityIconMap(a.activity_type)
                    const route = activityRoute(a.activity_type)
                    return (
                      <div key={a.id}
                        className="flex gap-3 items-start py-2.5 px-2 -mx-2 rounded-lg transition-colors"
                        style={{ cursor: route ? "pointer" : "default", borderBottom: i < group.items.length - 1 ? "1px solid #F2EDE6" : "none" }}
                        onClick={() => route && navigate(route)}
                        onMouseEnter={e => route && (e.currentTarget.style.background = "#F8F5F0")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: bg }}>
                          <Icon size={14} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] leading-relaxed">{a.description}</div>
                          <div className="text-[11px] font-mono mt-0.5" style={{ color: "#A89F94" }}>{timeAgo(a.created_at)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Market Insight Banner — real data */}
      {(() => {
        const avgPrice = artworks.length > 0
          ? Math.round(artworks.filter(a => a.price > 0).reduce((s, a) => s + Number(a.price), 0) / Math.max(artworks.filter(a => a.price > 0).length, 1))
          : 0
        const soldCount = artworks.filter(a => a.status === "Sold").length
        const totalCount = artworks.length
        const soldPct = totalCount > 0 ? Math.round((soldCount / totalCount) * 100) : 0

        return (
          <div className="rounded-xl px-5 md:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, #2D4A35, #1A2E20)", color: "white" }}>
            <div>
              <div className="text-[12px] uppercase tracking-[2px] mb-1.5" style={{ opacity: 0.6 }}>Portfolio Intelligence</div>
              <div className="font-serif text-lg md:text-xl font-normal">
                {totalCount > 0 ? (
                  <>
                    {soldCount > 0
                      ? <>{soldPct}% sell-through rate with <strong style={{ color: "#86C996" }}>${revenue.toLocaleString()}</strong> in revenue</>
                      : <>Your portfolio of {totalCount} works is valued at <strong style={{ color: "#86C996" }}>${portfolioValue.toLocaleString()}</strong></>
                    }
                  </>
                ) : (
                  <>Start building your portfolio to unlock market insights</>
                )}
              </div>
              <div className="text-[13px] mt-1" style={{ opacity: 0.65 }}>
                {avgPrice > 0
                  ? `Average artwork price: $${avgPrice.toLocaleString()} \u00B7 ${artworks.filter(a => a.status === "Available").length} works available`
                  : "Add artworks with prices to see your analytics"
                }
              </div>
            </div>
            <button onClick={() => navigate("/analytics")} className="whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium text-white flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              View Full Report \u2192
            </button>
          </div>
        )
      })()}
    </div>
  )
}
