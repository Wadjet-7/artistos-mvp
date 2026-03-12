import { useState } from "react"
import Modal from "./Modal"
import { Download, BookOpen } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Portfolio PDF Catalog Generator                                    */
/* ------------------------------------------------------------------ */
export default function CatalogModal({ open, onClose, artworks, artistName, artistLocation, artistWebsite }) {
  const [selectedIds, setSelectedIds] = useState(new Set(artworks.map(a => a.id)))
  const [title, setTitle] = useState("Portfolio Catalog")
  const [includePrice, setIncludePrice] = useState(true)

  const toggleAll = () => {
    if (selectedIds.size === artworks.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(artworks.map(a => a.id)))
  }

  const toggle = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }

  const handleExport = () => {
    const selected = artworks.filter(a => selectedIds.has(a.id))
    if (selected.length === 0) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const artworkCards = selected.map(a => `
      <div class="artwork-card">
        <div class="artwork-image" style="background: linear-gradient(135deg, hsl(${(a.seed || a.id?.charCodeAt(0) || 0) * 37 % 360}, 35%, 60%), hsl(${((a.seed || a.id?.charCodeAt(0) || 0) * 37 + 60) % 360}, 30%, 50%));">
          ${a.image_url ? `<img src="${a.image_url}" alt="${a.title}" />` : ""}
        </div>
        <div class="artwork-info">
          <div class="artwork-title">${a.title}</div>
          <div class="artwork-meta">${a.medium || ""}${a.dimensions ? ` · ${a.dimensions}` : ""}</div>
          ${a.status === "Sold" ? '<div class="artwork-sold">Sold</div>' : ""}
          ${includePrice && a.price && a.status === "Available" ? `<div class="artwork-price">$${a.price.toLocaleString()}</div>` : ""}
        </div>
      </div>
    `).join("")

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title} — ${artistName || "Artist"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; color: #333; }

    /* Cover page */
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: #0E0C0A;
      color: #FAF8F5;
      page-break-after: always;
    }
    .cover h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .cover .subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 400;
      color: #B5651D;
      margin-bottom: 24px;
      font-style: italic;
    }
    .cover .meta {
      font-size: 12px;
      color: #A89F94;
      letter-spacing: 1px;
    }
    .cover .divider {
      width: 60px;
      height: 2px;
      background: #B5651D;
      margin: 20px auto;
    }
    .cover .count {
      font-size: 13px;
      color: #A89F94;
      margin-top: 8px;
    }

    /* Artwork grid */
    .catalog-body {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 32px;
    }
    .catalog-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #B5651D;
    }
    .catalog-header h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #0E0C0A;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    .artwork-card {
      break-inside: avoid;
    }
    .artwork-image {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .artwork-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .artwork-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: #0E0C0A;
      margin-bottom: 4px;
    }
    .artwork-meta {
      font-size: 12px;
      color: #A89F94;
      margin-bottom: 4px;
    }
    .artwork-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      font-weight: 600;
      color: #B5651D;
    }
    .artwork-sold {
      font-size: 11px;
      font-weight: 600;
      color: #C4705A;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #E8E2DA;
      font-size: 11px;
      color: #A89F94;
    }
    @media print {
      .cover { height: 100vh; }
      .artwork-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${artistName || "Artist"}</h1>
    <div class="subtitle">${title}</div>
    <div class="divider"></div>
    <div class="meta">
      ${[artistLocation, artistWebsite?.replace(/^https?:\/\//, "")].filter(Boolean).join(" | ")}
    </div>
    <div class="count">${selected.length} works · ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
  </div>

  <div class="catalog-body">
    <div class="catalog-header">
      <h2>Selected Works</h2>
    </div>
    <div class="grid">
      ${artworkCards}
    </div>
    <div class="footer">Generated with ArtistOS · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  </div>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 400)
  }

  return (
    <Modal open={open} onClose={onClose} title="Export Portfolio Catalog" wide>
      <div className="space-y-4">
        <div className="rounded-xl p-4 text-center" style={{ background: "#0E0C0A" }}>
          <BookOpen size={28} className="mx-auto mb-2" style={{ color: "#B5651D" }} />
          <h3 className="font-serif text-lg font-semibold" style={{ color: "#FAF8F5" }}>
            {selectedIds.size} of {artworks.length} artworks selected
          </h3>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "#0E0C0A" }}>Catalog Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ borderColor: "#E8E2DA" }} />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={includePrice} onChange={e => setIncludePrice(e.target.checked)} />
            Include prices
          </label>
          <button onClick={toggleAll} className="text-xs font-medium px-3 py-1 rounded-lg ml-auto"
            style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
            {selectedIds.size === artworks.length ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="max-h-[200px] overflow-y-auto space-y-1 p-2 rounded-lg" style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
          {artworks.map(a => (
            <label key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white text-sm">
              <input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggle(a.id)} />
              <span className="flex-1 truncate" style={{ color: "#0E0C0A" }}>{a.title}</span>
              <span className="text-xs" style={{ color: "#A89F94" }}>{a.medium}</span>
              {a.price && <span className="text-xs font-medium" style={{ color: "#B5651D" }}>${a.price.toLocaleString()}</span>}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>Cancel</button>
          <button onClick={handleExport} disabled={selectedIds.size === 0}
            className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 20px" }}>
            <Download size={15} /> Export PDF Catalog
          </button>
        </div>
      </div>
    </Modal>
  )
}
