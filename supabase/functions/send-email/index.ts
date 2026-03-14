// Supabase Edge Function: send-email
// Sends transactional emails via Resend API — zero npm/esm imports

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Email templates — inline HTML with ArtistOS branding
function getTemplate(type: string, data: Record<string, string> = {}): { subject: string; html: string } {
  const header = `
    <div style="background: #0E0C0A; padding: 32px 24px 24px; text-align: center;">
      <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 24px; color: #B5651D; letter-spacing: 1px;">ArtistOS</h1>
    </div>`

  const footer = `
    <div style="background: #F5F0EB; padding: 20px 24px; text-align: center; font-size: 12px; color: #A89F94; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <p style="margin: 0;">ArtistOS — The All-in-One Creative Business Platform</p>
      <p style="margin: 8px 0 0;"><a href="https://artistos-mvp.vercel.app" style="color: #B5651D; text-decoration: none;">artistos-mvp.vercel.app</a></p>
    </div>`

  const wrap = (body: string) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; margin-top: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
        ${header}
        <div style="padding: 32px 24px;">${body}</div>
        ${footer}
      </div>
    </body>
    </html>`

  switch (type) {
    case "welcome":
      return {
        subject: "Welcome to ArtistOS!",
        html: wrap(`
          <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 22px; color: #0E0C0A;">Welcome to ArtistOS</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px;">Your all-in-one creative business platform is ready. Here's how to get started:</p>
          <div style="background: #FAF8F5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #0E0C0A;">Quick Start:</p>
            <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.8;">
              1. Upload your first artwork to your portfolio<br>
              2. Create a viewing room to share with collectors<br>
              3. Set up your artist profile and CV<br>
              4. Track invoices and manage contacts
            </p>
          </div>
          <a href="https://artistos-mvp.vercel.app/dashboard" style="display: inline-block; background: #B5651D; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Go to Dashboard</a>
        `),
      }

    case "viewing_room_shared":
      return {
        subject: `${data.artistName || "An artist"} shared a viewing room with you`,
        html: wrap(`
          <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 22px; color: #0E0C0A;">You've been invited to a Viewing Room</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px;"><strong>${data.artistName || "An artist"}</strong> has curated a selection of works for you to view.</p>
          ${data.roomTitle ? `<p style="color: #555; margin: 0 0 20px;"><em>"${data.roomTitle}"</em></p>` : ""}
          <a href="${data.roomUrl || "https://artistos-mvp.vercel.app"}" style="display: inline-block; background: #B5651D; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Collection</a>
          ${data.message ? `<div style="background: #FAF8F5; border-radius: 8px; padding: 16px; margin-top: 20px;"><p style="margin: 0; color: #555; font-size: 14px; font-style: italic;">"${data.message}"</p></div>` : ""}
        `),
      }

    case "invoice_reminder":
      return {
        subject: `Payment Reminder: Invoice from ${data.artistName || "ArtistOS"}`,
        html: wrap(`
          <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 22px; color: #0E0C0A;">Payment Reminder</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px;">This is a friendly reminder about an outstanding invoice.</p>
          <div style="background: #FAF8F5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 4px; font-size: 14px; color: #A89F94;">Invoice Details</p>
            <p style="margin: 0 0 4px; font-weight: 600; color: #0E0C0A;">${data.description || "Art Commission"}</p>
            <p style="margin: 0; font-family: Georgia, serif; font-size: 24px; color: #B5651D;">$${data.amount || "0"}</p>
            ${data.dueDate ? `<p style="margin: 8px 0 0; font-size: 13px; color: #C4705A;">Due: ${data.dueDate}</p>` : ""}
          </div>
          <p style="color: #555; font-size: 14px;">Please contact ${data.artistName || "the artist"} to arrange payment.</p>
        `),
      }

    case "invoice_payment":
      return {
        subject: `Invoice from ${data.artistName || "ArtistOS"} — Pay Online`,
        html: wrap(`
          <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 22px; color: #0E0C0A;">Invoice</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px;">
            ${data.artistName || "An artist"} has sent you an invoice. You can pay securely online using the button below.
          </p>
          <div style="background: #FAF8F5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 4px; font-size: 14px; color: #A89F94;">Invoice Details</p>
            <p style="margin: 0 0 4px; font-weight: 600; color: #0E0C0A;">${data.description || "Art Commission"}</p>
            <p style="margin: 0; font-family: Georgia, serif; font-size: 24px; color: #B5651D;">$${data.amount || "0"}</p>
            ${data.dueDate ? `<p style="margin: 8px 0 0; font-size: 13px; color: #C4705A;">Due: ${data.dueDate}</p>` : ""}
          </div>
          <div style="text-align: center; margin-bottom: 16px;">
            <a href="${data.paymentUrl || "#"}" style="display: inline-block; background: #B5651D; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Pay Now</a>
          </div>
          <p style="color: #A89F94; font-size: 12px; text-align: center;">Secure payment powered by Stripe</p>
        `),
      }

    case "commission_received":
      return {
        subject: `New Commission Request from ${data.clientName || "a collector"}`,
        html: wrap(`
          <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 22px; color: #0E0C0A;">New Commission Request</h2>
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px;">Great news! You've received a new commission inquiry.</p>
          <div style="background: #FAF8F5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; font-size: 14px;"><strong>From:</strong> ${data.clientName || "Anonymous"}</p>
            ${data.clientEmail ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>Email:</strong> ${data.clientEmail}</p>` : ""}
            ${data.budget ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>Budget:</strong> $${data.budget}</p>` : ""}
            ${data.description ? `<p style="margin: 0; font-size: 14px;"><strong>Details:</strong> ${data.description}</p>` : ""}
          </div>
          <a href="https://artistos-mvp.vercel.app/commissions" style="display: inline-block; background: #B5651D; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Commission</a>
        `),
      }

    default:
      return {
        subject: data.subject || "Message from ArtistOS",
        html: wrap(`<p style="color: #555; line-height: 1.6;">${data.html || data.message || ""}</p>`),
      }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "ArtistOS <onboarding@resend.dev>"

  try {
    const body = await req.json()
    const { to, type, data: templateData, subject: customSubject, html: customHtml } = body

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get template or use custom subject/html
    let subject: string
    let html: string

    if (type && type !== "custom") {
      const template = getTemplate(type, templateData || {})
      subject = template.subject
      html = template.html
    } else {
      subject = customSubject || "Message from ArtistOS"
      html = customHtml || ""
    }

    // Send via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    })

    const result = await resendRes.json()

    if (!resendRes.ok) {
      throw new Error(result.message || result.error || "Resend API error")
    }

    console.log(`Email sent: ${type || "custom"} to ${to}`)

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Email error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
