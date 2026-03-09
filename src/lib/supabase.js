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
    "⚠️ Supabase not configured. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env"
  )
}

// Use a dummy URL when not configured to prevent createClient from crashing
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-key"
)
