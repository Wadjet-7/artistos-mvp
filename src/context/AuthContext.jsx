import { createContext, useContext, useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "../lib/supabase"

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
    plan: profile.plan || "Starter",
    avatar: profile.avatar_url || null,
    bio: profile.bio || "",
    website: profile.website || "",
    medium: profile.medium || "",
    style: profile.style || "",
    location: profile.location || "",
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
        plan: "Starter",
        avatar: null,
        bio: "", website: "", medium: "", style: "", location: "",
      })
      return
    }

    setUser(buildUserObj(data))
  }

  /* ---- auth state listener ---- */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Supabase not configured — skip auth, allow app to render
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          loadProfile(session.user)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadProfile(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
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
    // Profile is auto-created by database trigger
    return data
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
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
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await loadProfile(session.user)
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
