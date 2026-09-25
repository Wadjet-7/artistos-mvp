import { useState, useEffect, useMemo } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { canAccess, normalizePlan } from "../lib/plans"
import { Loader2, TrendingUp, DollarSign, Palette, Package, PieChart, BarChart3, Crown, Lock, Clock } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import PageError from "../components/PageError"
import { FeatureGate } from "../components/UpgradePrompt"

export default function Analytics() {
  return (
    <FeatureGate feature="analytics">
      <AnalyticsContent />
    </FeatureGate>
  )
}

function AnalyticsContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [artworks, setArtworks] = useState([])
  const [activities, setActivities] = useState([])

  const fetchData = async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const [artRes, actRes] = await Promise.all([
        supabase.from("artworks").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      ])
      if (artRes.error) throw artRes.error
      setArtworks(artRes.data || [])
      setActivities(actRes.data || [])
    } catch (err) {
      console.error("[Analytics] error:", err)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    fetchData()
  }, [user?.id])

  /* ── Computed metrics ── */
  const metrics = useMemo(() => {
    const total = artworks.length
    const available = artworks.filter(a => a.status === "Available").length
    const sold = artworks.filter(a => a.status === "Sold").length
    const reserved = artworks.filter(a => a.status === "Reserved").length

    const prices = artworks.filter(a => a.price > 0).map(a => a.price)
    const totalValue = prices.reduce((s, p) => s + p, 0)
    const avgPrice = prices.length > 0 ? Math.round(totalValue / prices.length) : 0
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0

    const soldValue = artworks.filter(a => a.status === "Sold" && a.price > 0).reduce((s, a) => s + a.price, 0)
    const availableValue = artworks.filter(a => a.status === "Available" && a.price > 0).reduce((s, a) => s + a.price, 0)

    // Medium breakdown
    const byMedium = {}
    artworks.forEach(a => {
      const m = a.medium || "Other"
      if (!byMedium[m]) byMedium[m] = { count: 0, value: 0, sold: 0 }
      byMedium[m].count++
      byMedium[m].value += (a.price || 0)
      if (a.status === "Sold") byMedium[m].sold++
    })

    // Monthly additions (last 6 months)
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString("en-US", { month: "short" })
      const year = d.getFullYear()
      const month = d.getMonth()
      const count = artworks.filter(a => {
        const cd = new Date(a.created_at)
        return cd.getFullYear() === year && cd.getMonth() === month
      }).length
      months.push({ label, count })
    }
    const maxMonthly = Math.max(...months.map(m => m.count), 1)

    return { total, available, sold, reserved, avgPrice, highestPrice, lowestPrice, totalValue, soldValue, availableValue, byMedium, months, maxMonthly }
  }, [artworks])

  if (fetchError && !loading) {
    return <PageError message="Could not load your analytics data. Please check your connection and try again." onRetry={fetchData} />
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <div className="skeleton skeleton-text" style={{ width: 140 }} />
          <div className="skeleton skeleton-text" style={{ width: 220, height: 12, marginTop: 4 }} />
        </div>
        <div className="skeleton" style={{ height: 90, borderRadius: 12 }} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card" style={{ minHeight: 100 }}>
              <div className="skeleton skeleton-text short" />
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-text" style={{ width: "70%" }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <div className="card-header"><div className="skeleton skeleton-text" style={{ width: 140 }} /></div>
            <div className="card-body">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 30, marginBottom: 10 }} />)}</div>
          </div>
          <div className="card">
            <div className="card-header"><div className="skeleton skeleton-text" style={{ width: 140 }} /></div>
            <div className="card-body"><div className="skeleton skeleton-chart" /></div>
          </div>
        </div>
      </div>
    )
  }

  const mediumColors = {
    "Oil on Canvas": "#B5651D",
    "Acrylic": "#2D4A35",
    "Mixed Media": "#C9A84C",
    "Photography": "#4A7A57",
    "Sculpture": "#C4705A",
    "Other": "#A89F94",
  }

  const mediumEntries = Object.entries(metrics.byMedium).sort((a, b) => b[1].count - a[1].count)
  const totalMediumCount = mediumEntries.reduce((s, [, v]) => s + v.count, 0) || 1

  // Market position score based on real data
  const scoreFactors = Math.min(
    (metrics.total > 0 ? 20 : 0) +
    (metrics.sold > 0 ? 20 : 0) +
    (metrics.avgPrice > 500 ? 15 : metrics.avgPrice > 0 ? 8 : 0) +
    (mediumEntries.length > 1 ? 10 : 0) +
    (metrics.total >= 10 ? 15 : metrics.total >= 5 ? 10 : 5) +
    (activities.length > 5 ? 20 : activities.length > 0 ? 10 : 0),
    100
  )
  const scoreDeg = Math.round((scoreFactors / 100) * 360)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "#0E0C0A" }}>Analytics</h1>
        <p style={{ fontSize: 13, color: "#A89F94", marginTop: 2 }}>Real-time insights into your art business</p>
      </div>

      {/* Market Position Score */}
      <div className="rounded-xl p-5 flex flex-col md:flex-row items-center gap-4" style={{ background: "#0E0C0A", color: "#FAF8F5" }}>
        <div className="w-[72px] h-[72px] rounded-full flex-shrink-0 flex items-center justify-center relative"
          style={{ background: `conic-gradient(#D4854A 0deg ${scoreDeg}deg, rgba(255,255,255,0.1) ${scoreDeg}deg 360deg)` }}>
          <div className="w-[54px] h-[54px] rounded-full flex items-center justify-center font-serif text-[22px] font-semibold"
            style={{ background: "#0E0C0A" }}>{scoreFactors}</div>
        </div>
        <div className="flex-1">
          <div className="font-serif text-[22px] font-normal">Market Position Score</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            Based on portfolio size, sales history, pricing, and platform activity.
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[1px] mb-1" style={{ opacity: 0.5 }}>Portfolio Value</div>
          <div className="font-serif text-[28px]" style={{ color: "#86C996" }}>${metrics.totalValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Avg. Price", value: metrics.avgPrice > 0 ? `$${metrics.avgPrice.toLocaleString()}` : "$0", sub: `Range: $${metrics.lowestPrice.toLocaleString()} – $${metrics.highestPrice.toLocaleString()}`, variant: "copper" },
          { icon: Package, label: "Total Artworks", value: metrics.total.toString(), sub: `${metrics.available} available`, variant: "forest" },
          { icon: TrendingUp, label: "Sold", value: metrics.sold.toString(), sub: metrics.soldValue > 0 ? `$${metrics.soldValue.toLocaleString()} revenue` : "No sales yet", variant: "gold" },
          { icon: Palette, label: "Available Value", value: `$${metrics.availableValue.toLocaleString()}`, sub: `${metrics.available} pieces for sale`, variant: "copper" },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} style={{ opacity: 0.6 }} />
              <div className="stat-label">{s.label}</div>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-delta up">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Medium Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <PieChart size={16} style={{ color: "#B5651D" }} />
              <div>
                <div className="card-title">Portfolio by Medium</div>
                <div className="card-subtitle">{mediumEntries.length} mediums across {metrics.total} works</div>
              </div>
            </div>
          </div>
          <div className="card-body">
            {mediumEntries.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#A89F94" }}>Add artworks to see breakdown</p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {mediumEntries.map(([medium, data]) => {
                  const pct = Math.round((data.count / totalMediumCount) * 100)
                  return (
                    <div key={medium}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[13px]" style={{ color: "#0E0C0A" }}>{medium}</span>
                        <span className="text-xs font-mono" style={{ color: "#A89F94" }}>
                          {data.count} ({pct}%) &middot; ${data.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: pct + "%", background: mediumColors[medium] || "#A89F94" }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} style={{ color: "#2D4A35" }} />
              <div>
                <div className="card-title">Monthly Additions</div>
                <div className="card-subtitle">Artworks added per month (last 6 months)</div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
              {metrics.months.map((m, i) => {
                const h = metrics.maxMonthly > 0 ? Math.max((m.count / metrics.maxMonthly) * 120, m.count > 0 ? 8 : 2) : 2
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-mono" style={{ color: m.count > 0 ? "#0E0C0A" : "#C5BDB3" }}>{m.count}</span>
                    <div className="w-full rounded-t-md transition-all" style={{
                      height: h,
                      background: m.count > 0 ? "linear-gradient(to top, #2D4A35, #4A7A57)" : "#F2EDE6",
                      minWidth: 20,
                    }} />
                    <span className="text-[10px]" style={{ color: "#A89F94" }}>{m.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Status */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Inventory Status</div>
            <div className="card-subtitle">Breakdown of your portfolio by status</div>
          </div>
        </div>
        <div className="card-body">
          <div className="flex gap-4">
            {[
              { label: "Available", count: metrics.available, color: "#2D4A35", bg: "#E8F2EA" },
              { label: "Sold", count: metrics.sold, color: "#C4705A", bg: "#F5E2DC" },
              { label: "Reserved", count: metrics.reserved, color: "#C9A84C", bg: "#FBF2DC" },
            ].map(s => (
              <div key={s.label} className="flex-1 rounded-xl p-4 text-center" style={{ background: s.bg }}>
                <p className="text-2xl font-bold font-serif" style={{ color: s.color }}>{s.count}</p>
                <p className="text-xs font-medium mt-1" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>
          {/* Progress bar showing proportions */}
          {metrics.total > 0 && (
            <div className="flex rounded-full overflow-hidden mt-4" style={{ height: 8 }}>
              <div style={{ width: `${(metrics.available / metrics.total) * 100}%`, background: "#2D4A35" }} />
              <div style={{ width: `${(metrics.sold / metrics.total) * 100}%`, background: "#C4705A" }} />
              <div style={{ width: `${(metrics.reserved / metrics.total) * 100}%`, background: "#C9A84C" }} />
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Activity</div>
              <div className="card-subtitle">Last {Math.min(activities.length, 10)} actions</div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col divide-y" style={{ borderColor: "#F2EDE6" }}>
              {activities.slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm" style={{ color: "#0E0C0A" }}>{a.description}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#A89F94" }}>{a.activity_type}</p>
                  </div>
                  <span className="text-[11px] font-mono whitespace-nowrap" style={{ color: "#A89F94" }}>
                    {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Career Analytics (Studio only) ── */}
      <CareerAnalytics artworks={artworks} user={user} />
    </div>
  )
}

function CareerAnalyticsTooltip({ active, payload, label, prefix = "" }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 shadow-lg" style={{ background: "#0E0C0A", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[10px]" style={{ color: "#A89F94" }}>{label}</p>
      <p className="text-sm font-bold font-serif" style={{ color: "#FAF8F5" }}>{prefix}{payload[0].value?.toLocaleString()}</p>
    </div>
  )
}

function CareerAnalytics({ artworks, user }) {
  const plan = normalizePlan(user?.plan)
  const hasAccess = canAccess(plan, "careerAnalytics")
  const [invoices, setInvoices] = useState([])
  const [provenance, setProvenance] = useState([])

  useEffect(() => {
    if (!hasAccess || !user?.id) return
    Promise.all([
      supabase.from("invoices").select("id, amount, status, created_at, artwork_id").eq("user_id", user.id),
      supabase.from("artwork_provenance").select("*").eq("user_id", user.id),
    ]).then(([invRes, provRes]) => {
      setInvoices((invRes.data || []).filter(i => i.status === "paid"))
      setProvenance(provRes.data || [])
    }).catch(() => {})
  }, [hasAccess, user?.id])

  const priceByQuarter = useMemo(() => {
    const quarters = {}
    invoices.forEach(inv => {
      const d = new Date(inv.created_at)
      const q = `${d.getFullYear()} Q${Math.floor(d.getMonth() / 3) + 1}`
      if (!quarters[q]) quarters[q] = { total: 0, count: 0 }
      quarters[q].total += parseFloat(inv.amount) || 0
      quarters[q].count++
    })
    return Object.entries(quarters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([q, v]) => ({ quarter: q, avg: Math.round(v.total / v.count) }))
  }, [invoices])

  const timeToSale = useMemo(() => {
    const byMedium = {}
    const soldEvents = provenance.filter(p => p.event_type === "sold")
    soldEvents.forEach(ev => {
      const artwork = artworks.find(a => a.id === ev.artwork_id)
      if (!artwork) return
      const days = Math.ceil((new Date(ev.event_date) - new Date(artwork.created_at)) / 86400000)
      if (days < 0) return
      const medium = artwork.medium || "Other"
      if (!byMedium[medium]) byMedium[medium] = []
      byMedium[medium].push(days)
    })
    return Object.entries(byMedium).map(([medium, days]) => ({
      medium,
      avg: Math.round(days.reduce((s, d) => s + d, 0) / days.length),
      count: days.length,
    }))
  }, [provenance, artworks])

  if (!hasAccess) {
    return (
      <div className="card p-6 text-center" style={{ background: "#F0F5F1", border: "1px solid #B8D4BE" }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "#E8F2EA" }}>
          <Crown size={20} style={{ color: "#2D4A35" }} />
        </div>
        <h3 className="text-base font-serif font-semibold mb-1" style={{ color: "#0E0C0A" }}>Career Analytics</h3>
        <p className="text-xs mb-3" style={{ color: "#A89F94" }}>Price trajectory, sell-through rates, and time-to-sale — available on the Studio plan.</p>
        <a href="/upgrade" className="btn-copper text-xs inline-flex items-center gap-1.5 px-4 py-2">
          <Crown size={12} /> Upgrade to Studio
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mt-4">
        <Crown size={16} style={{ color: "#2D4A35" }} />
        <h2 className="text-lg font-serif font-semibold" style={{ color: "#0E0C0A" }}>Career Analytics</h2>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#E8F2EA", color: "#2D4A35" }}>Studio</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Price Trajectory */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Price Trajectory</div>
            <div className="card-subtitle">Average sale price by quarter</div>
          </div>
          <div className="card-body">
            {priceByQuarter.length < 2 ? (
              <p className="text-xs text-center py-8" style={{ color: "#A89F94" }}>
                Your price trajectory appears once you've had sales across two quarters.
              </p>
            ) : (
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceByQuarter}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE6" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "#A89F94" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#A89F94" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip content={<CareerAnalyticsTooltip prefix="$" />} />
                    <Line type="monotone" dataKey="avg" stroke="#B5651D" strokeWidth={2} dot={{ fill: "#B5651D", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Time to Sale */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Time to Sale</div>
            <div className="card-subtitle">Average days from creation to sale, by medium</div>
          </div>
          <div className="card-body">
            {timeToSale.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: "#A89F94" }}>
                Time-to-sale data appears after provenance events are recorded for sold works.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {timeToSale.map(({ medium, avg, count }) => (
                  <div key={medium} className="rounded-xl p-4 text-center" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
                    <p className="text-2xl font-bold font-serif" style={{ color: "#B5651D" }}>{avg}</p>
                    <p className="text-[10px] font-medium" style={{ color: "#0E0C0A" }}>days avg</p>
                    <p className="text-[10px] mt-1" style={{ color: "#A89F94" }}>{medium} ({count} sale{count !== 1 ? "s" : ""})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
