/* ================================================================ */
/*  Promo & Attribution Helpers                                      */
/*  Captures ?ref= / ?code= from any landing URL, stores them, and   */
/*  redeems promo codes via the redeem_promo_code RPC (phase 21).    */
/* ================================================================ */

import { supabase } from "./supabase"

const REF_KEY = "aos_ref"
const PROMO_KEY = "aos_promo"

/**
 * Call once on app load (any page). Persists ?ref= and ?code=/?promo=
 * so they survive navigation until signup.
 */
export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("ref")
    const code = params.get("code") || params.get("promo")
    if (ref) localStorage.setItem(REF_KEY, ref.slice(0, 64))
    if (code) localStorage.setItem(PROMO_KEY, code.toUpperCase().slice(0, 32))
  } catch {
    // non-critical
  }
}

/** Read stored attribution for signup. */
export function getStoredAttribution() {
  try {
    return {
      source: localStorage.getItem(REF_KEY) || "",
      promo: localStorage.getItem(PROMO_KEY) || "",
    }
  } catch {
    return { source: "", promo: "" }
  }
}

/** Clear the stored promo after it has been consumed. */
export function clearStoredAttribution() {
  try {
    localStorage.removeItem(REF_KEY)
    localStorage.removeItem(PROMO_KEY)
  } catch {
    // non-critical
  }
}

/**
 * Redeem a promo code for the signed-in user.
 * Returns { success, plan, months } or { success: false, error }.
 */
export async function redeemPromoCode(code) {
  const { data, error } = await supabase.rpc("redeem_promo_code", { p_code: code })
  if (error) return { success: false, error: error.message }
  return data || { success: false, error: "no_response" }
}
