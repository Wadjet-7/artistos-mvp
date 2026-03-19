import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { Search, MapPin, Palette, Loader2, ArrowRight, Users } from "lucide-react"
import paintAbstract from "../utils/paintAbstract"

/* ------------------------------------------------------------------ */
/*  Seed generator — deterministic number from UUID string             */
/* ------------------------------------------------------------------ */
function seedFromId(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/* ------------------------------------------------------------------ */
/*  Banner canvas — procedural abstract art header for each card       */
/* ------------------------------------------------------------------ */
function ArtistBanner({ seed }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      const cvs = ref.current
      cvs.width = 400; cvs.height = 120
      paintAbstract(cvs, seed)
    }
  }, [seed])
  return <canvas ref={ref} className="w-full h-full object-cover block" />
}

/* ------------------------------------------------------------------ */
/*  Artist card                                                        */
/* ------------------------------------------------------------------ */
function ArtistCard({ artist, artworkStats }) {
  const seed = seedFromId(artist.id)
  const stats = artworkStats[artist.id] || { total: 0, available: 0 }
  const gradient = `linear-gradient(135deg, hsl(${seed % 360}, 45%, 35%), hsl(${(seed * 3) % 360}, 50%, 40%))`

  return (
    <Link
      to={`/artist/${artist.id}`}
      className="bg-white rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg block"
      style={{ border: "1px solid #E8E2DA" }}
    >
      {/* Banner */}
      <div className="h-[100px] relative overflow-hidden">
        <ArtistBanner seed={seed} />
      </div>

      {/* Avatar */}
      <div className="relative">
        <div
          className="absolute -top-6 left-4 w-[52px] h-[52px] rounded-full flex items-center justify-center font-serif text-xl font-semibold text-white"
          style={{ background: artist.avatar_url ? "transparent" : gradient, border: "3px solid white" }}
        >
          {artist.avatar_url ? (
            <img src={artist.avatar_url} alt={artist.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            artist.initials || artist.name?.charAt(0) || "?"
          )}
        </div>
      </div>

      {/* Body */}
      <div className="pt-8 px-4 pb-4">
        <h3 className="text-sm font-semibold mb-0.5" style={{ color: "#0E0C0A" }}>{artist.name}</h3>

        {(artist.medium || artist.style) && (
          <p className="text-xs mb-2" style={{ color: "#A89F94" }}>
            {[artist.medium, artist.style].filter(Boolean).join(" · ")}
          </p>
        )}

        {artist.bio && (
          <p className="text-xs mb-3 line-clamp-2" style={{ color: "#A89F94" }}>
            {artist.bio}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {artist.location && (
            <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "#A89F94" }}>
              <MapPin size={11} /> {artist.location}
            </span>
          )}
          {stats.available > 0 && (
            <span className="text-[11px]" style={{ color: "#A89F94" }}>
              <strong style={{ color: "#0E0C0A" }}>{stats.available}</strong> works available
            </span>
          )}
        </div>

        <span className="badge badge-forest" style={{ fontSize: "10px" }}>
          Accepting Commissions
        </span>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/*  Filter options                                                     */
/* ------------------------------------------------------------------ */
const MEDIUM_FILTERS = ["All", "Oil Painting", "Acrylic", "Mixed Media", "Photography", "Sculpture", "Digital"]

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function DiscoverArtists() {
  const [artists, setArtists] = useState([])
  const [artworkStats, setArtworkStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch all artists with a name
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, bio, medium, style, location, avatar_url, initials")
          .not("name", "is", null)
          .order("name")

        setArtists(profiles || [])

        // Fetch artworks to compute per-artist stats
        const { data: works } = await supabase
          .from("artworks")
          .select("user_id, status")

        if (works) {
          const stats = {}
          works.forEach(w => {
            if (!stats[w.user_id]) stats[w.user_id] = { total: 0, available: 0 }
            stats[w.user_id].total++
            if (w.status === "Available") stats[w.user_id].available++
          })
          setArtworkStats(stats)
        }
      } catch (err) {
        console.error("Failed to load artists:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter + search
  const filtered = artists.filter(a => {
    // Search by name, medium, style, location
    if (search) {
      const q = search.toLowerCase()
      const match = [a.name, a.medium, a.style, a.location]
        .filter(Boolean)
        .some(field => field.toLowerCase().includes(q))
      if (!match) return false
    }
    // Medium filter
    if (activeFilter !== "All") {
      if (!a.medium?.toLowerCase().includes(activeFilter.toLowerCase())) return false
    }
    return true
  })

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
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, #B5651D33 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, #C9A84C22 0%, transparent 50%)" }} />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(181,101,29,0.15)", color: "#D4854A" }}>
            <Users size={14} /> {artists.length} artists on platform
          </div>
          <h1 className="font-serif font-semibold mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#FAF8F5", lineHeight: 1.1 }}>
            Discover Artists
          </h1>
          <p className="text-sm md:text-base leading-relaxed mx-auto" style={{ color: "#A89F94", maxWidth: 560 }}>
            Browse our curated community of emerging and established artists. Find the perfect creator for your next commission.
          </p>
        </div>
      </section>

      {/* ── Search + Filters ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-8 pb-4">
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4" style={{ background: "white", border: "1px solid #E8E2DA" }}>
          <Search size={18} style={{ color: "#A89F94" }} />
          <input
            type="text"
            placeholder="Search by name, medium, style, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border-none outline-none text-sm bg-transparent"
            style={{ color: "#0E0C0A" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs font-medium px-2 py-1 rounded" style={{ color: "#A89F94" }}>
              Clear
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {MEDIUM_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`filter-pill ${activeFilter === f ? "active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Artists Grid ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
            <p className="text-sm" style={{ color: "#A89F94" }}>Loading artists...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users size={40} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
            <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: "#0E0C0A" }}>No artists found</h3>
            <p className="text-sm" style={{ color: "#A89F94" }}>
              {search || activeFilter !== "All"
                ? "Try adjusting your search or filters."
                : "Check back soon — new artists are joining every day."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: "#A89F94" }}>
              Showing <strong style={{ color: "#0E0C0A" }}>{filtered.length}</strong> artist{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(artist => (
                <ArtistCard key={artist.id} artist={artist} artworkStats={artworkStats} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Artist CTA Banner ── */}
      <section className="relative overflow-hidden" style={{ background: "#0E0C0A" }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, #B5651D33 0%, transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
          <h2 className="font-serif font-semibold mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "#FAF8F5" }}>
            Are you an artist?
          </h2>
          <p className="text-sm md:text-base mb-8" style={{ color: "#A89F94", maxWidth: 480, margin: "0 auto 2rem" }}>
            Join ArtistOS to showcase your portfolio, connect with collectors, and land commissions. Free to get started.
          </p>
          <Link to="/signup" className="btn-copper text-base px-8 py-3 inline-flex items-center gap-2">
            Join ArtistOS <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 text-center" style={{ background: "#0E0C0A", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/" className="font-serif text-lg font-bold tracking-tight" style={{ color: "#B5651D" }}>
          ArtistOS
        </Link>
        <p className="text-xs mt-2" style={{ color: "#A89F94" }}>&copy; 2025 ArtistOS. All rights reserved.</p>
      </footer>
    </div>
  )
}
