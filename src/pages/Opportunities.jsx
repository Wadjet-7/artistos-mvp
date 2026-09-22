import { useState, useEffect, useCallback } from "react"
import {
  Award, Loader2, RefreshCw, ExternalLink, Bookmark, BookmarkCheck, X,
  Clock, DollarSign, MapPin, Sparkles, FileText, Copy, Check, Image, ChevronDown
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { logActivity } from "../lib/supabase"
import { FeatureGate } from "../components/UpgradePrompt"
import {
  fetchMyMatches, fetchActiveOpportunities, refreshMatches,
  setMatchStatus, draftApplication, saveApplication, fetchMyApplications
} from "../lib/opportunities"

const TYPE_BADGES = {
  grant:     { bg: "#E8F2EA", color: "#2D4A35" },
  residency: { bg: "#F5E6D8", color: "#B5651D" },
  fellowship:{ bg: "#FBF2DC", color: "#8A6A1A" },
  open_call: { bg: "#F5E2DC", color: "#C4705A" },
  award:     { bg: "#E8E2DA", color: "#0E0C0A" },
}

function daysUntil(deadline) {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline) - Date.now()) / 86400000)
  return diff
}

function DeadlineBadge({ deadline }) {
  const days = daysUntil(deadline)
  if (days === null) return null
  if (days < 0) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F2EDE6", color: "#A89F94" }}>Closed</span>
  const urgent = days < 14
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
      style={{ background: urgent ? "#F5E2DC" : "#E8F2EA", color: urgent ? "#C4705A" : "#2D4A35" }}>
      <Clock size={10} /> {days} day{days !== 1 ? "s" : ""} left
    </span>
  )
}

function ScorePill({ score }) {
  const style = score >= 80
    ? { background: "#E8F2EA", color: "#2D4A35" }
    : score >= 65
    ? { background: "#FBF2DC", color: "#8A6A1A" }
    : { background: "#F2EDE6", color: "#A89F94" }
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={style}>{score}%</span>
}

function OpportunityCard({ match, opportunity, onDraft, onSave, onDismiss }) {
  const opp = opportunity || match?.opportunity
  if (!opp) return null
  const typeBadge = TYPE_BADGES[opp.opportunity_type] || TYPE_BADGES.grant
  const status = match?.status

  return (
    <div className="card p-5 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase" style={typeBadge}>
              {opp.opportunity_type?.replace("_", " ")}
            </span>
            {match && <ScorePill score={match.match_score} />}
            <DeadlineBadge deadline={opp.deadline} />
          </div>
          <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{opp.title}</h3>
          <p className="text-xs" style={{ color: "#A89F94" }}>{opp.organization}</p>
        </div>
        {(opp.amount_min || opp.amount_max) && (
          <div className="text-right flex-shrink-0">
            <p className="font-serif text-lg font-semibold" style={{ color: "#B5651D" }}>
              {opp.amount_min && opp.amount_max && opp.amount_min !== opp.amount_max
                ? `$${opp.amount_min.toLocaleString()}–$${opp.amount_max.toLocaleString()}`
                : `$${(opp.amount_max || opp.amount_min || 0).toLocaleString()}`}
            </p>
          </div>
        )}
      </div>

      {match?.match_reason && (
        <p className="text-xs leading-relaxed mb-3" style={{ color: "#5C554C" }}>{match.match_reason}</p>
      )}

      {opp.description && (
        <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "#A89F94" }}>{opp.description}</p>
      )}

      {opp.mediums?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {opp.mediums.map(m => (
            <span key={m} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#F2EDE6", color: "#A89F94" }}>{m}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {onDraft && daysUntil(opp.deadline) > 0 && (
          <button onClick={() => onDraft(opp, match)} className="btn-copper text-xs flex items-center gap-1.5 px-3 py-1.5">
            <FileText size={12} /> Draft Application
          </button>
        )}
        {onSave && status !== "saved" && status !== "applied" && (
          <button onClick={() => onSave(match.id)} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5">
            <Bookmark size={12} /> Save
          </button>
        )}
        {status === "saved" && (
          <span className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: "#E8F2EA", color: "#2D4A35" }}>
            <BookmarkCheck size={12} /> Saved
          </span>
        )}
        {onDismiss && status !== "dismissed" && status !== "applied" && (
          <button onClick={() => onDismiss(match.id)} className="text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors hover:bg-gray-100" style={{ color: "#A89F94" }}>
            <X size={12} /> Dismiss
          </button>
        )}
        {opp.url && (
          <a href={opp.url} target="_blank" rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors hover:bg-gray-100 ml-auto" style={{ color: "#B5651D" }}>
            <ExternalLink size={12} /> View original
          </a>
        )}
      </div>
    </div>
  )
}

