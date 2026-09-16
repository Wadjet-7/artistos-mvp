/* ================================================================ */
/*  Growth Stats (Phase 21) — Admin Panel funnel section             */
/*  One RPC call (admin_growth_stats) renders the Friday scoreboard. */
/* ================================================================ */

import { useState, useEffect } from "react"
import { TrendingUp, UserPlus, Zap, CreditCard, Ticket } from "lucide-react"
import { supabase } from "../lib/supabase"

export default function GrowthStats() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.rpc("admin_growth_stats").then(({ data, error }) => {
      if (!mounted) return
      if (error || data?.error) { setError(true); return }
      setStats(data)
    })
    return () => { mounted = false }
  }, [])

  if (error) return null
  if (!stats) return (
    <div className="card p-5">
      <div className="skeleton skeleton-text" style={{ width: 160 }} />
    </div>
  )

  const activationRate = stats.total_users ? Math.round((stats.activated / stats.total_users) * 100) : 0
  const sources = Object.entries(stats.by_source || {}).sort((a, b) => b[1] - a[1])
  const maxSource = sources.length ? sources[0][1] : 1

  const cards = [
    { icon: UserPlus, label: "New (7 days)", value: stats.new_7d, color: "#B5651D", bg: "#F5E6D8" },
    { icon: Zap, label: `Activated (3+ artworks) · ${activationRate}%`, value: stats.activated, color: "#8A6A1A", bg: "#FBF2DC" },
    { icon: CreditCard, label: "Paying artists", value: stats.paying, color: "#2D4A35", bg: "#E8F2EA" },
    { icon: Ticket, label: "Promo redemptions", value: stats.promo_redemptions, color: "#C4705A", bg: "#F5E2DC" },
  ]

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} style={{ color: "#B5651D" }} />
        <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>Growth Funnel</h3>
        <span className="text-xs ml-auto" style={{ color: "#A89F94" }}>{stats.new_30d} signups last 30 days</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {cards.map(c => (
          <div key={c.label} className="rounded-lg p-3" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: c.bg }}>
              <c.icon size={15} style={{ color: c.color }} />
            </div>
            <p className="text-xl font-bold font-serif" style={{ color: "#0E0C0A" }}>{c.value ?? 0}</p>
            <p className="text-[11px] mt-0.5 leading-tight" style={{ color: "#A89F94" }}>{c.label}</p>
          </div>
        ))}
      </div>

      <h4 className="text-xs font-semibold mb-2" style={{ color: "#0E0C0A" }}>Signups by source</h4>
      {sources.length === 0 && <p className="text-xs" style={{ color: "#A89F94" }}>No signups yet.</p>}
      {sources.slice(0, 8).map(([src, cnt]) => (
        <div key={src} className="flex items-center gap-3 mb-2">
          <span className="text-xs w-28 truncate font-medium" style={{ color: "#5C554C" }}>{src}</span>
          <div className="flex-1 progress-bar" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${Math.round((cnt / maxSource) * 100)}%`, background: "#B5651D" }} />
          </div>
          <span className="text-xs font-semibold w-8 text-right" style={{ color: "#0E0C0A" }}>{cnt}</span>
        </div>
      ))}
    </div>
  )
}
