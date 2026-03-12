import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"

/* ================================================================ */
/*  Upgrade Success — Shown after Stripe checkout completion        */
/* ================================================================ */

export default function UpgradeSuccess() {
  const navigate = useNavigate()
  const { refreshProfile, user } = useAuth()
  const [searchParams] = useSearchParams()
  const [refreshing, setRefreshing] = useState(true)

  const planName = searchParams.get("plan") || "Pro"

  useEffect(() => {
    // Refresh the profile to pick up the new plan from webhook
    const refresh = async () => {
      try {
        await refreshProfile()
      } catch (err) {
        console.error("[UpgradeSuccess] refresh error:", err)
      } finally {
        setRefreshing(false)
      }
    }

    // Wait a moment for webhook to process
    const timer = setTimeout(refresh, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-redirect to dashboard after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard", { replace: true })
    }, 8000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FAF8F5" }}>
      <div className="w-full max-w-md text-center">
        <div className="card p-8" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>

          {/* Success icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "#E8F2EA" }}>
            <CheckCircle size={40} style={{ color: "#2D4A35" }} />
          </div>

          <h1 className="text-2xl font-serif font-semibold mb-2" style={{ color: "#0E0C0A" }}>
            Welcome to {planName}!
          </h1>

          <p className="text-sm mb-6" style={{ color: "#A89F94" }}>
            Your plan has been upgraded successfully. All premium features are now unlocked.
          </p>

          {/* Refreshing indicator */}
          {refreshing && (
            <div className="flex items-center justify-center gap-2 mb-4 text-sm" style={{ color: "#A89F94" }}>
              <Loader2 size={14} className="animate-spin" />
              Updating your account...
            </div>
          )}

          {/* What's new */}
          <div className="rounded-xl p-4 mb-6 text-left"
            style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#A89F94" }}>
              Now Available
            </p>
            <div className="space-y-2">
              {[
                "Market Analytics & Insights",
                "Social Media Scheduler",
                "Exhibition Planner",
                "Consignment Tracker",
                "PDF Catalog Export",
                "Expanded Limits",
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "#4A4540" }}>
                  <CheckCircle size={13} style={{ color: "#2D4A35" }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="btn-copper w-full flex items-center justify-center gap-2"
            style={{ padding: "12px 24px" }}>
            Go to Dashboard <ArrowRight size={16} />
          </button>

          <p className="text-xs mt-4" style={{ color: "#C5BDB3" }}>
            Redirecting automatically in a few seconds...
          </p>
        </div>
      </div>
    </div>
  )
}
