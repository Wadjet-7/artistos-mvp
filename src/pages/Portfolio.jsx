import { useState, useEffect, useRef, useCallback } from "react"
import { Plus, Trash2, Upload, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Modal from "../components/Modal"
import ConfirmModal from "../components/ConfirmModal"

/* ------------------------------------------------------------------ */
/*  Procedural abstract-art painter — fallback for artworks w/o image */
/* ------------------------------------------------------------------ */
function paintAbstract(canvas, seed) {
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

/* ------------------------------------------------------------------ */
/*  Artwork card — shows real image or canvas fallback                */
/* ------------------------------------------------------------------ */
function ArtworkCard({ artwork, onDelete }) {
  const canvasRef = useRef(null)
  const hasImage = !!artwork.image_url

  useEffect(() => {
    if (!hasImage && canvasRef.current && artwork.seed) {
      const cvs = canvasRef.current
      cvs.width = 320; cvs.height = 320
      paintAbstract(cvs, artwork.seed)
    }
  }, [artwork.seed, hasImage])

  return (
    <div className="group relative rounded-xl overflow-hidden cursor-pointer" style={{ aspectRatio: "1", border: "1px solid #E8E2DA" }}>
      {hasImage ? (
        <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover block" />
      ) : (
        <canvas ref={canvasRef} className="w-full h-full object-cover block" style={{ display: "block" }} />
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(14,12,10,0.82) 0%, rgba(14,12,10,0.30) 50%, transparent 100%)" }}
      >
        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(artwork) }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-red-500/80 transition-colors"
          >
            <Trash2 size={14} className="text-white" />
          </button>
        )}
        <div className="flex gap-1.5 mb-2">
          <span className="badge badge-copper">{artwork.tag}</span>
          <span className={"badge " + (artwork.status === "Available" ? "badge-forest" : artwork.status === "Sold" ? "badge-rose" : "badge-gold")}>{artwork.status}</span>
        </div>
        <p className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17 }}>{artwork.title}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-white/80 text-xs">${(artwork.price || 0).toLocaleString()}</span>
          <span className="text-white/60 text-xs">{artwork.dimensions}</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Portfolio page                                               */
/* ------------------------------------------------------------------ */
const mediumFilters = [
  { label: "All", count: null },
  { label: "Painting", match: ["Oil on Canvas", "Acrylic"] },
  { label: "Mixed Media", match: ["Mixed Media"] },
  { label: "Photography", match: ["Photography"] },
  { label: "Sculpture", match: ["Sculpture"] },
]

// Derive tag from medium
const tagFromMedium = (medium) => {
  const map = { "Oil on Canvas": "Oil", "Acrylic": "Acrylic", "Mixed Media": "Mixed Media", "Photography": "Photography", "Sculpture": "Sculpture" }
  return map[medium] || medium
}

