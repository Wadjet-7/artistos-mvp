/* ================================================================ */
/*  AI Helper Functions                                            */
/*  Client-side wrappers for the ai-assistant edge function        */
/* ================================================================ */

import { supabase } from "./supabase"

/**
 * Call the AI assistant edge function
 * @param {string} action - One of: describe_artwork, price_suggestion, style_analysis, bio_generator
 * @param {object} data - Action-specific data payload
 * @returns {Promise<object>} AI response
 */
async function callAI(action, data) {
  const { data: result, error } = await supabase.functions.invoke("ai-assistant", {
    body: { action, data },
  })

  if (error) throw error
  if (result?.error) throw new Error(result.error)
  return result
}

/**
 * Generate a gallery-quality artwork description
 * @param {object} artwork - { title, medium, dimensions, style, artistBio }
 * @returns {Promise<string>} Generated description
 */
export async function generateArtworkDescription(artwork) {
  const result = await callAI("describe_artwork", {
    title: artwork.title,
    medium: artwork.medium,
    dimensions: artwork.dimensions,
    style: artwork.style || "Contemporary",
    artistBio: artwork.artistBio || "",
  })
  return result.description || ""
}

/**
 * Get AI-suggested pricing for an artwork
 * @param {object} artwork - { medium, dimensions, style, existingPrices }
 * @returns {Promise<{ low: number, mid: number, high: number, reasoning: string }>}
 */
export async function suggestPricing(artwork) {
  const result = await callAI("price_suggestion", {
    medium: artwork.medium,
    dimensions: artwork.dimensions,
    style: artwork.style || "Contemporary",
    existingPrices: artwork.existingPrices || [],
  })
  return {
    low: result.low || 500,
    mid: result.mid || 1000,
    high: result.high || 2000,
    reasoning: result.reasoning || "",
  }
}

/**
 * Analyze portfolio style and market positioning
 * @param {Array} artworks - Array of { title, medium, style }
 * @returns {Promise<{ dominantStyle, themes, marketPosition, suggestions }>}
 */
export async function analyzeStyle(artworks) {
  const result = await callAI("style_analysis", {
    artworks: artworks.map(a => ({
      title: a.title,
      medium: a.medium,
      style: a.style || a.tag || "Contemporary",
    })),
  })
  return {
    dominantStyle: result.dominantStyle || "Contemporary",
    themes: result.themes || [],
    marketPosition: result.marketPosition || "",
    suggestions: result.suggestions || [],
  }
}

/**
 * Generate a professional artist bio
 * @param {object} profile - { name, medium, style, location, existingBio }
 * @returns {Promise<string>} Generated bio
 */
export async function generateBio(profile) {
  const result = await callAI("bio_generator", {
    name: profile.name,
    medium: profile.medium,
    style: profile.style,
    location: profile.location,
    existingBio: profile.existingBio || "",
  })
  return result.bio || ""
}
