import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, Search, ShoppingBag } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageError from "../components/PageError"

/* ------------------------------------------------------------------ */
/*  Canvas banner generator                                            */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Gradient palette based on artist seed                              */
/* ------------------------------------------------------------------ */
const gradients = [
  "linear-gradient(135deg,#B5651D,#C4705A)",
  "linear-gradient(135deg,#2D4A35,#4A7A57)",
  "linear-gradient(135deg,#C4705A,#D4854A)",
  "linear-gradient(135deg,#6B4A10,#B5651D)",
  "linear-gradient(135deg,#1A2E20,#2D4A35)",
  "linear-gradient(135deg,#8A4A3A,#C4705A)",
]

/* ------------------------------------------------------------------ */
/*  Marketplace — discover real artists on the platform                */
/* ------------------------------------------------------------------ */
export default function Marketplace() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const fetchArtists = useCallback(async () => {
    try {
      setFetchError(false)
      setLoading(true)

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, bio, medium, style, location, avatar_url, initials, created_at")
        .neq("id", user?.id || "")
        .not("name", "is", null)
        .order("created_at", { ascending: false })
        .limit(30)

      if (error) throw error

      // Enrich with artwork counts
      const enriched = await Promise.all(
        (data || []).filter(a => a.name?.trim()).map(async (artist, i) => {
          const { count } = await supabase
            .from("artworks")
            .select("id", { count: "exact", head: true })
            .eq("user_id", artist.id)

          const seed = artist.id.charCodeAt(0) * 7 + artist.id.charCodeAt(1) * 13 + i
          return {
            ...artist,
            artworkCount: count || 0,
            seed,
            gradient: gradients[seed % gradients.length],
            initial: artist.initials?.charAt(0) || artist.name?.charAt(0) || "?",
            styleLabel: [artist.medium, artist.style].filter(Boolean).join(" · ") || "Multidisciplinary",
            tags: [artist.medium, artist.style, artist.location].filter(Boolean).slice(0, 3),
          }
        })
      )

      setArtists(enriched)
    } catch (err) {
      console.error("[Marketplace] fetch error:", err)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchArtists()
  }, [fetchArtists])

  const filtered = artists.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.name?.toLowerCase().includes(q) ||
      a.styleLabel?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.medium?.toLowerCase().includes(q)
    )
  })

  if (fetchError && !loading) {
    return <PageError message="Could not load the artist marketplace. Please try again." onRetry={fetchArtists} />
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="search-bar">
        <span style={{ color: "#A89F94" }}>🔍</span>
        <input
          type="text"
          placeholder="Search by name, style, medium, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border-none outline-none text-[13.5px] bg-transparent"
          style={{ color: "#0E0C0A" }}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: "#B5651D" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#A89F94" }}>
          <ShoppingBag size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">{search ? "No artists match your search" : "No other artists on the platform yet"}</p>
          <p className="text-xs mt-1">{search ? "Try a different search term" : "Invite fellow artists to join ArtistOS!"}</p>
        </div>
      ) : (
        /* Artist cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <div key={a.id}
              className="bg-white rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ border: "1px solid #E8E2DA" }}
              onClick={() => window.open(`/artist/${a.id}`, "_blank")}
            >
              {/* Banner */}
              <div className="h-[90px] relative overflow-hidden">
                <ArtistBanner seed={a.seed} />
              </div>
              {/* Avatar */}
              <div className="relative">
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt=""
                    className="absolute -top-5 left-4 w-[52px] h-[52px] rounded-full object-cover"
                    style={{ border: "3px solid white" }} />
                ) : (
                  <div className="absolute -top-5 left-4 w-[52px] h-[52px] rounded-full flex items-center justify-center font-serif text-xl font-semibold text-white"
                    style={{ background: a.gradient, border: "3px solid white" }}>
                    {a.initial}
                  </div>
                )}
              </div>
              {/* Body */}
              <div className="pt-7 px-4 pb-4">
                <div className="text-sm font-semibold">{a.name}</div>
                <div className="text-xs mb-2" style={{ color: "#A89F94" }}>{a.styleLabel}</div>
                <div className="flex gap-3 mb-3">
                  <span className="text-[11px]" style={{ color: "#A89F94" }}>
                    🎨 <strong style={{ color: "#0E0C0A" }}>{a.artworkCount}</strong> works
                  </span>
                  {a.location && (
                    <span className="text-[11px]" style={{ color: "#A89F94" }}>
                      📍 <strong style={{ color: "#0E0C0A" }}>{a.location}</strong>
                    </span>
                  )}
                </div>
                {a.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {a.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded font-medium"
                        style={{ background: "#F2EDE6", color: "#A89F94", letterSpacing: "0.3px" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <span className="badge-forest" style={{ fontSize: "10px" }}>
                  ● View Profile
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
