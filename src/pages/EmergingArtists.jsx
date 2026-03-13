import { useState, useEffect, useRef } from "react"
import { Loader2, TrendingUp, Sparkles } from "lucide-react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageError from "../components/PageError"

/* ------------------------------------------------------------------ */
/*  Canvas art swatch for artists without avatars                      */
/* ------------------------------------------------------------------ */
function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const palettes = [
  ["#B5651D", "#C9A84C", "#F2EDE6", "#C4705A"],
  ["#2D4A35", "#4A7A57", "#C9A84C", "#E8E2DA"],
  ["#C4705A", "#B5651D", "#F2EDE6", "#2D4A35"],
  ["#0E0C0A", "#A89F94", "#C9A84C", "#B5651D"],
  ["#6B4A10", "#C9A84C", "#C4705A", "#2D4A35"],
]

function paintAbstract(canvas, seed) {
  const ctx = canvas.getContext("2d")
  const w = canvas.width
  const h = canvas.height
  const rng = seededRandom(seed)
  const palette = palettes[seed % palettes.length]

  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, palette[0])
  grad.addColorStop(0.5, palette[1])
  grad.addColorStop(1, palette[2])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    const cx = rng() * w
    const cy = rng() * h
    const rx = 4 + rng() * 12
    const ry = 4 + rng() * 12
    ctx.ellipse(cx, cy, rx, ry, rng() * Math.PI, 0, Math.PI * 2)
    ctx.fillStyle = palette[(i + 1) % palette.length]
    ctx.globalAlpha = 0.4 + rng() * 0.4
    ctx.fill()
  }

  ctx.globalAlpha = 0.6
  for (let i = 0; i < 2; i++) {
    ctx.beginPath()
    ctx.moveTo(rng() * w, rng() * h)
    ctx.quadraticCurveTo(rng() * w, rng() * h, rng() * w, rng() * h)
    ctx.strokeStyle = palette[(i + 2) % palette.length]
    ctx.lineWidth = 1.5 + rng() * 2
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

function ArtistSwatch({ seed }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      paintAbstract(canvasRef.current, seed)
    }
  }, [seed])

  return (
    <canvas
      ref={canvasRef}
      width={72}
      height={72}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        flexShrink: 0,
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  EmergingArtists — real data from Supabase profiles                 */
/* ------------------------------------------------------------------ */
export default function EmergingArtists() {
  const { user } = useAuth()
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    async function fetchArtists() {
      try {
        setFetchError(false)
        // Fetch all profiles except the current user, ordered by most recently active
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, medium, style, location, avatar_url, created_at")
          .neq("id", user?.id || "")
          .not("name", "is", null)
          .order("created_at", { ascending: false })
          .limit(20)

        if (error) throw error

        // For each artist, count their artworks to compute a "portfolio score"
        const enriched = await Promise.all(
          (data || []).filter(a => a.name?.trim()).map(async (artist, i) => {
            const { count } = await supabase
              .from("artworks")
              .select("id", { count: "exact", head: true })
              .eq("user_id", artist.id)

            return {
              ...artist,
              artworkCount: count || 0,
              rank: i + 1,
              seed: artist.id.charCodeAt(0) * 7 + artist.id.charCodeAt(1) * 13 + i,
              styleLabel: [artist.medium, artist.location].filter(Boolean).join(" · ") || artist.style || "Multidisciplinary",
            }
          })
        )

        // Sort by artwork count (most prolific = highest "emerging" score)
        enriched.sort((a, b) => b.artworkCount - a.artworkCount)
        enriched.forEach((a, i) => { a.rank = i + 1 })

        setArtists(enriched)
      } catch (err) {
        console.error("[EmergingArtists] fetch error:", err)
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchArtists()
  }, [user?.id])

  if (fetchError && !loading) {
    return <PageError message="Could not load emerging artists. Please try again." onRetry={() => { setLoading(true); setFetchError(false); window.location.reload() }} />
  }

  return (
    <div className="space-y-5">
      {/* ML Digest Banner */}
      <div
        style={{
          background: "#FBF2DC",
          border: "1px solid #C9A84C",
          borderRadius: 10,
          padding: "14px 20px",
          color: "#6B4A10",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <span style={{ marginRight: 6 }}>&#9672;</span>
        <strong>Community Spotlight:</strong> Discover artists on the ArtistOS platform.
        Ranked by portfolio activity and engagement.
      </div>

      {/* Top Emerging Artists Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Platform Artists</div>
            <div className="card-subtitle">Ranked by portfolio activity</div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin" style={{ color: "#B5651D" }} />
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-12" style={{ color: "#A89F94" }}>
              <Sparkles size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No other artists on the platform yet</p>
              <p className="text-xs mt-1">Invite fellow artists to join ArtistOS!</p>
            </div>
          ) : (
            artists.map((artist, i) => (
              <div
                key={artist.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 22px",
                  borderBottom:
                    i < artists.length - 1
                      ? "1px solid #F2EDE6"
                      : "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F2EDE6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => window.open(`/artist/${artist.id}`, "_blank")}
              >
                {/* Rank */}
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#A89F94",
                    width: 24,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {artist.rank}
                </div>

                {/* Avatar or canvas swatch */}
                {artist.avatar_url ? (
                  <img src={artist.avatar_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <ArtistSwatch seed={artist.seed} />
                )}

                {/* Name + style */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "#0E0C0A",
                    }}
                  >
                    {artist.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#A89F94",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {artist.styleLabel}
                  </div>
                </div>

                {/* Artwork count */}
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#4A7A57",
                    flexShrink: 0,
                  }}
                >
                  {artist.artworkCount} works
                </div>

                {/* View profile badge */}
                <div
                  style={{
                    background: "#F5E6D8",
                    color: "#B5651D",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    flexShrink: 0,
                  }}
                >
                  View
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
