// Shared layout for the static, crawlable marketing pages.
// These pages are plain HTML (no React bundle) so search engines and
// AI assistants can read them instantly, without running JavaScript.

export const SITE = "https://artistosapp.com"
export const UPDATED = "2026-09-24"
export const UPDATED_LABEL = "September 24, 2026"
export const YOUTUBE_ID = "L_WahSl2t_E"

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const stripTags = (s = "") => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()

export const ORG = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "ArtistOS",
  url: SITE,
  logo: `${SITE}/icon-512.png`,
  description:
    "ArtistOS is business software for working visual artists: portfolio and inventory, contracts, invoices collectors pay online, collector CRM, viewing rooms, an artist website and CV, AI descriptions and price suggestions, and a grant and residency finder.",
  foundingLocation: { "@type": "Place", name: "New Orleans, Louisiana, USA" },
  founder: { "@id": `${SITE}/about#larry-jones` },
  email: "larry@synergysourceadvisors.com",
}

export const FOUNDER = {
  "@type": "Person",
  "@id": `${SITE}/about#larry-jones`,
  name: "Larry Jones",
  jobTitle: "Founder",
  worksFor: { "@id": `${SITE}/#organization` },
  homeLocation: { "@type": "Place", name: "New Orleans, Louisiana" },
  url: `${SITE}/about`,
}

export const NAV = [
  ["/features", "Features"],
  ["/pricing", "Pricing"],
  ["/guides", "Guides"],
  ["/faq", "FAQ"],
]

export const GUIDES = [
  ["/how-to-price-artwork", "How to price your artwork", "Square-inch and linear-inch formulas, a free calculator, and when to raise prices."],
  ["/art-commission-contract-template", "Art commission contract template", "What every commission agreement should cover, with a free template."],
  ["/artist-invoice-template", "Artist invoice template", "What to put on an invoice for a sold artwork or commission."],
  ["/certificate-of-authenticity-template", "Certificate of authenticity template", "What a COA includes for originals and editions."],
  ["/art-consignment-agreement", "Art consignment agreements", "Gallery splits, what to put in writing, and how to track consigned work."],
  ["/artist-grants-louisiana", "Grants and residencies for Louisiana artists", "Programs individual artists in New Orleans and Louisiana can actually apply to."],
  ["/art-inventory-software", "Art inventory software for artists", "What to look for, and how the main options compare."],
  ["/artwork-archive-alternative", "Artwork Archive alternative", "An honest side-by-side of ArtistOS and Artwork Archive."],
  ["/how-to-write-an-artist-statement", "How to write an artist statement", "A simple 3-part structure, a template and examples by medium."],
  ["/artist-cv-template", "Artist CV template", "Standard sections, formatting and a free template."],
]

