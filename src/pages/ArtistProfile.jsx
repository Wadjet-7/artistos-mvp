import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { MapPin, Globe, Palette, Loader2, ArrowRight, Image, ScrollText, Share2 } from "lucide-react"
import paintAbstract from "../utils/paintAbstract"
import CommissionRequestForm from "../components/CommissionRequestForm"

/* ------------------------------------------------------------------ */
/*  Artwork card — procedural canvas or real image                     */
/* ------------------------------------------------------------------ */
function ArtworkCard({ artwork }) {
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
    <Link to={`/artwork/${artwork.id}`} className="group rounded-xl overflow-hidden block transition-shadow hover:shadow-lg" style={{ border: "1px solid #E8E2DA", background: "white" }}>
      <div className="relative" style={{ aspectRatio: "1" }}>
        {hasImage ? (
          <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover block" />
        ) : (
          <canvas ref={canvasRef} className="w-full h-full object-cover block" style={{ display: "block" }} />
        )}
        {artwork.status !== "Available" && (
          <div className="absolute top-3 left-3">
            <span className={artwork.status === "Sold" ? "badge badge-rose" : "badge badge-gold"}>
              {artwork.status}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1" style={{ color: "#0E0C0A" }}>{artwork.title}</h3>
        <p className="text-xs mb-1" style={{ color: "#A89F94" }}>{artwork.medium}{artwork.dimensions ? ` \u00B7 ${artwork.dimensions}` : ""}</p>
        {artwork.description && (
          <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: "#6B6560" }}>{artwork.description}</p>
        )}
        {artwork.price && artwork.status === "Available" && (
          <p className="font-serif text-lg font-semibold" style={{ color: "#B5651D" }}>
            ${artwork.price.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/*  Main public profile page                                           */
/* ------------------------------------------------------------------ */
export default function ArtistProfile() {
  const { userId } = useParams()
  const [artist, setArtist] = useState(null)
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCommissionForm, setShowCommissionForm] = useState(false)

  useEffect(() => {
    async function fetchArtist() {
      setLoading(true)
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, bio, website, medium, style, location, avatar_url, initials")
          .eq("id", userId)
          .single()

        if (profileError || !profile) {
          setError("Artist not found")
          return
        }
        setArtist(profile)

        // Dynamic SEO: update page title and meta description
        document.title = `${profile.name} — Artist Portfolio | ArtistOS`
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) {
          metaDesc.setAttribute("content", `View ${profile.name}'s art portfolio on ArtistOS. ${profile.medium || "Mixed media"} artist${profile.location ? ` based in ${profile.location}` : ""}. ${profile.bio?.slice(0, 100) || "Browse available works and request commissions."}`)
        }

        const { data: works } = await supabase
          .from("artworks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        setArtworks(works || [])
      } catch {
        setError("Failed to load artist profile")
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchArtist()
  }, [userId])

  const availableWorks = artworks.filter(a => a.status === "Available")
  const soldCount = artworks.filter(a => a.status === "Sold").length

  /* Loading state */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading artist profile...</p>
        </div>
      </div>
    )
  }

  /* Error state */
  if (error || !artist) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#F5E2DC" }}>
            <Image size={28} style={{ color: "#C4705A" }} />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#0E0C0A" }}>Artist Not Found</h2>
          <p className="text-sm mb-6" style={{ color: "#A89F94" }}>This profile doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary">Back to ArtistOS</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAF8F5" }}>

      {/* ── Minimal Nav ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-4" style={{ background: "#FAF8F5", borderBottom: "1px solid #E8E2DA" }}>
        <Link to="/" className="font-serif text-xl font-bold tracking-tight" style={{ color: "#0E0C0A" }}>
          ArtistOS
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium" style={{ color: "#A89F94" }}>Sign in</Link>
          <Link to="/signup" className="btn-copper text-sm">Get started free</Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden" style={{ background: "#0E0C0A" }}>
        {/* Decorative gradient */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, #B5651D33 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, #C9A84C22 0%, transparent 50%)" }} />

        <div className="relative max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24 text-center">
          {/* Avatar */}
          {artist.avatar_url ? (
            <img src={artist.avatar_url} alt={artist.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-6" style={{ border: "3px solid #B5651D" }} />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-semibold" style={{ background: "linear-gradient(135deg, #B5651D, #C9A84C)", color: "white", border: "3px solid rgba(255,255,255,0.15)" }}>
              {artist.initials || artist.name?.charAt(0) || "?"}
            </div>
          )}

          {/* Name */}
          <h1 className="font-serif font-semibold mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#FAF8F5", lineHeight: 1.1 }}>
            {artist.name}
          </h1>

          {/* Bio */}
          {artist.bio && (
            <p className="text-sm md:text-base leading-relaxed mb-6 mx-auto" style={{ color: "#A89F94", maxWidth: 560 }}>
              {artist.bio}
            </p>
          )}

          {/* Meta badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {artist.location && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "#A89F94" }}>
                <MapPin size={13} /> {artist.location}
              </span>
            )}
            {artist.medium && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "rgba(181,101,29,0.15)", color: "#D4854A" }}>
                <Palette size={13} /> {artist.medium}
              </span>
            )}
            {artist.style && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "#A89F94" }}>
                {artist.style}
              </span>
            )}
            {artist.website && (
              <a href={artist.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors" style={{ background: "rgba(255,255,255,0.08)", color: "#A89F94" }}>
                <Globe size={13} /> Portfolio
              </a>
            )}
          </div>

          {/* CTA Button */}
          <button onClick={() => setShowCommissionForm(true)} className="btn-copper text-base px-8 py-3">
            Request Commission <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex flex-wrap items-center gap-4" style={{ borderBottom: "1px solid #E8E2DA" }}>
        <span className="text-sm font-medium" style={{ color: "#0E0C0A" }}>
          {availableWorks.length} works available
        </span>
        <span className="text-xs" style={{ color: "#E8E2DA" }}>&bull;</span>
        <span className="text-sm" style={{ color: "#A89F94" }}>
          {artworks.length} total pieces
        </span>
        {soldCount > 0 && (
          <>
            <span className="text-xs" style={{ color: "#E8E2DA" }}>&bull;</span>
            <span className="text-sm" style={{ color: "#A89F94" }}>
              {soldCount} sold
            </span>
          </>
        )}
        <Link to={`/artist/${userId}/cv`} className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
          style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
          <ScrollText size={12} /> View CV
        </Link>
        <span className="ml-auto badge badge-forest">Accepting Commissions</span>
      </div>

      {/* ── Portfolio Grid ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-12">
        <h2 className="font-serif text-2xl font-semibold mb-8" style={{ color: "#0E0C0A" }}>
          Available Works
        </h2>

        {availableWorks.length === 0 ? (
          <div className="text-center py-16">
            <Image size={40} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
            <p className="text-sm" style={{ color: "#A89F94" }}>No available artworks at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableWorks.map(artwork => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}

        {/* Show sold/reserved works below */}
        {artworks.filter(a => a.status !== "Available").length > 0 && (
          <>
            <h3 className="font-serif text-xl font-semibold mt-16 mb-6" style={{ color: "#A89F94" }}>
              Past Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.filter(a => a.status !== "Available").map(artwork => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Commission CTA Banner ── */}
      <section className="relative overflow-hidden" style={{ background: "#0E0C0A" }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, #B5651D33 0%, transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <h2 className="font-serif font-semibold mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "#FAF8F5" }}>
            Interested in a custom piece?
          </h2>
          <p className="text-sm md:text-base mb-8" style={{ color: "#A89F94", maxWidth: 480, margin: "0 auto 2rem" }}>
            Share your vision and {artist.name?.split(" ")[0] || "this artist"} will craft something unique for your space. No commitment required.
          </p>
          <button onClick={() => setShowCommissionForm(true)} className="btn-copper text-base px-8 py-3">
            Request Commission <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 text-center" style={{ background: "#0E0C0A", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/" className="font-serif text-lg font-bold tracking-tight" style={{ color: "#B5651D" }}>
          ArtistOS
        </Link>
        <p className="text-xs mt-2" style={{ color: "#A89F94" }}>2026 All rights reserved.</p>
      </footer>

      {/* ── Commission Request Modal ── */}
      <CommissionRequestForm
        open={showCommissionForm}
        onClose={() => setShowCommissionForm(false)}
        artistId={artist.id}
        artistName={artist.name}
      />
    </div>
  )
}
