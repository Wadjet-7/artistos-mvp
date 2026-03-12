import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Loader2, Image, ArrowRight, MapPin, Palette } from "lucide-react"
import paintAbstract from "../utils/paintAbstract"

/* ------------------------------------------------------------------ */
/*  Artwork card — immersive gallery style                             */
/* ------------------------------------------------------------------ */
function GalleryCard({ artwork }) {
  const canvasRef = useRef(null)
  const hasImage = !!artwork.image_url

  useEffect(() => {
    if (!hasImage && canvasRef.current) {
      const cvs = canvasRef.current
      cvs.width = 480; cvs.height = 480
      paintAbstract(cvs, artwork.seed || artwork.id?.charCodeAt(0) || 1)
    }
  }, [artwork, hasImage])

  return (
    <Link to={`/artwork/${artwork.id}`} className="group block">
      <div className="rounded-xl overflow-hidden mb-4" style={{ aspectRatio: "1", background: "#1A1816" }}>
        {hasImage ? (
          <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <canvas ref={canvasRef} className="w-full h-full object-cover block" />
        )}
      </div>
      <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: "#FAF8F5" }}>{artwork.title}</h3>
      <p className="text-sm mb-1" style={{ color: "#A89F94" }}>
        {artwork.medium}{artwork.dimensions ? ` · ${artwork.dimensions}` : ""}
      </p>
      {artwork.price && artwork.status === "Available" && (
        <p className="font-serif text-lg font-semibold" style={{ color: "#D4854A" }}>
          ${artwork.price.toLocaleString()}
        </p>
      )}
      {artwork.status === "Sold" && (
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1" style={{ background: "rgba(196,112,90,0.15)", color: "#C4705A" }}>Sold</span>
      )}
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/*  Public Viewing Room page                                           */
/* ------------------------------------------------------------------ */
export default function ViewingRoom() {
  const { slug } = useParams()
  const [room, setRoom] = useState(null)
  const [artist, setArtist] = useState(null)
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRoom() {
      setLoading(true)
      try {
        // Fetch the viewing room by slug
        const { data: roomData, error: roomError } = await supabase
          .from("viewing_rooms")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single()

        if (roomError || !roomData) {
          setError("Viewing room not found")
          return
        }
        setRoom(roomData)

        // Fetch artist profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, bio, location, medium, style, website, initials, avatar_url")
          .eq("id", roomData.user_id)
          .single()

        setArtist(profile)

        // Fetch the artworks in this room
        if (roomData.artwork_ids && roomData.artwork_ids.length > 0) {
          const { data: artData } = await supabase
            .from("artworks")
            .select("*")
            .in("id", roomData.artwork_ids)

          // Preserve the order from artwork_ids
          const ordered = roomData.artwork_ids
            .map(id => artData?.find(a => a.id === id))
            .filter(Boolean)

          setArtworks(ordered)
        }
      } catch {
        setError("Failed to load viewing room")
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchRoom()
  }, [slug])

  /* Loading */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0E0C0A" }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading viewing room...</p>
        </div>
      </div>
    )
  }

  /* Error */
  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0E0C0A" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(196,112,90,0.15)" }}>
            <Image size={28} style={{ color: "#C4705A" }} />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#FAF8F5" }}>Room Not Found</h2>
          <p className="text-sm mb-6" style={{ color: "#A89F94" }}>This viewing room doesn't exist, isn't published, or has been removed.</p>
          <Link to="/" className="btn-copper">Back to ArtistOS</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#0E0C0A" }}>

      {/* ── Minimal Nav ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-4" style={{ background: "#0E0C0A", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/" className="font-serif text-xl font-bold tracking-tight" style={{ color: "#B5651D" }}>
          ArtistOS
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium" style={{ color: "#A89F94" }}>Sign in</Link>
          <Link to="/signup" className="btn-copper text-sm">Get started free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, #B5651D33 0%, transparent 60%)" }} />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24 text-center">
          {/* Artist info */}
          {artist && (
            <Link to={`/artist/${artist.id}`} className="inline-flex items-center gap-3 mb-6 group">
              {artist.avatar_url ? (
                <img src={artist.avatar_url} alt={artist.name} className="w-10 h-10 rounded-full object-cover" style={{ border: "2px solid #B5651D" }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: "linear-gradient(135deg, #B5651D, #C9A84C)", color: "white" }}>
                  {artist.initials || artist.name?.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium group-hover:underline" style={{ color: "#A89F94" }}>
                {artist.name}
              </span>
            </Link>
          )}

          <h1 className="font-serif font-semibold mb-4" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", color: "#FAF8F5", lineHeight: 1.1 }}>
            {room.title}
          </h1>

          {room.description && (
            <p className="text-sm md:text-base leading-relaxed mx-auto" style={{ color: "#A89F94", maxWidth: 560 }}>
              {room.description}
            </p>
          )}

          {room.recipient_name && (
            <p className="text-xs mt-6 font-medium" style={{ color: "rgba(181,101,29,0.7)" }}>
              Curated for {room.recipient_name}
            </p>
          )}
        </div>
      </section>

      {/* ── Artwork count ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-sm font-medium" style={{ color: "#FAF8F5" }}>
          {artworks.length} {artworks.length === 1 ? "work" : "works"}
        </span>
      </div>

      {/* ── Gallery Grid ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {artworks.length === 0 ? (
          <div className="text-center py-16">
            <Image size={40} className="mx-auto mb-3" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-sm" style={{ color: "#A89F94" }}>No artworks in this viewing room.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map(artwork => (
              <GalleryCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}
      </section>

      {/* ── Interested CTA ── */}
      {artist && (
        <section className="relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, #B5651D33 0%, transparent 60%)" }} />
          <div className="relative max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
            <h2 className="font-serif font-semibold mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "#FAF8F5" }}>
              Interested in these works?
            </h2>
            <p className="text-sm md:text-base mb-8" style={{ color: "#A89F94", maxWidth: 480, margin: "0 auto 2rem" }}>
              Visit {artist.name?.split(" ")[0]}'s full profile to see more work and request a commission.
            </p>
            <Link to={`/artist/${artist.id}`} className="btn-copper text-base px-8 py-3 inline-flex items-center gap-2">
              View Full Profile <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="py-10 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/" className="font-serif text-lg font-bold tracking-tight" style={{ color: "#B5651D" }}>
          ArtistOS
        </Link>
        <p className="text-xs mt-2" style={{ color: "#A89F94" }}>2026 All rights reserved.</p>
      </footer>
    </div>
  )
}
