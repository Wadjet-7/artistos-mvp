// Supabase Edge Function: check-stripe-connect
// Checks a Stripe Connect account status and updates the profile

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

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Fetch profile
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=stripe_account_id`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const profiles = await profileRes.json()
    const accountId = profiles?.[0]?.stripe_account_id

    if (!accountId) {
      return new Response(
        JSON.stringify({ status: "not_connected", charges_enabled: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Fetch account from Stripe
    const accountRes = await fetch(`https://api.stripe.com/v1/accounts/${accountId}`, {
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
      },
    })
    const account = await accountRes.json()

    if (account.error) {
      throw new Error(account.error.message)
    }

    // Determine status
    let status = "pending"
    if (account.charges_enabled) {
      status = "active"
    } else if (account.details_submitted) {
      status = "restricted"
    }

    // Update profile
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
        body: JSON.stringify({
          stripe_charges_enabled: account.charges_enabled,
          stripe_account_status: status,
        }),
      }
    )

    console.log(`Connect account ${accountId} status: ${status}, charges_enabled: ${account.charges_enabled}`)

    return new Response(
      JSON.stringify({ status, charges_enabled: account.charges_enabled }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Check Connect error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
