import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import {
  ArrowRight, ArrowLeft, Camera, Loader2, CheckCircle,
  Image, FileText, Eye, UserCircle, Sparkles
} from "lucide-react"
import toast from "react-hot-toast"

/* ================================================================ */
/*  Onboarding Wizard — Shown after first signup                    */
/* ================================================================ */

const steps = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "Profile" },
  { id: "start", label: "Get Started" },
]

const mediums = ["Oil Painting", "Acrylic", "Watercolor", "Digital", "Mixed Media", "Photography", "Sculpture", "Printmaking", "Ceramics", "Textile", "Other"]
const styles = ["Abstract", "Contemporary", "Realistic", "Illustrative", "Whimsical", "Minimalist", "Expressionist", "Conceptual", "Other"]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: "",
    location: "",
    website: "",
    medium: "",
    style: "",
  })

  const currentStep = steps[step]

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    setUploadingAvatar(true)
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
      toast.success("Photo uploaded!")
    } catch (err) {
      toast.error("Failed to upload photo")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleNext = async () => {
    if (step === 1) {
      // Save profile info
      setSaving(true)
      try {
        const updates = {}
        if (form.name && form.name !== user?.name) updates.name = form.name
        if (form.bio) updates.bio = form.bio
        if (form.location) updates.location = form.location
        if (form.website) updates.website = form.website
        if (form.medium) updates.medium = form.medium
        if (form.style) updates.style = form.style
        if (Object.keys(updates).length > 0) {
          await updateUser(updates)
        }
      } catch (err) {
        console.error("[Onboarding] save error:", err)
      } finally {
        setSaving(false)
      }
    }
    setStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      await updateUser({ onboarding_complete: true })
      toast.success("Welcome to ArtistOS!")
      navigate("/dashboard", { replace: true })
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FAF8F5" }}>
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  background: i <= step ? "#B5651D" : "#E8E2DA",
                  width: i === step ? 24 : 10,
                  borderRadius: 5,
                }} />
            </div>
          ))}
        </div>

        <div className="card p-8" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>

          {/* Step 1: Welcome */}
          {currentStep.id === "welcome" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "linear-gradient(135deg, #B5651D, #D4854A)" }}>
                <Sparkles size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-serif font-semibold mb-2" style={{ color: "#0E0C0A" }}>
                Welcome to ArtistOS
              </h1>
              <p className="text-sm mb-6" style={{ color: "#A89F94" }}>
                Your all-in-one creative business platform. Let's get your profile set up so collectors and galleries can find you.
              </p>
              <div className="flex items-center gap-3 p-4 rounded-xl mb-6"
                style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold font-serif"
                    style={{ background: "linear-gradient(135deg, #B5651D, #C4705A)" }}>
                    {user?.initials || "?"}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>
                    {user?.name || "Artist"}
                  </p>
                  <p className="text-xs" style={{ color: "#A89F94" }}>{user?.email}</p>
                </div>
              </div>
              <button onClick={handleNext} className="btn-copper w-full flex items-center justify-center gap-2"
                style={{ padding: "12px 24px" }}>
                Let's Get Started <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Profile Setup */}
          {currentStep.id === "profile" && (
            <div>
              <h2 className="text-xl font-serif font-semibold mb-1" style={{ color: "#0E0C0A" }}>
                Set Up Your Profile
              </h2>
              <p className="text-sm mb-6" style={{ color: "#A89F94" }}>
                Help collectors discover you. You can always update this later.
              </p>

              {/* Avatar Upload */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold font-serif"
                      style={{ background: "linear-gradient(135deg, #B5651D, #C4705A)" }}>
                      {user?.initials || "?"}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                    className="text-sm font-medium flex items-center gap-1.5 hover:underline"
                    style={{ color: "#B5651D" }}>
                    <Camera size={14} />
                    {uploadingAvatar ? "Uploading..." : "Upload photo"}
                  </button>
                  <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>Optional</p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="form-label">Artist Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="form-input" placeholder="Your artist name" />
                </div>
                <div>
                  <label className="form-label">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                    className="form-input resize-none" rows={3}
                    placeholder="Tell collectors about yourself and your work..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Primary Medium</label>
                    <select value={form.medium} onChange={e => setForm({...form, medium: e.target.value})}
                      className="form-select">
                      <option value="">Select...</option>
                      {mediums.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Style</label>
                    <select value={form.style} onChange={e => setForm({...form, style: e.target.value})}
                      className="form-select">
                      <option value="">Select...</option>
                      {styles.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Location</label>
                    <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                      className="form-input" placeholder="Brooklyn, NY" />
                  </div>
                  <div>
                    <label className="form-label">Website</label>
                    <input value={form.website} onChange={e => setForm({...form, website: e.target.value})}
                      className="form-input" placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)}
                  className="btn-secondary flex items-center gap-1.5"
                  style={{ padding: "10px 20px" }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={handleNext} disabled={saving}
                  className="btn-copper flex-1 flex items-center justify-center gap-2"
                  style={{ padding: "10px 24px" }}>
                  {saving ? (
                    <><Loader2 size={15} className="animate-spin" /> Saving...</>
                  ) : (
                    <>Continue <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Get Started */}
          {currentStep.id === "start" && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "#E8F2EA" }}>
                <CheckCircle size={28} style={{ color: "#2D4A35" }} />
              </div>
              <h2 className="text-xl font-serif font-semibold mb-2" style={{ color: "#0E0C0A" }}>
                You're All Set!
              </h2>
              <p className="text-sm mb-6" style={{ color: "#A89F94" }}>
                Your profile is ready. Here are some great first steps to get the most out of ArtistOS.
              </p>

              <div className="space-y-3 mb-6 text-left">
                {[
                  { icon: Image, label: "Upload your first artwork", desc: "Build your digital portfolio", path: "/portfolio" },
                  { icon: Eye, label: "Create a viewing room", desc: "Share curated galleries privately", path: "/viewing-rooms" },
                  { icon: FileText, label: "Generate a contract", desc: "Professional artist-gallery contracts", path: "/contracts" },
                  { icon: UserCircle, label: "Add your contacts", desc: "Track collectors and galleries", path: "/contacts" },
                ].map(item => (
                  <button key={item.label}
                    onClick={() => { handleComplete(); navigate(item.path) }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-colors text-left"
                    style={{ background: "#FAF8F5", border: "1px solid #E8E2DA" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F2EDE6"}
                    onMouseLeave={e => e.currentTarget.style.background = "#FAF8F5"}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "#F5E6D8" }}>
                      <item.icon size={16} style={{ color: "#B5651D" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>{item.label}</p>
                      <p className="text-xs" style={{ color: "#A89F94" }}>{item.desc}</p>
                    </div>
                    <ArrowRight size={14} style={{ color: "#A89F94" }} />
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="btn-secondary flex items-center gap-1.5"
                  style={{ padding: "10px 20px" }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={handleComplete} disabled={saving}
                  className="btn-copper flex-1 flex items-center justify-center gap-2"
                  style={{ padding: "12px 24px" }}>
                  {saving ? (
                    <><Loader2 size={15} className="animate-spin" /> Finishing...</>
                  ) : (
                    <>Go to Dashboard <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip link */}
        <div className="text-center mt-4">
          <button onClick={handleComplete} className="text-xs hover:underline" style={{ color: "#C5BDB3" }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
