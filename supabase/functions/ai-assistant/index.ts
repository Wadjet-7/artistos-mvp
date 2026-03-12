// Supabase Edge Function: ai-assistant
// Calls OpenAI API via fetch — zero npm/esm imports

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const SYSTEM_PROMPTS: Record<string, string> = {
  describe_artwork: `You are a professional art curator writing gallery descriptions. Given artwork details, write a compelling 2-3 sentence description suitable for a catalog, viewing room, or gallery label. Be evocative but concise. Use art-world vocabulary naturally. Do not mention the artist's name. Focus on visual qualities, emotional resonance, and artistic technique.`,

  price_suggestion: `You are an art market analyst. Given artwork details and optionally the artist's existing price history, suggest a realistic price range. Consider the medium, dimensions (larger = more expensive), and market trends. Return a JSON object with: low (conservative), mid (fair market), high (gallery premium) as numbers, and a brief "reasoning" string (1-2 sentences). Example: {"low": 800, "mid": 1200, "high": 1800, "reasoning": "Oil on canvas at this size typically ranges $20-35/sq inch for emerging artists."}`,

  style_analysis: `You are an art critic analyzing an artist's portfolio. Given a list of artworks with their titles, mediums, and styles, identify patterns and provide market positioning insight. Return a JSON object with: "dominantStyle" (string), "themes" (array of 3-4 keywords), "marketPosition" (1-2 sentence assessment), "suggestions" (array of 2-3 actionable tips for the artist).`,

  bio_generator: `You are a professional art writer. Generate a compelling 3-4 sentence artist bio suitable for a gallery website or exhibition catalog. Write in third person. Mention the artist's medium, style, and location naturally. Be professional but warm. Do not fabricate exhibitions, awards, or credentials — only use the information provided.`,
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    const { action, data } = await req.json()

    if (!action || !SYSTEM_PROMPTS[action]) {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Build user prompt based on action
    let userPrompt = ""

    switch (action) {
      case "describe_artwork":
        userPrompt = `Title: "${data.title || "Untitled"}"
Medium: ${data.medium || "Mixed Media"}
Dimensions: ${data.dimensions || "Unknown"}
Style: ${data.style || "Contemporary"}
${data.artistBio ? `Artist context: ${data.artistBio}` : ""}`
        break

      case "price_suggestion":
        userPrompt = `Medium: ${data.medium || "Mixed Media"}
Dimensions: ${data.dimensions || "Unknown"}
Style: ${data.style || "Contemporary"}
${data.existingPrices?.length ? `Artist's existing prices: $${data.existingPrices.join(", $")}` : "No existing price history."}
Return ONLY valid JSON, no other text.`
        break

      case "style_analysis":
        const artList = (data.artworks || [])
          .slice(0, 20)
          .map((a: any, i: number) => `${i + 1}. "${a.title}" — ${a.medium}, ${a.style || "Contemporary"}`)
          .join("\n")
        userPrompt = `Portfolio (${data.artworks?.length || 0} works):\n${artList}\nReturn ONLY valid JSON, no other text.`
        break

      case "bio_generator":
        userPrompt = `Name: ${data.name || "The artist"}
Primary Medium: ${data.medium || "Mixed Media"}
Style: ${data.style || "Contemporary"}
Location: ${data.location || ""}
${data.existingBio ? `Current bio to improve: "${data.existingBio}"` : "No existing bio — write one from scratch."}`
        break
    }

    // Call OpenAI API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[action] },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const openaiData = await openaiRes.json()

    if (!openaiRes.ok) {
      throw new Error(openaiData.error?.message || "OpenAI API error")
    }

    const content = openaiData.choices?.[0]?.message?.content?.trim() || ""

    // Parse response based on action
    let result: any = {}

    if (action === "describe_artwork" || action === "bio_generator") {
      result = action === "describe_artwork"
        ? { description: content }
        : { bio: content }
    } else {
      // price_suggestion and style_analysis return JSON
      try {
        // Extract JSON from potential markdown code blocks
        const jsonStr = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
        result = JSON.parse(jsonStr)
      } catch {
        // Fallback if JSON parsing fails
        if (action === "price_suggestion") {
          result = { low: 500, mid: 1000, high: 2000, reasoning: content }
        } else {
          result = { dominantStyle: "Contemporary", themes: [], marketPosition: content, suggestions: [] }
        }
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("AI assistant error:", err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
