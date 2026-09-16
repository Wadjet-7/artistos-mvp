import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { PLANS, normalizePlan, getPrice, getAnnualSavings, isLegacyPricing } from "../lib/plans"
import { redirectToCheckout, isStripeConfigured, getPaymentLink } from "../lib/stripe"
import { Check, Sparkles, Crown, Zap, ArrowLeft, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

const planIcons = { starter: Zap, pro: Sparkles, studio: Crown }

const planColors = {
  starter: { bg: "#F2EDE6", border: "#E8E2DA", accent: "#A89F94", badge: "#F2EDE6" },
  pro:     { bg: "#FFF8F0", border: "#F0D9B5", accent: "#B5651D", badge: "#F5E6D8" },
  studio:  { bg: "#F0F5F1", border: "#B8D4BE", accent: "#2D4A35", badge: "#E8F2EA" },
}

export default function Upgrade() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentPlan = normalizePlan(user?.plan)
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [interval, setInterval] = useState("annual")

  const handleUpgrade = async (planKey) => {
    if (planKey === currentPlan) return
    if (planKey === "starter") return

    const paymentLink = getPaymentLink(planKey, user?.email, interval)
    if (paymentLink) {
      window.open(paymentLink, "_blank", "noopener")
      toast.success("Opening secure checkout...")
      return
    }

    if (isStripeConfigured()) {
      setLoadingPlan(planKey)
      try {
        await redirectToCheckout({
          planId: planKey,
          userId: user?.id,
          userEmail: user?.email,
          interval,
        })
      } catch (err) {
        console.error("[Upgrade] checkout error:", err)
        toast.error(err.message || "Failed to start checkout")
        setLoadingPlan(null)
      }
      return
    }

    toast.error("Payments are being set up. Please check back shortly!")
  }

  const displayPrice = (planKey) => {
    const plan = PLANS[planKey]
    if (plan.price === 0) return { main: "Free", sub: null }
    const price = getPrice(planKey, interval, user)
    if (interval === "annual") {
      const monthly = Math.round(price / 12)
      return { main: `$${price}`, sub: `$${monthly}/mo billed annually` }
    }
    return { main: `$${price}`, sub: null }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm mb-4 hover:underline"
          style={{ color: "#A89F94" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-2xl font-serif font-semibold" style={{ color: "#0E0C0A" }}>
          Choose Your Plan
        </h1>
        <p className="text-sm mt-1" style={{ color: "#A89F94" }}>
          Unlock the full potential of your creative business
        </p>
      </div>

      {/* Legacy pricing banner */}
      {isLegacyPricing(user) && (
        <div className="rounded-xl p-4 mb-6 flex items-center gap-3"
          style={{ background: "#E8F2EA", border: "1px solid #B8D4BE" }}>
          <Sparkles size={18} style={{ color: "#2D4A35" }} />
          <p className="text-sm" style={{ color: "#2D4A35" }}>
            You're on founding pricing — <strong>${user.legacy_plan_price}/mo</strong>, locked in for as long as you stay subscribed. New prices don't apply to you.
          </p>
        </div>
      )}

      {/* Billing interval toggle */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          onClick={() => setInterval("monthly")}
          className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{
            background: interval === "monthly" ? "#0E0C0A" : "transparent",
            color: interval === "monthly" ? "#FAF8F5" : "#A89F94",
          }}>
          Monthly
        </button>
        <button
          onClick={() => setInterval("annual")}
          className="text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          style={{
            background: interval === "annual" ? "#0E0C0A" : "transparent",
            color: interval === "annual" ? "#FAF8F5" : "#A89F94",
          }}>
          Annual
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#F5E6D8", color: "#B5651D" }}>
            Save 2 months
          </span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-5 mb-10">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrent = key === currentPlan
          const isPopular = key === "pro"
          const colors = planColors[key]
          const Icon = planIcons[key]
          const isUpgrade = !isCurrent && key !== "starter"
          const isDowngrade = key === "starter" && currentPlan !== "starter"
          const { main, sub } = displayPrice(key)

          return (
            <div key={key}
              className="relative rounded-2xl p-6 transition-all"
              style={{
                background: isCurrent ? colors.bg : "white",
                border: `2px solid ${isCurrent ? colors.accent : isPopular ? colors.border : "#E8E2DA"}`,
                boxShadow: isPopular ? "0 4px 20px rgba(181, 101, 29, 0.1)" : "none",
              }}>

              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full text-white"
                  style={{ background: "#B5651D" }}>
                  Most Popular
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: colors.badge, color: colors.accent, border: `1px solid ${colors.accent}` }}>
                  Current Plan
                </div>
              )}

              <div className="flex items-center gap-2.5 mb-3 mt-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: colors.badge }}>
                  <Icon size={18} style={{ color: colors.accent }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "#0E0C0A" }}>
                  {plan.name}
                </h3>
              </div>

              <div className="mb-1">
                <span className="text-3xl font-serif font-bold" style={{ color: "#0E0C0A" }}>
                  {main}
                </span>
                {plan.price > 0 && interval === "monthly" && (
                  <span className="text-sm ml-1" style={{ color: "#A89F94" }}>/month</span>
                )}
                {plan.price > 0 && interval === "annual" && (
                  <span className="text-sm ml-1" style={{ color: "#A89F94" }}>/year</span>
                )}
              </div>
              {sub && (
                <p className="text-xs mb-1" style={{ color: "#A89F94" }}>{sub}</p>
              )}
              {interval === "annual" && plan.price > 0 && (
                <p className="text-xs font-semibold mb-1" style={{ color: "#2D4A35" }}>
                  Save ${getAnnualSavings(key)}/yr
                </p>
              )}
              {plan.trialDays && !isCurrent && interval === "monthly" && (
                <p className="text-xs font-semibold mb-1" style={{ color: "#2D4A35" }}>
                  {plan.trialDays}-day free trial
                </p>
              )}
              <p className="text-xs mb-5" style={{ color: "#A89F94" }}>{plan.tagline}</p>

              {isCurrent ? (
                <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#F2EDE6", color: "#A89F94", cursor: "default" }}>
                  Current Plan
                </button>
              ) : isUpgrade ? (
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={!!loadingPlan}
                  className="btn-copper w-full flex items-center justify-center gap-2"
                  style={{ padding: "10px 20px" }}>
                  {loadingPlan === key ? (
                    <><Loader2 size={15} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles size={15} /> {plan.trialDays && interval === "monthly" ? `Start ${plan.trialDays}-Day Free Trial` : `Upgrade to ${plan.name}`}</>
                  )}
                </button>
              ) : (
                <button disabled className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#F2EDE6", color: "#A89F94", cursor: "default" }}>
                  {isDowngrade ? "Downgrade" : "Free Plan"}
                </button>
              )}

              <ul className="mt-5 space-y-2.5">
                {plan.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#4A4540" }}>
                    {item.includes("Everything in") ? (
                      <span className="text-xs font-semibold mt-2 w-full" style={{ color: colors.accent }}>
                        {item}
                      </span>
                    ) : (
                      <>
                        <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
                        {item}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="card p-6">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0E0C0A" }}>
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {[
            {
              q: "Can I change plans later?",
              a: "Yes! You can upgrade or downgrade at any time. When upgrading, you'll be charged the prorated difference. When downgrading, your current plan continues until the end of the billing period.",
            },
            {
              q: "What happens to my data if I downgrade?",
              a: "Your data is never deleted. If you exceed the limits of your new plan, you won't be able to create new items until you're within the limits, but existing items remain accessible.",
            },
            {
              q: "Is there a free trial?",
              a: "Yes! The Pro plan comes with a 14-day free trial on the monthly plan — no charge until the trial ends. The Starter plan is also free forever with basic features.",
            },
            {
              q: "How does billing work?",
              a: "Plans are billed monthly or annually. Annual billing saves you 2 months per year. You can cancel anytime from Settings > Billing. Payments are securely processed through Stripe.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="py-3" style={{ borderBottom: "1px solid #F2EDE6" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "#0E0C0A" }}>{q}</p>
              <p className="text-xs leading-relaxed" style={{ color: "#A89F94" }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