export default function Portfolio() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState("All")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [artworkList, setArtworkList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [form, setForm] = useState({ title: "", medium: "Oil on Canvas", price: "", dimensions: "", status: "Available" })
  const [confirmTarget, setConfirmTarget] = useState(null)
  const fileInputRef = useRef(null)

  /* ---- fetch artworks from Supabase ---- */
  const fetchArtworks = useCallback(async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) setArtworkList(data)
    setLoadingData(false)
  }, [user?.id])

  useEffect(() => {
    fetchArtworks()
  }, [fetchArtworks])

  /* ---- derive counts ---- */
  const countFor = useCallback((f) => {
    if (f.label === "All") return artworkList.length
    return artworkList.filter(a => f.match.includes(a.medium)).length
  }, [artworkList])

  /* ---- filtered artworks ---- */
  const filtered = artworkList.filter(a => {
    const f = mediumFilters.find(m => m.label === activeFilter)
    const matchMedium = activeFilter === "All" || (f && f.match && f.match.includes(a.medium))
    const matchAvailable = !availableOnly || a.status === "Available"
    return matchMedium && matchAvailable
  })

  /* ---- handle image selection ---- */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  /* ---- submit new artwork ---- */
  const handleAddArtwork = async () => {
    if (!form.title.trim()) return
    setSubmitting(true)

    try {
      let imageUrl = null

      // Upload image if selected
      if (imageFile && user?.id) {
        const ext = imageFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("artworks")
          .upload(fileName, imageFile, { contentType: imageFile.type })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from("artworks")
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
      }

      // Insert artwork record
      const { error: insertError } = await supabase
        .from("artworks")
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          medium: form.medium,
          tag: tagFromMedium(form.medium),
          price: parseInt(form.price.replace(/,/g, "")) || 0,
          status: form.status,
          dimensions: form.dimensions.trim(),
          image_url: imageUrl,
          seed: Math.floor(Math.random() * 1000), // fallback seed if no image
        })

      if (insertError) throw insertError

      // Reset form and close modal
      setForm({ title: "", medium: "Oil on Canvas", price: "", dimensions: "", status: "Available" })
      setImageFile(null)
      setImagePreview(null)
      setModalOpen(false)

      // Refresh the list
      await fetchArtworks()
      toast.success("Artwork added to portfolio!")
    } catch (err) {
      console.error("Failed to add artwork:", err)
      toast.error("Failed to add artwork: " + (err.message || "Unknown error"))
    } finally {
      setSubmitting(false)
    }
  }

  /* ---- delete artwork ---- */
  const handleDelete = (artwork) => setConfirmTarget(artwork)

  const handleConfirmDelete = async () => {
    const artwork = confirmTarget
    setConfirmTarget(null)
    try {
      // Delete image from storage if it exists
      if (artwork.image_url && user?.id) {
        const path = artwork.image_url.split("/artworks/").pop()
        if (path) {
          await supabase.storage.from("artworks").remove([path])
        }
      }

      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", artwork.id)

      if (error) throw error
      setArtworkList(prev => prev.filter(a => a.id !== artwork.id))
      toast.success("Artwork deleted")
    } catch (err) {
      console.error("Failed to delete:", err)
      toast.error("Failed to delete artwork: " + (err.message || "Unknown error"))
    }
  }

  /* ---- close modal and reset ---- */
  const closeModal = () => {
    setModalOpen(false)
    setImageFile(null)
    setImagePreview(null)
    setForm({ title: "", medium: "Oil on Canvas", price: "", dimensions: "", status: "Available" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "#0E0C0A" }}>Portfolio</h1>
          <p style={{ fontSize: 13, color: "#A89F94", marginTop: 2 }}>Manage your artworks and inventory</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Artwork
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {mediumFilters.map(f => (
          <button
            key={f.label}
            className={"filter-pill" + (activeFilter === f.label ? " active" : "")}
            onClick={() => setActiveFilter(f.label)}
          >
            {f.label} ({countFor(f)})
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: "#E8E2DA", margin: "0 4px" }} />
        <button
          className={"filter-pill" + (availableOnly ? " active" : "")}
          onClick={() => setAvailableOnly(v => !v)}
        >
          Available
        </button>
      </div>

      {/* Loading state */}
      {loadingData && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: "#B5651D" }} />
            <p className="text-sm" style={{ color: "#A89F94" }}>Loading artworks...</p>
          </div>
        </div>
      )}

      {/* Artwork grid */}
      {!loadingData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} onDelete={handleDelete} />
          ))}

          {/* Upload placeholder */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex flex-col items-center justify-center rounded-xl transition-colors"
            style={{ aspectRatio: "1", border: "2px dashed #E8E2DA", background: "transparent", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#B5651D"; e.currentTarget.style.background = "#FAF8F5" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8E2DA"; e.currentTarget.style.background = "transparent" }}
          >
            <div className="flex items-center justify-center rounded-full mb-3" style={{ width: 48, height: 48, background: "#F2EDE6" }}>
              <Plus size={22} style={{ color: "#A89F94" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#A89F94" }}>Upload Artwork</span>
            <span style={{ fontSize: 12, color: "#C5BDB3", marginTop: 2 }}>JPG, PNG or TIFF</span>
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loadingData && filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🖼</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0E0C0A" }}>
            {artworkList.length === 0 ? "No artworks yet" : "No artworks match your filters"}
          </p>
          <p style={{ fontSize: 13, color: "#A89F94", marginTop: 4 }}>
            {artworkList.length === 0
              ? "Upload your first artwork to get started"
              : "Try adjusting your filters or add a new artwork"}
          </p>
          {artworkList.length === 0 && (
            <button className="btn-copper mt-4" onClick={() => setModalOpen(true)}>
              <Upload size={15} /> Upload First Artwork
            </button>
          )}
        </div>
      )}

      {/* Add artwork modal */}
      <Modal open={modalOpen} onClose={closeModal} title="Add Artwork">
        <div className="space-y-4">
          <div>
            <label className="form-label">Artwork Title</label>
            <input
              className="form-input"
              placeholder="e.g. Solstice No. 4"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Medium</label>
            <select
              className="form-select"
              value={form.medium}
              onChange={e => setForm({ ...form, medium: e.target.value })}
            >
              <option>Oil on Canvas</option>
              <option>Acrylic</option>
              <option>Mixed Media</option>
              <option>Photography</option>
              <option>Sculpture</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Price (USD)</label>
              <input
                className="form-input"
                placeholder="2,400"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Dimensions</label>
              <input
                className="form-input"
                placeholder='36x48"'
                value={form.dimensions}
                onChange={e => setForm({ ...form, dimensions: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option>Available</option>
              <option>Sold</option>
              <option>Reserved</option>
            </select>
          </div>

          {/* Upload zone */}
          <div>
            <label className="form-label">Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/tiff,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden" style={{ border: "2px solid #B5651D" }}>
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                  <Trash2 size={13} />
                </button>
                <div className="px-3 py-2 text-xs" style={{ background: "#F5E6D8", color: "#B5651D" }}>
                  {imageFile?.name} ({(imageFile?.size / 1024).toFixed(0)} KB)
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors"
                style={{ border: "2px dashed #E8E2DA", padding: "24px 16px" }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#B5651D"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E8E2DA"}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#B5651D" }}
                onDragLeave={e => { e.currentTarget.style.borderColor = "#E8E2DA" }}
                onDrop={handleDrop}
              >
                <Upload size={20} style={{ color: "#A89F94", marginBottom: 6 }} />
                <span style={{ fontSize: 13, color: "#A89F94" }}>Click to upload or drag & drop</span>
                <span style={{ fontSize: 11, color: "#C5BDB3", marginTop: 2 }}>JPG, PNG, TIFF or WebP up to 25MB</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={handleAddArtwork}
              disabled={submitting || !form.title.trim()}
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Uploading...</>
              ) : (
                <>Add Artwork</>
              )}
            </button>
            <button className="btn-secondary flex-1" onClick={closeModal} disabled={submitting}>Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Artwork?"
        message={`Are you sure you want to delete "${confirmTarget?.title}"? This cannot be undone.`}
      />
    </div>
  )
}
