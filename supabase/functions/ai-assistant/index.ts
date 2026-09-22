// Supabase Edge Function: ai-assistant
// Calls OpenAI API via fetch — zero npm/esm imports
//
// Actions:
//   describe_artwork, price_suggestion, style_analysis, bio_generator   (payload under `data`)
//   match_opportunities, draft_application                              (payload at top level — Phase 24)
//
// Guardrails (Phase 24): the model only RANKS opportunities we pass it — it never invents
// listings, and it must never fabricate exhibitions, awards, or credentials in drafts.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const US_STATES: Record<string, string> = {
  al:"alabama", ak:"alaska", az:"arizona", ar:"arkansas", ca:"california", co:"colorado", ct:"connecticut", de:"delaware",
  fl:"florida", ga:"georgia", hi:"hawaii", id:"idaho", il:"illinois", in:"indiana", ia:"iowa", ks:"kansas", ky:"kentucky",
  la:"louisiana", me:"maine", md:"maryland", ma:"massachusetts", mi:"michigan", mn:"minnesota", ms:"mississippi", mo:"missouri",
  mt:"montana", ne:"nebraska", nv:"nevada", nh:"new hampshire", nj:"new jersey", nm:"new mexico", ny:"new york", nc:"north carolina",
  nd:"north dakota", oh:"ohio", ok:"oklahoma", or:"oregon", pa:"pennsylvania", ri:"rhode island", sc:"south carolina", sd:"south dakota",
  tn:"tennessee", tx:"texas", ut:"utah", vt:"vermont", va:"virginia", wa:"washington", wv:"west virginia", wi:"wisconsin", wy:"wyoming", dc:"district of columbia",
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })

const SYSTEM_PROMPTS: Record<string, string> = {
  describe_artwork: `You are a professional art curator writing gallery descriptions. Given artwork details, write a compelling 2-3 sentence description suitable for a catalog, viewing room, or gallery label. Be evocative but concise. Use art-world vocabulary naturally. Do not mention the artist's name. Focus on visual qualities, emotional resonance, and artistic technique.`,

  price_suggestion: `You are an art market analyst. Given artwork details and optionally the artist's existing price history, suggest a realistic price range. Consider the medium, dimensions (larger = more expensive), and market trends. Return a JSON object with: low (conservative), mid (fair market), high (gallery premium) as numbers, and a brief "reasoning" string (1-2 sentences). Example: {"low": 800, "mid": 1200, "high": 1800, "reasoning": "Oil on canvas at this size typically ranges $20-35/sq inch for emerging artists."}`,

  style_analysis: `You are an art critic analyzing an artist's portfolio. Given a list of artworks with their titles, mediums, and styles, identify patterns and provide market positioning insight. Return a JSON object with: "dominantStyle" (string), "themes" (array of 3-4 keywords), "marketPosition" (1-2 sentence assessment), "suggestions" (array of 2-3 actionable tips for the artist).`,

  bio_generator: `You are a professional art writer. Generate a compelling 3-4 sentence artist bio suitable for a gallery website or exhibition catalog. Write in third person. Mention the artist's medium, style, and location naturally. Be professional but warm. Do not fabricate exhibitions, awards, or credentials — only use the information provided.`,

  match_opportunities: `You are a grants advisor for working visual artists. You will receive an artist profile and a list of opportunities (grants, residencies, fellowships, awards). Rank ONLY the opportunities provided — never invent, rename, or add opportunities. For each opportunity, score 0-100 how well the artist fits, weighing: medium match (heavily), location eligibility (a state/local program the artist is not in should score below 30), career stage, and eligibility notes. Return ONLY valid JSON of the form {"matches":[{"id":"<opportunity id exactly as given>","score":<0-100>,"reason":"<one line, max 120 chars, plain language, e.g. 'Louisiana resident · oil painter · fits emerging stage'>"}]}. Score every opportunity; include every one with score >= 30 (only omit clearly ineligible ones). Sort by score descending. No prose outside the JSON.`,

  draft_application: `You are helping a working artist draft a grant or residency application. Write in first person, in a confident, specific, plain voice — no clichés like "passionate" or "unique vision". Use ONLY facts given in the artist profile, CV highlights, and artworks list. Never fabricate exhibitions, awards, press, sales, education, or dates; if something is unknown, leave a bracketed placeholder like [year]. Return ONLY valid JSON with four string fields: "artist_statement" (120-180 words), "project_description" (150-220 words, tied to what this specific opportunity funds), "bio" (80-120 words, third person), "why_this_opportunity" (80-120 words, referencing the organization by name). No prose outside the JSON.`,
}

