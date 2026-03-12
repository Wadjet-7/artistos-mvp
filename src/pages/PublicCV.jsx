import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { ArrowLeft, Loader2, MapPin, Globe, Download } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  CV section config                                                  */
/* ------------------------------------------------------------------ */
const SECTIONS = [
  { key: "solo_exhibitions", label: "Solo Exhibitions" },
  { key: "group_exhibitions", label: "Group Exhibitions" },
  { key: "education", label: "Education" },
  { key: "collections", label: "Collections" },
  { key: "awards", label: "Awards & Grants" },
  { key: "residencies", label: "Residencies" },
  { key: "publications", label: "Publications" },
]

/* ------------------------------------------------------------------ */
/*  Public artist CV page                                              */
/* ------------------------------------------------------------------ */
export default function PublicCV() {
  const { userId } = useParams()
  const [artist, setArtist] = useState(null)
  const [cv, setCv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCV() {
      setLoading(true)
      try {
        const [profileRes, cvRes] = await Promise.all([
          supabase.from("profiles").select("id, name, location, website, bio, avatar_url, initials").eq("id", userId).single(),
          supabase.from("artist_cv").select("*").eq("user_id", userId).single(),
        ])

        if (profileRes.error || !profileRes.data) {
          setError("Artist not found")
          return
        }
        setArtist(profileRes.data)

        if (cvRes.data) setCv(cvRes.data)
        else setError("No CV available for this artist")
      } catch (err) {
        console.error("Error fetching CV:", err)
        setError("Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetchCV()
  }, [userId])

  /* ---- Export PDF ---- */
  const handleExportPDF = () => {
    if (!cv || !artist) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const sectionHTML = SECTIONS.map(s => {
      const entries = cv[s.key] || []
      if (entries.length === 0) return ""
      const rows = entries.map(e =>
        `<div class="cv-entry">
          <span class="cv-year">${e.year || ""}</span>
          <span class="cv-detail">
            ${e.title ? `<strong>${e.title}</strong>` : ""}${e.venue ? ` \u2014 ${e.venue}` : ""}${e.location ? `, ${e.location}` : ""}
          </span>
        </div>`
      ).join("")
      return `<div class="cv-section">
        <h2>${s.label.toUpperCase()}</h2>
        ${rows}
      </div>`
    }).join("")

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>CV \u2014 ${artist.name || "Artist"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; max-width: 680px; margin: 50px auto; padding: 0 32px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #B5651D; }
    .header h1 { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 700; color: #0E0C0A; text-transform: uppercase; letter-spacing: 3px; }
    .header .meta { font-size: 12px; color: #A89F94; margin-top: 6px; }
    ${cv.artist_statement ? `.statement { margin-bottom: 32px; }
    .statement h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A89F94; margin-bottom: 10px; }
    .statement p { font-size: 13px; line-height: 1.8; color: #555; font-style: italic; }` : ""}
    .cv-section { margin-bottom: 28px; }
    .cv-section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A89F94; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #E8E2DA; }
    .cv-entry { display: flex; gap: 16px; padding: 6px 0; font-size: 13px; }
    .cv-year { width: 40px; flex-shrink: 0; color: #A89F94; font-weight: 500; }
    .cv-detail { flex: 1; color: #333; line-height: 1.5; }
    .cv-detail strong { color: #0E0C0A; }
    .footer { text-align: center; margin-top: 48px; font-size: 10px; color: #C5BDB3; }
    @media print { body { margin: 30px auto; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${artist.name || "Artist"}</h1>
    <div class="meta">${[artist.location, artist.website?.replace(/^https?:\/\//, "")].filter(Boolean).join(" \u00B7 ")}</div>
  </div>
  ${cv.artist_statement ? `<div class="statement"><h2>Artist Statement</h2><p>${cv.artist_statement}</p></div>` : ""}
  ${sectionHTML}
  <div class="footer">Generated with ArtistOS</div>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 400)
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
        <div className="text-center">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading CV...</p>
        </div>
      </div>
    )
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold mb-3" style={{ color: "#0E0C0A" }}>{error}</h1>
          <p className="text-sm mb-6" style={{ color: "#A89F94" }}>This CV may not be available.</p>
          <Link to="/artists" className="btn-copper inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Browse Artists
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      {/* Minimal nav */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #E8E2DA" }}>
        <Link to={`/artist/${userId}`} className="flex items-center gap-2 text-sm font-medium" style={{ color: "#A89F94" }}>
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <Link to="/" className="font-serif text-lg font-bold" style={{ color: "#0E0C0A" }}>ArtistOS</Link>
        <button onClick={handleExportPDF} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg"
          style={{ color: "#B5651D", background: "#FFF3E8" }}>
          <Download size={14} /> PDF
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Artist header */}
        <div className="text-center mb-12 pb-8" style={{ borderBottom: "2px solid #B5651D" }}>
          {artist.avatar_url ? (
            <img src={artist.avatar_url} alt={artist.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              style={{ border: "3px solid #B5651D" }} />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
              style={{ background: "linear-gradient(135deg, #B5651D, #D4854A)", color: "white" }}>
              {artist.initials || artist.name?.charAt(0) || "A"}
            </div>
          )}
          <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: "#0E0C0A", letterSpacing: "2px", textTransform: "uppercase" }}>
            {artist.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm" style={{ color: "#A89F94" }}>
            {artist.location && (
              <span className="flex items-center gap-1"><MapPin size={13} /> {artist.location}</span>
            )}
            {artist.website && (
              <a href={artist.website.startsWith("http") ? artist.website : `https://${artist.website}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline" style={{ color: "#B5651D" }}>
                <Globe size={13} /> {artist.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Artist Statement */}
        {cv.artist_statement && (
          <div className="mb-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[2px] mb-4" style={{ color: "#A89F94" }}>Artist Statement</h2>
            <p className="text-sm leading-relaxed italic" style={{ color: "#555" }}>{cv.artist_statement}</p>
          </div>
        )}

        {/* CV Sections */}
        {SECTIONS.map(s => {
          const entries = cv[s.key] || []
          if (entries.length === 0) return null
          return (
            <div key={s.key} className="mb-10">
              <h2 className="text-[11px] font-semibold uppercase tracking-[2px] mb-4 pb-2"
                style={{ color: "#A89F94", borderBottom: "1px solid #E8E2DA" }}>
                {s.label}
              </h2>
              <div className="space-y-2">
                {entries.map((e, i) => (
                  <div key={i} className="flex gap-4 text-sm py-1">
                    <span className="w-12 flex-shrink-0 font-medium" style={{ color: "#A89F94" }}>{e.year}</span>
                    <span style={{ color: "#333" }}>
                      {e.title && <strong style={{ color: "#0E0C0A" }}>{e.title}</strong>}
                      {e.venue && ` \u2014 ${e.venue}`}
                      {e.location && `, ${e.location}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Link to full profile */}
        <div className="text-center mt-12 pt-8" style={{ borderTop: "1px solid #E8E2DA" }}>
          <Link to={`/artist/${userId}`}
            className="inline-flex items-center gap-2 font-medium text-sm px-6 py-2.5 rounded-xl transition-colors"
            style={{ background: "#0E0C0A", color: "#FAF8F5" }}>
            View Full Portfolio →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs" style={{ color: "#C5BDB3", borderTop: "1px solid #E8E2DA" }}>
        Powered by <Link to="/" className="font-medium" style={{ color: "#B5651D" }}>ArtistOS</Link>
      </footer>
    </div>
  )
}
