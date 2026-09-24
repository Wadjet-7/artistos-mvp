import { SITE, UPDATED, YOUTUBE_ID, GUIDES, FOUNDER } from "./layout.mjs"

export const SOFTWARE_APP = {
  "@type": "SoftwareApplication",
  "@id": `${SITE}/#software`,
  name: "ArtistOS",
  url: SITE,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Art business and inventory management",
  operatingSystem: "Web browser (desktop and mobile)",
  description:
    "All-in-one business platform for working visual artists: artwork inventory, AI gallery descriptions and price suggestions, commission and consignment contracts, invoices collectors pay online, collector CRM, private viewing rooms, artist website and CV, and a grant and residency finder.",
  publisher: { "@id": `${SITE}/#organization` },
  image: `${SITE}/og-image.png`,
  screenshot: `${SITE}/images/artistos-dashboard.jpg`,
  featureList: [
    "Artwork inventory and portfolio",
    "AI artwork descriptions",
    "AI price suggestions",
    "Commission and consignment contract generator",
    "Invoices with online card payment via Stripe",
    "Collector and contact CRM",
    "Private online viewing rooms",
    "Artist website and public CV",
    "Consignment and exhibition tracking",
    "Certificates of authenticity and QR codes",
    "Grant, residency and fellowship finder with application drafts (Studio)",
    "Editions, provenance and appraisal records (Studio)",
  ],
  offers: [
    { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "USD", description: "Free forever: up to 25 artworks" },
    { "@type": "Offer", name: "Pro (monthly)", price: "29", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "29", priceCurrency: "USD", unitText: "MONTH" } },
    { "@type": "Offer", name: "Pro (annual)", price: "290", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "290", priceCurrency: "USD", unitText: "YEAR" } },
    { "@type": "Offer", name: "Studio (monthly)", price: "120", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "120", priceCurrency: "USD", unitText: "MONTH" } },
    { "@type": "Offer", name: "Studio (annual)", price: "1200", priceCurrency: "USD", priceSpecification: { "@type": "UnitPriceSpecification", price: "1200", priceCurrency: "USD", unitText: "YEAR" } },
  ],
}

export const VIDEO = {
  "@type": "VideoObject",
  "@id": `${SITE}/#demo-video`,
  name: "ArtistOS — Run Your Art Practice Like a Business (2-Minute Demo)",
  description:
    "A two-minute walkthrough of ArtistOS: the dashboard, adding an artwork with AI descriptions and price suggestions, contracts and invoices, viewing rooms and collectors, analytics, consignments, and the Studio grant and opportunity engine.",
  thumbnailUrl: [`https://i.ytimg.com/vi/${YOUTUBE_ID}/hqdefault.jpg`, `${SITE}/og-image.png`],
  uploadDate: "2026-09-22",
  duration: "PT2M20S",
  embedUrl: `https://www.youtube.com/embed/${YOUTUBE_ID}`,
  contentUrl: `${SITE}/demo.mp4`,
  publisher: { "@id": `${SITE}/#organization` },
}

const videoEmbed = `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}" title="ArtistOS two-minute demo" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`

