import { useState, useEffect, useCallback } from "react"
import {
  Shield, Users, Image, FileText, DollarSign, Eye, Package, CalendarDays,
  Loader2, Search, Download, ExternalLink, RefreshCw, TrendingUp
} from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageError from "../components/PageError"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"
const formatCurrency = (n) => `$${(Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}`

const planBadge = (plan) => {
  switch ((plan || "").toLowerCase()) {
    case "pro": return { bg: "#F5E6D8", color: "#B5651D", label: "Pro" }
    case "studio": return { bg: "#FBF2DC", color: "#8A6A1A", label: "Studio" }
    default: return { bg: "#F2EDE6", color: "#A89F94", label: "Starter" }
  }
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */
const tabs = ["Overview", "Users", "Content", "Platform"]

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState("Overview")
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  /* ---- Data ---- */
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [recentSignups, setRecentSignups] = useState([])
  const [contentStats, setContentStats] = useState({})

  /* ---- User tab state ---- */
  const [userSearch, setUserSearch] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [updatingUser, setUpdatingUser] = useState(null)

  /* ---- Fetch all admin data ---- */
  const fetchData = useCallback(async () => {
    try {
      setFetchError(false)
      setLoading(true)

      const [
        profilesRes, artworksRes, invoicesRes, commissionsRes,
        contractsRes, viewingRoomsRes, consignmentsRes, exhibitionsRes,
        contactsRes, postsRes, expensesRes
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, email, plan, avatar_url, initials, is_admin, created_at"),
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
      ])

      const profiles = profilesRes.data || []
      const artworks = artworksRes.data || []
      const invoices = invoicesRes.data || []
      const commissions = commissionsRes.data || []
      const viewingRooms = viewingRoomsRes.data || []

      // Count artworks per user
      const artworkCountByUser = {}
      artworks.forEach(a => { artworkCountByUser[a.user_id] = (artworkCountByUser[a.user_id] || 0) + 1 })

      // Enrich users
      const enrichedUsers = profiles.map(p => ({
        ...p,
        artworkCount: artworkCountByUser[p.id] || 0,
      }))

      // Plan breakdown
      const planCounts = { starter: 0, pro: 0, studio: 0 }
      profiles.forEach(p => {
        const plan = (p.plan || "starter").toLowerCase()
        if (planCounts[plan] !== undefined) planCounts[plan]++
        else planCounts.starter++
      })

      // Revenue
      const paidInvoices = invoices.filter(i => i.status === "paid")
      const totalRevenue = paidInvoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
      const totalExpenses = (expensesRes.data || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)

      setStats({
        totalUsers: profiles.length,
        planCounts,
        totalArtworks: artworks.length,
        totalInvoices: invoices.length,
        totalRevenue,
        totalExpenses,
        totalCommissions: commissions.length,
        activeCommissions: commissions.filter(c => ["pending", "active", "quoted"].includes(c.status)).length,
        totalContracts: contractsRes.count || 0,
        totalViewingRooms: viewingRooms.length,
        totalConsignments: consignmentsRes.count || 0,
        totalExhibitions: exhibitionsRes.count || 0,
        totalContacts: contactsRes.count || 0,
        totalPosts: postsRes.count || 0,
      })

      setUsers(enrichedUsers)
      setRecentSignups(
        [...profiles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10)
      )

      setContentStats({
        artworks: artworks.length,
        viewingRooms: viewingRooms.length,
        publicViewingRooms: viewingRooms.filter(v => v.published).length,
        recentViewingRooms: [...viewingRooms].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
        contracts: contractsRes.count || 0,
        commissions: commissions.length,
        consignments: consignmentsRes.count || 0,
        exhibitions: exhibitionsRes.count || 0,
        contacts: contactsRes.count || 0,
        posts: postsRes.count || 0,
      })

    } catch (err) {
      console.error("[Admin] fetch error:", err)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* ---- Update user plan ---- */
  const handleChangePlan = async (userId, newPlan) => {
    setUpdatingUser(userId)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ plan: newPlan })
        .eq("id", userId)
      if (error) throw error
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
      toast.success(`Plan updated to ${newPlan}`)
    } catch {
      toast.error("Failed to update plan")
    } finally {
      setUpdatingUser(null)
    }
  }

  /* ---- Toggle admin ---- */
  const handleToggleAdmin = async (userId, currentAdmin) => {
    if (userId === user.id) {
      toast.error("You can't remove your own admin access")
      return
    }
    setUpdatingUser(userId)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentAdmin })
        .eq("id", userId)
      if (error) throw error
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentAdmin } : u))
      toast.success(currentAdmin ? "Admin access removed" : "Admin access granted")
    } catch {
      toast.error("Failed to update admin status")
    } finally {
      setUpdatingUser(null)
    }
  }

  /* ---- Export CSV ---- */
  const exportUsersCSV = () => {
    const header = "Name,Email,Plan,Artworks,Signup Date,Admin\n"
    const rows = users.map(u =>
      `"${(u.name || "").replace(/"/g, '""')}","${u.email}","${u.plan || "starter"}",${u.artworkCount},"${formatDate(u.created_at)}",${u.is_admin ? "Yes" : "No"}`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `artistos-users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("User list exported")
  }

  /* ---- Filter users ---- */
  const filteredUsers = users.filter(u => {
    if (userFilter !== "all" && (u.plan || "starter").toLowerCase() !== userFilter) return false
    if (userSearch) {
      const q = userSearch.toLowerCase()
      return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    }
    return true
  })

  /* ---------------------------------------------------------------- */
  if (fetchError && !loading) {
    return <PageError message="Could not load admin data." onRetry={fetchData} />
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#0E0C0A" }}>
            <Shield size={20} style={{ color: "#D4854A" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold font-serif" style={{ color: "#0E0C0A" }}>Admin Panel</h1>
            <p className="text-xs" style={{ color: "#A89F94" }}>Platform management & analytics</p>
          </div>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2 text-xs" disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "#F2EDE6" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors"
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
          {/* ============================================================ */}
          {/*  OVERVIEW TAB                                                 */}
          {/* ============================================================ */}
          {tab === "Overview" && (
            <div className="space-y-5">
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Total Users", value: stats.totalUsers, color: "#B5651D", bg: "#F5E6D8" },
                  { icon: Image, label: "Total Artworks", value: stats.totalArtworks, color: "#2D4A35", bg: "#E8F2EA" },
                  { icon: DollarSign, label: "Revenue (Paid)", value: formatCurrency(stats.totalRevenue), color: "#8A6A1A", bg: "#FBF2DC" },
                  { icon: TrendingUp, label: "Active Commissions", value: stats.activeCommissions, color: "#C4705A", bg: "#F5E2DC" },
                ].map(s => (
                  <div key={s.label} className="card p-5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: s.bg }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-bold font-serif" style={{ color: "#0E0C0A" }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Plan breakdown + recent signups */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Plan breakdown */}
                <div className="card p-5">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Users by Plan</h3>
                  {["starter", "pro", "studio"].map(plan => {
                    const count = stats.planCounts?.[plan] || 0
                    const pct = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0
                    const badge = planBadge(plan)
                    return (
                      <div key={plan} className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                        <div className="flex-1">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: badge.color }} />
                          </div>
                        </div>
                        <span className="text-xs font-mono" style={{ color: "#A89F94" }}>{count} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>

                {/* Recent signups */}
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
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                          <span className="text-[10px]" style={{ color: "#A89F94" }}>{formatDate(u.created_at)}</span>
                        </div>
                      )
                    })}
                    {recentSignups.length === 0 && (
                      <p className="text-xs text-center py-4" style={{ color: "#A89F94" }}>No users yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary stats */}
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

          {/* ============================================================ */}
          {/*  USERS TAB                                                    */}
          {/* ============================================================ */}
          {tab === "Users" && (
            <div className="space-y-4">
              {/* Search + filter + export */}
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

              {/* Users table */}
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
                        <tr key={u.id} style={{ borderBottom: "1px solid #F2EDE6" }}
                          className="hover:bg-[#FAF8F5] transition-colors">
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
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: "#0E0C0A" }}>{u.artworkCount}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "#A89F94" }}>{formatDate(u.created_at)}</td>
                          <td className="px-4 py-3">
                            {u.is_admin && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#0E0C0A", color: "#D4854A" }}>
                                Admin
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <select
                                value={(u.plan || "starter").toLowerCase()}
                                onChange={e => handleChangePlan(u.id, e.target.value)}
                                disabled={updatingUser === u.id}
                                className="text-[11px] border rounded px-1.5 py-1 bg-white"
                                style={{ borderColor: "#E8E2DA", color: "#0E0C0A" }}>
                                <option value="starter">Starter</option>
                                <option value="pro">Pro</option>
                                <option value="studio">Studio</option>
                              </select>
                              <button
                                onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                                disabled={updatingUser === u.id || u.id === user.id}
                                className="text-[10px] px-2 py-1 rounded font-medium transition-colors"
                                style={{
                                  background: u.is_admin ? "#F5E2DC" : "#F2EDE6",
                                  color: u.is_admin ? "#C4705A" : "#A89F94",
                                  opacity: u.id === user.id ? 0.4 : 1,
                                }}>
                                {u.is_admin ? "Remove Admin" : "Make Admin"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: "#A89F94" }}>No users match your search</p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/*  CONTENT TAB                                                  */}
          {/* ============================================================ */}
          {tab === "Content" && (
            <div className="space-y-5">
              {/* Content stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Artworks", value: contentStats.artworks, icon: Image, color: "#2D4A35", bg: "#E8F2EA" },
                  { label: "Viewing Rooms", value: contentStats.viewingRooms, icon: Eye, color: "#B5651D", bg: "#F5E6D8" },
                  { label: "Commissions", value: contentStats.commissions, icon: Users, color: "#C4705A", bg: "#F5E2DC" },
                  { label: "Contacts", value: contentStats.contacts, icon: Users, color: "#8A6A1A", bg: "#FBF2DC" },
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

              {/* More content stats */}
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

              {/* Recent public viewing rooms */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>
                  Recent Viewing Rooms ({contentStats.publicViewingRooms} published)
                </h3>
                {(contentStats.recentViewingRooms || []).length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "#A89F94" }}>No viewing rooms yet</p>
                ) : (
                  <div className="space-y-3">
                    {(contentStats.recentViewingRooms || []).map(vr => (
                      <div key={vr.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "#FAF8F5" }}>
                        <Eye size={14} style={{ color: "#B5651D" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: "#0E0C0A" }}>{vr.title || "Untitled"}</p>
                          {vr.slug && (
                            <p className="text-[10px] truncate" style={{ color: "#A89F94" }}>/view/{vr.slug}</p>
                          )}
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

          {/* ============================================================ */}
          {/*  PLATFORM TAB                                                 */}
          {/* ============================================================ */}
          {tab === "Platform" && (
            <div className="space-y-5">
              {/* Quick links */}
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

              {/* Platform info */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#0E0C0A" }}>Platform Info</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Users", value: String(stats.totalUsers || 0) },
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

              {/* Export */}
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
