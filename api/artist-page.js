// Vercel serverless function: server-renders SEO tags + crawlable content
// for public artist pages (/artist/:id). The React app still loads and
// takes over normally; this only makes the page readable by search
// engines, AI assistants and link previews (iMessage, Instagram, Slack...).
//
// If anything fails, it falls back to the plain app shell so the page
// always works.

const SITE = "https://artistosapp.com"
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://vdrqiugwnztzqvfieeip.supabase.co"
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_TCDE1tTNF1UtCSzLxIM9bA_FYJc60MS"
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

async function sb(pathAndQuery) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!r.ok) throw new Error(`supabase ${r.status}`)
  return r.json()
}

async function getShell(host) {
  const r = await fetch(`${process.env.SHELL_ORIGIN || `https://${host}`}/app`)
  if (!r.ok) throw new Error(`shell ${r.status}`)
  return r.text()
}

function injectHead(shell, tags) {
  return shell
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta name="description"[^>]*>/, "")
    .replace(/<meta name="robots"[^>]*>/, "")
    .replace(/<meta property="og:(title|description|image|type)"[^>]*>/g, "")
    .replace(/<meta name="twitter:(title|description|image)"[^>]*>/g, "")
    .replace("</head>", `${tags}\n</head>`)
}

export default async function handler(req, res) {
  const id = String(req.query.id || "")
  const host = req.headers["x-forwarded-host"] || req.headers.host || "artistosapp.com"
  let shell = ""
  try {
    shell = await getShell(host)
  } catch {
    res.statusCode = 302
    res.setHeader("Location", "/")
    return res.end()
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8")

  const notFound = () => {
    res.statusCode = 404
    res.setHeader("Cache-Control", "public, s-maxage=300")
    return res.end(injectHead(shell, `<title>Artist not found — ArtistOS</title><meta name="robots" content="noindex">`))
  }

  if (!UUID.test(id)) return notFound()

  try {
    const [profiles, works] = await Promise.all([
      sb(`profiles?id=eq.${id}&select=id,name,bio,medium,style,location,avatar_url,artist_statement,website,is_demo`)
        // is_demo is added by phase26-seo-fixes.sql; retry without it if that hasn't run yet
        .catch(() => sb(`profiles?id=eq.${id}&select=id,name,bio,medium,style,location,avatar_url,artist_statement,website`)),
      sb(`artworks?user_id=eq.${id}&select=id,title,medium,dimensions,image_url,status,price&order=created_at.desc&limit=24`),
    ])
    const p = profiles && profiles[0]
    if (!p || p.is_demo || !p.name) return notFound()

    const url = `${SITE}/artist/${p.id}`
    const medium = p.medium ? p.medium.trim() : ""
    const title = `${p.name}${medium ? ` — ${medium}` : " — Artist"}${p.location ? `, ${p.location}` : ""} | ArtistOS`
    const lead = `${p.name} is ${medium ? `a ${medium.toLowerCase()} artist` : "an artist"}${p.location ? ` based in ${p.location}` : ""}.`
    const bio = (p.bio || p.artist_statement || "").replace(/\s+/g, " ").trim()
    const description = `${lead} ${bio || "View available works, CV and commission information on ArtistOS."}`.slice(0, 300)
    const image = (works || []).find((w) => w.image_url)?.image_url || p.avatar_url || `${SITE}/og-image.png`
    const thin = !(works && works.length) && !bio

    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfilePage",
          "@id": `${url}#page`,
          url,
          name: title,
          dateModified: new Date().toISOString().slice(0, 10),
          isPartOf: { "@type": "WebSite", name: "ArtistOS", url: SITE },
          mainEntity: {
            "@type": "Person",
            "@id": `${url}#artist`,
            name: p.name,
            jobTitle: medium ? `${medium} artist` : "Artist",
            description: bio || undefined,
            image: p.avatar_url || undefined,
            homeLocation: p.location ? { "@type": "Place", name: p.location } : undefined,
            url,
            sameAs: p.website ? [p.website] : undefined,
          },
        },
        ...(works || []).slice(0, 12).map((w) => ({
          "@type": "VisualArtwork",
          name: w.title,
          artMedium: w.medium || undefined,
          image: w.image_url || undefined,
          creator: { "@id": `${url}#artist` },
          url: `${SITE}/artwork/${w.id}`,
        })),
      ],
    }

    const tags = [
      `<title>${esc(title)}</title>`,
      `<meta name="description" content="${esc(description)}">`,
      `<meta name="robots" content="${thin ? "noindex, follow" : "index, follow, max-image-preview:large"}">`,
      `<link rel="canonical" href="${url}">`,
      `<meta property="og:type" content="profile">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(description)}">`,
      `<meta property="og:image" content="${esc(image)}">`,
      `<meta name="twitter:title" content="${esc(title)}">`,
      `<meta name="twitter:description" content="${esc(description)}">`,
      `<meta name="twitter:image" content="${esc(image)}">`,
      `<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>`,
    ].join("\n")

    const list = (works || [])
      .map((w) => `<li><a href="/artwork/${esc(w.id)}">${esc(w.title || "Untitled")}</a>${w.medium ? `, ${esc(w.medium)}` : ""}${w.dimensions ? `, ${esc(w.dimensions)}` : ""}${w.status ? ` (${esc(w.status)})` : ""}</li>`)
      .join("")
    const body = `<div style="max-width:900px;margin:0 auto;padding:40px 20px;font-family:system-ui,sans-serif;color:#0E0C0A">
<p><a href="/">ArtistOS</a> / <a href="/artists">Artists</a></p>
<h1 style="font-family:Georgia,serif">${esc(p.name)}</h1>
<p>${esc(lead)}</p>${bio ? `<p>${esc(bio)}</p>` : ""}
${list ? `<h2>Works</h2><ul>${list}</ul>` : ""}
<p><a href="/artist/${esc(p.id)}/cv">View CV</a></p>
</div>`

    const html = injectHead(shell, tags).replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    res.statusCode = 200
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400")
    return res.end(html)
  } catch (e) {
    // Never break the page: serve the normal app shell.
    res.statusCode = 200
    res.setHeader("Cache-Control", "no-store")
    return res.end(shell)
  }
}
