/* ================================================================ */
/*  Plan Configuration & Gating Logic                               */
/*  Central source of truth for plan tiers, limits, and features    */
/* ================================================================ */

export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    priceLabel: "Free",
    tagline: "Get started with the essentials",
    limits: {
      artworks: 25,
      viewingRooms: 3,
      contacts: 20,
      invoices: 10,
    },
    features: {
      analytics: false,
      socialScheduler: false,
      exhibitions: false,
      consignments: false,
      catalog: false,
      ai: false,
      artistWebsite: false,
      careerAnalytics: false,
      provenance: false,
      editions: false,
      appraisal: false,
      consignmentMap: false,
      grantEngine: false,
    },
    highlights: [
      "Up to 25 artworks",
      "3 viewing rooms",
      "Contract generator",
      "Invoice tracking (10)",
      "Commission management",
      "Messaging system",
      "Artist CV builder",
      "QR code generator",
    ],
  },
  pro: {
    name: "Pro",
    price: 29,
    priceLabel: "$29/mo",
    priceAnnual: 290,
    priceAnnualLabel: "$290/yr",
    trialDays: 14,
    tagline: "For the working artist",
    stripePriceId: null,
    paymentLink: import.meta.env.VITE_STRIPE_PRO_LINK || "",
    paymentLinkAnnual: import.meta.env.VITE_STRIPE_PRO_ANNUAL_LINK || "",
    limits: {
      artworks: 200,
      viewingRooms: 25,
      contacts: 500,
      invoices: 100,
    },
    features: {
      analytics: true,
      socialScheduler: true,
      exhibitions: true,
      consignments: true,
      catalog: true,
      ai: true,
      artistWebsite: true,
      careerAnalytics: false,
      provenance: false,
      editions: false,
      appraisal: false,
      consignmentMap: false,
      grantEngine: false,
    },
    highlights: [
      "Up to 200 artworks",
      "25 viewing rooms",
      "Everything in Starter, plus:",
      "Market analytics",
      "AI-powered tools",
      "Social media scheduler",
      "Exhibition planner",
      "Consignment tracker",
      "PDF catalog export",
      "Expense tracking",
      "Artist website & themes",
    ],
  },
  studio: {
    name: "Studio",
    price: 120,
    priceLabel: "$120/mo",
    priceAnnual: 1200,
    priceAnnualLabel: "$1,200/yr",
    tagline: "For the artist whose work is an asset",
    stripePriceId: null,
    paymentLink: import.meta.env.VITE_STRIPE_STUDIO_LINK || "",
    paymentLinkAnnual: import.meta.env.VITE_STRIPE_STUDIO_ANNUAL_LINK || "",
    limits: {
      artworks: Infinity,
      viewingRooms: Infinity,
      contacts: Infinity,
      invoices: Infinity,
    },
    features: {
      analytics: true,
      socialScheduler: true,
      exhibitions: true,
      consignments: true,
      catalog: true,
      ai: true,
      artistWebsite: true,
      careerAnalytics: true,
      provenance: true,
      editions: true,
      appraisal: true,
      consignmentMap: true,
      grantEngine: true,
    },
    highlights: [
      "Everything in Pro, unlimited",
      "Grant & opportunity engine",
      "Provenance & archive records",
      "Editions & print management",
      "Insurance & appraisal reports",
      "Consignment map",
      "Career analytics",
      "Personal onboarding & quarterly review",
    ],
  },
}

export const LEGACY_PRICES = { pro: 19, studio: 49 }

const STUDIO_FEATURE_LABELS = {
  careerAnalytics: "Career analytics",
  provenance: "Provenance & archive",
  editions: "Editions & print management",
  appraisal: "Insurance & appraisal reports",
  consignmentMap: "Consignment map",
  grantEngine: "Grant & opportunity engine",
}

export function getStudioFeatureLabel(feature) {
  return STUDIO_FEATURE_LABELS[feature] || feature
}

export function canAccess(planName, feature) {
  const plan = PLANS[planName?.toLowerCase()] || PLANS.starter
  return plan.features[feature] ?? false
}

export function isAtLimit(planName, resource, currentCount) {
  const plan = PLANS[planName?.toLowerCase()] || PLANS.starter
  const limit = plan.limits[resource]
  if (limit === Infinity) return false
  return currentCount >= limit
}

export function getPlanLimits(planName) {
  const plan = PLANS[planName?.toLowerCase()] || PLANS.starter
  return plan.limits
}

export function getMinimumPlan(feature) {
  if (PLANS.starter.features[feature]) return "starter"
  if (PLANS.pro.features[feature]) return "pro"
  return "studio"
}

export function formatLimit(limit) {
  if (limit === Infinity) return "Unlimited"
  return limit.toLocaleString()
}

export function normalizePlan(plan) {
  if (!plan) return "starter"
  const lower = plan.toLowerCase().replace(/\s+plan$/i, "").trim()
  if (PLANS[lower]) return lower
  return "starter"
}

export function getPrice(planName, interval = "monthly", user = null) {
  const plan = PLANS[planName?.toLowerCase()]
  if (!plan || plan.price === 0) return 0
  const key = planName.toLowerCase()
  if (user?.legacy_pricing && user.plan?.toLowerCase() === key) {
    return LEGACY_PRICES[key] || plan.price
  }
  return interval === "annual" ? plan.priceAnnual : plan.price
}

export function getAnnualSavings(planName) {
  const plan = PLANS[planName?.toLowerCase()]
  if (!plan || plan.price === 0) return 0
  return (plan.price * 12) - plan.priceAnnual
}

export function getPaymentLinkFor(planName, interval = "monthly") {
  const plan = PLANS[planName?.toLowerCase()]
  if (!plan) return ""
  return interval === "annual" ? (plan.paymentLinkAnnual || "") : (plan.paymentLink || "")
}

export function isLegacyPricing(user) {
  return !!user?.legacy_pricing
}
