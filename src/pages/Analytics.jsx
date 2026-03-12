import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { Loader2 } from "lucide-react"
import { styleMarketTrends } from "../data/mockData"
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
  const [avgPrice, setAvgPrice] = useState(0)
  const [artworkCount, setArtworkCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("artworks")
          .select("price, medium, status")
          .eq("user_id", user.id)

        if (error) {
          console.error("[Analytics] fetch error:", error)
          setLoading(false)
          return
        }

        const artworks = data || []
        setArtworkCount(artworks.length)

        if (artworks.length > 0) {
          const total = artworks.reduce((sum, a) => sum + (Number(a.price) || 0), 0)
          setAvgPrice(Math.round(total / artworks.length))
        } else {
          setAvgPrice(0)
        }
      } catch (err) {
        console.error("[Analytics] error:", err)
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
      label: "Avg. Sale Price",
      value: avgPrice > 0 ? `$${avgPrice.toLocaleString()}` : "$0",
      delta: artworkCount > 0 ? `Based on ${artworkCount} artworks` : "No artworks yet",
      up: avgPrice > 0,
      variant: "copper",
    },
    { label: "Price / Sq. Inch", value: "$4.80", delta: "Top 15% of peers", up: true, variant: "forest" },
    { label: "Collector Reach", value: "1,240", delta: "↑ Profile views (30d)", up: true, variant: "gold" },
  ]

  // Market position ring: 74 is static score, but adjust percentage based on artwork count
  // More artworks = higher ring fill. Cap at 100% (266deg = 74%)
  const scorePercent = Math.min(74 + artworkCount, 100)
  const scoreDeg = Math.round((scorePercent / 100) * 360)

  return (
    <div className="space-y-5">
      {/* Market Position Score */}
      <div className="rounded-xl p-5 flex flex-col md:flex-row items-center gap-4" style={{ background: "#0E0C0A", color: "#FAF8F5" }}>
        <div className="w-[72px] h-[72px] rounded-full flex-shrink-0 flex items-center justify-center relative"
          style={{ background: `conic-gradient(#D4854A 0deg ${scoreDeg}deg, rgba(255,255,255,0.1) ${scoreDeg}deg 360deg)` }}>
          <div className="w-[54px] h-[54px] rounded-full flex items-center justify-center font-serif text-[22px] font-semibold"
            style={{ background: "#0E0C0A" }}>74</div>
        </div>
        <div className="flex-1">
          <div className="font-serif text-[22px] font-normal">Market Position Score</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            Based on price trajectory, exhibition history, and social growth. Top 22% of comparable artists.
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[1px] mb-1" style={{ opacity: 0.5 }}>YoY Growth</div>
          <div className="font-serif text-[28px]" style={{ color: "#86C996" }}>+32%</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.up ? "up" : "down"}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Price History */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Price History</div>
              <div className="card-subtitle">Avg. sale price per year</div>
            </div>
          </div>
          <div className="card-body">
            <svg viewBox="0 0 360 140" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D4A35" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2D4A35" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[110, 80, 50, 20].map(y => (
                <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="#F2EDE6" strokeWidth="1" />
              ))}
              {["2021","2022","2023","2024","2025"].map((yr, i) => (
                <text key={yr} x={28 + i * 70} y="125" fill="#A89F94" fontSize="10" fontFamily="DM Mono" textAnchor="middle">{yr}</text>
              ))}
              <path d="M28,100 L98,90 L168,80 L238,55 L308,30 L308,110 L28,110 Z" fill="url(#g2)" />
              <polyline points="28,100 98,90 168,80 238,55 308,30" fill="none" stroke="#2D4A35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {[[28,100],[98,90],[168,80],[238,55]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="white" stroke="#2D4A35" strokeWidth="2" />
              ))}
              <circle cx="308" cy="30" r="5" fill="#2D4A35" stroke="#2D4A35" strokeWidth="2" />
              <text x="308" y="20" fill="#2D4A35" fontSize="10" fontFamily="DM Mono" textAnchor="middle" fontWeight="600">
                {avgPrice > 0 ? `$${avgPrice.toLocaleString()}` : "$0"}
              </text>
            </svg>
          </div>
        </div>

        {/* Style Market Trends */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Style Market Trends</div>
              <div className="card-subtitle">Q1 2026 vs Q4 2025</div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-3.5">
              {styleMarketTrends.map(t => (
                <div key={t.style}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px]">{t.style}</span>
                    <span className="text-xs font-semibold font-mono" style={{ color: t.positive ? "#4A7A57" : "#C4705A" }}>
                      {t.change}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: t.percentage + "%", background: t.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