function DraftModal({ open, onClose, opportunity, user }) {
  const [artworks, setArtworks] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [generating, setGenerating] = useState(false)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (!open || !user?.id) return
    supabase.from("artworks").select("id, title, medium, dimensions, tag, image_url")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setArtworks(data || []))
  }, [open, user?.id])

  const toggleArtwork = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 6 ? [...prev, id] : prev
    )
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const selected = artworks.filter(a => selectedIds.includes(a.id))
      // Pull real CV facts so the draft never has to invent credentials.
      const { data: cv } = await supabase
        .from("artist_cv")
        .select("artist_statement, solo_exhibitions, group_exhibitions, awards, residencies, education")
        .eq("user_id", user.id)
        .maybeSingle()
      const line = (label) => (e) => `${label}: ${e.title}${e.venue ? " — " + e.venue : ""}${e.location ? ", " + e.location : ""}${e.year ? " (" + e.year + ")" : ""}`
      const cv_highlights = [
        ...(cv?.solo_exhibitions || []).map(line("Solo exhibition")),
        ...(cv?.group_exhibitions || []).map(line("Group exhibition")),
        ...(cv?.awards || []).map(line("Award")),
        ...(cv?.residencies || []).map(line("Residency")),
        ...(cv?.education || []).map(line("Education")),
      ].slice(0, 10)
      const result = await draftApplication(
        opportunity,
        { ...user, artist_statement: cv?.artist_statement || user.artist_statement || "", cv_highlights },
        selected
      )
      setDraft(result)
    } catch (err) {
      console.error(err)
      toast.error("Failed to generate draft")
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveApplication({
        user_id: user.id,
        opportunity_id: opportunity.id,
        draft_content: draft,
        selected_artwork_ids: selectedIds,
        status: "drafting",
      })
      toast.success("Draft saved!")
      logActivity(user.id, "application_drafted", `Drafted application for: ${opportunity.title}`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to save draft")
    } finally {
      setSaving(false)
    }
  }

  const copySection = (key) => {
    navigator.clipboard.writeText(draft[key] || "")
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!open) return null

  const sections = [
    { key: "artist_statement", label: "Artist Statement" },
    { key: "project_description", label: "Project Description" },
    { key: "bio", label: "Bio" },
    { key: "why_this_opportunity", label: "Why This Opportunity" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ border: "1px solid #E8E2DA" }}>
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between z-10" style={{ borderBottom: "1px solid #E8E2DA" }}>
          <div>
            <h2 className="text-lg font-serif font-semibold" style={{ color: "#0E0C0A" }}>Draft Application</h2>
            <p className="text-xs" style={{ color: "#A89F94" }}>{opportunity?.title} — {opportunity?.organization}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} style={{ color: "#A89F94" }} /></button>
        </div>

        <div className="p-6 space-y-5">
          {!draft ? (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#0E0C0A" }}>
                  Select artworks to reference <span className="font-normal" style={{ color: "#A89F94" }}>(up to 6)</span>
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {artworks.map(a => (
                    <button key={a.id} onClick={() => toggleArtwork(a.id)}
                      className="text-left rounded-lg p-2 transition-all"
                      style={{
                        border: selectedIds.includes(a.id) ? "2px solid #B5651D" : "2px solid #E8E2DA",
                        background: selectedIds.includes(a.id) ? "#FFF8F0" : "white",
                      }}>
                      <div className="w-full aspect-square rounded bg-gray-100 mb-1 flex items-center justify-center overflow-hidden">
                        {a.image_url ? (
                          <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                        ) : (
                          <Image size={16} style={{ color: "#E8E2DA" }} />
                        )}
                      </div>
                      <p className="text-[10px] font-medium truncate" style={{ color: "#0E0C0A" }}>{a.title}</p>
                    </button>
                  ))}
                </div>
                {artworks.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: "#A89F94" }}>No artworks in your portfolio yet.</p>
                )}
              </div>
              <button onClick={handleGenerate} disabled={generating} className="btn-copper w-full flex items-center justify-center gap-2 py-3">
                {generating ? <><Loader2 size={16} className="animate-spin" /> Generating draft...</> : <><Sparkles size={16} /> Generate Draft</>}
              </button>
            </>
          ) : (
            <>
              {sections.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold" style={{ color: "#0E0C0A" }}>{label}</label>
                    <button onClick={() => copySection(key)} className="text-[10px] flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100" style={{ color: "#B5651D" }}>
                      {copied === key ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                    </button>
                  </div>
                  <textarea
                    value={draft[key] || ""}
                    onChange={(e) => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
                    rows={5}
                    className="form-input w-full text-xs resize-y"
                  />
                </div>
              ))}

              <p className="text-[10px] leading-relaxed italic" style={{ color: "#A89F94" }}>
                AI-generated first draft from your profile and portfolio. Verify every claim and confirm deadlines and eligibility on the organization's own site before submitting.
              </p>

              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="btn-copper flex items-center gap-2 text-sm px-5 py-2.5">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  {saving ? "Saving..." : "Save Draft"}
                </button>
                <button onClick={() => setDraft(null)} className="btn-secondary text-sm px-4 py-2.5">
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function OpportunitiesContent() {
  const { user } = useAuth()
  const [tab, setTab] = useState("Matched")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [matches, setMatches] = useState([])
  const [allOpps, setAllOpps] = useState([])
  const [applications, setApplications] = useState([])
  const [draftModal, setDraftModal] = useState({ open: false, opportunity: null })

  const tabs = ["Matched", "All Open", "Saved", "Applications"]

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [m, o, a] = await Promise.all([
        fetchMyMatches(user.id),
        fetchActiveOpportunities(),
        fetchMyApplications(user.id),
      ])
      setMatches(m)
      setAllOpps(o)
      setApplications(a)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load opportunities")
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { loadData() }, [loadData])

  const handleRefresh = async () => {
    const lastMatched = localStorage.getItem("artistos_last_matched")
    if (lastMatched && Date.now() - parseInt(lastMatched) < 3600000) {
      toast.error("Matches refresh once per hour. Try again later.")
      return
    }
    setRefreshing(true)
    try {
      const [{ count: artworkCount }, { count: exhibitionCount }, { data: cv }] = await Promise.all([
        supabase.from("artworks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("exhibitions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("artist_cv").select("solo_exhibitions, group_exhibitions").eq("user_id", user.id).maybeSingle(),
      ])
      const shows = (cv?.solo_exhibitions?.length || 0) + (cv?.group_exhibitions?.length || 0) + (exhibitionCount || 0)
      const careerStage = shows >= 12 ? "established" : shows >= 4 ? "mid_career" : "emerging"
      const result = await refreshMatches(user.id, {
        medium: user.medium,
        style: user.style,
        location: user.location,
        bio: user.bio,
        careerStage,
        artworkCount: artworkCount || 0,
        exhibitionCount: shows,
      })
      localStorage.setItem("artistos_last_matched", String(Date.now()))
      toast.success(`Found ${result.length} matching opportunities!`)
      await loadData()
    } catch (err) {
      console.error(err)
      const msg = err?.context?.status === 400 ? "Matching isn't deployed yet — redeploy the ai-assistant function." : (err?.message || "Failed to refresh matches")
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  const handleSave = async (matchId) => {
    try {
      await setMatchStatus(matchId, "saved")
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: "saved" } : m))
      toast.success("Opportunity saved!")
    } catch { toast.error("Failed to save") }
  }

  const handleDismiss = async (matchId) => {
    try {
      await setMatchStatus(matchId, "dismissed")
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: "dismissed" } : m))
    } catch { toast.error("Failed to dismiss") }
  }

  const openDraft = (opp) => setDraftModal({ open: true, opportunity: opp })

  const filteredMatches = matches.filter(m => m.status !== "dismissed")
  const savedMatches = matches.filter(m => m.status === "saved")
  const newMatchCount = matches.filter(m => m.status === "new").length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FBF2DC" }}>
            <Award size={20} style={{ color: "#8A6A1A" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold font-serif" style={{ color: "#0E0C0A" }}>Opportunities</h1>
            <p className="text-xs" style={{ color: "#A89F94" }}>Grants, residencies & fellowships matched to your profile</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-copper flex items-center gap-2 text-xs px-4 py-2">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Matching..." : "Refresh Matches"}
        </button>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-lg overflow-x-auto" style={{ background: "#F2EDE6" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap px-3"
            style={{
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "#0E0C0A" : "#A89F94",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t}
            {t === "Matched" && newMatchCount > 0 && (
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#B5651D", color: "white" }}>{newMatchCount}</span>
            )}
            {t === "Saved" && savedMatches.length > 0 && (
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#E8F2EA", color: "#2D4A35" }}>{savedMatches.length}</span>
            )}
            {t === "Applications" && applications.length > 0 && (
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#F2EDE6", color: "#A89F94" }}>{applications.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" style={{ color: "#B5651D" }} />
        </div>
      ) : (
        <>
          {tab === "Matched" && (
            <div className="space-y-4">
              {filteredMatches.length === 0 ? (
                <div className="card p-10 text-center">
                  <Award size={32} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
                  <p className="text-sm font-medium mb-1" style={{ color: "#0E0C0A" }}>No matches yet</p>
                  <p className="text-xs mb-4" style={{ color: "#A89F94" }}>Click "Refresh Matches" to find opportunities that fit your profile.</p>
                </div>
              ) : (
                filteredMatches.map(m => (
                  <OpportunityCard key={m.id} match={m} onDraft={(opp) => openDraft(opp)} onSave={handleSave} onDismiss={handleDismiss} />
                ))
              )}
            </div>
          )}

          {tab === "All Open" && (
            <div className="space-y-4">
              {allOpps.length === 0 ? (
                <div className="card p-10 text-center">
                  <Award size={32} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
                  <p className="text-sm" style={{ color: "#A89F94" }}>No open opportunities at this time. Check back soon!</p>
                </div>
              ) : (
                allOpps.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} onDraft={() => openDraft(opp)} />
                ))
              )}
            </div>
          )}

          {tab === "Saved" && (
            <div className="space-y-4">
              {savedMatches.length === 0 ? (
                <div className="card p-10 text-center">
                  <Bookmark size={32} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
                  <p className="text-sm" style={{ color: "#A89F94" }}>No saved opportunities. Browse and save ones you're interested in.</p>
                </div>
              ) : (
                savedMatches.map(m => (
                  <OpportunityCard key={m.id} match={m} onDraft={(opp) => openDraft(opp)} onSave={handleSave} onDismiss={handleDismiss} />
                ))
              )}
            </div>
          )}

          {tab === "Applications" && (
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="card p-10 text-center">
                  <FileText size={32} className="mx-auto mb-3" style={{ color: "#E8E2DA" }} />
                  <p className="text-sm" style={{ color: "#A89F94" }}>No applications yet. Draft your first application from the Matched tab.</p>
                </div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{app.opportunity?.title}</h3>
                        <p className="text-xs" style={{ color: "#A89F94" }}>{app.opportunity?.organization}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase"
                        style={{
                          background: app.status === "submitted" ? "#E8F2EA" : app.status === "accepted" ? "#E8F2EA" : "#F2EDE6",
                          color: app.status === "submitted" ? "#2D4A35" : app.status === "accepted" ? "#2D4A35" : "#A89F94",
                        }}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "#A89F94" }}>
                      {app.selected_artwork_ids?.length || 0} artworks referenced
                      {app.updated_at && ` · Updated ${new Date(app.updated_at).toLocaleDateString()}`}
                    </p>
                    <button onClick={() => openDraft(app.opportunity)} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 mt-3">
                      <FileText size={12} /> Edit Draft
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      <DraftModal
        open={draftModal.open}
        onClose={() => { setDraftModal({ open: false, opportunity: null }); loadData() }}
        opportunity={draftModal.opportunity}
        user={user}
      />
    </div>
  )
}

export default function Opportunities() {
  return (
    <FeatureGate feature="grantEngine">
      <OpportunitiesContent />
    </FeatureGate>
  )
}
