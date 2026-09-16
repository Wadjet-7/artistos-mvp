/* ================================================================ */
/*  First-Steps Checklist (Phase 21)                                 */
/*  Guides new artists to the activation moment:                     */
/*  3 artworks + 1 business doc + profile + share.                   */
/*  Hides itself once complete or dismissed.                         */
/* ================================================================ */

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, Circle, X, Image, FileText, UserCircle, Share2 } from "lucide-react"
import toast from "react-hot-toast"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"

const DISMISS_KEY = "aos_checklist_dismissed"
const SHARED_KEY = "aos_shared_profile"

export default function FirstStepsChecklist() {
  const { user } = useAuth()
  const [counts, setCounts] = useState(null)
  const [shared, setShared] = useState(() => localStorage.getItem(SHARED_KEY) === "1")
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1")

  useEffect(() => {
    if (!user?.id || dismissed) return
    let mounted = true
    const load = async () => {
      try {
        const [aw, inv, con] = await Promise.all([
          supabase.from("artworks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("contracts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        ])
        if (mounted) {
          setCounts({
            artworks: aw.count || 0,
            docs: (inv.count || 0) + (con.count || 0),
          })
        }
      } catch {
        if (mounted) setCounts({ artworks: 0, docs: 0 })
      }
    }
    load()
    return () => { mounted = false }
  }, [user?.id, dismissed])

  if (dismissed || !user?.id || counts === null) return null

  const profileDone = !!(user.avatar_url || (user.bio && user.bio.length > 10))

  const steps = [
    {
      key: "artworks",
      icon: Image,
      label: `Add your first 3 artworks`,
      sub: counts.artworks >= 3 ? "Done — your portfolio is live" : `${counts.artworks}/3 added`,
      done: counts.artworks >= 3,
      to: "/portfolio",
    },
    {
      key: "doc",
      icon: FileText,
      label: "Create an invoice or contract",
      sub: counts.docs >= 1 ? "Done — business mode: on" : "Takes about 90 seconds",
      done: counts.docs >= 1,
      to: "/finances",
    },
    {
      key: "profile",
      icon: UserCircle,
      label: "Add a photo or bio to your profile",
      sub: profileDone ? "Done — looking professional" : "Collectors check this first",
      done: profileDone,
      to: "/settings",
    },
    {
      key: "share",
      icon: Share2,
      label: "Share your public artist page",
      sub: shared ? "Link copied — send it out!" : "Copy your link to share anywhere",
      done: shared,
      action: () => {
        const url = `${window.location.origin}/artist/${user.id}`
        navigator.clipboard?.writeText(url)
          .then(() => toast.success("Profile link copied!"))
          .catch(() => toast(url))
        localStorage.setItem(SHARED_KEY, "1")
        setShared(true)
      },
    },
  ]

  const doneCount = steps.filter(s => s.done).length
  if (doneCount === steps.length) return null

  return (
    <div className="card p-5" style={{ border: "1px solid #E8E2DA", background: "linear-gradient(135deg, #FFFFFF 0%, #FAF8F5 100%)" }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif text-base font-semibold" style={{ color: "#0E0C0A" }}>
            Get set up in minutes
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>
            {doneCount} of {steps.length} done — artists who finish this are the ones who get paid through ArtistOS.
          </p>
        </div>
        <button
          onClick={() => { localStorage.setItem(DISMISS_KEY, "1"); setDismissed(true) }}
          className="p-1 rounded transition-colors hover:bg-black/5"
          style={{ color: "#A89F94" }}
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>

      {/* progress bar */}
      <div className="progress-bar mb-4" style={{ height: 6 }}>
        <div className="progress-fill" style={{ width: `${(doneCount / steps.length) * 100}%`, background: "#B5651D" }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {steps.map(s => {
          const inner = (
            <div
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
              style={{
                background: s.done ? "#E8F2EA" : "#FFFFFF",
                border: `1px solid ${s.done ? "#CFE3D4" : "#E8E2DA"}`,
                opacity: s.done ? 0.85 : 1,
                cursor: s.done ? "default" : "pointer",
              }}
            >
              {s.done
                ? <CheckCircle2 size={17} className="flex-shrink-0" style={{ color: "#2D4A35" }} />
                : <Circle size={17} className="flex-shrink-0" style={{ color: "#D4854A" }} />}
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: "#0E0C0A", textDecoration: s.done ? "line-through" : "none" }}>
                  {s.label}
                </p>
                <p className="text-[11px] truncate" style={{ color: "#A89F94" }}>{s.sub}</p>
              </div>
            </div>
          )
          if (s.done) return <div key={s.key}>{inner}</div>
          if (s.action) return <button key={s.key} onClick={s.action} className="text-left w-full">{inner}</button>
          return <Link key={s.key} to={s.to}>{inner}</Link>
        })}
      </div>
    </div>
  )
}