/* ------------------------------------------------------------------ */
export const features = {
  path: "/features",
  title: "Features — Art Business Software for Artists | ArtistOS",
  description:
    "ArtistOS features: art inventory, AI descriptions and pricing, commission contracts, invoices collectors pay online, collector CRM, artist website and a grant finder.",
  eyebrow: "Features",
  h1: "Everything the business side of your art practice needs",
  lede: "ArtistOS replaces the spreadsheet, the notes app, the invoice tool and the Instagram DMs with one place built for working artists.",
  wide: false,
  schema: [SOFTWARE_APP, VIDEO],
  body: `
<div class="answer"><strong>ArtistOS is an all-in-one business platform for visual artists.</strong> It tracks your artwork inventory, writes gallery-ready descriptions and suggests prices with AI, generates commission and consignment contracts, sends invoices collectors can pay online, keeps your collector list, publishes your artist website and CV, and, on the Studio plan, finds grants and residencies you qualify for and drafts the application.</div>
${videoEmbed}
<figure><img src="/images/artistos-dashboard.jpg" alt="ArtistOS dashboard showing artworks, active commissions, revenue and portfolio value" width="1200" height="532" loading="lazy"><figcaption>The ArtistOS dashboard: inventory, commissions, revenue and portfolio value at a glance.</figcaption></figure>

<h2 id="inventory">Artwork inventory and portfolio</h2>
<p>Catalog every piece with title, medium, dimensions, year, price, status (available, sold, on consignment and more) and images. Filter and search your whole body of work, export a PDF catalog (Pro), and generate QR codes and certificates of authenticity for any piece. Your inventory powers everything else, so a sale, an invoice and a consignment all stay connected to the same artwork record.</p>

<h2 id="ai">AI descriptions and price suggestions</h2>
<p>Enter a title, medium and size and ArtistOS writes a gallery-quality description you can edit in seconds. The price suggestion looks at your medium, dimensions and your own sales history to recommend a range, so pricing stops being a guess. The same AI writes your professional bio. AI tools are included on Pro and Studio.</p>
<p>Want to understand the math first? Read <a href="/how-to-price-artwork">how to price artwork</a> and try the free calculator.</p>

<h2 id="contracts">Contracts</h2>
<p>Generate commission, sales and consignment agreements with a live preview: scope, deposit, timeline, revisions, delivery, cancellation and reproduction rights. Download or print them to sign. See <a href="/art-commission-contract-template">what a commission contract should include</a>.</p>

<h2 id="invoices">Invoices collectors can pay online</h2>
<p>Create branded invoices for sales, deposits and commission milestones. Connect your Stripe account and collectors can pay by card from a secure link. See at a glance what's pending, paid and overdue, and log expenses on Pro. Here's <a href="/artist-invoice-template">what to put on an artist invoice</a>.</p>

<h2 id="collectors">Collectors, contacts and commissions</h2>
<p>Keep collectors, galleries, curators and interior designers in one CRM with notes, tags and purchase history. Manage commission requests from inquiry to delivery with stages, deposits and deadlines, and keep conversations organized with built-in messaging.</p>

<h2 id="viewing-rooms">Private viewing rooms</h2>
<p>Send a collector a private, beautifully laid-out online room of selected works instead of a folder of photos or a PDF. Starter includes 3 rooms, Pro 25, Studio unlimited.</p>

<h2 id="website">Artist website and CV</h2>
<p>Publish a public artist page with your bio, statement and available work, and build a properly formatted artist CV (exhibitions, education, awards, residencies, collections) with its own shareable page. Themes and the full artist website are on Pro and Studio.</p>

<h2 id="consignments">Consignments and exhibitions</h2>
<p>Track which gallery has which piece, agreed commission percentages and end dates, so "where is everything?" always has an answer. Plan exhibitions and link the works in each show. Studio adds a consignment map. Read more about <a href="/art-consignment-agreement">consignment agreements and splits</a>.</p>

<h2 id="social">Social scheduler and analytics</h2>
<p>Plan Instagram and social posts around new work and shows. Analytics show portfolio value, sales velocity, what's selling by medium and inventory status (Pro and Studio).</p>

<h2 id="grant-finder">Grant, residency and fellowship finder (Studio)</h2>
<p>The Studio plan matches your medium, location and career stage against the grants, residencies, fellowships and open calls in the ArtistOS opportunity database, scores each one for fit, flags deadlines and location restrictions, and drafts your artist statement, project description, bio and "why this opportunity" answer from your actual CV. It won't invent credentials. For Louisiana artists, see our guide to <a href="/artist-grants-louisiana">grants and residencies you can apply to</a>.</p>

<h2 id="studio">Archive-grade records (Studio)</h2>
<p>For artists whose work is an asset: provenance timelines for each piece, editions and print management, insurance and appraisal reports, career analytics, and personal onboarding with a quarterly review.</p>

<h2>Compare plans</h2>
<p>Starter is free forever (up to 25 artworks). Pro is $29/month or $290/year. Studio is $120/month or $1,200/year. <a href="/pricing">See full pricing</a>.</p>
`,
  faq: [
    ["Is ArtistOS free?", "Yes. The Starter plan is free forever and includes up to 25 artworks, 3 viewing rooms, the contract generator, invoice tracking, commission management, messaging and the artist CV builder. No credit card is required."],
    ["Does ArtistOS work on my phone?", "Yes. ArtistOS runs in any modern web browser on desktop, tablet and phone, and can be added to your home screen like an app."],
    ["Can collectors pay my invoices online?", "Yes. Connect your Stripe account in Settings and collectors can pay ArtistOS invoices by card from a link. Payments go to your Stripe account."],
    ["Does the AI make up facts about my work?", "The AI drafts descriptions and application text from what you enter and from your CV, and you edit before anything is shared. The grant application drafts are instructed not to invent exhibitions, awards or credentials."],
  ],
}

