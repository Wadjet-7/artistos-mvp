// Vercel serverless function: /sitemap-artists.xml
// Lists public artist pages that have real content (a name and at least
// one artwork), excluding demo accounts.

const SITE = "https://artistosapp.com"
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://vdrqiugwnztzqvfieeip.supabase.co"
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_TCDE1tTNF1UtCSzLxIM9bA_FYJc60MS"

async function sb(q) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${q}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!r.ok) throw new Error(`supabase ${r.status}`)
  return r.json()
}

export default async function handler(req, res) {
  let entries = []
  try {
    const works = await sb("artworks?select=user_id,created_at&order=created_at.desc&limit=5000")
    const latest = new Map()
    for (const w of works) if (w.user_id && !latest.has(w.user_id)) latest.set(w.user_id, w.created_at)
    const ids = [...latest.keys()]
    if (ids.length) {
      const list = ids.slice(0, 1000).join(",")
      const profiles = await sb(`profiles?id=in.(${list})&select=id,name,is_demo`)
        .catch(() => sb(`profiles?id=in.(${list})&select=id,name`))
      entries = profiles
        .filter((p) => p.name && p.name.trim() && !p.is_demo)
        .map((p) => ({ loc: `${SITE}/artist/${p.id}`, lastmod: String(latest.get(p.id) || "").slice(0, 10) }))
    }
  } catch {
    entries = []
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}<priority>0.6</priority></url>`).join("\n")}
</urlset>
`
  res.statusCode = 200
  res.setHeader("Content-Type", "application/xml; charset=utf-8")
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
  res.end(xml)
}
