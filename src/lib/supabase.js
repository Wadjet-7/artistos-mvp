import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== "your-supabase-url-here" &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== "your-supabase-anon-key-here"

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase not configured. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env"
  )
}

// Storage key for manual session persistence
const projectRef = isSupabaseConfigured
  ? supabaseUrl.match(/https:\/\/(.+?)\.supabase/)?.[1] || ""
  : ""
export const STORAGE_KEY = `sb-${projectRef}-auth-token`

// ---- Token refresh helpers ----

// Decode JWT payload to check expiry (without external library)
function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

// Check if the access token is expired (or will expire within 60 seconds)
function isTokenExpired(accessToken) {
  if (!accessToken) return true
  const payload = decodeJwtPayload(accessToken)
  if (!payload?.exp) return true
  return Date.now() >= (payload.exp - 60) * 1000 // 60-second buffer
}

// Refresh lock to prevent concurrent refresh calls
let refreshPromise = null

// Refresh the session using the refresh token via Supabase Auth REST API
async function refreshSession() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const stored = JSON.parse(raw)
    if (!stored?.refresh_token) return null

    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
      },
      body: JSON.stringify({ refresh_token: stored.refresh_token }),
    })

    if (!res.ok) {
      // Refresh failed — token is fully expired, user must re-login
      console.warn("[Auth] Token refresh failed:", res.status)
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    const newSession = await res.json()
    // Save the refreshed session
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...stored,
      access_token: newSession.access_token,
      refresh_token: newSession.refresh_token,
      expires_at: newSession.expires_at,
      user: newSession.user || stored.user,
    }))
    return newSession.access_token
  } catch (e) {
    console.warn("[Auth] Token refresh error:", e)
    return null
  }
}

// Get a valid access token, refreshing if needed
async function getValidToken() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const stored = JSON.parse(raw)
    if (!stored?.access_token) return null

    if (!isTokenExpired(stored.access_token)) {
      return stored.access_token
    }

    // Token expired — refresh it (with deduplication)
    if (!refreshPromise) {
      refreshPromise = refreshSession().finally(() => { refreshPromise = null })
    }
    return await refreshPromise
  } catch {
    return null
  }
}

// Export for use in AuthContext init
export { getValidToken, isTokenExpired }

// Custom fetch that injects the stored auth token into every Supabase request.
// Automatically refreshes expired tokens.
const authFetch = async (url, options = {}) => {
  try {
    const token = await getValidToken()
    if (token) {
      const headers = new Headers(options.headers || {})
      headers.set("Authorization", `Bearer ${token}`)
      options = { ...options, headers }
    }
  } catch {
    // ignore — will use whatever token is available
  }
  return fetch(url, options)
}

// Activity logging helper — call from any page after CRUD operations
export async function logActivity(userId, type, description, metadata = {}) {
  if (!isSupabaseConfigured || !userId) return
  try {
    await supabase.from("activity_log").insert({
      user_id: userId,
      activity_type: type,
      description,
      metadata,
    })
  } catch {
    // Activity logging is non-critical — don't break the app if it fails
  }
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: authFetch,
    },
  }
)
