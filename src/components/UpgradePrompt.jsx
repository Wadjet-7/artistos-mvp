import { useNavigate } from "react-router-dom"
import { Sparkles, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { PLANS, normalizePlan, getMinimumPlan, formatLimit } from "../lib/plans"

/* ------------------------------------------------------------------ */
/*  UpgradePrompt — Shown when user hits a plan limit or gated feature */
/* ------------------------------------------------------------------ */

/**
 * Feature gate overlay — wraps an entire page
 * Shows a blurred preview with upgrade CTA when feature isn't available
 */
export function FeatureGate({ feature, children }) {
  const { user } = useAuth()
  const plan = normalizePlan(user?.plan)
  const planConfig = PLANS[plan]

  if (planConfig?.features[feature]) return children

  const minPlan = getMinimumPlan(feature)
  const minPlanConfig = PLANS[minPlan]

  return (
    <div className="relative">
      {/* Blurred preview of the page content */}
      <div style={{ filter: "blur(3px)", opacity: 0.4, pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-start justify-center pt-16 z-10"
        style={{ background: "rgba(250, 248, 245, 0.6)" }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#F5E6D8" }}>
            <Lock size={24} style={{ color: "#B5651D" }} />
          </div>
          <h3 className="text-xl font-serif font-semibold mb-2" style={{ color: "#0E0C0A" }}>
            Upgrade to {minPlanConfig.name}
          </h3>
          <p className="text-sm mb-5" style={{ color: "#A89F94" }}>
            This feature is available on the {minPlanConfig.name} plan ({minPlanConfig.priceLabel}).
            Upgrade to unlock full access.
          </p>
          <UpgradeButton plan={minPlan} />
          <p className="text-xs mt-3" style={{ color: "#C5BDB3" }}>
            Currently on: <span className="font-medium">{PLANS[plan]?.name || "Starter"}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Limit prompt — inline banner shown when user hits a resource limit
 * Use this inside pages near the "Create" button
 */
export function LimitBanner({ resource, currentCount, label }) {
  const { user } = useAuth()
  const plan = normalizePlan(user?.plan)
  const planConfig = PLANS[plan]
  const limit = planConfig?.limits[resource]

  // Don't show if not at limit
  if (limit === Infinity || currentCount < limit) return null

  // Find next plan with higher limit
  const nextPlan = plan === "starter" ? "pro" : "studio"
  const nextLimit = PLANS[nextPlan]?.limits[resource]

  return (
    <div className="rounded-xl p-4 flex items-center gap-4"
      style={{ background: "#FFF8F0", border: "1px solid #F0D9B5" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "#F5E6D8" }}>
        <Sparkles size={18} style={{ color: "#B5651D" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>
          You've reached the {label || resource} limit ({formatLimit(limit)})
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>
          Upgrade to {PLANS[nextPlan].name} for {nextLimit === Infinity ? "unlimited" : `up to ${formatLimit(nextLimit)}`} {label || resource}
        </p>
      </div>
      <UpgradeButton plan={nextPlan} size="sm" />
    </div>
  )
}

/**
 * Small upgrade CTA button
 */
export function UpgradeButton({ plan = "pro", size = "md" }) {
  const navigate = useNavigate()

  const styles = size === "sm"
    ? { fontSize: 12, padding: "6px 14px" }
    : { fontSize: 13, padding: "10px 24px" }

  return (
    <button
      onClick={() => navigate("/upgrade")}
      className="btn-copper inline-flex items-center gap-1.5"
      style={styles}
    >
      <Sparkles size={size === "sm" ? 12 : 14} />
      Upgrade
      <ArrowRight size={size === "sm" ? 12 : 14} />
    </button>
  )
}

export default UpgradePrompt

/**
 * Generic upgrade prompt (standalone card)
 */
function UpgradePrompt({ title, message, targetPlan = "pro" }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const plan = normalizePlan(user?.plan)

  return (
    <div className="card p-6 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "#F5E6D8" }}>
        <Sparkles size={24} style={{ color: "#B5651D" }} />
      </div>
      <h3 className="text-lg font-serif font-semibold mb-2" style={{ color: "#0E0C0A" }}>
        {title || "Upgrade Your Plan"}
      </h3>
      <p className="text-sm mb-5 max-w-sm mx-auto" style={{ color: "#A89F94" }}>
        {message || `This feature requires the ${PLANS[targetPlan]?.name} plan. Upgrade to unlock full access.`}
      </p>
      <button
        onClick={() => navigate("/upgrade")}
        className="btn-copper inline-flex items-center gap-2"
        style={{ fontSize: 14, padding: "10px 28px" }}
      >
        <Sparkles size={15} />
        View Plans & Upgrade
        <ArrowRight size={15} />
      </button>
      <p className="text-xs mt-4" style={{ color: "#C5BDB3" }}>
        Currently on: <span className="font-medium">{PLANS[plan]?.name || "Starter"}</span>
      </p>
    </div>
  )
}
