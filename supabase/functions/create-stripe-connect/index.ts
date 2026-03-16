// Supabase Edge Function: create-stripe-connect
// Creates a Stripe Connect Standard account and returns an Account Link URL for onboarding

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

    // Fetch profile to check if they already have a Connect account
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=stripe_account_id,email,name`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const profiles = await profileRes.json()
    const profile = profiles?.[0]

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let accountId = profile.stripe_account_id

    // Step 1: Create a new Stripe Connect Standard account if none exists
    if (!accountId) {
      const accountParams = new URLSearchParams({
        type: "standard",
        "metadata[supabase_user_id]": userId,
      })

      if (profile.email) {
        accountParams.set("email", profile.email)
      }

      const accountRes = await fetch("https://api.stripe.com/v1/accounts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: accountParams.toString(),
      })
      const account = await accountRes.json()

      if (account.error) {
        throw new Error(account.error.message)
      }

      accountId = account.id

      // Save the account ID to the profile
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
            stripe_account_id: accountId,
            stripe_account_status: "pending",
          }),
        }
      )

      console.log(`Created Connect account ${accountId} for user ${userId}`)
    }

    // Step 2: Create an Account Link for onboarding
    const origin = req.headers.get("origin") || "https://artistos-mvp.vercel.app"

    const linkParams = new URLSearchParams({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${origin}/settings?stripe_connect=refresh`,
      return_url: `${origin}/settings?stripe_connect=complete`,
    })

    const linkRes = await fetch("https://api.stripe.com/v1/account_links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: linkParams.toString(),
    })
    const link = await linkRes.json()

    if (link.error) {
      throw new Error(link.error.message)
    }

    return new Response(
      JSON.stringify({ url: link.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Stripe Connect error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
