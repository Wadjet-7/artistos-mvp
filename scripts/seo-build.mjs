// Post-build SEO step (runs after `vite build`).
//
//  1. dist/app.html      — SPA shell used for app routes (see vercel.json rewrites)
//  2. dist/index.html    — homepage with structured data + crawlable content inside #root
//                          (React replaces it on load; bots that don't run JS still read it)
//  3. dist/<page>.html   — static marketing pages and guides (served at /<page> via cleanUrls)
//  4. dist/sitemap.xml, robots.txt, llms.txt, llms-full.txt
//
// No dependencies beyond Node itself.

import fs from "node:fs"
import path from "node:path"
import { SITE, UPDATED, ORG, FOUNDER, GUIDES, esc, renderPage, faqSchema } from "./seo/layout.mjs"
import { productPages, SOFTWARE_APP, VIDEO, pricing, faq as faqPage } from "./seo/pages-product.mjs"
import { guidePages } from "./seo/pages-guides.mjs"

const DIST = path.resolve("dist")
const shellPath = path.join(DIST, "index.html")
if (!fs.existsSync(shellPath)) {
  console.error("[seo-build] dist/index.html not found — run vite build first")
  process.exit(1)
}
const shell = fs.readFileSync(shellPath, "utf8")
const pages = [...productPages, ...guidePages]

/* ---------- 1. app.html (generic shell for SPA routes) ---------- */
let app = shell
  .replace(/<title>[\s\S]*?<\/title>/, "<title>ArtistOS</title>")
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="ArtistOS — business software for working artists." />')
  .replace(/\s*<link rel="canonical"[^>]*>/, "")
  .replace(/\s*<meta property="og:url"[^>]*>/, "")
  .replace("<!-- SEO:JSONLD -->", "")
  .replace("<!-- SEO:STATIC -->", "")
fs.writeFileSync(path.join(DIST, "app.html"), app)

/* ---------- 2. homepage ---------- */
const homeFaq = [
  ["What is ArtistOS?", "ArtistOS is business software for working visual artists. It combines artwork inventory, AI-written descriptions and price suggestions, commission and consignment contracts, invoices collectors can pay online, a collector CRM, private viewing rooms, an artist website and CV, and on the Studio plan, a grant and residency finder that drafts applications."],
  ["How much does ArtistOS cost?", "Starter is free forever for up to 25 artworks. Pro is $29 per month or $290 per year with a 14-day free trial. Studio is $120 per month or $1,200 per year. Students with a .edu email get 50% off Pro."],
  ["Does ArtistOS take a commission on art sales?", "No. Collectors pay invoices through your own Stripe account, and ArtistOS does not take a percentage of your sales."],
  ["Who makes ArtistOS?", "ArtistOS was founded in New Orleans by Larry Jones after months of studio visits with working artists between New Orleans and New York."],
]
const homeGraph = {
  "@context": "https://schema.org",
  "@graph": [
    ORG,
    FOUNDER,
    { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "ArtistOS", publisher: { "@id": `${SITE}/#organization` }, inLanguage: "en-US" },
    SOFTWARE_APP,
    VIDEO,
    faqSchema(homeFaq),
  ],
}
const homeStatic = `
<style>#seo-home{background:#0E0C0A;color:#FAF8F5;font-family:"DM Sans",system-ui,sans-serif;min-height:100vh}
#seo-home a{color:#D4854A}#seo-home .w{max-width:980px;margin:0 auto;padding:0 20px}
#seo-home header{display:flex;justify-content:space-between;align-items:center;height:64px}
#seo-home .logo{font:600 22px "Cormorant Garamond",Georgia,serif;color:#FAF8F5;text-decoration:none}
#seo-home nav a{color:rgba(250,248,245,.6);text-decoration:none;margin-left:18px;font-size:15px}
#seo-home h1{font:600 clamp(38px,6vw,60px)/1.08 "Cormorant Garamond",Georgia,serif;margin:72px 0 18px;text-align:center}
#seo-home h1 em{color:#D4854A}#seo-home p.l{max-width:680px;margin:0 auto;text-align:center;color:rgba(250,248,245,.6);font-size:19px;line-height:1.6}
#seo-home .c{text-align:center;margin:30px 0 60px}#seo-home .b{background:#B5651D;color:#fff;padding:14px 26px;border-radius:12px;text-decoration:none;font-weight:600}
#seo-home section{border-top:1px solid rgba(255,255,255,.08);padding:36px 0}#seo-home h2{font:600 28px "Cormorant Garamond",Georgia,serif;margin:0 0 12px}
#seo-home li,#seo-home section p{color:rgba(250,248,245,.72);line-height:1.6}</style>
<div id="seo-home"><div class="w">
<header><a class="logo" href="/">ArtistOS</a><nav><a href="/features">Features</a><a href="/pricing">Pricing</a><a href="/guides">Guides</a><a href="/login">Sign in</a></nav></header>
<h1>Run your art practice <em>like a business.</em></h1>
<p class="l">ArtistOS is business software for working artists: track your art inventory, price work with AI, send contracts and invoices collectors pay online, and find grants you qualify for, all in one place. Free to start.</p>
<div class="c"><a class="b" href="/signup">Start for free</a></div>
<section><h2>Everything the business side of your practice needs</h2><ul>
<li><a href="/features#inventory">Artwork inventory and portfolio</a> with status, location, QR codes and certificates of authenticity</li>
<li><a href="/features#ai">AI descriptions and price suggestions</a> from your medium, size and sales history</li>
<li><a href="/features#contracts">Commission, sales and consignment contracts</a></li>
<li><a href="/features#invoices">Invoices collectors can pay online</a> through your Stripe account</li>
<li><a href="/features#collectors">Collector CRM and commission tracking</a> and <a href="/features#viewing-rooms">private viewing rooms</a></li>
<li><a href="/features#website">Artist website and public CV</a></li>
<li><a href="/features#grant-finder">Grant, residency and fellowship finder</a> that drafts applications from your CV (Studio)</li>
</ul></section>
<section><h2>Pricing</h2><p>Starter: free forever (25 artworks). Pro: $29/month or $290/year, 14-day free trial, 50% off for students. Studio: $120/month or $1,200/year, unlimited, with the grant finder. <a href="/pricing">See pricing</a>.</p></section>
<section><h2>Free guides for artists</h2><ul>${GUIDES.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join("")}</ul></section>
<section><h2>Questions</h2>${homeFaq.map(([q, a]) => `<h3 style="font-size:17px;margin:16px 0 4px">${esc(q)}</h3><p>${esc(a)}</p>`).join("")}<p><a href="/faq">More answers</a> · <a href="/about">About ArtistOS</a> · <a href="/artists">Browse artists</a></p></section>
</div></div>`
const home = shell
  .replace("<!-- SEO:JSONLD -->", `<script type="application/ld+json">${JSON.stringify(homeGraph).replace(/</g, "\\u003c")}</script>`)
  .replace("<!-- SEO:STATIC -->", homeStatic.replace(/\n/g, ""))
