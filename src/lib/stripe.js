/* ================================================================ */
/*  Stripe Client Initialization                                    */
/*  Loads Stripe.js from CDN and provides checkout redirect helper  */
/* ================================================================ */

import { supabase } from "./supabase"

// Stripe publishable key — set via env variable or after Stripe setup
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""

let stripePromise = null

/**
 * Load Stripe.js from CDN (no npm package needed)
 */
function loadStripeCDN(key) {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe(key))
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.stripe.com/v3/"
    script.onload = () => {
      if (window.Stripe) {
        resolve(window.Stripe(key))
      } else {
        reject(new Error("Stripe.js failed to load"))
      }
    }
    script.onerror = () => reject(new Error("Failed to load Stripe.js from CDN"))
    document.head.appendChild(script)
  })
}

export async function getStripe() {
  if (!stripePromise && STRIPE_KEY) {
    stripePromise = loadStripeCDN(STRIPE_KEY)
  }
  return stripePromise
}

/**
 * Redirect user to Stripe Checkout for a given plan
 * Calls Supabase Edge Function to create checkout session
 */
export async function redirectToCheckout({ planId, userId, userEmail }) {
  if (!STRIPE_KEY) {
    throw new Error("Stripe is not configured yet. Please follow STRIPE-SETUP.md to set up payments.")
  }

  // Call Supabase Edge Function to create a checkout session
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: {
      planId,
      userId,
      userEmail,
    },
  })

  if (error) throw error
  if (!data?.sessionId) throw new Error("Failed to create checkout session")

  // Redirect to Stripe Checkout
  const stripe = await getStripe()
  if (!stripe) throw new Error("Stripe failed to load")

  const { error: stripeError } = await stripe.redirectToCheckout({
    sessionId: data.sessionId,
  })

  if (stripeError) throw stripeError
}

/**
 * Redirect to Stripe Customer Portal for subscription management
 */
export async function redirectToCustomerPortal({ userId }) {
  if (!STRIPE_KEY) {
    throw new Error("Stripe is not configured. Please follow STRIPE-SETUP.md.")
  }

  const { data, error } = await supabase.functions.invoke("create-portal-session", {
    body: { userId },
  })

  if (error) throw error
  if (!data?.url) throw new Error("Failed to create portal session")

  window.location.href = data.url
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured() {
  return !!STRIPE_KEY
}
