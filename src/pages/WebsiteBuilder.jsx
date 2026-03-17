import { useState } from "react"
import { ExternalLink, Save, Loader2, Globe, Eye, EyeOff, Palette, Type, Image, ScrollText, MessageSquare, UserCircle, Check } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { THEMES, DEFAULT_WEBSITE_SETTINGS } from "../lib/themes"
import { FeatureGate } from "../components/UpgradePrompt"

/* ------------------------------------------------------------------ */
/*  Accent color presets                                               */
/* ------------------------------------------------------------------ */
const ACCENT_PRESETS = [
  { label: "Copper", color: "#B5651D" },
  { label: "Forest", color: "#2D4A35" },
  { label: "Rose", color: "#C4705A" },
  { label: "Gold", color: "#C9A84C" },
  { label: "Ink", color: "#0E0C0A" },
]

/* ------------------------------------------------------------------ */
/*  Section toggle config                                              */
/* ------------------------------------------------------------------ */
const SECTION_TOGGLES = [
  { key: "about", label: "About / Bio", description: "Your bio text on the public profile", icon: UserCircle },
  { key: "artistStatement", label: "Artist Statement", description: "Longer statement about your practice", icon: ScrollText },
  { key: "availableWorks", label: "Available Works", description: "Gallery grid of works for sale", icon: Image },
  { key: "pastWorks", label: "Past Works", description: "Sold and reserved artworks", icon: Image },
  { key: "cvLink", label: "CV Link", description: "Link to your public CV page", icon: Type },
  { key: "commissionForm", label: "Commission Form", description: "Allow visitors to request commissions", icon: MessageSquare },
]

/* ------------------------------------------------------------------ */
/*  Toggle Switch component                                            */
/* ------------------------------------------------------------------ */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200"
      style={{ background: checked ? "#B5651D" : "#E8E2DA" }}
    >
      <span
        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200"
        style={{ transform: checked ? "translateX(21px) translateY(2px)" : "translateX(2px) translateY(2px)" }}
      />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Theme preview card                                                 */