const CSS = `
:root{--ink:#0E0C0A;--paper:#FAF8F5;--copper:#B5651D;--copper-2:#D4854A;--muted:#6B635A;--line:#E8E2DA;--tint:#F5E6D8;--green:#2D4A35}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.65 "DM Sans",system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
a{color:var(--copper)}a:hover{color:var(--ink)}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}.narrow{max-width:760px;margin:0 auto;padding:0 20px}
header.site{position:sticky;top:0;z-index:10;background:rgba(250,248,245,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;height:62px;gap:16px}
.logo{font:600 22px/1 "Cormorant Garamond",Georgia,serif;color:var(--ink);text-decoration:none;letter-spacing:.3px}
nav.main{display:flex;gap:22px;font-size:15px}nav.main a{color:var(--muted);text-decoration:none}nav.main a:hover{color:var(--ink)}
.actions{display:flex;gap:12px;align-items:center;font-size:15px}.actions a.signin{color:var(--muted);text-decoration:none}
.btn{display:inline-block;background:var(--copper);color:#fff!important;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:10px;font-size:15px}
.btn:hover{background:#9c5617}.btn.lg{padding:14px 26px;font-size:17px;border-radius:12px}.btn.ghost{background:transparent;border:1px solid rgba(255,255,255,.3)}
@media(max-width:760px){nav.main{display:none}.actions a.signin{display:none}}
.hero{background:var(--ink);color:var(--paper);padding:64px 0 56px}
.hero .eyebrow{color:var(--copper-2);text-transform:uppercase;letter-spacing:2px;font-size:12px;font-weight:600;margin:0 0 12px}
.hero h1{font:600 clamp(34px,5vw,54px)/1.1 "Cormorant Garamond",Georgia,serif;margin:0 0 16px;letter-spacing:.3px}
.hero .lede{color:rgba(250,248,245,.72);font-size:19px;max-width:720px;margin:0}
.hero .meta{color:rgba(250,248,245,.45);font-size:14px;margin-top:18px}
.crumbs{font-size:13px;color:rgba(250,248,245,.5);margin-bottom:18px}.crumbs a{color:rgba(250,248,245,.6);text-decoration:none}
main{padding:48px 0 24px}
main h2{font:600 32px/1.2 "Cormorant Garamond",Georgia,serif;margin:44px 0 12px}
main h3{font-size:19px;margin:28px 0 8px}
main p,main li{color:#2b2622}main ul,main ol{padding-left:22px}
.answer{background:#fff;border:1px solid var(--line);border-left:4px solid var(--copper);border-radius:12px;padding:18px 20px;margin:0 0 28px;font-size:18px}
.answer strong{color:var(--ink)}
table{width:100%;border-collapse:collapse;margin:18px 0 26px;font-size:15px;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;display:block;overflow-x:auto}
th,td{text-align:left;padding:11px 13px;border-bottom:1px solid var(--line);vertical-align:top}th{background:#F2EDE6;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;margin:18px 0}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px}.card h3{margin-top:0}
.card a.more{font-weight:600;text-decoration:none}
.plan{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px}.plan.hi{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.plan.hi li,.plan.hi p{color:rgba(250,248,245,.78)}.plan .price{font:600 42px/1 "Cormorant Garamond",Georgia,serif;margin:10px 0 4px}
.template{background:#fff;border:1px dashed #cfc5b8;border-radius:12px;padding:20px 22px;font:15px/1.7 ui-monospace,"DM Mono",Menlo,monospace;white-space:pre-wrap;color:#2b2622}
details{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:10px 0}
details summary{cursor:pointer;font-weight:600}details p{margin:10px 0 2px}
.cta{background:var(--ink);color:var(--paper);border-radius:18px;padding:36px 28px;margin:48px 0 8px;text-align:center}
.cta h2{color:var(--paper);margin:0 0 8px}.cta p{color:rgba(250,248,245,.65);margin:0 0 20px}
.note{font-size:14px;color:var(--muted)}
.calc{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px;margin:18px 0}
.calc label{display:block;font-size:14px;font-weight:600;margin:10px 0 4px}.calc input,.calc select{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;background:var(--paper)}
.calc .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}.calc output{display:block;font:600 34px/1.2 "Cormorant Garamond",Georgia,serif;margin-top:14px;color:var(--copper)}
figure{margin:24px 0}figure img{width:100%;height:auto;border-radius:14px;border:1px solid var(--line)}figcaption{font-size:14px;color:var(--muted);margin-top:6px}
.video{position:relative;padding-top:56.25%;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#000;margin:18px 0}
.video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
footer.site{background:var(--ink);color:rgba(250,248,245,.55);padding:44px 0 36px;margin-top:56px;font-size:14px}
footer.site .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:24px}
footer.site h4{color:var(--paper);font-size:14px;margin:0 0 10px}footer.site a{color:rgba(250,248,245,.6);text-decoration:none;display:block;margin:6px 0}
footer.site a:hover{color:#fff}footer.site .base{border-top:1px solid rgba(255,255,255,.08);margin-top:28px;padding-top:18px}
`

function header() {
  return `<header class="site"><div class="wrap">
<a class="logo" href="/">ArtistOS</a>
<nav class="main" aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
<div class="actions"><a class="signin" href="/login">Sign in</a><a class="btn" href="/signup">Start free</a></div>
</div></header>`
}

