import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Shield, Users, Image, FileText, DollarSign, Eye, Package, CalendarDays,
  Loader2, Search, Download, ExternalLink, RefreshCw, TrendingUp, TrendingDown,
  BarChart3, UserCircle
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from "recharts"
import toast from "react-hot-toast"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageError from "../components/PageError"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"
const formatCurrency = (n) => `$${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}`
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return "Just now"
  if (s < 3600) return Math.floor(s / 60) + "m ago"
  if (s < 86400) return Math.floor(s / 3600) + "h ago"
  if (s < 604800) return Math.floor(s / 86400) + "d ago"
  return formatDate(d)
}

const planBadge = (plan) => {
  switch ((plan || "").toLowerCase()) {
    case "pro": return { bg: "#F5E6D8", color: "#B5651D", label: "Pro" }
    case "studio": return { bg: "#FBF2DC", color: "#8A6A1A", label: "Studio" }
    default: return { bg: "#F2EDE6", color: "#A89F94", label: "Starter" }
  }
}

const PIE_COLORS = ["#A89F94", "#B5651D", "#C9A84C"]

function ChartTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 shadow-lg" style={{ background: "#0E0C0A", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[10px] font-medium" style={{ color: "#A89F94" }}>{label}</p>
      <p className="text-sm font-bold font-serif" style={{ color: "#FAF8F5" }}>{prefix}{payload[0].value?.toLocaleString()}</p>
    </div>
  )
}

function groupByMonth(items, dateKey, valueKey, monthsBack = 6) {
  const now = new Date()
  const months = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      value: 0,
    })
  }
  items.forEach(item => {
    const d = new Date(item[dateKey])
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const bucket = months.find(m => m.key === key)
    if (bucket) bucket.value += valueKey ? (Number(item[valueKey]) || 0) : 1
  })
  return months
}

