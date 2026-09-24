# ArtistOS — SEO + AI search plan

Prepared September 24, 2026.

## What was wrong (audit of the live site)

| Problem | Why it mattered | Status |
|---|---|---|
| The homepage HTML was empty (`<div id="root"></div>`); all text was drawn by JavaScript | Google indexes slowly and inconsistently. ChatGPT, Claude and Perplexity crawlers mostly don't run JavaScript, so to them the site was blank. | Fixed: real text in the page, plus 13 static pages |
| Only one URL existed: no pricing, features, FAQ or guide pages | There was nothing to rank for besides the brand name | Fixed: 13 pages |
| `robots.txt`, `sitemap.xml` and `llms.txt` didn't exist; the site returned the app's HTML for them | Crawlers had no map of the site | Fixed |
| The canonical URL pointed to `www.artistosapp.com`, which redirects to `artistosapp.com` with a *temporary* (307) redirect | Mixed signals about which address is the real one | Fixed in code; you also need to change the redirect in Vercel (see step 3) |
| Every made-up URL returned "200 OK" | Google sees soft-404s | Fixed: missing pages are now `noindex` and bad artist links return 404 |
| The structured data listed the old $19/$49 prices | Google and AI answers could quote the wrong price | Fixed: $0 / $29 / $120 plus annual prices |
| There was no social preview image, and the favicon and app icons were missing | Links looked blank in iMessage, Slack and LinkedIn, and there was no icon in Google results | Fixed |
| **Public artist pages have been broken since Sept 22.** The code reads a `profiles.is_demo` column that was never created, so every artist page shows "Artist not found" | Artist pages were the biggest free SEO asset, and they didn't work | Fixed by `phase26-seo-fixes.sql` |
| **Anyone logged out could read every user's email and Stripe customer ID** | Privacy and security | Fixed for logged-out visitors by the SQL. Logged-in users can still read all profiles; that needs a follow-up fix. |
| **Three grant-finder listings were wrong for Louisiana artists** (two are organization-only; one fellowship no longer exists) | Studio users would be told to apply to things they can't | Deactivated by the SQL. The other listings still use placeholder deadlines, so the database needs a proper refresh. |

## What's new on the site

- **Product pages:** `/features`, `/pricing`, `/faq`, `/about`, `/guides`
- **Guides:** each is written to rank on Google and to be quoted by AI assistants. Every guide opens with a direct answer, has an FAQ, cites sources and shows an "updated" date.
  - `/how-to-price-artwork`, with a working price calculator
  - `/art-commission-contract-template`
  - `/artist-invoice-template`
  - `/certificate-of-authenticity-template`
  - `/art-consignment-agreement`
  - `/artist-grants-louisiana`, a local page with verified programs
  - `/art-inventory-software`, a comparison page
  - `/artwork-archive-alternative`, an honest head-to-head comparison
- **Artist pages (`/artist/<id>`):** now served with the artist's name, medium, city, bio and works already in the HTML, so each Founding Artist becomes a Google-indexable page. Links shared in iMessage or Instagram show a proper preview.
- **Crawler files:**
  - `sitemap.xml` for the site's pages
  - `sitemap-artists.xml`, which updates itself as artists add work
  - `robots.txt`, which explicitly allows Google, Bing, ChatGPT, Claude, Perplexity and Apple
  - `llms.txt` and `llms-full.txt`, plain-text summaries written for AI assistants
- **Structured data (schema.org):** SoftwareApplication with prices, Organization, founder, VideoObject for the demo, FAQPage, Article, BreadcrumbList, and Person/VisualArtwork on artist pages.

---

## Your steps, in order

### 1. Run the SQL (5 minutes)
Supabase → SQL Editor → New query → paste all of `phase26-seo-fixes.sql` → Run. This brings artist pages back, hides the demo accounts, closes the email leak and removes the three bad grant listings.

### 2. Push the code
In GitHub Desktop (or your terminal) commit everything and push. Vercel deploys automatically.

### 3. Fix the www redirect in Vercel (2 minutes)
Vercel → your project → Settings → Domains → `www.artistosapp.com` → Edit → "Redirect to artistosapp.com" → Status code: **308 Permanent** → Save.

