// Supabase Edge Function: create-checkout
// Creates a Stripe Checkout Session for plan upgrades
// Deploy: supabase functions deploy create-checkout

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
})

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Price IDs — set these after creating products in Stripe
const PRICE_IDS: Record<string, string> = {
  pro: Deno.env.get("STRIPE_PRO_PRICE_ID") || "",
  studio: Deno.env.get("STRIPE_STUDIO_PRICE_ID") || "",
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { planId, userId, userEmail } = await req.json()

    if (!planId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing planId or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const priceId = PRICE_IDS[planId]
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `No price configured for plan: ${planId}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Check if user already has a Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      })
      customerId = customer.id

      // Save customer ID
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId)
    }

    // Determine success/cancel URLs
    const origin = req.headers.get("origin") || "https://artistos-mvp.vercel.app"

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/upgrade/success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
      client_reference_id: userId,
      metadata: { planId, userId },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Checkout error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