function calcDelta(items, dateKey, days = 30) {
  const now = Date.now()
  const recent = items.filter(i => (now - new Date(i[dateKey]).getTime()) < days * 86400000).length
  const prior = items.filter(i => {
    const t = now - new Date(i[dateKey]).getTime()
    return t >= days * 86400000 && t < days * 2 * 86400000
  }).length
  if (prior === 0) return recent > 0 ? 100 : 0
  return Math.round(((recent - prior) / prior) * 100)
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */
const tabs = ["Overview", "Analytics", "Users", "Content", "Platform"]

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState("Overview")
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [allInvoices, setAllInvoices] = useState([])
  const [allArtworks, setAllArtworks] = useState([])
  const [allCommissions, setAllCommissions] = useState([])
  const [recentSignups, setRecentSignups] = useState([])
  const [contentStats, setContentStats] = useState({})
  const [activityLog, setActivityLog] = useState([])

  const [userSearch, setUserSearch] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [updatingUser, setUpdatingUser] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setFetchError(false)
      setLoading(true)

      const [
        profilesRes, artworksRes, invoicesRes, commissionsRes,
        contractsRes, viewingRoomsRes, consignmentsRes, exhibitionsRes,
        contactsRes, postsRes, expensesRes, activityRes
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, email, plan, avatar_url, initials, is_admin, created_at, subscription_status"),
        supabase.from("artworks").select("id, user_id, status, created_at", { count: "exact", head: false }),
        supabase.from("invoices").select("id, amount, status, created_at"),
        supabase.from("commissions").select("id, status, created_at", { count: "exact", head: false }),
        supabase.from("contracts").select("id", { count: "exact", head: true }),
        supabase.from("viewing_rooms").select("id, title, published, slug, created_at"),
        supabase.from("consignments").select("id", { count: "exact", head: true }),
        supabase.from("exhibitions").select("id", { count: "exact", head: true }),
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("scheduled_posts").select("id", { count: "exact", head: true }),
        supabase.from("expenses").select("id, amount"),
        supabase.from("activity_log").select("id, user_id, action, details, created_at").order("created_at", { ascending: false }).limit(20),
      ])

      const profiles = profilesRes.data || []
      const artworks = artworksRes.data || []
      const invoices = invoicesRes.data || []
      const commissions = commissionsRes.data || []
      const viewingRooms = viewingRoomsRes.data || []

      const artworkCountByUser = {}
      artworks.forEach(a => { artworkCountByUser[a.user_id] = (artworkCountByUser[a.user_id] || 0) + 1 })

      const enrichedUsers = profiles.map(p => ({ ...p, artworkCount: artworkCountByUser[p.id] || 0 }))

      const planCounts = { starter: 0, pro: 0, studio: 0 }
      profiles.forEach(p => {
        const plan = (p.plan || "starter").toLowerCase()
        if (planCounts[plan] !== undefined) planCounts[plan]++
        else planCounts.starter++
      })

      const paidInvoices = invoices.filter(i => i.status === "paid")
      const totalRevenue = paidInvoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
      const totalExpenses = (expensesRes.data || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)

      setStats({
        totalUsers: profiles.length, planCounts,
        totalArtworks: artworks.length, totalInvoices: invoices.length,
        totalRevenue, totalExpenses,
        totalCommissions: commissions.length,
        activeCommissions: commissions.filter(c => ["pending", "active", "quoted"].includes(c.status)).length,
        totalContracts: contractsRes.count || 0,
        totalViewingRooms: viewingRooms.length,
        totalConsignments: consignmentsRes.count || 0,
        totalExhibitions: exhibitionsRes.count || 0,
        totalContacts: contactsRes.count || 0,
        totalPosts: postsRes.count || 0,
        paidUsers: profiles.filter(p => ["pro", "studio"].includes((p.plan || "").toLowerCase())).length,
        activeSubscriptions: profiles.filter(p => p.subscription_status === "active").length,
      })

      setUsers(enrichedUsers)
      setAllInvoices(invoices)
      setAllArtworks(artworks)
      setAllCommissions(commissions)
      setRecentSignups([...profiles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10))

      setContentStats({
        artworks: artworks.length, viewingRooms: viewingRooms.length,
        publicViewingRooms: viewingRooms.filter(v => v.published).length,
        recentViewingRooms: [...viewingRooms].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
        contracts: contractsRes.count || 0, commissions: commissions.length,
        consignments: consignmentsRes.count || 0, exhibitions: exhibitionsRes.count || 0,
        contacts: contactsRes.count || 0, posts: postsRes.count || 0,
      })

      const profileMap = {}
      profiles.forEach(p => { profileMap[p.id] = p })
      setActivityLog((activityRes.data || []).map(a => ({
        ...a,
        userName: profileMap[a.user_id]?.name || "Unknown",
        userInitials: profileMap[a.user_id]?.initials || "?",
      })))
    } catch (err) {
      console.error("[Admin] fetch error:", err)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const userGrowthData = useMemo(() => groupByMonth(users, "created_at", null, 6), [users])
  const revenueData = useMemo(() => groupByMonth(allInvoices.filter(i => i.status === "paid"), "created_at", "amount", 6), [allInvoices])
  const artworkGrowthData = useMemo(() => groupByMonth(allArtworks, "created_at", null, 6), [allArtworks])
  const commissionData = useMemo(() => groupByMonth(allCommissions, "created_at", null, 6), [allCommissions])
  const userDelta = useMemo(() => calcDelta(users, "created_at"), [users])
  const revenueDelta = useMemo(() => calcDelta(allInvoices.filter(i => i.status === "paid"), "created_at"), [allInvoices])
  const conversionRate = useMemo(() => stats.totalUsers ? Math.round((stats.paidUsers / stats.totalUsers) * 100) : 0, [stats])
  const planPieData = useMemo(() => [
    { name: "Starter", value: stats.planCounts?.starter || 0 },
    { name: "Pro", value: stats.planCounts?.pro || 0 },
    { name: "Studio", value: stats.planCounts?.studio || 0 },
  ], [stats])

  const handleChangePlan = async (userId, newPlan) => {
    setUpdatingUser(userId)
    try {
      const { error } = await supabase.from("profiles").update({ plan: newPlan }).eq("id", userId)
      if (error) throw error
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
      toast.success(`Plan updated to ${newPlan}`)
    } catch { toast.error("Failed to update plan") }
    finally { setUpdatingUser(null) }
  }

  const handleToggleAdmin = async (userId, currentAdmin) => {
    if (userId === user.id) { toast.error("You can't remove your own admin access"); return }
    setUpdatingUser(userId)
    try {
      const { error } = await supabase.from("profiles").update({ is_admin: !currentAdmin }).eq("id", userId)
      if (error) throw error
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentAdmin } : u))
      toast.success(currentAdmin ? "Admin access removed" : "Admin access granted")
    } catch { toast.error("Failed to update admin status") }
    finally { setUpdatingUser(null) }
  }

  const exportUsersCSV = () => {
    const header = "Name,Email,Plan,Artworks,Signup Date,Admin\n"
    const rows = users.map(u =>
      `"${(u.name || "").replace(/"/g, '""')}","${u.email}","${u.plan || "starter"}",${u.artworkCount},"${formatDate(u.created_at)}",${u.is_admin ? "Yes" : "No"}`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `artistos-users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success("User list exported")
  }

  const filteredUsers = users.filter(u => {
    if (userFilter !== "all" && (u.plan || "starter").toLowerCase() !== userFilter) return false
    if (userSearch) {
      const q = userSearch.toLowerCase()
      return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    }
    return true
  })

  if (fetchError && !loading) return <PageError message="Could not load admin data." onRetry={fetchData} />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#0E0C0A" }}>
            <Shield size={20} style={{ color: "#D4854A" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold font-serif" style={{ color: "#0E0C0A" }}>Admin Portal</h1>
            <p className="text-xs" style={{ color: "#A89F94" }}>Platform management & analytics</p>
          </div>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-xs" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg overflow-x-auto" style={{ background: "#F2EDE6" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap px-3"
            style={{
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "#0E0C0A" : "#A89F94",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: "#B5651D" }} />
        </div>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {tab === "Overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Total Users", value: stats.totalUsers, delta: userDelta, color: "#B5651D", bg: "#F5E6D8" },
                  { icon: Image, label: "Total Artworks", value: stats.totalArtworks, color: "#2D4A35", bg: "#E8F2EA" },
                  { icon: DollarSign, label: "Revenue", value: formatCurrency(stats.totalRevenue), delta: revenueDelta, color: "#8A6A1A", bg: "#FBF2DC" },
                  { icon: TrendingUp, label: "Active Commissions", value: stats.activeCommissions, color: "#C4705A", bg: "#F5E2DC" },
                ].map(s => (
                  <div key={s.label} className="card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                        <s.icon size={18} style={{ color: s.color }} />
                      </div>
                      {s.delta !== undefined && (
                        <span className="text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                          style={{ background: s.delta >= 0 ? "#E8F2EA" : "#F5E2DC", color: s.delta >= 0 ? "#2D4A35" : "#C4705A" }}>
                          {s.delta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {Math.abs(s.delta)}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold font-serif" style={{ color: "#0E0C0A" }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div className="card p-5 md:col-span-2">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "#0E0C0A" }}>User Growth</h3>
                  <p className="text-[10px] mb-4" style={{ color: "#A89F94" }}>New signups per month (last 6 months)</p>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userGrowthData}>
                        <defs>
                          <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#B5651D" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#B5651D" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE6" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#A89F94" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#A89F94" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#B5651D" strokeWidth={2} fill="url(#userGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "#0E0C0A" }}>Plan Distribution</h3>
                  <p className="text-[10px] mb-2" style={{ color: "#A89F94" }}>{conversionRate}% conversion to paid</p>
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={planPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                          {planPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {planPieData.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-[10px]" style={{ color: "#A89F94" }}>{p.name} ({p.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="card p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Recent Signups</h3>
                  <div className="space-y-3">
                    {recentSignups.map(u => {
                      const badge = planBadge(u.plan)
                      return (
                        <div key={u.id} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold font-serif"
                            style={{ background: "linear-gradient(135deg, #B5651D, #C4705A)" }}>
                            {u.initials || u.name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: "#0E0C0A" }}>{u.name || "Unnamed"}</p>
                            <p className="text-[10px] truncate" style={{ color: "#A89F94" }}>{u.email}</p>
                          </div>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                          <span className="text-[10px]" style={{ color: "#A89F94" }}>{timeAgo(u.created_at)}</span>
                        </div>
                      )
                    })}
                    {recentSignups.length === 0 && <p className="text-xs text-center py-4" style={{ color: "#A89F94" }}>No users yet</p>}
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Recent Activity</h3>
                  <div className="space-y-3">
                    {activityLog.map(a => (
                      <div key={a.id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold font-serif"
                          style={{ background: "linear-gradient(135deg, #2D4A35, #4A7A57)" }}>
                          {a.userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate" style={{ color: "#0E0C0A" }}>
                            <span className="font-medium">{a.userName}</span>{" "}
                            <span style={{ color: "#A89F94" }}>{a.action?.replace(/_/g, " ")}</span>
                          </p>
                          {a.details && <p className="text-[10px] truncate" style={{ color: "#A89F94" }}>{a.details}</p>}
                        </div>
                        <span className="text-[10px] whitespace-nowrap" style={{ color: "#A89F94" }}>{timeAgo(a.created_at)}</span>
                      </div>
                    ))}
                    {activityLog.length === 0 && <p className="text-xs text-center py-4" style={{ color: "#A89F94" }}>No activity yet</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Contracts", value: stats.totalContracts, icon: FileText },
                  { label: "Viewing Rooms", value: stats.totalViewingRooms, icon: Eye },
                  { label: "Consignments", value: stats.totalConsignments, icon: Package },
                  { label: "Exhibitions", value: stats.totalExhibitions, icon: CalendarDays },
                ].map(s => (
                  <div key={s.label} className="card p-4 flex items-center gap-3">
                    <s.icon size={16} style={{ color: "#A89F94" }} />
                    <div>
                      <p className="text-lg font-bold font-serif" style={{ color: "#0E0C0A" }}>{s.value}</p>
                      <p className="text-[10px]" style={{ color: "#A89F94" }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === "Analytics" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Paid Users", value: stats.paidUsers || 0, sub: `${conversionRate}% of total`, color: "#B5651D", bg: "#F5E6D8" },
                  { label: "MRR (est.)", value: formatCurrency((stats.planCounts?.pro || 0) * 19 + (stats.planCounts?.studio || 0) * 49), sub: "Monthly recurring", color: "#2D4A35", bg: "#E8F2EA" },
                  { label: "Avg Artworks/User", value: stats.totalUsers ? Math.round(stats.totalArtworks / stats.totalUsers) : 0, sub: `${stats.totalArtworks} total`, color: "#8A6A1A", bg: "#FBF2DC" },
                  { label: "Net Revenue", value: formatCurrency((stats.totalRevenue || 0) - (stats.totalExpenses || 0)), sub: `${formatCurrency(stats.totalExpenses)} expenses`, color: "#C4705A", bg: "#F5E2DC" },
                ].map(s => (
                  <div key={s.label} className="card p-5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: s.bg }}>
                      <BarChart3 size={18} style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-bold font-serif" style={{ color: "#0E0C0A" }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>{s.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#A89F94" }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-1" style={{ color: "#0E0C0A" }}>Revenue Trend</h3>
                <p className="text-[10px] mb-4" style={{ color: "#A89F94" }}>Paid invoice revenue by month</p>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2D4A35" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#2D4A35" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE6" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#A89F94" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#A89F94" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip content={<ChartTooltip prefix="$" />} />
                      <Area type="monotone" dataKey="value" stroke="#2D4A35" strokeWidth={2} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="card p-5">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "#0E0C0A" }}>Content Growth</h3>
                  <p className="text-[10px] mb-4" style={{ color: "#A89F94" }}>New artworks uploaded per month</p>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={artworkGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE6" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#A89F94" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#A89F94" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="value" fill="#B5651D" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "#0E0C0A" }}>Commission Requests</h3>
                  <p className="text-[10px] mb-4" style={{ color: "#A89F94" }}>New commissions per month</p>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={commissionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE6" />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#A89F94" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#A89F94" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="value" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Most Active Users</h3>
                <div className="space-y-3">
                  {[...users].sort((a, b) => b.artworkCount - a.artworkCount).slice(0, 8).map((u, i) => {
                    const badge = planBadge(u.plan)
                    const maxCount = [...users].sort((a, b) => b.artworkCount - a.artworkCount)[0]?.artworkCount || 1
                    return (
                      <div key={u.id} className="flex items-center gap-3">
                        <span className="text-xs font-mono w-5 text-right" style={{ color: "#A89F94" }}>{i + 1}</span>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold font-serif"
                          style={{ background: "linear-gradient(135deg, #B5651D, #C4705A)" }}>
                          {u.initials || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium truncate" style={{ color: "#0E0C0A" }}>{u.name || "Unnamed"}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                          </div>
                          <div className="progress-bar" style={{ height: 4 }}>
                            <div className="progress-fill" style={{ width: `${(u.artworkCount / maxCount) * 100}%`, background: "#B5651D" }} />
                          </div>
                        </div>
                        <span className="text-xs font-mono font-semibold" style={{ color: "#0E0C0A" }}>{u.artworkCount}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "Users" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] search-bar">
                  <Search size={15} style={{ color: "#A89F94" }} />
                  <input type="text" placeholder="Search users..." value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="flex-1 border-none outline-none text-[13px] bg-transparent" style={{ color: "#0E0C0A" }} />
                </div>
                <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
                  className="form-input text-xs py-2 px-3" style={{ width: "auto" }}>
                  <option value="all">All Plans</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="studio">Studio</option>
                </select>
                <button onClick={exportUsersCSV} className="btn-secondary flex items-center gap-1.5 text-xs">
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <p className="text-xs" style={{ color: "#A89F94" }}>{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</p>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F2EDE6" }}>
                      {["User", "Email", "Plan", "Artworks", "Joined", "Admin", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#A89F94" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const badge = planBadge(u.plan)
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid #F2EDE6" }} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold font-serif"
                                style={{ background: "linear-gradient(135deg, #B5651D, #C4705A)" }}>
                                {u.initials || u.name?.charAt(0) || "?"}
                              </div>
                              <span className="font-medium" style={{ color: "#0E0C0A" }}>{u.name || "Unnamed"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "#A89F94" }}>{u.email}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: "#0E0C0A" }}>{u.artworkCount}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "#A89F94" }}>{formatDate(u.created_at)}</td>
                          <td className="px-4 py-3">
                            {u.is_admin && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#0E0C0A", color: "#D4854A" }}>Admin</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <select value={(u.plan || "starter").toLowerCase()} onChange={e => handleChangePlan(u.id, e.target.value)}
                                disabled={updatingUser === u.id} className="text-[11px] border rounded px-1.5 py-1 bg-white" style={{ borderColor: "#E8E2DA", color: "#0E0C0A" }}>
                                <option value="starter">Starter</option>
                                <option value="pro">Pro</option>
                                <option value="studio">Studio</option>
                              </select>
                              <button onClick={() => handleToggleAdmin(u.id, u.is_admin)} disabled={updatingUser === u.id || u.id === user.id}
                                className="text-[10px] px-2 py-1 rounded font-medium transition-colors"
                                style={{ background: u.is_admin ? "#F5E2DC" : "#F2EDE6", color: u.is_admin ? "#C4705A" : "#A89F94", opacity: u.id === user.id ? 0.4 : 1 }}>
                                {u.is_admin ? "Remove Admin" : "Make Admin"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#A89F94" }}>No users match your search</p>}
              </div>
            </div>
          )}

          {/* ── CONTENT ── */}
          {tab === "Content" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Artworks", value: contentStats.artworks, icon: Image, color: "#2D4A35", bg: "#E8F2EA" },
                  { label: "Viewing Rooms", value: contentStats.viewingRooms, icon: Eye, color: "#B5651D", bg: "#F5E6D8" },
                  { label: "Commissions", value: contentStats.commissions, icon: Users, color: "#C4705A", bg: "#F5E2DC" },
                  { label: "Contacts", value: contentStats.contacts, icon: UserCircle, color: "#8A6A1A", bg: "#FBF2DC" },
                ].map(s => (
                  <div key={s.label} className="card p-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: s.bg }}>
                      <s.icon size={16} style={{ color: s.color }} />
                    </div>
                    <p className="text-xl font-bold font-serif" style={{ color: "#0E0C0A" }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: "#A89F94" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Contracts", value: contentStats.contracts },
                  { label: "Scheduled Posts", value: contentStats.posts },
                  { label: "Consignments", value: contentStats.consignments },
                  { label: "Exhibitions", value: contentStats.exhibitions },
                ].map(s => (
                  <div key={s.label} className="card p-4 text-center">
                    <p className="text-xl font-bold font-serif" style={{ color: "#0E0C0A" }}>{s.value}</p>
                    <p className="text-[10px]" style={{ color: "#A89F94" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Recent Viewing Rooms ({contentStats.publicViewingRooms} published)</h3>
                {(contentStats.recentViewingRooms || []).length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "#A89F94" }}>No viewing rooms yet</p>
                ) : (
                  <div className="space-y-3">
                    {(contentStats.recentViewingRooms || []).map(vr => (
                      <div key={vr.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#FAF8F5" }}>
                        <Eye size={14} style={{ color: "#B5651D" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: "#0E0C0A" }}>{vr.title || "Untitled"}</p>
                          {vr.slug && <p className="text-[10px] truncate" style={{ color: "#A89F94" }}>/view/{vr.slug}</p>}
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: vr.published ? "#E8F2EA" : "#F2EDE6", color: vr.published ? "#2D4A35" : "#A89F94" }}>
                          {vr.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-[10px]" style={{ color: "#A89F94" }}>{formatDate(vr.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PLATFORM ── */}
          {tab === "Platform" && (
            <div className="space-y-5">
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Quick Links</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { label: "Supabase Dashboard", url: "https://supabase.com/dashboard", desc: "Database, auth, edge functions" },
                    { label: "Stripe Dashboard", url: "https://dashboard.stripe.com", desc: "Payments, subscriptions, invoices" },
                    { label: "Vercel Dashboard", url: "https://vercel.com/dashboard", desc: "Deployments, domains, analytics" },
                  ].map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg transition-colors hover:shadow-sm"
                      style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
                      <ExternalLink size={16} style={{ color: "#B5651D" }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>{link.label}</p>
                        <p className="text-[10px]" style={{ color: "#A89F94" }}>{link.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Platform Info</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Users", value: String(stats.totalUsers || 0) },
                    { label: "Paid Users", value: `${stats.paidUsers || 0} (${conversionRate}% conversion)` },
                    { label: "Active Subscriptions", value: String(stats.activeSubscriptions || 0) },
                    { label: "Est. MRR", value: formatCurrency((stats.planCounts?.pro || 0) * 19 + (stats.planCounts?.studio || 0) * 49) },
                    { label: "Total Content Items", value: String((stats.totalArtworks || 0) + (stats.totalContracts || 0) + (stats.totalViewingRooms || 0)) },
                    { label: "Total Revenue (Paid Invoices)", value: formatCurrency(stats.totalRevenue) },
                    { label: "Total Expenses", value: formatCurrency(stats.totalExpenses) },
                    { label: "Net Revenue", value: formatCurrency((stats.totalRevenue || 0) - (stats.totalExpenses || 0)) },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-2" style={{ borderBottom: "1px solid #F2EDE6" }}>
                      <span className="text-xs" style={{ color: "#A89F94" }}>{row.label}</span>
                      <span className="text-xs font-semibold font-mono" style={{ color: "#0E0C0A" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Data Export</h3>
                <button onClick={exportUsersCSV} className="btn-primary flex items-center gap-2 text-sm">
                  <Download size={15} /> Export All Users (CSV)
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
