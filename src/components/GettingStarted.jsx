import { useState, useEffect } from "react"
import { X, Check, Play, ChevronRight, Sparkles, Crown } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { useTour } from "../tour/TourProvider"
import { MISSIONS, MISSION_ORDER } from "../tour/missions"
import { normalizePlan, canAccess } from "../lib/plans"

export default function GettingStarted() {
  const { user, updateUser } = useAuth()
  const tour = useTour()
  const [dismissed, setDismissed] = useState(false)
  const [counts, setCounts] = useState({ artworks: 0, viewingRooms: 0, contacts: 0, invoices: 0, hasBio: false, hasAvatar: false, savedMatches: 0 })

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      supabase.from("artworks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("viewing_rooms").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("invoices").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([a, v, c, i]) => {
      setCounts({
        artworks: a.count || 0,
        viewingRooms: v.count || 0,
        contacts: c.count || 0,
        invoices: i.count || 0,
        hasBio: !!user.bio,
        hasAvatar: !!user.avatar_url,
        savedMatches: 0,
      })
    }).catch(() => {})
  }, [user?.id])

  const plan = normalizePlan(user?.plan)
  const progress = user?.onboarding_progress || {}

  if (dismissed || progress.tour_disabled) return null

  const missions = MISSION_ORDER
    .map(id => MISSIONS[id])
    .filter(m => m.plans === "all" || canAccess(plan, m.plans === "studio" ? "grantEngine" : m.plans))

  const completedCount = missions.filter(m => m.doneCheck(counts) || tour?.isMissionDone(m.id)).length
  const allDone = completedCount === missions.length

  if (allDone) return null

  const handleDismiss = async () => {
    setDismissed(true)
    try {
      await updateUser({ onboarding_progress: { ...progress, tour_disabled: true } })
    } catch { /* silent */ }
  }

  return (
    <div className="card p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>Getting Started</h3>
          <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>{completedCount} of {missions.length} complete</p>
        </div>
        <button onClick={handleDismiss} className="p-1 rounded hover:bg-gray-100">
          <X size={14} style={{ color: "#A89F94" }} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex rounded-full overflow-hidden mb-4" style={{ height: 4, background: "#E8E2DA" }}>
        <div style={{ width: `${(completedCount / missions.length) * 100}%`, background: "#B5651D", transition: "width 0.3s" }} />
      </div>

      {/* Mission list */}
      <div className="space-y-2">
        {missions.map(mission => {
          const done = mission.doneCheck(counts) || tour?.isMissionDone(mission.id)
          return (
            <div key={mission.id} className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
              style={{ background: done ? "#E8F2EA" : "transparent", border: done ? "1px solid #B8D4BE" : "1px solid #E8E2DA" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: done ? "#2D4A35" : "#F2EDE6" }}>
                {done ? <Check size={12} color="white" /> : <Play size={10} style={{ color: "#A89F94" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: done ? "#2D4A35" : "#0E0C0A" }}>{mission.title}</p>
                <p className="text-[10px]" style={{ color: "#A89F94" }}>{mission.description} · {mission.time}</p>
              </div>
              {!done && (
                <button onClick={() => tour?.startMission(mission.id)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
                  style={{ background: "#F5E6D8", color: "#B5651D" }}>
                  Start <ChevronRight size={10} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
