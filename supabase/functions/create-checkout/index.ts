// Supabase Edge Function: create-checkout
// Uses only fetch — zero npm/esm imports

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

  const PRICE_IDS: Record<string, string> = {
    pro: Deno.env.get("STRIPE_PRO_PRICE_ID") || "",
    studio: Deno.env.get("STRIPE_STUDIO_PRICE_ID") || "",
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

    // Get user profile from Supabase REST API
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=stripe_customer_id`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const profiles = await profileRes.json()
    let customerId = profiles?.[0]?.stripe_customer_id

    // Create Stripe customer if needed
    if (!customerId) {
      const custRes = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: userEmail || "",
          "metadata[supabase_user_id]": userId,
        }).toString(),
      })
      const customer = await custRes.json()
      customerId = customer.id

      // Save customer ID to profile
      await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({ stripe_customer_id: customerId }),
        }
      )
    }

    const origin = req.headers.get("origin") || "https://artistos-mvp.vercel.app"

    // Create Stripe Checkout Session
    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: customerId,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        mode: "subscription",
        success_url: `${origin}/upgrade/success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/upgrade`,
        client_reference_id: userId,
        "metadata[planId]": planId,
        "metadata[userId]": userId,
        ...(planId === "pro" ? { "subscription_data[trial_period_days]": "14" } : {}),
      }).toString(),
    })
    const session = await sessionRes.json()

    if (session.error) {
      throw new Error(session.error.message)
    }

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