function footer() {
  return `<footer class="site"><div class="wrap">
<div class="cols">
<div><h4>ArtistOS</h4><p style="margin:0">Business software for working artists. Built in New Orleans.</p></div>
<div><h4>Product</h4><a href="/features">Features</a><a href="/pricing">Pricing</a><a href="/features#grant-finder">Grant finder</a><a href="/artists">Browse artists</a><a href="/signup">Start free</a></div>
<div><h4>Guides</h4>${GUIDES.slice(0, 6).map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}<a href="/guides">All guides</a></div>
<div><h4>Company</h4><a href="/about">About</a><a href="/faq">FAQ</a><a href="https://www.youtube.com/watch?v=${YOUTUBE_ID}">Demo video</a><a href="mailto:larry@synergysourceadvisors.com">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div>
</div>
<div class="base">&copy; 2026 ArtistOS. Made in New Orleans.</div>
</div></footer>`
}

export function faqBlock(faq) {
  if (!faq || !faq.length) return ""
  return `<h2 id="faq">Frequently asked questions</h2>` +
    faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${a}</p></details>`).join("")
}

export function faqSchema(faq) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: stripTags(a) } })),
  }
}

export function ctaBlock(title = "Run your art practice like a business", text = "Free to start. No credit card. Pro includes a 14-day free trial.") {
  return `<section class="cta"><h2>${title}</h2><p>${text}</p><a class="btn lg" href="/signup">Start free</a></section>`
}

/**
 * Render a full static page.
 * @param {object} p  { path, title, description, eyebrow, h1, lede, body, faq, schema:[], crumbs:[[href,label]], type, showUpdated, image }
 */
export function renderPage(p) {
  const url = SITE + (p.path === "/" ? "/" : p.path)
  const image = p.image || `${SITE}/og-image.png`
  const crumbs = p.crumbs || [["/", "Home"], [p.path, p.h1]]
  const graph = [
    ORG,
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: p.title,
      description: p.description,
      isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website`, name: "ArtistOS", url: SITE },
      dateModified: UPDATED,
      inLanguage: "en-US",
      primaryImageOfPage: image,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map(([h, n], i) => ({ "@type": "ListItem", position: i + 1, name: stripTags(n), item: SITE + (h === "/" ? "/" : h) })),
    },
    ...(p.schema || []),
    ...(p.faq && p.faq.length ? [faqSchema(p.faq)] : []),
  ]
  const jsonld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")
  const crumbHtml = crumbs.length > 1
    ? `<div class="crumbs">${crumbs.map(([h, n], i) => i < crumbs.length - 1 ? `<a href="${h}">${esc(stripTags(n))}</a> / ` : esc(stripTags(n))).join("")}</div>`
    : ""
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta property="og:type" content="${p.type || "website"}">
<meta property="og:site_name" content="ArtistOS">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${image}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0E0C0A">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-6N236P7CBJ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-6N236P7CBJ');</script>
<script type="application/ld+json">${jsonld}</script>
<style>${CSS.replace(/\n/g, "")}</style>
</head>
<body>
${header()}
<section class="hero"><div class="${p.wide ? "wrap" : "narrow"}">
${crumbHtml}
${p.eyebrow ? `<p class="eyebrow">${esc(p.eyebrow)}</p>` : ""}
<h1>${p.h1}</h1>
${p.lede ? `<p class="lede">${p.lede}</p>` : ""}
${p.showUpdated === false ? "" : `<p class="meta">By <a href="/about" style="color:inherit">Larry Jones</a>, founder of ArtistOS &middot; Updated ${UPDATED_LABEL}</p>`}
</div></section>
<main><div class="${p.wide ? "wrap" : "narrow"}">
${p.body}
${faqBlock(p.faq)}
${p.noCta ? "" : ctaBlock(p.ctaTitle, p.ctaText)}
</div></main>
${footer()}
${p.script ? `<script>${p.script}</script>` : ""}
</body>
</html>
`
}
