import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { supabase, logActivity } from "../lib/supabase"
import toast from "react-hot-toast"
import {
  ScrollText, Plus, Trash2, Download, Loader2, ChevronDown, ChevronUp, Save, Eye
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  CV section config                                                  */
/* ------------------------------------------------------------------ */
const SECTIONS = [
  { key: "solo_exhibitions", label: "Solo Exhibitions", fields: ["title", "venue", "location", "year"] },
  { key: "group_exhibitions", label: "Group Exhibitions", fields: ["title", "venue", "location", "year"] },
  { key: "education", label: "Education", fields: ["title", "venue", "location", "year"] },
  { key: "collections", label: "Collections", fields: ["title", "venue", "location", "year"] },
  { key: "awards", label: "Awards & Grants", fields: ["title", "venue", "location", "year"] },
  { key: "residencies", label: "Residencies", fields: ["title", "venue", "location", "year"] },
  { key: "publications", label: "Publications", fields: ["title", "venue", "location", "year"] },
]

const fieldLabels = {
  title: "Title / Degree",
  venue: "Venue / Institution",
  location: "Location",
  year: "Year"
}

/* ------------------------------------------------------------------ */
/*  Collapsible CV section                                             */
/* ------------------------------------------------------------------ */
function CVSection({ section, entries, onAdd, onRemove, onChange }) {
  const [open, setOpen] = useState(entries.length > 0)

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E8E2DA", background: "white" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{section.label}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "#F2EDE6", color: "#A89F94" }}>
            {entries.length}
          </span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: "#A89F94" }} /> : <ChevronDown size={16} style={{ color: "#A89F94" }} />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid #F2EDE6" }}>
          {entries.map((entry, idx) => (
            <div key={idx} className="flex gap-2 items-start pt-3">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                {section.fields.map(field => (
                  <input
                    key={field}
                    type="text"
                    placeholder={fieldLabels[field]}
                    value={entry[field] || ""}
                    onChange={e => onChange(section.key, idx, field, e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg text-xs border outline-none"
                    style={{ borderColor: "#E8E2DA" }}
                  />
                ))}
              </div>
              <button onClick={() => onRemove(section.key, idx)}
                className="p-1.5 rounded-lg transition-colors flex-shrink-0 mt-0.5"
                style={{ color: "#C4705A" }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button onClick={() => onAdd(section.key)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors mt-2"
            style={{ background: "#F2EDE6", color: "#0E0C0A" }}>
            <Plus size={13} /> Add Entry
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Artist CV page                                                */
/* ------------------------------------------------------------------ */
export default function ArtistCV() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cvId, setCvId] = useState(null)
  const [statement, setStatement] = useState("")
  const [sections, setSections] = useState({
    education: [],
    solo_exhibitions: [],
    group_exhibitions: [],
    collections: [],
    awards: [],
    residencies: [],
    publications: [],
  })

  const fetchCV = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [profileRes, cvRes] = await Promise.all([
      supabase.from("profiles").select("name, location, website").eq("id", user.id).single(),
      supabase.from("artist_cv").select("*").eq("user_id", user.id).single()
    ])

    setProfile(profileRes.data)

    if (cvRes.data) {
      setCvId(cvRes.data.id)
      setStatement(cvRes.data.artist_statement || "")
      setSections({
        education: cvRes.data.education || [],
        solo_exhibitions: cvRes.data.solo_exhibitions || [],
        group_exhibitions: cvRes.data.group_exhibitions || [],
        collections: cvRes.data.collections || [],
        awards: cvRes.data.awards || [],
        residencies: cvRes.data.residencies || [],
        publications: cvRes.data.publications || [],
      })
    }

    setLoading(false)
  }, [user])

  useEffect(() => { fetchCV() }, [fetchCV])

  const handleAddEntry = (sectionKey) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], { title: "", venue: "", location: "", year: "" }]
    }))
  }

  const handleRemoveEntry = (sectionKey, idx) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter((_, i) => i !== idx)
    }))
  }

  const handleChangeEntry = (sectionKey, idx, field, value) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((entry, i) =>
        i === idx ? { ...entry, [field]: value } : entry
      )
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      user_id: user.id,
      artist_statement: statement.trim(),
      education: sections.education,
      solo_exhibitions: sections.solo_exhibitions,
      group_exhibitions: sections.group_exhibitions,
      collections: sections.collections,
      awards: sections.awards,
      residencies: sections.residencies,
      publications: sections.publications,
      updated_at: new Date().toISOString()
    }

    let error
    if (cvId) {
      ({ error } = await supabase.from("artist_cv").update(payload).eq("id", cvId))
    } else {
      const res = await supabase.from("artist_cv").insert(payload).select("id").single()
      error = res.error
      if (res.data) setCvId(res.data.id)
    }

    if (error) {
      toast.error("Failed to save CV")
    } else {
      toast.success("CV saved")
      await logActivity(user.id, "cv", "Updated artist CV")
    }
    setSaving(false)
  }

  const renderSectionForPrint = (label, entries) => {
    if (!entries || entries.length === 0) return ""
    const rows = entries
      .sort((a, b) => (b.year || "").localeCompare(a.year || ""))
      .map(e => {
        const parts = []
        if (e.title) parts.push(`<strong>${e.title}</strong>`)
        if (e.venue) parts.push(e.venue)
        if (e.location) parts.push(e.location)
        const line = parts.join(" — ")
        return `<tr><td class="year">${e.year || ""}</td><td>${line}</td></tr>`
      })
      .join("")
    return `<h2>${label}</h2><table>${rows}</table>`
  }

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast.error("Please allow pop-ups to export PDF")
      return
    }

    const name = profile?.name || "Artist"
    const loc = profile?.location || ""
    const web = profile?.website || ""

    const sectionHTML = SECTIONS.map(s => renderSectionForPrint(s.label, sections[s.key])).join("")

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>CV — ${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      max-width: 680px;
      margin: 50px auto;
      padding: 0 32px;
      color: #333;
      font-size: 13px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #B5651D;
    }
    .header h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #0E0C0A;
      margin-bottom: 6px;
    }
    .header .meta {
      font-size: 12px;
      color: #A89F94;
    }
    .header .meta a {
      color: #B5651D;
      text-decoration: none;
    }
    h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #0E0C0A;
      margin: 28px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #E8E2DA;
    }
    .statement {
      font-size: 13px;
      line-height: 1.85;
      color: #555;
      margin-bottom: 8px;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 5px 0;
      vertical-align: top;
      font-size: 13px;
      color: #333;
    }
    td.year {
      width: 50px;
      font-weight: 500;
      color: #A89F94;
      padding-right: 16px;
    }
    td strong {
      color: #0E0C0A;
    }
    .footer {
      margin-top: 48px;
      text-align: center;
      font-size: 10px;
      color: #C5BDB3;
    }
    @media print {
      body { margin: 30px auto; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    <div class="meta">
      ${[loc, web ? `<a href="${web}">${web.replace(/^https?:\/\//, "")}</a>` : ""].filter(Boolean).join(" | ")}
    </div>
  </div>

  ${statement ? `<h2>Artist Statement</h2><div class="statement">${statement.replace(/\n/g, "<br/>")}</div>` : ""}

  ${sectionHTML}

  <div class="footer">Generated with ArtistOS</div>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 400)
  }

  // Count total entries
  const totalEntries = Object.values(sections).reduce((sum, arr) => sum + arr.length, 0)

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#B5651D" }} />
        <p className="text-sm" style={{ color: "#A89F94" }}>Loading CV...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#0E0C0A" }}>Artist CV</h2>
          <p className="text-xs mt-1" style={{ color: "#A89F94" }}>
            Build your professional art-world curriculum vitae
            {totalEntries > 0 && <span className="ml-2 font-medium" style={{ color: "#B5651D" }}>({totalEntries} entries)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2" style={{ fontSize: 13, padding: "8px 16px" }}>
            <Download size={15} /> Export PDF
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 16px" }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving..." : "Save CV"}
          </button>
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Editor (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Artist Statement */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E8E2DA", background: "white" }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #F2EDE6" }}>
              <span className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>Artist Statement</span>
            </div>
            <div className="p-4">
              <textarea
                value={statement}
                onChange={e => setStatement(e.target.value)}
                placeholder="Write your artist statement..."
                rows={5}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
                style={{ borderColor: "#E8E2DA", lineHeight: 1.7 }}
              />
            </div>
          </div>

          {/* CV Sections */}
          {SECTIONS.map(s => (
            <CVSection
              key={s.key}
              section={s}
              entries={sections[s.key]}
              onAdd={handleAddEntry}
              onRemove={handleRemoveEntry}
              onChange={handleChangeEntry}
            />
          ))}
        </div>

        {/* Right: Live Preview (2 cols) */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 rounded-xl overflow-hidden" style={{ border: "1px solid #E8E2DA", background: "white" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #F2EDE6" }}>
              <div className="flex items-center gap-2">
                <Eye size={14} style={{ color: "#B5651D" }} />
                <span className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>Preview</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#F5E6D8", color: "#B5651D" }}>Live</span>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto" style={{ fontSize: 11, lineHeight: 1.6 }}>
              {/* Header */}
              <div className="text-center pb-3 mb-3" style={{ borderBottom: "2px solid #B5651D" }}>
                <h3 className="font-serif font-bold text-base mb-0.5" style={{ color: "#0E0C0A", letterSpacing: 1, textTransform: "uppercase" }}>
                  {profile?.name || "Your Name"}
                </h3>
                <p className="text-[10px]" style={{ color: "#A89F94" }}>
                  {[profile?.location, profile?.website?.replace(/^https?:\/\//, "")].filter(Boolean).join(" | ") || "Location | website"}
                </p>
              </div>

              {/* Statement */}
              {statement && (
                <>
                  <h4 className="font-serif text-xs font-semibold mb-1.5 pb-1" style={{ color: "#0E0C0A", borderBottom: "1px solid #E8E2DA", textTransform: "uppercase", letterSpacing: 1 }}>
                    Artist Statement
                  </h4>
                  <p className="text-[10px] mb-3 italic" style={{ color: "#777", lineHeight: 1.7 }}>
                    {statement.length > 300 ? statement.slice(0, 300) + "..." : statement}
                  </p>
                </>
              )}

              {/* Sections */}
              {SECTIONS.map(s => {
                const entries = sections[s.key]
                if (!entries || entries.length === 0) return null
                return (
                  <div key={s.key} className="mb-3">
                    <h4 className="font-serif text-xs font-semibold mb-1.5 pb-1" style={{ color: "#0E0C0A", borderBottom: "1px solid #E8E2DA", textTransform: "uppercase", letterSpacing: 1 }}>
                      {s.label}
                    </h4>
                    {entries
                      .sort((a, b) => (b.year || "").localeCompare(a.year || ""))
                      .map((e, i) => (
                        <div key={i} className="flex gap-2 mb-0.5">
                          <span className="text-[10px] flex-shrink-0" style={{ color: "#A89F94", width: 30 }}>{e.year}</span>
                          <span className="text-[10px]" style={{ color: "#333" }}>
                            {[e.title && <strong key="t">{e.title}</strong>, e.venue, e.location].filter(Boolean).reduce((arr, item, idx) => {
                              if (idx > 0) arr.push(" — ")
                              arr.push(item)
                              return arr
                            }, [])}
                          </span>
                        </div>
                      ))}
                  </div>
                )
              })}

              {/* Empty state */}
              {totalEntries === 0 && !statement && (
                <div className="text-center py-8">
                  <ScrollText size={24} className="mx-auto mb-2" style={{ color: "#E8E2DA" }} />
                  <p className="text-[10px]" style={{ color: "#A89F94" }}>Add entries to see your CV preview here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