/* ------------------------------------------------------------------ */
function ThemeCard({ theme, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(theme.id)}
      className="text-left rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: selected ? "2px solid #B5651D" : "2px solid #E8E2DA",
        background: "white",
        boxShadow: selected ? "0 0 0 3px rgba(181,101,29,0.15)" : "none",
      }}
    >
      {/* Color preview swatch */}
      <div className="flex" style={{ height: 56 }}>
        <div className="flex-1" style={{ background: theme.preview.bg }} />
        <div style={{ width: 4, background: theme.preview.accent }} />
        <div className="flex-1" style={{ background: theme.vars["bg-hero"] }} />
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          {selected && (
            <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#B5651D" }}>
              <Check size={10} color="white" strokeWidth={3} />
            </span>
          )}
          <span className="text-sm font-medium" style={{ color: "#0E0C0A" }}>{theme.name}</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "#A89F94" }}>{theme.description}</p>
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Main WebsiteBuilder content                                        */
/* ------------------------------------------------------------------ */
function WebsiteBuilderContent() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)

  const ws = user?.website_settings || DEFAULT_WEBSITE_SETTINGS

  const [settings, setSettings] = useState({
    theme: ws.theme || "gallery-white",
    accentColor: ws.accentColor || "#B5651D",
    sections: { ...DEFAULT_WEBSITE_SETTINGS.sections, ...ws.sections },
  })

  const [artistStatement, setArtistStatement] = useState(user?.artist_statement || "")
  const [useCustomColor, setUseCustomColor] = useState(
    !ACCENT_PRESETS.some(p => p.color === (ws.accentColor || "#B5651D"))
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          website_settings: settings,
          artist_statement: artistStatement,
        })
        .eq("id", user.id)

      if (error) throw error
      await updateUser({ website_settings: settings, artist_statement: artistStatement })
      toast.success("Website settings saved!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to save website settings")
    } finally {
      setSaving(false)
    }
  }

  const setTheme = (themeId) => setSettings(s => ({ ...s, theme: themeId }))
  const setAccent = (color) => setSettings(s => ({ ...s, accentColor: color }))
  const toggleSection = (key) => setSettings(s => ({
    ...s,
    sections: { ...s.sections, [key]: !s.sections[key] },
  }))

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm" style={{ color: "#A89F94" }}>
            Customize how your public artist profile looks to visitors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/artist/${user?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2 text-sm px-4 py-2"
          >
            <ExternalLink size={14} /> Preview site
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-copper inline-flex items-center gap-2 text-sm px-5 py-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* ── Theme Picker ── */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Palette size={18} style={{ color: "#B5651D" }} />
            <h3 className="card-title">Theme</h3>
          </div>
          <p className="card-subtitle mt-1">Choose a look for your public profile</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.values(THEMES).map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={settings.theme === theme.id}
                onSelect={setTheme}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Accent Color ── */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Globe size={18} style={{ color: "#B5651D" }} />
            <h3 className="card-title">Accent Color</h3>
          </div>
          <p className="card-subtitle mt-1">Used for buttons, links, prices, and highlights</p>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap items-center gap-3">
            {ACCENT_PRESETS.map(preset => (
              <button
                key={preset.color}
                title={preset.label}
                onClick={() => { setAccent(preset.color); setUseCustomColor(false) }}
                className="w-10 h-10 rounded-full transition-all duration-150 flex items-center justify-center"
                style={{
                  background: preset.color,
                  boxShadow: !useCustomColor && settings.accentColor === preset.color
                    ? `0 0 0 3px white, 0 0 0 5px ${preset.color}`
                    : "0 1px 3px rgba(0,0,0,0.15)",
                }}
              >
                {!useCustomColor && settings.accentColor === preset.color && (
                  <Check size={16} color="white" strokeWidth={3} />
                )}
              </button>
            ))}

            {/* Custom color */}
            <div className="flex items-center gap-2 ml-2">
              <div className="relative">
                <input
                  type="color"
                  value={useCustomColor ? settings.accentColor : "#B5651D"}
                  onChange={(e) => { setAccent(e.target.value); setUseCustomColor(true) }}
                  className="w-10 h-10 rounded-full cursor-pointer border-0 p-0"
                  style={{
                    boxShadow: useCustomColor
                      ? `0 0 0 3px white, 0 0 0 5px ${settings.accentColor}`
                      : "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: "#A89F94" }}>Custom</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Artist Statement ── */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <ScrollText size={18} style={{ color: "#B5651D" }} />
            <h3 className="card-title">Artist Statement</h3>
          </div>
          <p className="card-subtitle mt-1">A longer statement about your artistic practice, philosophy, and process. Displayed prominently on your public profile.</p>
        </div>
        <div className="card-body">
          <textarea
            value={artistStatement}
            onChange={(e) => setArtistStatement(e.target.value.slice(0, 2000))}
            rows={8}
            placeholder="Share your artistic vision, process, and what drives your work..."
            className="form-input w-full resize-y"
            style={{ minHeight: 140 }}
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs" style={{ color: artistStatement.length > 1800 ? "#C4705A" : "#A89F94" }}>
              {artistStatement.length} / 2,000
            </span>
          </div>
        </div>
      </div>

      {/* ── Section Toggles ── */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Eye size={18} style={{ color: "#B5651D" }} />
            <h3 className="card-title">Sections</h3>
          </div>
          <p className="card-subtitle mt-1">Choose which sections appear on your public profile</p>
        </div>
        <div className="card-body divide-y" style={{ borderColor: "#F2EDE6" }}>
          {SECTION_TOGGLES.map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F2EDE6" }}>
                  <Icon size={16} style={{ color: settings.sections[key] ? "#B5651D" : "#A89F94" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>{label}</p>
                  <p className="text-xs" style={{ color: "#A89F94" }}>{description}</p>
                </div>
              </div>
              <Toggle checked={settings.sections[key]} onChange={() => toggleSection(key)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Public URL hint ── */}
      <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#F2EDE6", border: "1px solid #E8E2DA" }}>
        <Globe size={18} style={{ color: "#B5651D" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "#0E0C0A" }}>Your public profile</p>
          <a
            href={`/artist/${user?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline"
            style={{ color: "#B5651D" }}
          >
            {window.location.origin}/artist/{user?.id}
          </a>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Export — wrapped in feature gate                                    */
/* ------------------------------------------------------------------ */
export default function WebsiteBuilder() {
  return (
    <FeatureGate feature="artistWebsite">
      <WebsiteBuilderContent />
    </FeatureGate>
  )
}
