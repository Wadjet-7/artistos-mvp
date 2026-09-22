import { supabase } from "./supabase"

export async function fetchActiveOpportunities() {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("is_active", true)
    .gte("deadline", today)
    .order("deadline", { ascending: true })
  if (error) throw error
  return data || []
}

export async function fetchMyMatches(userId) {
  const { data, error } = await supabase
    .from("opportunity_matches")
    .select("*, opportunity:opportunities(*)")
    .eq("user_id", userId)
    .order("match_score", { ascending: false })
  if (error) throw error
  return data || []
}

export async function refreshMatches(userId, artist) {
  const opportunities = await fetchActiveOpportunities()
  if (!opportunities.length) return []

  const { data, error } = await supabase.functions.invoke("ai-assistant", {
    body: {
      action: "match_opportunities",
      artist: {
        medium: artist.medium || "",
        style: artist.style || "",
        location: artist.location || "",
        bio: artist.bio || "",
        careerStage: artist.careerStage || "emerging",
        artworkCount: artist.artworkCount || 0,
        exhibitionCount: artist.exhibitionCount || 0,
      },
      opportunities: opportunities.map(o => ({
        id: o.id,
        title: o.title,
        organization: o.organization,
        type: o.opportunity_type,
        description: o.description,
        eligibility_notes: o.eligibility_notes,
        mediums: o.mediums,
        location_scope: o.location_scope,
        location_detail: o.location_detail,
        career_stage: o.career_stage,
        amount_max: o.amount_max,
        deadline: o.deadline,
      })),
    },
  })

  if (error) throw error
  const matches = data?.matches || []

  // Keep the user's own decisions: never downgrade saved / dismissed / applied back to "new".
  const { data: existing } = await supabase
    .from("opportunity_matches")
    .select("opportunity_id, status")
    .eq("user_id", userId)
  const keep = new Set((existing || []).filter(r => ["saved", "dismissed", "applied"].includes(r.status)).map(r => r.opportunity_id))

  const rows = matches
    .filter(m => !keep.has(m.id))
    .map(m => ({
      user_id: userId,
      opportunity_id: m.id,
      match_score: m.score,
      match_reason: m.reason,
      status: "new",
    }))

  if (rows.length) {
    const { error: upsertError } = await supabase
      .from("opportunity_matches")
      .upsert(rows, { onConflict: "user_id,opportunity_id" })
    if (upsertError) console.warn("[Opportunities] upsert warning:", upsertError)
  }

  // Re-score rows the user kept, without touching their status.
  for (const m of matches.filter(m => keep.has(m.id))) {
    await supabase
      .from("opportunity_matches")
      .update({ match_score: m.score, match_reason: m.reason })
      .eq("user_id", userId)
      .eq("opportunity_id", m.id)
  }

  return matches
}

export async function setMatchStatus(matchId, status) {
  const { error } = await supabase
    .from("opportunity_matches")
    .update({ status })
    .eq("id", matchId)
  if (error) throw error
}

export async function draftApplication(opportunity, artist, artworks) {
  const { data, error } = await supabase.functions.invoke("ai-assistant", {
    body: {
      action: "draft_application",
      opportunity: {
        title: opportunity.title,
        organization: opportunity.organization,
        description: opportunity.description,
        eligibility_notes: opportunity.eligibility_notes,
        amount_max: opportunity.amount_max,
      },
      artist: {
        name: artist.name || "",
        bio: artist.bio || "",
        artist_statement: artist.artist_statement || "",
        medium: artist.medium || "",
        style: artist.style || "",
        location: artist.location || "",
        cv_highlights: artist.cv_highlights || [],
      },
      artworks: (artworks || []).map(a => ({
        title: a.title,
        medium: a.medium,
        dimensions: a.dimensions || "",
        tag: a.tag || "",
      })),
    },
  })
  if (error) throw error
  return data
}

export async function saveApplication(payload) {
  const { data, error } = await supabase
    .from("opportunity_applications")
    .upsert(payload, { onConflict: "user_id,opportunity_id" })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchMyApplications(userId) {
  const { data, error } = await supabase
    .from("opportunity_applications")
    .select("*, opportunity:opportunities(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}