function extractJson(content: string) {
  const s = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
  try {
    return JSON.parse(s)
  } catch {
    // last resort: take the outermost {...}
    const m = s.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error("Model did not return JSON")
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
  if (!OPENAI_API_KEY) return json({ error: "OpenAI API key not configured" }, 500)

  try {
    const body = await req.json()
    const action = body.action
    // Legacy actions send their payload under `data`; Phase 24 actions send it at the top level.
    const data = body.data ?? body

    if (!action || !SYSTEM_PROMPTS[action]) {
      return json({ error: `Unknown action: ${action}` }, 400)
    }

    let userPrompt = ""
    let maxTokens = 500
    let temperature = 0.7

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

      case "style_analysis": {
        const artList = (data.artworks || [])
          .slice(0, 20)
          .map((a: any, i: number) => `${i + 1}. "${a.title}" — ${a.medium}, ${a.style || "Contemporary"}`)
          .join("\n")
        userPrompt = `Portfolio (${data.artworks?.length || 0} works):\n${artList}\nReturn ONLY valid JSON, no other text.`
        break
      }

      case "bio_generator":
        userPrompt = `Name: ${data.name || "The artist"}
Primary Medium: ${data.medium || "Mixed Media"}
Style: ${data.style || "Contemporary"}
Location: ${data.location || ""}
${data.existingBio ? `Current bio to improve: "${data.existingBio}"` : "No existing bio — write one from scratch."}`
        break

      case "match_opportunities": {
        const a = data.artist || {}
        const opps = (data.opportunities || []).slice(0, 60)
        if (!opps.length) return json({ matches: [] })
        const oppList = opps
          .map((o: any) =>
            `- id: ${o.id}\n  title: ${o.title} (${o.organization})\n  type: ${o.type}\n  mediums: ${(o.mediums || []).join(", ") || "any"}\n  location: ${o.location_scope}${o.location_detail ? " — " + o.location_detail : ""}\n  career_stage: ${o.career_stage || "any"}\n  eligibility: ${o.eligibility_notes || "n/a"}\n  deadline: ${o.deadline || "n/a"}`
          )
          .join("\n")
        userPrompt = `ARTIST
Medium: ${a.medium || "unknown"}
Style: ${a.style || "unknown"}
Location: ${a.location || "unknown"}
Career stage: ${a.careerStage || "emerging"}
Artworks in portfolio: ${a.artworkCount ?? 0}
Exhibitions: ${a.exhibitionCount ?? 0}
Bio: ${a.bio || "n/a"}

OPPORTUNITIES (rank only these, use the ids exactly)
${oppList}

Return ONLY the JSON object.`
        maxTokens = 1500
        temperature = 0.2
        break
      }

      case "draft_application": {
        const o = data.opportunity || {}
        const a = data.artist || {}
        const works = (data.artworks || [])
          .slice(0, 6)
          .map((w: any) => `- "${w.title}" — ${w.medium}${w.dimensions ? ", " + w.dimensions : ""}${w.tag ? " (" + w.tag + ")" : ""}`)
          .join("\n")
        const cv = (a.cv_highlights || []).slice(0, 10).map((h: any) => `- ${typeof h === "string" ? h : JSON.stringify(h)}`).join("\n")
        userPrompt = `OPPORTUNITY
${o.title} — ${o.organization}
${o.description || ""}
Eligibility: ${o.eligibility_notes || "n/a"}
${o.amount_max ? `Award up to $${o.amount_max}` : ""}

ARTIST
Name: ${a.name || "[name]"}
Location: ${a.location || "[location]"}
Medium: ${a.medium || "[medium]"}
Style: ${a.style || ""}
Bio: ${a.bio || "n/a"}
Artist statement: ${a.artist_statement || "n/a"}
CV highlights:
${cv || "- none provided"}

ARTWORKS TO REFERENCE
${works || "- none selected"}

Return ONLY the JSON object with the four fields.`
        maxTokens = 1800
        temperature = 0.5
        break
      }
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[action] },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        ...(action === "match_opportunities" || action === "draft_application"
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
    })

    const openaiData = await openaiRes.json()
    if (!openaiRes.ok) throw new Error(openaiData.error?.message || "OpenAI API error")

    const content = openaiData.choices?.[0]?.message?.content?.trim() || ""
    let result: any = {}

    if (action === "describe_artwork") {
      result = { description: content }
    } else if (action === "bio_generator") {
      result = { bio: content }
    } else if (action === "match_opportunities") {
      const parsed = extractJson(content)
      const oppById = new Map((data.opportunities || []).map((o: any) => [String(o.id), o]))
      // Artist location → set of comparable tokens ("new orleans, la" → new orleans, la, louisiana)
      const artistLocRaw = String(data.artist?.location || "").toLowerCase().trim()
      const artistTokens = new Set<string>()
      for (const part of artistLocRaw.split(/[,/;]/).map((p) => p.trim()).filter(Boolean)) {
        artistTokens.add(part)
        if (US_STATES[part]) artistTokens.add(US_STATES[part])           // abbreviation → full name
        const abbr = Object.keys(US_STATES).find((k) => US_STATES[k] === part)
        if (abbr) artistTokens.add(abbr)                                 // full name → abbreviation
      }
      // Deterministic eligibility check the model can't override. Returns:
      //   "ok" | "mismatch" | "unknown" (artist has no location set)
      const locationCheck = (o: any): "ok" | "mismatch" | "unknown" => {
        const scope = String(o.location_scope || "").toLowerCase()
        if (!["state", "local", "regional"].includes(scope)) return "ok"
        const detail = String(o.location_detail || "").toLowerCase()
        if (!detail) return "ok"
        if (!artistLocRaw) return "unknown"
        const detailTokens = detail.split(/[,/;·]| and /).map((t) => t.trim()).filter((t) => t.length > 1)
        const expanded = new Set<string>(detailTokens)
        for (const t of detailTokens) { if (US_STATES[t]) expanded.add(US_STATES[t]) }
        for (const t of expanded) {
          for (const a of artistTokens) { if (t === a || t.includes(a) || a.includes(t)) return "ok" }
        }
        return "mismatch"
      }
      // Guardrail: drop anything the model invented; clamp scores; enforce location.
      const matches = (parsed.matches || [])
        .filter((m: any) => oppById.has(String(m.id)))
        .map((m: any) => {
          const o = oppById.get(String(m.id))
          let score = Math.max(0, Math.min(100, Math.round(Number(m.score) || 0)))
          let reason = String(m.reason || "").slice(0, 160)
          const chk = locationCheck(o)
          if (chk === "mismatch") {
            score = Math.min(score, 25)
            reason = `Location-restricted (${o.location_detail}) — ` + reason
          } else if (chk === "unknown") {
            score = Math.min(score, 45)
            reason = `Add your location in Settings to confirm eligibility (${o.location_detail}) — ` + reason
          }
          return { id: String(m.id), score, reason: reason.slice(0, 160) }
        })
        .filter((m: any) => m.score >= 30)
        .sort((x: any, y: any) => y.score - x.score)
      result = { matches }
    } else if (action === "draft_application") {
      const parsed = extractJson(content)
      result = {
        artist_statement: String(parsed.artist_statement || ""),
        project_description: String(parsed.project_description || ""),
        bio: String(parsed.bio || ""),
        why_this_opportunity: String(parsed.why_this_opportunity || ""),
      }
    } else {
      try {
        result = extractJson(content)
      } catch {
        result = action === "price_suggestion"
          ? { low: 500, mid: 1000, high: 2000, reasoning: content }
          : { dominantStyle: "Contemporary", themes: [], marketPosition: content, suggestions: [] }
      }
    }

    return json(result)
  } catch (err) {
    console.error("AI assistant error:", err)
    return json({ error: (err as Error).message }, 500)
  }
})
