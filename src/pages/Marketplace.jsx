import { useState, useEffect, useRef, useCallback } from "react"
import { marketplaceArtists } from "../data/mockData"

const filters = ["All Artists", "Abstract", "Portrait", "Sculpture", "Digital", "$0–2K", "Accepting Now"]

function paintAbstract(canvas, seed) {
  const ctx = canvas.getContext("2d")
  const w = canvas.width, h = canvas.height
  const randColor = (s) => `hsl(${(s * 137.508) % 360}, 55%, ${45 + (s % 20)}%)`
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, randColor(seed))
  bg.addColorStop(1, randColor(seed + 7))
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 8; i++) {
    ctx.globalAlpha = 0.3 + (i % 3) * 0.15
    ctx.fillStyle = randColor(seed + i * 3)
    ctx.beginPath()
    const x = ((seed * 13 + i * 47) % w)
    const y = ((seed * 17 + i * 31) % h)
    const r = 20 + (seed * 7 + i * 23) % 60
    ctx.ellipse(x, y, r, r * 0.7, (seed + i) * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function ArtistBanner({ seed }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) paintAbstract(ref.current, seed)
  }, [seed])
  return <canvas ref={ref} width={300} height={90} className="w-full h-full block" />
}

export default function Marketplace() {
  const [search, setSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState(new Set(["All Artists"]))

  const toggleFilter = useCallback((f) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (f === "All Artists") return new Set(["All Artists"])
      next.delete("All Artists")
      next.has(f) ? next.delete(f) : next.add(f)
      if (next.size === 0) next.add("All Artists")
      return next
    })
  }, [])

  const filtered = marketplaceArtists.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.style.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="search-bar">
        <span style={{ color: "#A89F94" }}>🔍</span>
        <input
          type="text"
          placeholder="Search by style, medium, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border-none outline-none text-[13.5px] bg-transparent"
          style={{ color: "#0E0C0A" }}
        />
        <button className="btn-secondary" style={{ fontSize: "12px", padding: "6px 14px" }}>Filters</button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => toggleFilter(f)}
            className={`filter-pill ${activeFilters.has(f) ? "active" : ""}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Artist cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => (
          <div key={a.id} className="bg-white rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ border: "1px solid #E8E2DA" }}>
            {/* Banner */}
            <div className="h-[90px] relative overflow-hidden">
              <ArtistBanner seed={a.seed} />
            </div>
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -top-5 left-4 w-[52px] h-[52px] rounded-full flex items-center justify-center font-serif text-xl font-semibold text-white"
                style={{ background: a.gradient, border: "3px solid white" }}>
                {a.initial}
              </div>
            </div>
            {/* Body */}
            <div className="pt-7 px-4 pb-4">
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="text-xs mb-2" style={{ color: "#A89F94" }}>{a.style}</div>
              <div className="flex gap-3 mb-3">
                <span className="text-[11px]" style={{ color: "#A89F94" }}>⭐ <strong style={{ color: "#0E0C0A" }}>{a.rating}</strong> ({a.reviews})</span>
                <span className="text-[11px]" style={{ color: "#A89F94" }}>💰 <strong style={{ color: "#0E0C0A" }}>{a.priceRange}</strong></span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {a.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded font-medium"
                    style={{ background: "#F2EDE6", color: "#A89F94", letterSpacing: "0.3px" }}>
                    {t}
                  </span>
                ))}
              </div>
              <span className={a.statusColor} style={{ fontSize: "10px" }}>
                {a.status === "Accepting" ? "●" : a.status.includes("Waitlist") ? "⌛" : "✗"} {a.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
