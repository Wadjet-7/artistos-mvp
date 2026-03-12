import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { User, Mail, Bell, Shield, CreditCard, Save, CheckCircle, Loader2, Camera, Sparkles, ArrowRight, Check } from "lucide-react"
import { PLANS, normalizePlan, formatLimit, canAccess } from "../lib/plans"
import { isStripeConfigured, redirectToCustomerPortal } from "../lib/stripe"
import { generateBio } from "../lib/ai"

const tabs = ["Profile", "Notifications", "Billing"]

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("Profile")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    website: user?.website || "",
    medium: user?.medium || "Oil Painting",
    style: user?.style || "Abstract",
    location: user?.location || "",
  })

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      await updateUser({
        name: form.name,
        email: form.email,
        bio: form.bio,
        website: form.website,
        medium: form.medium,
        style: form.style,
        location: form.location,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast.success("Settings saved!")
    } catch (err) {
      setError(err.message || "Failed to save changes.")
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    setUploadingAvatar(true)
    setError("")
    try {
      const ext = file.name.split(".").pop()
      const fileName = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)
      await updateUser({ avatar_url: urlData.publicUrl + "?t=" + Date.now() })
      toast.success("Avatar updated!")
    } catch (err) {
      setError(err.message || "Failed to upload avatar.")
      toast.error("Failed to upload avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#F2EDE6" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "#0E0C0A" : "#A89F94",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Profile" && (
        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold font-serif"
                    style={{ background: "linear-gradient(135deg, #B5651D, #C4705A)" }}>
                    {user?.initials || "M"}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "#0E0C0A" }}>{form.name}</h3>
                <p className="text-sm" style={{ color: "#A89F94" }}>{form.email}</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-xs font-medium mt-1 hover:underline flex items-center gap-1"
                  style={{ color: "#B5651D" }}
                >
                  <Camera size={12} />
                  {uploadingAvatar ? "Uploading..." : "Change photo"}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm px-4 py-2.5 rounded-lg mb-4" style={{ background: "#F5E2DC", border: "1px solid #C4705A", color: "#C4705A" }}>
                {error}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input pl-10" />
                </div>
              </div>
              <div>
                <label className="form-label">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="form-input pl-10" />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label mb-0">Bio</label>
                  {canAccess(normalizePlan(user?.plan), "ai") ? (
                    <button
                      type="button"
                      onClick={async () => {
                        setAiGenerating(true)
                        try {
                          const bio = await generateBio({
                            name: form.name,
                            medium: form.medium,
                            style: form.style,
                            location: form.location,
                            existingBio: form.bio,
                          })
                          setForm(f => ({ ...f, bio }))
                          toast.success("Bio generated! Review and save when ready.")
                        } catch (err) {
                          toast.error("AI bio failed: " + (err.message || "Unknown error"))
                        } finally {
                          setAiGenerating(false)
                        }
                      }}
                      disabled={aiGenerating}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "#F5E6D8", color: "#B5651D", border: "1px solid #D4854A" }}
                    >
                      {aiGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      AI Generate Bio
                    </button>
                  ) : (
                    <span className="text-[11px] flex items-center gap-1" style={{ color: "#A89F94" }}>
                      <Sparkles size={10} style={{ color: "#B5651D" }} />
                      Upgrade to Pro for AI bio
                    </span>
                  )}
                </div>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3}
                  className="form-input resize-none" placeholder="Tell collectors about yourself and your work..." />
              </div>
              <div>
                <label className="form-label">Primary medium</label>
                <select value={form.medium} onChange={e => setForm({...form, medium: e.target.value})} className="form-select">
                  {["Oil Painting","Acrylic","Watercolor","Digital","Mixed Media","Photography","Sculpture"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Style</label>
                <select value={form.style} onChange={e => setForm({...form, style: e.target.value})} className="form-select">
                  {["Abstract","Contemporary","Realistic","Illustrative","Whimsical","Minimalist"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Website</label>
                <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="form-input" placeholder="https://yoursite.com" />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="form-input" placeholder="Brooklyn, NY" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-5" style={{ borderTop: "1px solid #F2EDE6" }}>
              <button onClick={handleSave} disabled={saving} className="btn-copper flex items-center gap-2 disabled:opacity-70">
                {saving ? (
                  <><Loader2 size={15} className="animate-spin" /> Saving...</>
                ) : saved ? (
                  <><CheckCircle size={15} /> Saved!</>
                ) : (
                  <><Save size={15} /> Save changes</>
                )}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={18} style={{ color: "#C4705A" }} />
              <h3 className="text-base font-semibold" style={{ color: "#0E0C0A" }}>Danger Zone</h3>
            </div>
            <div className="flex items-center justify-between rounded-xl p-4" style={{ background: "#F5E2DC", border: "1px solid #C4705A" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>Sign out of your account</p>
                <p className="text-xs mt-0.5" style={{ color: "#C4705A" }}>You will need to sign in again to access your dashboard.</p>
              </div>
              <button onClick={logout} className="px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
                style={{ background: "#C4705A" }}
                onMouseEnter={e => e.currentTarget.style.background = "#a85a47"}
                onMouseLeave={e => e.currentTarget.style.background = "#C4705A"}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <NotificationsTab user={user} />
      )}

      {activeTab === "Billing" && <BillingTab user={user} />}
    </div>
  )
}

/* ================================================================ */
/*  Billing Tab — Real plan data + subscription management          */
/* ================================================================ */
function BillingTab({ user }) {
  const navigate = useNavigate()
  const plan = normalizePlan(user?.plan)
  const planConfig = PLANS[plan] || PLANS.starter
  const isActive = user?.subscription_status === "active"
  const hasSubscription = !!user?.subscription_id

  const handleManageSubscription = async () => {
    if (!isStripeConfigured()) {
      toast.error("Stripe is not configured yet")
      return
    }
    try {
      await redirectToCustomerPortal({ userId: user?.id })
    } catch (err) {
      toast.error(err.message || "Failed to open billing portal")
    }
  }

  return (
    <div className="space-y-5">
      {/* Current Plan Card */}
      <div className="card p-6">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0E0C0A" }}>Current Plan</h3>
        <div className="flex items-center justify-between rounded-xl p-5"
          style={{ background: "#F5E6D8", border: "1px solid #D4854A" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-semibold font-serif" style={{ color: "#B5651D" }}>
                {planConfig.name}
              </span>
              <span className="badge-copper">
                {hasSubscription && isActive ? "Active" : plan === "starter" ? "Free" : "Active"}
              </span>
            </div>
            <p className="text-sm" style={{ color: "#B5651D" }}>
              {planConfig.tagline}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-serif" style={{ color: "#B5651D" }}>
              {planConfig.price === 0 ? "Free" : `$${planConfig.price}`}
            </p>
            {planConfig.price > 0 && (
              <p className="text-xs" style={{ color: "#A89F94" }}>/ month</p>
            )}
          </div>
        </div>

        {/* Next billing date */}
        {user?.plan_period_end && (
          <p className="text-xs mt-3" style={{ color: "#A89F94" }}>
            Next billing date: {new Date(user.plan_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          {plan === "starter" ? (
            <button onClick={() => navigate("/upgrade")}
              className="btn-copper flex items-center gap-2" style={{ fontSize: 13, padding: "8px 20px" }}>
              <Sparkles size={14} /> Upgrade Plan <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button onClick={handleManageSubscription}
                className="btn-secondary flex items-center gap-2" style={{ fontSize: 13, padding: "8px 20px" }}>
                <CreditCard size={14} /> Manage Subscription
              </button>
              <button onClick={() => navigate("/upgrade")}
                className="btn-secondary flex items-center gap-2" style={{ fontSize: 13, padding: "8px 16px" }}>
                Change Plan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Plan Limits */}
      <div className="card p-6">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#0E0C0A" }}>Plan Limits</h3>
        <div className="space-y-3">
          {[
            { label: "Artworks", limit: planConfig.limits.artworks },
            { label: "Viewing Rooms", limit: planConfig.limits.viewingRooms },
            { label: "Contacts", limit: planConfig.limits.contacts },
            { label: "Invoices", limit: planConfig.limits.invoices },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #F2EDE6" }}>
              <span className="text-sm" style={{ color: "#4A4540" }}>{item.label}</span>
              <span className="text-sm font-medium" style={{ color: "#0E0C0A" }}>
                {formatLimit(item.limit)}
              </span>
            </div>
          ))}
        </div>

        {/* Features included */}
        <h4 className="text-sm font-semibold mt-5 mb-3" style={{ color: "#0E0C0A" }}>Features</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Market Analytics", included: planConfig.features.analytics },
            { label: "AI-Powered Tools", included: planConfig.features.ai },
            { label: "Social Scheduler", included: planConfig.features.socialScheduler },
            { label: "Exhibition Planner", included: planConfig.features.exhibitions },
            { label: "Consignment Tracker", included: planConfig.features.consignments },
            { label: "PDF Catalog", included: planConfig.features.catalog },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 text-sm" style={{ color: f.included ? "#2D4A35" : "#C5BDB3" }}>
              <Check size={14} style={{ color: f.included ? "#2D4A35" : "#E8E2DA" }} />
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================================================================ */
/*  Notifications Tab — Persisted to profiles.notification_preferences */
/* ================================================================ */
const NOTIF_DEFAULTS = {
  commissions: true,
  invoices: true,
  contracts: true,
  analytics_digest: true,
  marketplace: true,
  product_updates: false,
}

const NOTIF_OPTIONS = [
  { key: "commissions", label: "New commission inquiries", desc: "Get notified when a collector sends you a commission request" },
  { key: "invoices", label: "Invoice updates", desc: "Receive alerts when an invoice is paid or becomes overdue" },
  { key: "contracts", label: "Contract activity", desc: "Notifications when contracts are signed or need attention" },
  { key: "analytics_digest", label: "Market analytics digest", desc: "Weekly digest of market trends relevant to your work" },
  { key: "marketplace", label: "Marketplace matches", desc: "Alerts for new commissions matching your style and medium" },
  { key: "product_updates", label: "Product updates", desc: "News about new ArtistOS features and improvements" },
]

function NotificationsTab({ user }) {
  const [prefs, setPrefs] = useState(NOTIF_DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load saved preferences from profile
  useEffect(() => {
    if (!user?.id) return
    const loadPrefs = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("id", user.id)
        .single()
      if (data?.notification_preferences) {
        setPrefs(prev => ({ ...prev, ...data.notification_preferences }))
      }
      setLoaded(true)
    }
    loadPrefs()
  }, [user?.id])

  const handleToggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: prefs })
        .eq("id", user.id)
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast.success("Notification preferences saved!")
    } catch (err) {
      toast.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <Bell size={18} style={{ color: "#B5651D" }} />
        <h3 className="text-base font-semibold" style={{ color: "#0E0C0A" }}>Notification Preferences</h3>
      </div>
      {NOTIF_OPTIONS.map(n => (
        <label key={n.key} className="flex items-start gap-4 py-3 cursor-pointer" style={{ borderBottom: "1px solid #F2EDE6" }}>
          <input
            type="checkbox"
            checked={prefs[n.key] ?? false}
            onChange={() => handleToggle(n.key)}
            className="mt-1 w-4 h-4 rounded"
            style={{ accentColor: "#B5651D" }}
          />
          <div>
            <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>{n.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>{n.desc}</p>
          </div>
        </label>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-copper flex items-center gap-2 disabled:opacity-70">
          {saving ? (
            <><Loader2 size={15} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle size={15} /> Saved!</>
          ) : (
            <><Save size={15} /> Save preferences</>
          )}
        </button>
      </div>
    </div>
  )
}
