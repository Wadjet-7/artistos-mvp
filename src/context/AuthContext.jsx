import { createContext, useContext, useState, useEffect } from "react"
import { supabase, isSupabaseConfigured, STORAGE_KEY, getValidToken, isTokenExpired } from "../lib/supabase"
import { sendWelcomeEmail } from "../lib/email"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /* ---- helpers ---- */
  const buildUserObj = (profile) => ({
    id: profile.id,
    name: profile.name || "",
    email: profile.email || "",
    initials: profile.initials || (profile.name || "").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    plan: profile.plan || "starter",
    avatar_url: profile.avatar_url || null,
    bio: profile.bio || "",
    website: profile.website || "",
    medium: profile.medium || "",
    style: profile.style || "",
    location: profile.location || "",
    onboarding_complete: profile.onboarding_complete ?? true,
    stripe_customer_id: profile.stripe_customer_id || null,
    subscription_id: profile.subscription_id || null,
    subscription_status: profile.subscription_status || "inactive",
    plan_period_end: profile.plan_period_end || null,
    is_admin: profile.is_admin || false,
    stripe_account_id: profile.stripe_account_id || null,
    stripe_account_status: profile.stripe_account_status || "not_connected",
    stripe_charges_enabled: profile.stripe_charges_enabled || false,
    artist_statement: profile.artist_statement || "",
    website_settings: profile.website_settings || null,
  })

  const loadProfile = async (authUser) => {
    if (!authUser) { setUser(null); return }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single()

    if (error || !data) {
      // Profile might not exist yet (trigger hasn't fired), create minimal user obj
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.name || "",
        email: authUser.email || "",
        initials: (authUser.user_metadata?.name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        plan: "starter",
        avatar_url: null,
        bio: "", website: "", medium: "", style: "", location: "",
        onboarding_complete: false,
        stripe_customer_id: null,
        subscription_id: null,
        subscription_status: "inactive",
        plan_period_end: null,
        stripe_account_id: null,
        stripe_account_status: "not_connected",
        stripe_charges_enabled: false,
        artist_statement: "",
        website_settings: null,
      })
      return
    }

    setUser(buildUserObj(data))
  }

  // Save session to localStorage (since persistSession is off)
  const saveSession = (session) => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /* ---- auth state listener ---- */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let mounted = true

    const init = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const stored = JSON.parse(raw)
          if (stored?.user && mounted) {
            // Ensure we have a valid (non-expired) token before making any queries
            const token = await getValidToken()
            if (!token) {
              // Token fully expired & refresh failed — clear session
              console.warn("[Auth] Session expired, clearing")
              localStorage.removeItem(STORAGE_KEY)
              if (mounted) setLoading(false)
              return
            }
            await loadProfile(stored.user)
          }
        }
      } catch (e) {
        console.warn("[Auth] init error:", e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // Listen for auth changes from login/signup
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        if (session?.user) {
          await loadProfile(session.user)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  /* ---- auth actions ---- */
  const signup = async (name, email, password) => {
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, initials },
      },
    })

    if (error) throw error
    // Manually save session (persistSession is off)
    if (data.session) saveSession(data.session)

    // Send welcome email (non-blocking — don't let email failure block signup)
    try {
      await sendWelcomeEmail(email)
    } catch (e) {
      console.warn("[Auth] Welcome email failed (non-critical):", e)
    }

    return data
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    // Manually save session (persistSession is off)
    if (data.session) saveSession(data.session)
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    saveSession(null)
    setUser(null)
  }

  const updateUser = async (updates) => {
    if (!user?.id) return

    // Build profile updates
    const profileUpdates = { ...updates }
    if (updates.name) {
      profileUpdates.initials = updates.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const { error } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", user.id)

    if (error) throw error

    // Update local state
    setUser(prev => ({
      ...prev,
      ...profileUpdates,
    }))
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile({ id: user.id, email: user.email })
    }
  }

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-copper rounded-full border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: "#E8E2DA", borderTopColor: "#B5651D" }} />
          <p className="text-sm" style={{ color: "#A89F94" }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
