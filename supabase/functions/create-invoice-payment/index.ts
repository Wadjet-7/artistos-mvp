// Supabase Edge Function: create-invoice-payment
// Creates a one-time Stripe Checkout session for an invoice — zero npm/esm imports

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
    const { invoiceId, userId } = await req.json()

    if (!invoiceId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing invoiceId or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Fetch invoice from Supabase REST API
    const invRes = await fetch(
      `${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoiceId}&user_id=eq.${userId}&select=*`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const invoices = await invRes.json()
    const invoice = invoices?.[0]

    if (!invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (invoice.status === "paid") {
      return new Response(
        JSON.stringify({ error: "Invoice is already paid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Stripe requires amount in cents
    const amountCents = Math.round(parseFloat(invoice.amount) * 100)

    if (amountCents < 50) {
      return new Response(
        JSON.stringify({ error: "Amount must be at least $0.50" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Fetch artist name from profiles
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=name`,
      {
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const profiles = await profileRes.json()
    const artistName = profiles?.[0]?.name || "Artist"

    // Build origin for success/cancel URLs
    const origin = req.headers.get("origin") || "https://artistos-mvp.vercel.app"

    // Create Stripe Checkout Session — mode: "payment" (one-time)
    const params = new URLSearchParams({
      mode: "payment",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(amountCents),
      "line_items[0][price_data][product_data][name]": invoice.description || "Art Commission",
      "line_items[0][price_data][product_data][description]": `Invoice from ${artistName}`,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/invoice/success?invoice_id=${invoiceId}`,
      cancel_url: `${origin}/invoice/cancelled`,
      "metadata[type]": "invoice_payment",
      "metadata[invoice_id]": invoiceId,
      "metadata[user_id]": userId,
    })

    // Pre-fill client email if available
    if (invoice.client_email) {
      params.set("customer_email", invoice.client_email)
    }

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })
    const session = await sessionRes.json()

    if (session.error) {
      throw new Error(session.error.message)
    }

    // Save session ID and checkout URL to the invoice
    const updateData: Record<string, unknown> = {
      stripe_session_id: session.id,
      stripe_payment_url: session.url,
    }

    // Auto-promote draft to pending when payment link is created
    if (invoice.status === "draft") {
      updateData.status = "pending"
    }

    await fetch(
      `${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoiceId}`,
      {
        method: "PATCH",
        headers: {
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify(updateData),
      }
    )

    console.log(`Payment link created for invoice ${invoiceId}: ${session.url}`)

    return new Response(
      JSON.stringify({ sessionId: session.id, checkoutUrl: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Invoice payment error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
