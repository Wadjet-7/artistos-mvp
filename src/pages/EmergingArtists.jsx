import { useRef, useEffect } from "react"
import { emergingArtists } from "../data/mockData"

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

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, palette[0])
  grad.addColorStop(0.5, palette[1])
  grad.addColorStop(1, palette[2])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Ellipses
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

  // Strokes
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

export default function EmergingArtists() {
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
        <strong>Weekly Digest:</strong> 5 new artists flagged by our ML model
        this week. Based on exhibition velocity, gallery tier, and market
        trajectory.
      </div>

      {/* Top Emerging Artists Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Top Emerging Artists</div>
            <div className="card-subtitle">Ranked by growth score</div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {emergingArtists.map((artist, i) => (
            <div
              key={artist.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 22px",
                borderBottom:
                  i < emergingArtists.length - 1
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

              {/* Canvas swatch */}
              <ArtistSwatch seed={artist.seed} />

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
                  {artist.style}
                </div>
              </div>

              {/* Growth */}
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#4A7A57",
                  flexShrink: 0,
                }}
              >
                {artist.growth}
              </div>

              {/* Match badge */}
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
                {artist.match} match
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