/* ------------------------------------------------------------------ */
export const pricing = {
  path: "/pricing",
  title: "Pricing — Free, Pro $29/mo, Studio $120/mo | ArtistOS",
  description:
    "ArtistOS pricing: Starter is free forever. Pro is $29/mo with a 14-day trial (50% off for students). Studio is $120/mo and adds the grant finder.",
  eyebrow: "Pricing",
  h1: "Simple pricing for working artists",
  lede: "Start free. Upgrade when your practice needs more. Annual plans get two months free.",
  wide: true,
  schema: [SOFTWARE_APP],
  body: `
<div class="narrow" style="padding:0">
<div class="answer"><strong>ArtistOS has three plans.</strong> Starter is free forever (up to 25 artworks). Pro costs $29 per month or $290 per year and adds AI tools, analytics, consignments and an artist website, with a 14-day free trial. Studio costs $120 per month or $1,200 per year and adds unlimited everything, the grant and residency finder, provenance, editions and appraisal records. Students with a .edu email get 50% off Pro.</div>
</div>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
<div class="plan"><h3>Starter</h3><p>Get started with the essentials</p><div class="price">Free</div><p class="note">Forever. No card.</p>
<ul><li>Up to 25 artworks</li><li>3 viewing rooms</li><li>20 contacts</li><li>10 invoices</li><li>Contract generator</li><li>Commission management</li><li>Messaging</li><li>Artist CV builder</li><li>QR codes</li></ul>
<a class="btn" href="/signup">Start free</a></div>
<div class="plan hi"><h3 style="color:#FAF8F5">Pro</h3><p>For the working artist</p><div class="price">$29<span style="font-size:18px">/mo</span></div><p class="note" style="color:rgba(250,248,245,.55)">or $290/year &middot; 14-day free trial &middot; 50% off with .edu email</p>
<ul><li>Up to 200 artworks</li><li>25 viewing rooms, 500 contacts, 100 invoices</li><li>AI descriptions, price suggestions and bio</li><li>Market and portfolio analytics</li><li>Social media scheduler</li><li>Exhibition planner</li><li>Consignment tracker</li><li>PDF catalog export</li><li>Expense tracking</li><li>Artist website and themes</li></ul>
<a class="btn" href="/signup">Start 14-day trial</a></div>
<div class="plan"><h3>Studio</h3><p>For the artist whose work is an asset</p><div class="price">$120<span style="font-size:18px">/mo</span></div><p class="note">or $1,200/year</p>
<ul><li>Everything in Pro, unlimited</li><li>Grant and opportunity engine with application drafts</li><li>Provenance and archive records</li><li>Editions and print management</li><li>Insurance and appraisal reports</li><li>Consignment map</li><li>Career analytics</li><li>Personal onboarding and quarterly review</li></ul>
<a class="btn" href="/signup">Get Studio</a></div>
</div>
<div class="narrow" style="padding:0">
<h2>Which plan is right for me?</h2>
<p><strong>Starter</strong> fits artists who are organizing their first body of work or selling occasionally. <strong>Pro</strong> fits artists who sell regularly, take commissions or work with galleries, and want AI help with descriptions and pricing. <strong>Studio</strong> fits established artists with large inventories, editions, consignments across several galleries, or who apply to grants and residencies every year.</p>
<p>Not sure? Start on Starter. Everything you add carries over when you upgrade. See <a href="/features">all features</a> or compare with <a href="/artwork-archive-alternative">Artwork Archive</a>.</p>
</div>
`,
  faq: [
    ["Is there a free trial of Pro?", "Yes. Pro includes a 14-day free trial. The Starter plan is free with no time limit."],
    ["Do students get a discount?", "Yes. Students who sign up with a .edu email address get 50% off Pro, applied automatically at checkout."],
    ["Can I switch or cancel anytime?", "Yes. You can upgrade, downgrade or cancel from your account. Paid plans are billed monthly or annually through Stripe."],
    ["How much do I save with annual billing?", "Annual billing costs the same as ten months: Pro is $290 per year instead of $348, and Studio is $1,200 per year instead of $1,440."],
    ["Does ArtistOS take a commission on my sales?", "ArtistOS does not take a percentage of your art sales. Card payments on invoices are processed by Stripe under your own Stripe account, and Stripe charges its standard processing fees."],
  ],
}

