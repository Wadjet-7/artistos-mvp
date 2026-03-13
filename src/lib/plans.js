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
    price: 19,
    priceLabel: "$19/mo",
    tagline: "For serious working artists",
    stripePriceId: null,
    paymentLink: import.meta.env.VITE_STRIPE_PRO_LINK || "",
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
    ],
  },
  studio: {
    name: "Studio",
    price: 49,
    priceLabel: "$49/mo",
    tagline: "Unlimited creative business platform",
    stripePriceId: null,
    paymentLink: import.meta.env.VITE_STRIPE_STUDIO_LINK || "",
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
    },
    highlights: [
      "Unlimited artworks",
      "Unlimited viewing rooms",
      "Everything in Pro, plus:",
      "AI-powered tools",
      "Unlimited contacts & invoices",
      "Priority support",
      "Early access to new features",
    ],
  },
}

/**
 * Check if a plan has access to a specific feature
 * @param {string} planName - lowercase plan name (starter, pro, studio)
 * @param {string} feature - feature key (analytics, socialScheduler, etc.)
 * @returns {boolean}
 */
export function canAccess(planName, feature) {
  const plan = PLANS[planName?.toLowerCase()] || PLANS.starter
  return plan.features[feature] ?? false
}

/**
 * Check if the user has reached a resource limit
 * @param {string} planName - lowercase plan name
 * @param {string} resource - resource key (artworks, viewingRooms, contacts, invoices)
 * @param {number} currentCount - current number of items
 * @returns {boolean} true if at or over limit
 */
export function isAtLimit(planName, resource, currentCount) {
  const plan = PLANS[planName?.toLowerCase()] || PLANS.starter
  const limit = plan.limits[resource]
  if (limit === Infinity) return false
  return currentCount >= limit
}

/**
 * Get the limits for a plan
 * @param {string} planName - lowercase plan name
 * @returns {object} limits object
 */
export function getPlanLimits(planName) {
  const plan = PLANS[planName?.toLowerCase()] || PLANS.starter
  return plan.limits
}

/**
 * Get the minimum plan needed for a feature
 * @param {string} feature - feature key
 * @returns {string} plan name
 */
export function getMinimumPlan(feature) {
  if (PLANS.starter.features[feature]) return "starter"
  if (PLANS.pro.features[feature]) return "pro"
  return "studio"
}

/**
 * Get a formatted limit string
 * @param {number} limit
 * @returns {string}
 */
export function formatLimit(limit) {
  if (limit === Infinity) return "Unlimited"
  return limit.toLocaleString()
}

/**
 * Normalize plan name to lowercase
 * @param {string} plan
 * @returns {string}
 */
export function normalizePlan(plan) {
  if (!plan) return "starter"
  const lower = plan.toLowerCase().replace(/\s+plan$/i, "").trim()
  if (PLANS[lower]) return lower
  return "starter"
}
