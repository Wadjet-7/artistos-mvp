/**
 * Procedural abstract-art painter — renders generative art on a canvas element.
 * Used as a fallback for artworks without uploaded images.
 * Uses a seeded PRNG for deterministic output per artwork.
 */
export default function paintAbstract(canvas, seed) {
  const ctx = canvas.getContext("2d")
  const W = canvas.width
  const H = canvas.height

  let s = seed | 0
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

  const palettes = [
    ["#B5651D", "#C4705A", "#C9A84C", "#2D4A35", "#F2EDE6"],
    ["#D4854A", "#8A6A1A", "#4A7A57", "#E8E2DA", "#C4705A"],
    ["#2D4A35", "#C9A84C", "#B5651D", "#F5E6D8", "#A89F94"],
    ["#C4705A", "#F2EDE6", "#0E0C0A", "#B5651D", "#C9A84C"],
  ]
  const palette = palettes[Math.floor(rand() * palettes.length)]

  ctx.fillStyle = palette[4]
  ctx.fillRect(0, 0, W, H)

  for (let i = 0; i < 4 + Math.floor(rand() * 3); i++) {
    ctx.save()
    ctx.globalAlpha = 0.25 + rand() * 0.35
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)]
    ctx.beginPath()
    const cx = rand() * W, cy = rand() * H, r = 40 + rand() * 100
    const points = 5 + Math.floor(rand() * 4)
    for (let p = 0; p < points; p++) {
      const angle = (p / points) * Math.PI * 2
      const pr = r * (0.6 + rand() * 0.8)
      const x = cx + Math.cos(angle) * pr, y = cy + Math.sin(angle) * pr
      p === 0 ? ctx.moveTo(x, y) : ctx.quadraticCurveTo(cx + rand() * 40 - 20, cy + rand() * 40 - 20, x, y)
    }
    ctx.closePath(); ctx.fill(); ctx.restore()
  }

  for (let i = 0; i < 6 + Math.floor(rand() * 6); i++) {
    ctx.save()
    ctx.globalAlpha = 0.15 + rand() * 0.4
    ctx.strokeStyle = palette[Math.floor(rand() * palette.length)]
    ctx.lineWidth = 1 + rand() * 4; ctx.lineCap = "round"
    ctx.beginPath()
    let x = rand() * W, y = rand() * H
    ctx.moveTo(x, y)
    for (let j = 0; j < 3 + Math.floor(rand() * 5); j++) {
      x += (rand() - 0.5) * 160; y += (rand() - 0.5) * 160
      ctx.quadraticCurveTo(x + (rand() - 0.5) * 80, y + (rand() - 0.5) * 80, x, y)
    }
    ctx.stroke(); ctx.restore()
  }

  for (let i = 0; i < 15 + Math.floor(rand() * 25); i++) {
    ctx.save()
    ctx.globalAlpha = 0.12 + rand() * 0.3
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)]
    ctx.beginPath()
    ctx.arc(rand() * W, rand() * H, 1.5 + rand() * 6, 0, Math.PI * 2)
    ctx.fill(); ctx.restore()
  }

  ctx.save(); ctx.globalAlpha = 0.04; ctx.strokeStyle = "#0E0C0A"; ctx.lineWidth = 0.5
  for (let i = 0; i < W + H; i += 8) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i - H, H); ctx.stroke() }
  ctx.restore()
}