/* ------------------------------------------------------------------ */
export const faq = {
  path: "/faq",
  title: "ArtistOS FAQ — Questions About the Art Business Platform",
  description: "Answers about ArtistOS: what it does, pricing, the free plan, AI tools, online invoice payments, the grant finder, data ownership and who it's for.",
  eyebrow: "FAQ",
  h1: "Frequently asked questions",
  lede: "Straight answers about what ArtistOS does and doesn't do.",
  showUpdated: true,
  body: `<div class="answer"><strong>ArtistOS is business software for working visual artists</strong>, built in New Orleans. It's free to start, runs in the browser, and covers inventory, AI descriptions and pricing, contracts, invoices, collectors, viewing rooms, an artist website and CV, and a grant finder on the Studio plan.</div>`,
  faq: [
    ["What is ArtistOS?", "ArtistOS is an all-in-one platform for the business side of an art practice: artwork inventory, AI-written descriptions and price suggestions, commission and consignment contracts, invoices collectors can pay online, a collector CRM, private viewing rooms, an artist website and CV, and on the Studio plan, a grant and residency finder that drafts applications."],
    ["Who is ArtistOS for?", "Independent visual artists: painters, printmakers, photographers, ceramicists, sculptors, illustrators, muralists and mixed-media artists, from students and emerging artists to established artists with gallery representation. It is built for individual artists rather than galleries."],
    ["How much does ArtistOS cost?", "Starter is free forever. Pro is $29 per month or $290 per year with a 14-day free trial. Studio is $120 per month or $1,200 per year. Students with a .edu email get 50% off Pro."],
    ["Do I need a credit card to sign up?", "No. You can create a free Starter account without a credit card."],
    ["How does the AI price suggestion work?", "You enter the medium and dimensions of a piece. ArtistOS considers those along with your own past sales in the platform and suggests a price range. You always set the final price. The guide on how to price artwork explains the formulas most artists use."],
    ["Can collectors pay me through ArtistOS?", "Yes. After you connect your own Stripe account, invoices include a secure payment link and collectors can pay by card. The money goes to your Stripe account; ArtistOS does not take a cut of your sales."],
    ["What does the grant finder do?", "On the Studio plan, ArtistOS compares your medium, location and career stage with the grants, residencies, fellowships and open calls in its opportunity database, scores each for fit, flags deadlines and location restrictions, and drafts your application materials from your CV."],
    ["Can I sign contracts inside ArtistOS?", "ArtistOS generates commission, sales and consignment contracts with a live preview that you can download or print to sign. Built-in electronic signature is not available yet."],
    ["Who owns my artwork images and data?", "You do. Your images, inventory and client records belong to you, and ArtistOS does not take a cut of your sales. See the privacy policy for details."],
    ["Is ArtistOS a marketplace that sells my art?", "No. ArtistOS is a tool you use to run your own practice. You sell directly to your collectors and galleries. There is a public artist directory where you can choose to be listed."],
    ["How is ArtistOS different from Artwork Archive?", "Both track artwork inventory. ArtistOS adds AI descriptions and price suggestions, a contract generator, Stripe invoice payments, and a grant finder, and it has a free plan. Artwork Archive is older, has an iOS app and more reporting templates. See the full comparison."],
    ["Where is ArtistOS based?", "ArtistOS was founded in New Orleans, Louisiana, by Larry Jones."],
  ],
  ctaTitle: "Try it free",
}