### 4. Check the deploy (2 minutes)
Open each of these. All should load real pages, not the app:
- artistosapp.com/features
- artistosapp.com/how-to-price-artwork (try the calculator)
- artistosapp.com/robots.txt
- artistosapp.com/sitemap.xml
- artistosapp.com/llms.txt
- artistosapp.com/artists

Tell me when it's live and I'll run the full crawler check from my side.

### 5. Google Search Console (15 minutes, the most important step)
1. Go to search.google.com/search-console → Add property → **Domain** → `artistosapp.com`.
2. It gives you a TXT record. Add it in Vercel → Settings → Domains → artistosapp.com → DNS Records (or at your domain registrar if DNS isn't on Vercel) → Verify.
3. Sitemaps → submit `sitemap.xml` and `sitemap-artists.xml`.
4. URL Inspection → paste `https://artistosapp.com/` → **Request indexing**. Repeat for /features, /pricing, /how-to-price-artwork and /artist-grants-louisiana.

### 6. Bing Webmaster Tools (5 minutes)
bing.com/webmasters → "Import from Google Search Console." Bing's index feeds ChatGPT search and Microsoft Copilot, so this is how you show up in AI answers, not just Bing.

### 7. Get listed (1–2 hours, spread over two weeks)
Each listing is a link back to you and a place AI assistants look when recommending tools.
- **AlternativeTo:** add ArtistOS as an alternative to Artwork Archive and ArtCloud. This is the highest-intent listing.
- **SaaSHub**, **G2** (which now also runs Capterra), in the "Art Gallery Software" category.
- **AI directories:** There's An AI For That, Futurepedia, Toolify. These are relevant because of the AI pricing and description tools.
- **Product Hunt:** launch on a Tuesday, after the Founding Artists are in, so there are real people to comment.
- **BetaList, Uneed, Microlaunch:** quick submissions.

### 8. Make the YouTube video public, with real artwork
YouTube videos are among the sources AI answers cite most often. When a Founding Artist's work is in the demo, re-record, set it to Public, and keep artistosapp.com as the first line of the description.

### 9. Turn outreach into links
- **Professors:** in follow-ups, offer the pricing guide and the contract template as free class handouts. A link from a `.edu` syllabus or resource page is worth more than almost anything else you can get.
- **Arts New Orleans, Antenna, CAC:** ask to be listed on their artist-resources pages. Offer `/artist-grants-louisiana` as a resource for their members.
- **Founding Artists:** ask each to link "Portfolio on ArtistOS" from their Instagram bio or website, and to fill in bio, medium and city. Each complete profile becomes a page Google can rank for their name.
- **Local press:** the existing pitch in `launch/04-press-pitch.md`. Local coverage gives you strong links.

### 10. Keep publishing (2 guides a month)
Write in the same format as the current guides: the answer first, then an FAQ, then sources. Ideas, roughly highest-demand first:
1. How to write an artist statement (with examples by medium)
2. Artist CV format and template
3. How to photograph your artwork with a phone
4. How to get gallery representation
5. Art fair checklist and booth pricing
6. Sales tax for artists in Louisiana
7. How to price prints and editions
8. New Orleans art markets and open studios: a local guide
9. Artist residencies in the South
10. How to ship artwork safely

Tell me which ones you want and I'll draft them in the same template.

---

## How to measure it

- **Search Console, weekly:** impressions and clicks, and which queries you show for. Expect little for 2–4 weeks, then growth on the guides. A new domain takes 3–6 months to rank for competitive terms; long-tail guides come first.
- **GA4:** signups from organic search.
- **AI answers, monthly:** ask ChatGPT, Perplexity, Claude and Google's AI Mode these questions and note whether ArtistOS is mentioned or cited:
  - "What software should an independent artist use to track inventory and invoices?"
  - "Artwork Archive alternatives"
  - "How do I price my paintings?"
  - "Grants for artists in New Orleans"
  - "Free art commission contract template"

## Follow-ups I'd recommend next
1. **Refresh the grant finder database** with verified 2026–27 programs and real deadlines (I can build this).
2. **Lock down profile emails for logged-in users**: move private fields out of the public profiles table or behind a view.
3. **Server-render artwork pages (`/artwork/<id>`)** the same way as artist pages, once Founding Artists add real work.
