/* ================================================================ */
/*  Theme Definitions for Artist Websites                           */
/*  Each theme maps CSS custom properties to color values           */
/* ================================================================ */

export const THEMES = {
  "gallery-white": {
    id: "gallery-white",
    name: "Gallery White",
    description: "Clean, minimal, gallery-like",
    preview: { bg: "#FFFFFF", text: "#0E0C0A", accent: "#B5651D" },
    vars: {
      "bg-primary": "#FFFFFF",
      "bg-secondary": "#FAF8F5",
      "bg-hero": "#FAF8F5",
      "bg-footer": "#0E0C0A",
      "text-primary": "#0E0C0A",
      "text-secondary": "#6B6560",
      "text-muted": "#A89F94",
      "border-color": "#E8E2DA",
      "card-bg": "#FFFFFF",
      "card-border": "#E8E2DA",
      "badge-bg": "rgba(0,0,0,0.04)",
      "hero-text": "#0E0C0A",
      "hero-subtitle": "#6B6560",
      "nav-bg": "#FFFFFF",
      "nav-border": "#E8E2DA",
      "nav-text": "#A89F94",
      "footer-text": "#A89F94",
    },
  },
  "dark-studio": {
    id: "dark-studio",
    name: "Dark Studio",
    description: "Dark, moody, dramatic",
    preview: { bg: "#0E0C0A", text: "#FAF8F5", accent: "#D4854A" },
    vars: {
      "bg-primary": "#0E0C0A",
      "bg-secondary": "#1A1816",
      "bg-hero": "#0E0C0A",
      "bg-footer": "#000000",
      "text-primary": "#FAF8F5",
      "text-secondary": "#C5BDB3",
      "text-muted": "#A89F94",
      "border-color": "rgba(255,255,255,0.08)",
      "card-bg": "#1A1816",
      "card-border": "rgba(255,255,255,0.08)",
      "badge-bg": "rgba(255,255,255,0.08)",
      "hero-text": "#FAF8F5",
      "hero-subtitle": "#A89F94",
      "nav-bg": "#0E0C0A",
      "nav-border": "rgba(255,255,255,0.06)",
      "nav-text": "#A89F94",
      "footer-text": "#6B6560",
    },
  },
  "earth-tone": {
    id: "earth-tone",
    name: "Earth Tone",
    description: "Warm browns, terracotta, natural",
    preview: { bg: "#F5EDE3", text: "#3D2E1F", accent: "#A0522D" },
    vars: {
      "bg-primary": "#F5EDE3",
      "bg-secondary": "#EDE3D5",
      "bg-hero": "#3D2E1F",
      "bg-footer": "#3D2E1F",
      "text-primary": "#3D2E1F",
      "text-secondary": "#6B5744",
      "text-muted": "#9C8B7A",
      "border-color": "#D9CCBC",
      "card-bg": "#FFFCF8",
      "card-border": "#D9CCBC",
      "badge-bg": "rgba(61,46,31,0.06)",
      "hero-text": "#F5EDE3",
      "hero-subtitle": "#C5B5A0",
      "nav-bg": "#F5EDE3",
      "nav-border": "#D9CCBC",
      "nav-text": "#9C8B7A",
      "footer-text": "#9C8B7A",
    },
  },
  "monochrome": {
    id: "monochrome",
    name: "Monochrome",
    description: "Black and white, high contrast, editorial",
    preview: { bg: "#FFFFFF", text: "#000000", accent: "#000000" },
    vars: {
      "bg-primary": "#FFFFFF",
      "bg-secondary": "#F5F5F5",
      "bg-hero": "#000000",
      "bg-footer": "#000000",
      "text-primary": "#000000",
      "text-secondary": "#333333",
      "text-muted": "#777777",
      "border-color": "#E0E0E0",
      "card-bg": "#FFFFFF",
      "card-border": "#E0E0E0",
      "badge-bg": "rgba(0,0,0,0.05)",
      "hero-text": "#FFFFFF",
      "hero-subtitle": "#999999",
      "nav-bg": "#FFFFFF",
      "nav-border": "#E0E0E0",
      "nav-text": "#777777",
      "footer-text": "#777777",
    },
  },
  "warm-copper": {
    id: "warm-copper",
    name: "Warm Copper",
    description: "ArtistOS brand copper, warm and inviting",
    preview: { bg: "#FFF8F0", text: "#0E0C0A", accent: "#B5651D" },
    vars: {
      "bg-primary": "#FFF8F0",
      "bg-secondary": "#F5E6D8",
      "bg-hero": "#4A2810",
      "bg-footer": "#2A1808",
      "text-primary": "#0E0C0A",
      "text-secondary": "#6B5744",
      "text-muted": "#A89080",
      "border-color": "#E8D5C0",
      "card-bg": "#FFFCF8",
      "card-border": "#E8D5C0",
      "badge-bg": "rgba(181,101,29,0.08)",
      "hero-text": "#FAF8F5",
      "hero-subtitle": "#D4B896",
      "nav-bg": "#FFF8F0",
      "nav-border": "#E8D5C0",
      "nav-text": "#A89080",
      "footer-text": "#A89080",
    },
  },
}

/**
 * Get theme by ID with fallback to gallery-white
 * @param {string} themeId
 * @returns {object}
 */
export function getTheme(themeId) {
  return THEMES[themeId] || THEMES["gallery-white"]
}

/**
 * Build a CSS custom properties style object from theme vars + accent override
 * @param {string} themeId
 * @param {string} accentColor - optional hex color override
 * @returns {object} inline style object with --t-* properties
 */
export function buildThemeStyle(themeId, accentColor) {
  const theme = getTheme(themeId)
  const style = {}
  for (const [key, value] of Object.entries(theme.vars)) {
    style[`--t-${key}`] = value
  }
  style["--t-accent"] = accentColor || "#B5651D"
  return style
}

/** Default website settings for new users */
export const DEFAULT_WEBSITE_SETTINGS = {
  theme: "gallery-white",
  accentColor: "#B5651D",
  sections: {
    about: true,
    artistStatement: true,
    availableWorks: true,
    pastWorks: true,
    cvLink: true,
    commissionForm: true,
  },
}
