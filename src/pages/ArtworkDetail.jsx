import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { MapPin, ArrowLeft, Loader2, Share2, Mail } from "lucide-react"
import paintAbstract from "../utils/paintAbstract"
import toast from "react-hot-toast"

/* ------------------------------------------------------------------ */
/*  Public artwork detail page                                         */
/* ------------------------------------------------------------------ */
export default function ArtworkDetail() {
  const { id } = useParams()
  const [artwork, setArtwork] = useState(null)
  const [artist, setArtist] = useState(null)
  const [otherWorks, setOtherWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    async function fetchArtwork() {
      setLoading(true)
      try {
        const { data: art, error: artErr } = await supabase
          .from("artworks")
          .select("*")
          .eq("id", id)
          .single()

        if (artErr || !art) {
          setError("Artwork not found")
          return
        }
        setArtwork(art)

        // Fetch artist profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, location, website, avatar_url, initials, bio")
          .eq("id", art.user_id)
          .single()

        if (profile) setArtist(profile)

        // Fetch other works by same artist (excluding current)
        const { data: others } = await supabase
          .from("artworks")
          .select("id, title, medium, price, status, image_url, seed")
          .eq("user_id", art.user_id)
          .neq("id", id)
          .order("created_at", { ascending: false })
          .limit(4)

        if (others) setOtherWorks(others)
      } catch (err) {
        console.error("Error fetching artwork:", err)
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchArtwork()
  }, [id])

  // Paint canvas fallback
  useEffect(() => {
    if (artwork && !artwork.image_url && canvasRef.current) {
      canvasRef.current.width = 640
      canvasRef.current.height = 640
      paintAbstract(canvasRef.current, artwork.seed || artwork.id?.charCodeAt(0) || 1)
    }
  }, [artwork])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied!")
  }

  const handleInquire = () => {
    if (artist?.name) {
      const subject = encodeURIComponent(`Inquiry about "${artwork.title}"`)
      const body = encodeURIComponent(`Hi ${artist.name},\n\nI'm interested in your artwork "${artwork.title}". Could you share more details?\n\nThank you`)
      window.open(`mailto:?subject=${subject}&body=${body}`, "_self")
    }
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
        <div className="text-center">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading artwork...</p>
        </div>
      </div>
    )
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold mb-3" style={{ color: "#0E0C0A" }}>Artwork Not Found</h1>
          <p className="text-sm mb-6" style={{ color: "#A89F94" }}>This artwork may have been removed or doesn't exist.</p>
          <Link to="/artists" className="btn-copper inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Browse Artists
          </Link>
        </div>
      </div>
    )
  }

  const year = artwork.created_at
    ? new Date(artwork.created_at).getFullYear()
    : new Date().getFullYear()

  return (
    <div style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      {/* Minimal nav */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E8E2DA" }}>
        <Link to="/artists" className="flex items-center gap-2 text-sm font-medium" style={{ color: "#A89F94" }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <Link to="/" className="font-serif text-lg font-bold" style={{ color: "#0E0C0A" }}>ArtistOS</Link>
        <button onClick={handleShare} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg"
          style={{ color: "#A89F94", background: "#F2EDE6" }}>
          <Share2 size={14} /> Share
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Artwork image */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E8E2DA", background: "white" }}>
            {artwork.image_url ? (
              <img src={artwork.image_url} alt={artwork.title} className="w-full object-contain" style={{ maxHeight: 600 }} />
            ) : (
              <canvas ref={canvasRef} className="w-full" style={{ display: "block", maxHeight: 600, objectFit: "contain" }} />
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Artist link */}
            {artist && (
              <Link to={`/artist/${artist.id}`}
                className="inline-flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                style={{ background: "white", border: "1px solid #E8E2DA" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #B5651D, #D4854A)", color: "white" }}>
                  {artist.initials || artist.name?.charAt(0) || "A"}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{artist.name}</div>
                  {artist.location && (
                    <div className="text-xs flex items-center gap-1" style={{ color: "#A89F94" }}>
                      <MapPin size={10} /> {artist.location}
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* Title */}
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: "#0E0C0A" }}>{artwork.title}</h1>
              <p className="text-sm" style={{ color: "#A89F94" }}>
                {artwork.medium}{artwork.dimensions ? ` \u00B7 ${artwork.dimensions}` : ""}{` \u00B7 ${year}`}
              </p>
            </div>

            {/* Status + Price */}
            <div className="flex items-center gap-4">
              <span className={`badge ${artwork.status === "Available" ? "badge-forest" : artwork.status === "Sold" ? "badge-rose" : "badge-gold"}`}>
                {artwork.status}
              </span>
              {artwork.price && artwork.status === "Available" && (
                <span className="font-serif text-2xl font-bold" style={{ color: "#B5651D" }}>
                  ${artwork.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {artwork.description && (
              <div className="rounded-xl p-4" style={{ background: "white", border: "1px solid #E8E2DA" }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#A89F94" }}>About this work</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{artwork.description}</p>
              </div>
            )}

            {/* Details grid */}
            <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #E8E2DA" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider px-4 pt-4 mb-3" style={{ color: "#A89F94" }}>Details</h3>
              {[
                { label: "Medium", value: artwork.medium },
                { label: "Dimensions", value: artwork.dimensions },
                { label: "Year", value: year },
                { label: "Status", value: artwork.status },
                { label: "Tag", value: artwork.tag },
              ].filter(d => d.value).map((d, i) => (
                <div key={d.label} className="flex justify-between px-4 py-2.5 text-sm"
                  style={{ borderBottom: i < 4 ? "1px solid #F2EDE6" : "none" }}>
                  <span style={{ color: "#A89F94" }}>{d.label}</span>
                  <span className="font-medium" style={{ color: "#0E0C0A" }}>{d.value}</span>
                </div>
              ))}
            </div>

            {/* Inquire button */}
            {artwork.status === "Available" && (
              <button onClick={handleInquire}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #B5651D, #D4854A)" }}>
                <Mail size={18} /> Inquire About This Work
              </button>
            )}
          </div>
        </div>

        {/* Other works by this artist */}
        {otherWorks.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold" style={{ color: "#0E0C0A" }}>
                More by {artist?.name || "this artist"}
              </h2>
              {artist && (
                <Link to={`/artist/${artist.id}`} className="text-sm font-medium" style={{ color: "#B5651D" }}>
                  View all works →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {otherWorks.map(w => (
                <OtherWorkCard key={w.id} artwork={w} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs" style={{ color: "#C5BDB3", borderTop: "1px solid #E8E2DA" }}>
        Powered by <Link to="/" className="font-medium" style={{ color: "#B5651D" }}>ArtistOS</Link>
      </footer>
    </div>
  )
}

/* ---- Small card for "More by artist" section ---- */
function OtherWorkCard({ artwork }) {
  const canvasRef = useRef(null)
  const hasImage = !!artwork.image_url

  useEffect(() => {
    if (!hasImage && canvasRef.current) {
      canvasRef.current.width = 200
      canvasRef.current.height = 200
      paintAbstract(canvasRef.current, artwork.seed || artwork.id?.charCodeAt(0) || 1)
    }
  }, [artwork, hasImage])

  return (
    <Link to={`/artwork/${artwork.id}`}
      className="rounded-xl overflow-hidden group transition-shadow hover:shadow-lg"
      style={{ border: "1px solid #E8E2DA", background: "white" }}>
      <div className="relative" style={{ aspectRatio: "1" }}>
        {hasImage ? (
          <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover block" />
        ) : (
          <canvas ref={canvasRef} className="w-full h-full object-cover block" style={{ display: "block" }} />
        )}
      </div>
      <div className="p-3">
        <h4 className="text-xs font-semibold truncate" style={{ color: "#0E0C0A" }}>{artwork.title}</h4>
        <p className="text-[11px] mt-0.5" style={{ color: "#A89F94" }}>{artwork.medium}</p>
        {artwork.price && artwork.status === "Available" && (
          <p className="text-xs font-semibold mt-1" style={{ color: "#B5651D" }}>${artwork.price.toLocaleString()}</p>
        )}
      </div>
    </Link>
  )
}
