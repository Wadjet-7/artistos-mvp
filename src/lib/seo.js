/* ================================================================ */
/*  Client-side SEO helpers                                          */
/*  Keeps <title>, description, canonical and robots in sync as the  */
/*  single-page app navigates. Crawlable marketing pages are static  */
/*  HTML generated at build time (scripts/seo-build.mjs).            */
/* ================================================================ */

import { useEffect } from "react"

export const SITE_URL = "https://artistosapp.com"

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!href) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

/**
 * Apply page-level SEO tags.
 * @param {{ title?: string, description?: string, path?: string|null, noindex?: boolean, image?: string }} opts
 *   path: canonical path (e.g. "/artists"); pass null to remove the canonical tag.
 */
export function applySEO({ title, description, path, noindex = false, image } = {}) {
  if (typeof document === "undefined") return
  if (title) {
    document.title = title
    upsertMeta("property", "og:title", title)
    upsertMeta("name", "twitter:title", title)
  }
  if (description) {
    const d = description.length > 300 ? description.slice(0, 297) + "..." : description
    upsertMeta("name", "description", d)
    upsertMeta("property", "og:description", d)
    upsertMeta("name", "twitter:description", d)
  }
  if (path !== undefined) {
    const url = path ? SITE_URL + path : null
    setCanonical(url)
    if (url) upsertMeta("property", "og:url", url)
  }
  if (image) {
    upsertMeta("property", "og:image", image)
    upsertMeta("name", "twitter:image", image)
  }
  upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large")
}

/** React hook version of applySEO. Re-applies when any value changes. */
export function useSEO(opts) {
  const { title, description, path, noindex, image } = opts || {}
  useEffect(() => {
    applySEO({ title, description, path, noindex, image })
  }, [title, description, path, noindex, image])
}