/* ------------------------------------------------------------------ */
export const about = {
  path: "/about",
  title: "About ArtistOS — Built in New Orleans for Working Artists",
  description: "ArtistOS was founded in New Orleans by Larry Jones after months of studio visits with artists between New Orleans and New York. Here's why it exists.",
  eyebrow: "About",
  h1: "Artists are small businesses that were never given small-business tools",
  lede: "ArtistOS exists so the business side of an art practice takes less time than the art.",
  schema: [FOUNDER],
  body: `
<p>ArtistOS was founded in New Orleans by <strong>Larry Jones</strong>. Before writing a line of code, Larry spent months in artists' studios between New Orleans and New York asking one question: what is the most frustrating part of being a working artist?</p>
<p>Nobody said "making the work." They said guessing what to charge. Skipping the contract because writing one takes an afternoon. Chasing a collector for payment through Instagram DMs. Keeping inventory in a spreadsheet, prices in a notes app, and client history in their head. The business of a practice lived in five different places, and none of them were built for artists.</p>
<p>ArtistOS puts it in one place: inventory, AI descriptions and pricing, contracts, invoices collectors pay online, collectors, viewing rooms, an artist website and CV, and a grant and residency finder that drafts applications from an artist's own CV.</p>
<h2>What we believe</h2>
<ul>
<li><strong>Pricing should be explainable.</strong> Artists deserve a clear, consistent method, not a guess.</li>
<li><strong>Paperwork protects the work.</strong> A simple contract and a clean invoice prevent most of the problems artists tell us about.</li>
<li><strong>Funding shouldn't be a part-time job to find.</strong> Grants and residencies go unapplied-for because they're hard to find and slow to write for.</li>
<li><strong>Artists own their work and their data.</strong> ArtistOS doesn't take a cut of your sales.</li>
</ul>
<h2>Founding Artists</h2>
<p>We're building ArtistOS with a small group of Founding Artists who use it in their real practice and tell us what to fix. If you're a working artist and want to help shape it, <a href="mailto:larry@synergysourceadvisors.com">email Larry</a>.</p>
<h2>Contact</h2>
<p>Email <a href="mailto:larry@synergysourceadvisors.com">larry@synergysourceadvisors.com</a>. For schools and arts organizations interested in free access for students or members, mention your program in the subject line.</p>
`,
}

/* ------------------------------------------------------------------ */
export const guides = {
  path: "/guides",
  title: "Art Business Guides: Pricing, Contracts, Invoices, Grants | ArtistOS",
  description: "Free guides for working artists: how to price artwork, commission contracts, invoices, certificates of authenticity, consignment and artist grants.",
  eyebrow: "Guides",
  h1: "Art business guides",
  lede: "Practical, plain-English guides to the business side of an art practice. Free templates included.",
  showUpdated: false,
  body: `<div class="grid">${GUIDES.map(([h, t, d]) => `<div class="card"><h3><a href="${h}" style="color:inherit;text-decoration:none">${t}</a></h3><p>${d}</p><a class="more" href="${h}">Read the guide &rarr;</a></div>`).join("")}</div>`,
  schema: [{ "@type": "ItemList", itemListElement: GUIDES.map(([h, t], i) => ({ "@type": "ListItem", position: i + 1, url: SITE + h, name: t })) }],
}

export const productPages = [features, pricing, faq, about, guides]
