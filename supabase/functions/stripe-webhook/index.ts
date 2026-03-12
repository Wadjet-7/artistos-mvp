// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events to update subscription status
// Deploy: supabase functions deploy stripe-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
})

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!
const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Map Stripe Price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  [Deno.env.get("STRIPE_PRO_PRICE_ID") || ""]: "pro",
  [Deno.env.get("STRIPE_STUDIO_PRICE_ID") || ""]: "studio",
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return new Response("Missing signature", { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log(`Received event: ${event.type}`)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.userId
        const subscriptionId = session.subscription as string

        if (!userId) {
          console.error("No userId found in checkout session")
          break
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price?.id || ""
        const planName = PRICE_TO_PLAN[priceId] || session.metadata?.planId || "pro"

        await supabase.from("profiles").update({
          plan: planName,
          subscription_id: subscriptionId,
          subscription_status: "active",
          plan_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          stripe_customer_id: session.customer as string,
        }).eq("id", userId)

        console.log(`User ${userId} upgraded to ${planName}`)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!profile) {
          console.error("No profile found for customer:", customerId)
          break
        }

        const priceId = subscription.items.data[0]?.price?.id || ""
        const planName = PRICE_TO_PLAN[priceId] || "pro"

        await supabase.from("profiles").update({
          plan: subscription.status === "active" ? planName : "starter",
          subscription_status: subscription.status,
          plan_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq("id", profile.id)

        console.log(`Subscription updated for ${profile.id}: ${subscription.status}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (!profile) {
          console.error("No profile found for customer:", customerId)
          break
        }

        // Downgrade to starter
        await supabase.from("profiles").update({
          plan: "starter",
          subscription_status: "canceled",
          subscription_id: null,
        }).eq("id", profile.id)

        console.log(`Subscription canceled for ${profile.id}, downgraded to starter`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    return new Response(`Webhook handler error: ${err.message}`, { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
