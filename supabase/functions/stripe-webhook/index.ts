// Supabase Edge Function: stripe-webhook
// Uses only fetch — zero npm/esm imports

Deno.serve(async (req) => {
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

  const PRICE_TO_PLAN: Record<string, string> = {
    [Deno.env.get("STRIPE_PRO_PRICE_ID") || ""]: "pro",
    [Deno.env.get("STRIPE_STUDIO_PRICE_ID") || ""]: "studio",
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return new Response("Missing signature", { status: 400 })
  }

  const body = await req.text()

  // Verify webhook signature using Web Crypto
  try {
    const parts = signature.split(",")
    let timestamp = ""
    let signatures: string[] = []
    for (const part of parts) {
      const [key, value] = part.trim().split("=")
      if (key === "t") timestamp = value
      if (key === "v1") signatures.push(value)
    }

    const signedPayload = `${timestamp}.${body}`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(STRIPE_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload))
    const expectedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    if (!signatures.includes(expectedSig)) {
      console.error("Invalid webhook signature")
      return new Response("Invalid signature", { status: 400 })
    }
  } catch (err) {
    console.error("Signature verification error:", err)
    return new Response("Signature verification failed", { status: 400 })
  }

  const event = JSON.parse(body)
  console.log(`Received event: ${event.type}`)

  // Helper: update profile via Supabase REST
  async function updateProfile(filter: string, data: Record<string, unknown>) {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?${filter}`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(data),
    })
  }

  // Helper: get profile via Supabase REST
  async function getProfile(filter: string) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?${filter}&select=id`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const rows = await res.json()
    return rows?.[0] || null
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.client_reference_id || session.metadata?.userId
        const subscriptionId = session.subscription

        if (!userId) {
          console.error("No userId in checkout session")
          break
        }

        // Get subscription from Stripe REST
        const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
          headers: { "Authorization": `Bearer ${STRIPE_SECRET_KEY}` },
        })
        const subscription = await subRes.json()
        const priceId = subscription.items?.data?.[0]?.price?.id || ""
        const planName = PRICE_TO_PLAN[priceId] || session.metadata?.planId || "pro"

        await updateProfile(`id=eq.${userId}`, {
          plan: planName,
          subscription_id: subscriptionId,
          subscription_status: "active",
          plan_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_customer_id: session.customer,
        })

        console.log(`User ${userId} upgraded to ${planName}`)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object
        const customerId = subscription.customer
        const profile = await getProfile(`stripe_customer_id=eq.${customerId}`)

        if (!profile) {
          console.error("No profile for customer:", customerId)
          break
        }

        const priceId = subscription.items?.data?.[0]?.price?.id || ""
        const planName = PRICE_TO_PLAN[priceId] || "pro"

        await updateProfile(`id=eq.${profile.id}`, {
          plan: subscription.status === "active" ? planName : "starter",
          subscription_status: subscription.status,
          plan_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })

        console.log(`Subscription updated for ${profile.id}: ${subscription.status}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object
        const customerId = subscription.customer
        const profile = await getProfile(`stripe_customer_id=eq.${customerId}`)

        if (!profile) {
          console.error("No profile for customer:", customerId)
          break
        }

        await updateProfile(`id=eq.${profile.id}`, {
          plan: "starter",
          subscription_status: "canceled",
          subscription_id: null,
        })

        console.log(`Subscription canceled for ${profile.id}`)
        break
      }

      default:
        console.log(`Unhandled event: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