fs.writeFileSync(shellPath, home)

/* ---------- 3. static pages ---------- */
for (const p of pages) {
  const file = path.join(DIST, p.path.replace(/^\//, "") + ".html")
  fs.writeFileSync(file, renderPage(p))
}

/* ---------- 4. sitemap, robots, llms ---------- */
const urls = [
  { loc: `${SITE}/`, priority: "1.0" },
  ...pages.map((p) => ({ loc: SITE + p.path, priority: ["/features", "/pricing"].includes(p.path) ? "0.9" : "0.8" })),
  { loc: `${SITE}/artists`, priority: "0.6" },
  { loc: `${SITE}/signup`, priority: "0.5" },
  { loc: `${SITE}/privacy`, priority: "0.2" },
  { loc: `${SITE}/terms`, priority: "0.2" },
]
fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${UPDATED}</lastmod><priority>${u.priority}</priority></url>`)
    .join("\n")}\n</urlset>\n`
)

const APP_PATHS = ["/dashboard", "/portfolio", "/contracts", "/viewing-rooms", "/social", "/finances", "/analytics", "/emerging", "/marketplace", "/contacts", "/commissions", "/messages", "/cv", "/consignments", "/exhibitions", "/website", "/opportunities", "/settings", "/upgrade", "/admin", "/onboarding", "/login", "/forgot-password", "/invoice/", "/view/", "/api/", "/app"]
fs.writeFileSync(
  path.join(DIST, "robots.txt"),
  `# ArtistOS — search engines and AI assistants are welcome to read our public pages.
User-agent: *
${APP_PATHS.map((p) => `Disallow: ${p}`).join("\n")}
Allow: /

# AI search and answer engines (explicitly allowed)
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Bingbot
${APP_PATHS.map((p) => `Disallow: ${p}`).join("\n")}
Allow: /

Sitemap: ${SITE}/sitemap.xml
Sitemap: ${SITE}/sitemap-artists.xml
`
)

const strip = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<(br|\/p|\/li|\/h[1-6]|\/tr|\/div|\/details|\/summary)>/g, "\n")
    .replace(/<\/t[dh]>/g, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&middot;/g, "·").replace(/&rarr;/g, "→").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim()

const llms = `# ArtistOS

> ArtistOS (${SITE}) is business software for working visual artists, founded in New Orleans, Louisiana by Larry Jones. It combines artwork inventory, AI-written artwork descriptions and price suggestions, commission/sales/consignment contract generation, invoices collectors can pay online by card through the artist's own Stripe account, a collector CRM, private online viewing rooms, an artist website and public CV, consignment and exhibition tracking, and (Studio plan) a grant, residency and fellowship finder that scores fit and drafts application materials from the artist's CV.

Pricing (USD): Starter free forever (up to 25 artworks). Pro $29/month or $290/year, 14-day free trial, 50% off for students with a .edu email. Studio $120/month or $1,200/year, unlimited, adds the grant engine, provenance, editions and appraisal records. ArtistOS does not take a commission on artists' sales. Web app; works in desktop and mobile browsers. Demo video: https://www.youtube.com/watch?v=L_WahSl2t_E

## Product
- [Features](${SITE}/features): every feature, by area
- [Pricing](${SITE}/pricing): plans, limits, trial and student discount
- [FAQ](${SITE}/faq): common questions about ArtistOS
- [About](${SITE}/about): who built ArtistOS and why

## Guides for artists
${GUIDES.map(([h, t, d]) => `- [${t}](${SITE}${h}): ${d}`).join("\n")}

## Optional
- [Full text of all pages](${SITE}/llms-full.txt)
- [Browse artists using ArtistOS](${SITE}/artists)
`
fs.writeFileSync(path.join(DIST, "llms.txt"), llms)
fs.writeFileSync(
  path.join(DIST, "llms-full.txt"),
  llms + "\n\n" + pages.map((p) => `\n\n---\n\n# ${strip(p.h1)}\nURL: ${SITE}${p.path}\n\n${strip(p.lede || "")}\n\n${strip(p.body)}${p.faq ? "\n\nFAQ\n" + p.faq.map(([q, a]) => `Q: ${q}\nA: ${strip(a)}`).join("\n\n") : ""}`).join("")
)

console.log(`[seo-build] wrote app.html, home, ${pages.length} pages, sitemap (${urls.length} urls), robots.txt, llms.txt`)
