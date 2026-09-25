import { SITE, UPDATED } from "./layout.mjs"

const article = (path, headline, description) => ({
  "@type": "Article",
  "@id": `${SITE}${path}#article`,
  headline,
  description,
  datePublished: UPDATED,
  dateModified: UPDATED,
  author: { "@id": `${SITE}/about#larry-jones` },
  publisher: { "@id": `${SITE}/#organization` },
  mainEntityOfPage: `${SITE}${path}`,
  image: `${SITE}/og-image.png`,
})

const guideCrumbs = (path, name) => [["/", "Home"], ["/guides", "Guides"], [path, name]]

const sources = (list) =>
  `<h2>Sources</h2><ul class="note">${list.map(([t, u]) => `<li><a href="${u}" rel="nofollow noopener">${t}</a></li>`).join("")}</ul>`

/* ------------------------------------------------------------------ */
const priceCalc = `
(function(){var f=document.getElementById('pc');if(!f)return;function r(){var w=parseFloat(f.w.value)||0,h=parseFloat(f.h.value)||0,m=f.m.value,rate=parseFloat(f.r.value)||0,mat=parseFloat(f.c.value)||0;
var base=m==='sq'?w*h*rate:(w+h)*rate;var total=Math.round((base+mat*(f.d.checked?2:1))/10)*10;
document.getElementById('po').textContent=total>0?'$'+total.toLocaleString():'—';
document.getElementById('pe').textContent=m==='sq'?(w+' × '+h+' in = '+(w*h)+' sq in × $'+rate):('('+w+' + '+h+') = '+(w+h)+' linear in × $'+rate);}
f.addEventListener('input',r);f.m.addEventListener('change',function(){f.r.value=f.m.value==='sq'?3:15;r()});r();})();`

export const pricingGuide = {
  path: "/how-to-price-artwork",
  title: "How to Price Artwork: Formulas + Free Art Pricing Calculator (2026)",
  description:
    "How to price your art with the square-inch and linear-inch methods, typical rates for emerging artists, prints and commissions, plus a free calculator.",
  eyebrow: "Pricing guide",
  h1: "How to price your artwork",
  lede: "The two formulas most working artists use, the rates that are typical at each stage, and a free calculator.",
  crumbs: guideCrumbs("/how-to-price-artwork", "How to price artwork"),
  type: "article",
  schema: [article("/how-to-price-artwork", "How to price your artwork", "Square-inch and linear-inch pricing formulas with a free calculator.")],
  script: priceCalc,
  body: `
<div class="answer"><strong>Short answer:</strong> most artists price original work by size using a consistent formula. <strong>Square-inch method:</strong> width × height × a dollar rate per square inch, plus materials. <strong>Linear-inch method:</strong> (width + height) × a multiplier, plus materials. Emerging artists commonly use about $2–4 per square inch or a linear-inch multiplier of about 10–25, then raise the rate as their work sells consistently. Keep the same prices everywhere you sell.</div>

<h2>Free art pricing calculator</h2>
<form id="pc" class="calc" onsubmit="return false">
<div class="row"><div><label for="w">Width (inches)</label><input id="w" name="w" type="number" min="0" value="18"></div>
<div><label for="h">Height (inches)</label><input id="h" name="h" type="number" min="0" value="24"></div></div>
<div class="row"><div><label for="m">Method</label><select id="m" name="m"><option value="sq">Square inch</option><option value="lin">Linear inch</option></select></div>
<div><label for="r">Rate ($ per inch)</label><input id="r" name="r" type="number" min="0" step="0.25" value="3"></div>
<div><label for="c">Materials &amp; framing ($)</label><input id="c" name="c" type="number" min="0" value="100"></div></div>
<label style="font-weight:400"><input type="checkbox" name="d" checked style="width:auto"> Double the materials cost (a common rule of thumb)</label>
<output id="po" aria-live="polite">—</output><div class="note" id="pe"></div>
</form>
<p class="note">Rounded to the nearest $10. A starting point, not a rule: adjust for your market, sales history and where you sell. ArtistOS Pro suggests a price range from your medium, size and your own past sales.</p>

<h2>Method 1: price per square inch</h2>
<p><strong>Formula:</strong> (width × height × rate) + materials. Example: an 18 × 24 inch painting is 432 square inches. At $4 per square inch that's $1,728; add $100 of materials counted twice ($200) and the price is about $1,930.</p>
<p>Typical starting rates: artists new to selling often begin around <strong>$1–2 per square inch</strong>; emerging artists with some sales history commonly sit around <strong>$2–4</strong>, and rates rise with demand, gallery representation and reputation.</p>
<p><strong>The catch:</strong> square-inch pricing makes small works too cheap and very large works too expensive. Many gallerists recommend charging a <em>higher</em> rate per square inch for small pieces and a lower one for large pieces so your price list rises smoothly with size.</p>

<h2>Method 2: price per linear inch</h2>
<p><strong>Formula:</strong> (width + height) × multiplier + materials. Example: a 24 × 36 inch piece is 60 linear inches; at a multiplier of 15, that's $900 before materials. Multipliers of roughly <strong>10 to 25</strong> are commonly cited for emerging and mid-career artists. The linear-inch method scales more gently than square inches, which is why many painters prefer it for work of very different sizes.</p>

<h2>Rules that matter more than the formula</h2>
<ol>
<li><strong>Be consistent everywhere.</strong> Your price at an art fair, on your website and in a gallery should match. Collectors compare, and galleries expect it.</li>
<li><strong>Price the gallery commission in, not on top.</strong> If a gallery takes 50%, your retail price is the price; don't charge your studio buyers less than gallery buyers.</li>
<li><strong>Raise prices on evidence.</strong> Raise your rate when work sells steadily, you have a waitlist, or you add a significant show or representation. Never lower prices on work that has already sold.</li>
<li><strong>Keep a record.</strong> Pricing gets easier when you can see what sold, at what size and medium, and how fast. That's exactly what ArtistOS tracks.</li>
</ol>

<h2>How to price prints and editions</h2>
<p>Price limited editions below the original and in relation to edition size, paper and process: smaller editions and hand-pulled processes (etching, lithography, screenprint) justify higher prices than large open-edition digital prints. Number and sign editions, and give each a <a href="/certificate-of-authenticity-template">certificate of authenticity</a>.</p>

<h2>How to price commissions</h2>
<p>Start from your normal formula for the size and medium, then add for custom work: extra sketches or revisions, rush timelines, travel or site visits, and installation. Take a deposit (50% is common) before starting. See our <a href="/art-commission-contract-template">commission contract template</a>.</p>

${sources([
    ["Artwork Archive — How to price consistently for art sales success", "https://www.artworkarchive.com/blog/how-to-price-consistently-for-art-sales-success"],
    ["FoundMyself — How to price your art", "https://www.foundmyself.com/blog/how-to-price-your-art/"],
    ["Pastel Society of Colorado — Pricing your artwork: the linear inch method (PDF)", "https://www.pastelsocietyofcolorado.org/wp-content/uploads/2023/08/pricing_your_artwork_-_linear_inch_method.pdf"],
    ["RedDotBlog — Ask a gallery owner: pricing", "https://reddotblog.com/ask-a-gallery-owner-pricing-21/"],
  ])}
`,
  faq: [
    ["How much should I charge for my art as a beginner?", "Many beginners start at about $1–2 per square inch (or a linear-inch multiplier near 10) plus materials, then raise the rate as work sells consistently. The key is using one consistent formula so your prices make sense to collectors."],
    ["What is the square inch method for pricing art?", "Multiply the width by the height to get square inches, multiply by your dollar rate per square inch, then add the cost of materials (often doubled). An 18 × 24 inch piece at $3 per square inch is $1,296 plus materials."],
    ["What is the linear inch method for pricing art?", "Add the width and height, then multiply by a multiplier, commonly between about 10 and 25 for emerging and mid-career artists, and add materials. A 24 × 36 inch piece at a multiplier of 15 is $900 plus materials."],
    ["Should my prices be the same in galleries and at art fairs?", "Yes. Keep one retail price everywhere you sell. If a gallery takes a commission, that comes out of the retail price rather than being added on top."],
    ["When should I raise my art prices?", "Raise prices when your work sells steadily, when you have a waitlist or more demand than supply, or after meaningful milestones like gallery representation. Raise gradually and never reduce prices on work that has already sold."],
  ],
}

/* ------------------------------------------------------------------ */
export const commissionGuide = {
  path: "/art-commission-contract-template",
  title: "Art Commission Contract Template (Free) + What to Include",
  description:
    "A free art commission contract template and checklist: scope, approvals, deposit, timeline, delivery, cancellation and copyright, for independent artists.",
  eyebrow: "Contracts",
  h1: "Art commission contract template",
  lede: "What every commission agreement should cover, and a free template you can copy.",
  crumbs: guideCrumbs("/art-commission-contract-template", "Commission contract template"),
  type: "article",
  schema: [article("/art-commission-contract-template", "Art commission contract template", "What to include in an art commission agreement, with a free template.")],
  body: `
<div class="answer"><strong>A commission contract should state:</strong> what you'll make (size, medium, subject), how many sketches and revisions are included, the total price and a deposit (commonly 50%, non-refundable, due before work starts), the timeline, delivery and shipping, what happens if either side cancels, and that you keep the copyright and reproduction rights. Both parties sign before work begins.</div>

<h2>Commission contract checklist</h2>
<ol>
<li><strong>Parties:</strong> your name or studio and the client's name and contact details.</li>
<li><strong>Description of the work:</strong> subject, size, medium, materials, framing, and any reference images.</li>
<li><strong>Creative control and approvals:</strong> how many preliminary sketches, how many rounds of revisions, and what counts as a change that costs extra.</li>
<li><strong>Price and payment schedule:</strong> total price, deposit amount, when the balance is due (usually before delivery), accepted payment methods.</li>
<li><strong>Timeline:</strong> estimated completion date that starts when the deposit is received, and how delays on either side are handled.</li>
<li><strong>Delivery, shipping and installation:</strong> who pays, who insures the work in transit, and when ownership transfers.</li>
<li><strong>Cancellation (kill fee):</strong> what the client owes if they cancel at each stage, and what you refund if you can't complete the work.</li>
<li><strong>Copyright and reproduction:</strong> the client owns the physical work; you keep the copyright and the right to photograph and show it in your portfolio.</li>
<li><strong>Signatures and date.</strong></li>
</ol>

<h2>Free commission contract template</h2>
<p class="note">A general template, not legal advice. Laws vary by state and country; have an attorney review agreements for large commissions.</p>
<div class="template">ART COMMISSION AGREEMENT

This agreement is made on [DATE] between [ARTIST NAME / STUDIO] ("Artist") and [CLIENT NAME] ("Client").

1. THE WORK
The Artist will create an original artwork: [SUBJECT], [MEDIUM], approximately [WIDTH × HEIGHT] inches, [FRAMED / UNFRAMED].

2. APPROVALS
The Artist will provide [2] preliminary sketches. The price includes [2] rounds of revisions at the sketch stage. Changes after the sketch is approved may be billed at [$ / hour or flat fee].

3. PRICE AND PAYMENT
Total price: $[AMOUNT]. A non-refundable deposit of $[50% OF TOTAL] is due on signing, and work begins when it is received. The balance of $[AMOUNT] is due before delivery.

4. TIMELINE
Estimated completion: [DATE or NUMBER OF WEEKS] after the deposit is received. The Artist will notify the Client of any delay.

5. DELIVERY
[Pickup / shipping / installation] on or about [DATE]. Shipping and insurance are paid by [CLIENT / ARTIST]. Ownership of the physical artwork transfers to the Client when payment is complete.

6. CANCELLATION
If the Client cancels after the sketch is approved, the deposit is kept and [__%] of the balance is due. If the Artist cannot complete the work, the Artist refunds [all payments beyond the deposit / the full amount].

7. COPYRIGHT
The Artist retains all copyright and reproduction rights. The Client may not reproduce the artwork commercially without written permission. The Artist may photograph and exhibit images of the work.

Artist signature: __________________  Date: ________
Client signature: __________________  Date: ________</div>
<p>ArtistOS generates commission, sales and consignment agreements with these sections filled in from your client and artwork records, with a live preview you can download or print. It also tracks the deposit and the balance as invoices.</p>

${sources([
    ["RedDotBlog — The artist's guide to commission agreements", "https://reddotblog.com/the-artists-guide-to-commission-agreements-how-to-protect-your-process-without-overcomplicating-the-experience/"],
    ["ArtConnect — Guide to artist contracts and agreements", "https://www.magazine.artconnect.com/resources/guide-to-artist-contracts-and-agreements"],
  ])}
`,
  faq: [
    ["How much deposit should I take for an art commission?", "A 50% deposit due before you start is the most common practice, usually stated as non-refundable once work begins, with the balance due before delivery."],
    ["Who owns the copyright to a commissioned painting?", "Unless the contract says otherwise, the artist generally keeps the copyright and the client owns the physical artwork. State this plainly in the contract, including your right to photograph and show the work."],
    ["What if the client wants changes?", "Specify how many sketches and revision rounds are included, and charge for changes beyond that or after the sketch is approved."],
    ["Do I need a contract for a small commission?", "Yes. Even a one-page agreement that covers the work, price, deposit, timeline and cancellation prevents most disputes."],
  ],
}

/* ------------------------------------------------------------------ */
export const invoiceGuide = {
  path: "/artist-invoice-template",
  title: "Artist Invoice Template (Free) — What to Include When You Sell Art",
  description:
    "What to put on an invoice when you sell art or a commission, with a free artist invoice template: artwork details, deposit, sales tax and payment terms.",
  eyebrow: "Invoices",
  h1: "Artist invoice template",
  lede: "What to include on an invoice when you sell a painting, print or commission, and a free template.",
  crumbs: guideCrumbs("/artist-invoice-template", "Artist invoice template"),
  type: "article",
  schema: [article("/artist-invoice-template", "Artist invoice template", "What to include on an invoice for artwork sales and commissions.")],
  body: `
<div class="answer"><strong>An artist's invoice should include:</strong> your name and contact details, an invoice number and date, the buyer's name and contact details, the artwork's title, medium, dimensions and year, the price, any deposit already paid, sales tax if it applies, shipping or installation, the total due, the due date, how to pay, and a line stating that you keep the copyright.</div>

<h2>Checklist</h2>
<ul>
<li>Your name or studio name, email, phone and address or city</li>
<li>Invoice number (sequential) and invoice date</li>
<li>Buyer or client name, email and billing address</li>
<li>Artwork details: title, medium, dimensions, year, edition number if a print</li>
<li>Price, less any deposit received</li>
<li>Sales tax, if your state requires you to collect it</li>
<li>Framing, shipping, crating or installation as separate lines</li>
<li>Total due, due date and payment methods (card link, bank transfer, check)</li>
<li>Notes: "Title transfers upon payment in full. Artist retains all copyright and reproduction rights."</li>
</ul>

<h2>Free artist invoice template</h2>
<div class="template">INVOICE #[0001]                              Date: [DATE]
From: [ARTIST NAME] · [EMAIL] · [PHONE] · [CITY, STATE]
Bill to: [BUYER NAME] · [EMAIL] · [ADDRESS]

Artwork: "[TITLE]", [YEAR]
[MEDIUM], [W × H] in [Edition 3/25, if applicable]

Artwork price ................................ $[0,000.00]
Framing ...................................... $[000.00]
Shipping & insurance ......................... $[000.00]
Sales tax ([RATE]%, if applicable) ............ $[000.00]
Less deposit received ([DATE]) ............... –$[000.00]
TOTAL DUE .................................... $[0,000.00]

Due: [DATE]   Pay by: [card link / bank transfer / check]

Title to the artwork transfers upon payment in full.
The artist retains all copyright and reproduction rights.
Thank you for supporting my work.</div>

<h2>A note on sales tax</h2>
<p>Whether you must collect sales tax on art depends on your state and how and where you sell (studio, fair, online, out of state). Many states require a seller's permit even for occasional sales at fairs. Check your state revenue department's guidance or ask a tax professional. This guide is not tax advice.</p>

<h2>Get paid faster</h2>
<p>ArtistOS creates invoices from your artwork and client records and, once you connect Stripe, includes a secure link so collectors can pay by card. You can see which invoices are pending, paid or overdue, and deposits for commissions are tracked against the final invoice.</p>

${sources([
    ["Artwork Archive — What to include in your invoice: a checklist for artists", "https://www.artworkarchive.com/blog/what-to-include-in-your-invoice-a-checklist-for-artists"],
    ["TaxJar — Sales tax guide for artists", "https://www.taxjar.com/blog/services/sales-tax-guide-artists"],
  ])}
`,
  faq: [
    ["What should an invoice for a painting include?", "Your details, an invoice number and date, the buyer's details, the painting's title, medium, size and year, the price, any deposit paid, sales tax if applicable, shipping, the total, the due date, payment methods, and a note that you keep the copyright."],
    ["Should I charge sales tax on my art?", "In many U.S. states, yes, sales of physical artwork are taxable and you need a seller's permit. Rules differ by state and by where the buyer is, so check your state revenue department or a tax professional."],
    ["How can collectors pay an artist's invoice online?", "Use an invoicing tool with card payments. In ArtistOS, connect your Stripe account and each invoice includes a secure payment link; money goes to your Stripe account."],
  ],
}

/* ------------------------------------------------------------------ */
export const coaGuide = {
  path: "/certificate-of-authenticity-template",
  title: "Certificate of Authenticity for Art: Template + What to Include",
  description:
    "What a certificate of authenticity (COA) for artwork should include, for originals and limited-edition prints, with a free COA template.",
  eyebrow: "Certificates",
  h1: "Certificate of authenticity template for artists",
  lede: "What to put on a certificate of authenticity for an original or a limited edition, and a free template.",
  crumbs: guideCrumbs("/certificate-of-authenticity-template", "Certificate of authenticity"),
  type: "article",
  schema: [article("/certificate-of-authenticity-template", "Certificate of authenticity template for artists", "What a COA for artwork includes.")],
  body: `
<div class="answer"><strong>A certificate of authenticity (COA) should include:</strong> the artist's name, the artwork's title, year, dimensions and medium, a photo of the work, a statement that it is an original (or edition number, e.g. 3/25, with the print process and paper), the artist's signature and date, and a copyright notice. Many artists add a unique ID number, contact details and exhibition history.</div>
<h2>Free COA template</h2>
<div class="template">CERTIFICATE OF AUTHENTICITY

[PHOTO OF THE ARTWORK]

Title: [TITLE]
Artist: [ARTIST NAME]
Year: [YEAR]
Medium: [MEDIUM]            Dimensions: [W × H (× D)] in
Edition: [Original, one of a kind]  or  [3/25 — process, paper]
Certificate ID: [UNIQUE NUMBER]

I certify that this is an authentic artwork created by me.
All copyright and reproduction rights are retained by the artist.

Signature: ______________________   Date: __________
[ARTIST WEBSITE / EMAIL]</div>
<h2>Tips</h2>
<ul>
<li>Use a unique ID that matches your inventory record so the certificate can always be traced to the piece.</li>
<li>For editions, state the total edition size and any artist's proofs.</li>
<li>Keep a copy. A COA is part of the work's provenance.</li>
</ul>
<p>ArtistOS generates a certificate of authenticity and a QR code for any artwork in your inventory, and on Studio keeps a full provenance timeline for each piece.</p>
${sources([
    ["Format — Certificates of authenticity for artwork", "https://www.format.com/magazine/resources/art/certificates-of-authenticity"],
    ["Artwork Archive Help — Generating a certificate of authenticity", "https://help.artworkarchive.com/en/articles/802853-generating-a-certificate-of-authenticity"],
  ])}
`,
  faq: [
    ["Do I need a certificate of authenticity for my art?", "It isn't legally required, but collectors increasingly expect one for originals and limited editions, and it helps document provenance."],
    ["Should a certificate of authenticity be signed?", "Yes. The artist should sign and date it, ideally in ink, and keep a matching record in their inventory."],
  ],
}

/* ------------------------------------------------------------------ */
export const consignmentGuide = {
  path: "/art-consignment-agreement",
  title: "Art Consignment Agreements: Gallery Splits & What to Include",
  description:
    "How art consignment works, the typical 50/50 gallery split, what an artist–gallery consignment agreement should include, and how to track consigned work.",
  eyebrow: "Galleries",
  h1: "Art consignment agreements: splits and what to include",
  lede: "How consignment with a gallery works, what the standard split is, and what to get in writing.",
  crumbs: guideCrumbs("/art-consignment-agreement", "Consignment agreements"),
  type: "article",
  schema: [article("/art-consignment-agreement", "Art consignment agreements", "Gallery consignment splits and what to include in the agreement.")],
  body: `
<div class="answer"><strong>In a consignment, the artist keeps ownership while a gallery shows and sells the work, and the sale is split.</strong> The standard split in commercial galleries is <strong>50/50</strong> of the retail price; some galleries offer 60/40 in the artist's favor. The agreement should list each work and its retail price, the commission, the consignment period, who pays for framing, shipping and insurance, how quickly you get paid after a sale, and how unsold work is returned.</div>
<h2>What to include in a consignment agreement</h2>
<ol>
<li>An inventory list: title, medium, size and agreed retail price for every work</li>
<li>Commission percentage, and whether it applies to studio sales or commissions the gallery refers</li>
<li>Consignment period and how either side can end it</li>
<li>Payment terms: how many days after a sale you are paid, and whether you get the buyer's name</li>
<li>Discounts: whether the gallery can discount and whose share it comes from</li>
<li>Insurance while the work is at the gallery and in transit</li>
<li>Framing and shipping costs, and whether they come off the top before the split</li>
<li>Return of unsold work, condition, and who pays for it</li>
<li>Copyright stays with the artist</li>
</ol>
<h2>Track what's where</h2>
<p>Once work is spread across galleries, fairs and your studio, the hard part is knowing where each piece is and what you're owed. ArtistOS tracks every consignment (gallery, commission rate, dates) and updates each artwork's location, and Studio shows it all on a consignment map. Pair each agreement with a consignment sheet listing the works and prices.</p>
${sources([
    ["Hyperallergic — It's time to rethink the 50/50 split with art galleries", "https://hyperallergic.com/its-time-rethink-the-50-50-split-with-art-galleries/"],
    ["ArtConnect — Guide to artist contracts and agreements", "https://www.magazine.artconnect.com/resources/guide-to-artist-contracts-and-agreements"],
    ["Artwork Archive — Consignment agreements for artists", "https://www.artworkarchive.com/blog/art-business-essentials-consignment-agreements-for-artists"],
  ])}
`,
  faq: [
    ["What percentage do art galleries take?", "Most commercial galleries take 50% of the retail price on consigned work. Some offer the artist 60%, and nonprofit spaces or co-ops often take less."],
    ["Is framing deducted before the gallery split?", "It depends on the agreement. Some galleries reimburse framing off the top before splitting; others split the full price. Put it in writing."],
    ["How long should a consignment period be?", "Many agreements run for the length of a show or a set term such as 6 to 12 months, with a clause for returning unsold work."],
  ],
}

/* ------------------------------------------------------------------ */
export const louisianaGuide = {
  path: "/artist-grants-louisiana",
  title: "Grants & Residencies for Louisiana and New Orleans Artists (2026)",
  description:
    "Grants, fellowships and residencies individual artists in New Orleans and Louisiana can apply to, with eligibility, awards and timing, updated for 2026.",
  eyebrow: "Funding",
  h1: "Grants and residencies for Louisiana artists",
  lede: "Which programs individual visual artists in New Orleans and Louisiana can actually apply to, what they pay, and when they open.",
  crumbs: guideCrumbs("/artist-grants-louisiana", "Louisiana artist grants"),
  type: "article",
  schema: [article("/artist-grants-louisiana", "Grants and residencies for Louisiana artists", "Funding programs open to individual visual artists in Louisiana.")],
  wide: true,
  body: `
<div class="narrow" style="padding:0">
<div class="answer"><strong>Individual visual artists in Louisiana can apply to:</strong> the South Arts Southern Prize and State Fellowships ($5,000 fellowship), the New Orleans Jazz &amp; Heritage Foundation's Louisiana Cultural Equity arts grants (up to $7,500), the Joan Mitchell Center artist residency in New Orleans, the Ogden Museum's Louisiana Contemporary open call ($5,000 prize), and national programs like the Pollock-Krasner Foundation grant. Several well-known local grants, including Arts New Orleans' Community Arts Grants and Louisiana Project Grants, are for <strong>organizations only</strong>.</div>
<p class="note">Last checked September 24, 2026. Deadlines and rules change every cycle; always confirm on the official page before applying.</p>
</div>
<h2>Programs open to individual artists</h2>
<table>
<thead><tr><th>Program</th><th>Who can apply</th><th>Award</th><th>Typical timing</th></tr></thead>
<tbody>
<tr><td><a href="https://www.southarts.org/grants-opportunities/southern-prize-and-state-fellowships-visual-arts" rel="nofollow noopener">South Arts Southern Prize &amp; State Fellowships (visual arts)</a></td><td>Visual artists 18+ living in the South Arts region (includes Louisiana) for 2+ years; not students</td><td>$5,000 state fellowship; finalists $10,000; Southern Prize $25,000, with a residency</td><td>2026 cycle ran Feb 10 – Mar 18; $25 fee (waivable)</td></tr>
<tr><td><a href="https://www.jazzandheritage.org/2026-2027-community-partnership-grants/" rel="nofollow noopener">Jazz &amp; Heritage Foundation — Louisiana Cultural Equity: Arts + Creation</a></td><td>Individuals based in Louisiana</td><td>Up to $7,500</td><td>2026–27 deadline was July 8, 2026 (projects Sept 2026 – Aug 2027)</td></tr>
<tr><td><a href="https://www.joanmitchellfoundation.org/artist-programs/air-program-2027-guidelines" rel="nofollow noopener">Joan Mitchell Center Artist-in-Residence (New Orleans)</a></td><td>Visual artists 21+; New Orleans-area artists with 5+ years' residence in Orleans, Jefferson or Plaquemines (or natives); not students</td><td>Studio residency with a $150/week stipend</td><td>2027 sessions; applications ran Mar 30 – Jun 1, 2026</td></tr>
<tr><td><a href="https://ogdenmuseum.org/ogden-museum-of-southern-art-announces-open-call-for-the-2026-edition-of-louisiana-contemporary-presented-by-the-helis-foundation/" rel="nofollow noopener">Ogden Museum — Louisiana Contemporary</a></td><td>Louisiana residents 18+, recent work</td><td>Exhibition; Helis Foundation Art Prize $5,000</td><td>2026 call ran Apr 6 – May 22; exhibition Aug 2026 – Jan 2027</td></tr>
<tr><td><a href="https://astudiointhewoods.org/series/artistic/" rel="nofollow noopener">A Studio in the Woods</a></td><td>Artists in all disciplines; Replenish is for South Louisiana artists and culture bearers</td><td>Residency with a weekly stipend</td><td>2026–27 residencies are by invitation; watch for open calls</td></tr>
<tr><td><a href="https://warholfoundation.org/grants/regional-regranting/platforms-fund/" rel="nofollow noopener">Platforms Fund (Andy Warhol Foundation regrant)</a></td><td>Self-organized, collaborative artist projects in New Orleans</td><td>Up to $10,000 per project</td><td>Check site for the current cycle</td></tr>
<tr><td><a href="https://www.pkf.org/grants/grant-for-artists/" rel="nofollow noopener">Pollock-Krasner Foundation Grant</a></td><td>Working visual artists with financial need (national)</td><td>Unrestricted grant</td><td>Rolling; review takes 9–12 months</td></tr>
</tbody></table>
<div class="narrow" style="padding:0">
<h2>Local grants that are for organizations, not individuals</h2>
<ul>
<li><strong>Arts New Orleans Community Arts Grants</strong> ("More Joy" and "New Orleans as Cultural Capital") fund nonprofits based in Orleans Parish. <a href="https://www.artsneworleans.org/grantmaking/community-arts-grants/" rel="nofollow noopener">Details</a>.</li>
<li><strong>Louisiana Project Grants</strong> (Region 1, administered by Arts New Orleans) state that individual artists are no longer eligible. <a href="https://www.artsneworleans.org/grantmaking/louisiana-project-grants/" rel="nofollow noopener">Details</a>.</li>
<li><strong>Louisiana Division of the Arts</strong> currently lists project, operating and arts-in-education grants for organizations. For individual artists it offers the Culturalyst artist roster, Percent for Art calls and folklife apprenticeships. <a href="https://www.crt.state.la.us/cultural-development/arts/grants/" rel="nofollow noopener">Details</a>.</li>
</ul>
<p>If you want to use one of these, partner with a nonprofit or a fiscal sponsor that can apply on a project's behalf.</p>
<h2>Tips for Louisiana applicants</h2>
<ul>
<li>Keep an up-to-date CV, artist statement and 10–20 strong images ready so you can apply the week a call opens.</li>
<li>Read the residency requirement carefully: several programs require years of residence in specific parishes.</li>
<li>Put the spring windows (South Arts in February–March, Joan Mitchell and Ogden in spring) on your calendar now.</li>
</ul>
<p>ArtistOS Studio's grant finder matches your medium, location and career stage against the opportunities in its database, flags location restrictions and deadlines, and drafts your statement, project description and bio from your CV.</p>
</div>
`,
  faq: [
    ["Can individual artists apply for Arts New Orleans grants?", "Not for the Community Arts Grants or Louisiana Project Grants, which are for organizations. Individual artists can partner with a nonprofit or fiscal sponsor, or look at programs like the Jazz & Heritage Foundation's Louisiana Cultural Equity grants and South Arts fellowships."],
    ["Does Louisiana have an individual artist fellowship?", "As of September 2026, the Louisiana Division of the Arts does not list an individual artist fellowship. Louisiana visual artists can apply for the South Arts State Fellowship, which awards $5,000 to artists in each state in the region."],
    ["Are there artist residencies in New Orleans?", "Yes. The Joan Mitchell Center runs artist residencies in New Orleans, with a stipend, for eligible local and national artists, and A Studio in the Woods offers residencies in South Louisiana."],
  ],
}

/* ------------------------------------------------------------------ */
const compareTable = `
<table><thead><tr><th></th><th>ArtistOS</th><th>Artwork Archive</th><th>ArtCloud (artist plans)</th><th>Artwork Codex</th><th>Artlogic</th></tr></thead><tbody>
<tr><td>Built for</td><td>Independent artists</td><td>Artists, collectors, organizations</td><td>Galleries and artists</td><td>Artists</td><td>Galleries first</td></tr>
<tr><td>Free plan</td><td>Yes (25 artworks)</td><td>No (14-day trial)</td><td>Yes (50 artworks, no invoices)</td><td>Yes (5 artworks)</td><td>No</td></tr>
<tr><td>Entry paid price</td><td>$29/mo</td><td>$10/mo ($9/mo annual)</td><td>$29/mo</td><td>$96/yr</td><td>From £95/mo (artist)</td></tr>
<tr><td>AI descriptions &amp; price suggestions</td><td>Yes</td><td>Not found</td><td>Not found</td><td>Not found</td><td>Not found</td></tr>
<tr><td>Contract generator</td><td>Yes</td><td>Not found (document storage)</td><td>Not found</td><td>Not found</td><td>Not found</td></tr>
<tr><td>Invoices paid online</td><td>Yes, Stripe</td><td>Yes, PayPal only</td><td>Yes, Stripe</td><td>Not verified</td><td>Yes, Artlogic Pay</td></tr>
<tr><td>Grant &amp; residency finder</td><td>Yes (Studio), with drafts</td><td>Call-for-entry tracking</td><td>No</td><td>No</td><td>No</td></tr>
<tr><td>Mobile app</td><td>Web app, works on phones</td><td>iOS app</td><td>Web</td><td>Web</td><td>Web</td></tr>
</tbody></table>
<p class="note">Competitor details from each company's public pricing and help pages, checked September 24, 2026. "Not found" means we couldn't find the feature on their public site; tell us if that's changed and we'll update this page.</p>`

export const inventoryGuide = {
  path: "/art-inventory-software",
  title: "Art Inventory Software for Artists: What to Look For (2026 Comparison)",
  description:
    "How to choose art inventory software as an artist, and how ArtistOS, Artwork Archive, ArtCloud, Artwork Codex and Artlogic compare on price and features.",
  eyebrow: "Software",
  h1: "Art inventory software for artists",
  lede: "What to look for, what it should cost, and how the main options compare.",
  crumbs: guideCrumbs("/art-inventory-software", "Art inventory software"),
  type: "article",
  wide: true,
  schema: [article("/art-inventory-software", "Art inventory software for artists", "How to choose art inventory software, with a comparison.")],
  body: `
<div class="narrow" style="padding:0">
<div class="answer"><strong>Art inventory software</strong> keeps a record of every artwork you make (title, medium, size, price, images, status and location) and ties it to sales, collectors and galleries. For an independent artist, the best choice is the one that also handles the work around the inventory: invoices, contracts, consignments and a public portfolio. Popular options include ArtistOS, Artwork Archive, ArtCloud and Artwork Codex; gallery-focused systems like Artlogic and Arternal cost more and are built for dealers.</div>
<h2>What to look for</h2>
<ol>
<li><strong>Fast entry.</strong> Adding a piece should take a minute, with images and dimensions.</li>
<li><strong>Status and location.</strong> Available, sold, on consignment, and which gallery has it.</li>
<li><strong>Connected sales.</strong> Invoices and payments that link to the artwork and the buyer.</li>
<li><strong>Collector records.</strong> Who bought what, and when.</li>
<li><strong>Documents.</strong> Certificates of authenticity, price lists, consignment sheets, catalogs.</li>
<li><strong>A public portfolio.</strong> So your inventory doubles as your website.</li>
<li><strong>Price you can justify.</strong> A free tier to start, and plans that grow with you.</li>
</ol>
</div>
<h2>How the main options compare</h2>
${compareTable}
<div class="narrow" style="padding:0">
<h2>Where ArtistOS fits</h2>
<p>ArtistOS is built for the independent artist who wants inventory <em>and</em> the business around it: AI-written descriptions and price suggestions, a contract generator, invoices collectors pay by card through Stripe, a collector CRM, viewing rooms, an artist website and CV, and on Studio, a grant and residency finder. It's free to start. If you mainly need a mature inventory with an iOS app and lots of report templates, Artwork Archive is a strong choice; galleries with staff should look at gallery systems.</p>
<p>See the detailed <a href="/artwork-archive-alternative">ArtistOS vs Artwork Archive comparison</a> or <a href="/features">all ArtistOS features</a>.</p>
</div>
`,
  faq: [
    ["What is the best art inventory software for artists?", "It depends on what else you need. Artwork Archive is a long-established inventory tool with an iOS app. ArtistOS combines inventory with AI pricing and descriptions, contracts, Stripe invoicing and a grant finder, and has a free plan. ArtCloud suits artists who work closely with galleries on its network."],
    ["Is there free art inventory software?", "Yes. ArtistOS Starter is free for up to 25 artworks, ArtCloud has a free plan for 50 artworks without invoicing, and Artwork Codex is free for 5 artworks."],
    ["Can I use a spreadsheet for art inventory?", "You can, and many artists start there. Dedicated software becomes worth it when you need images, sales and client history, consignment tracking, certificates and invoices connected to each piece."],
  ],
}

export const archiveAlt = {
  path: "/artwork-archive-alternative",
  title: "Artwork Archive Alternative — ArtistOS vs Artwork Archive (2026)",
  description:
    "An honest comparison of ArtistOS and Artwork Archive: pricing, free plans, AI pricing and descriptions, contracts, online invoice payments and grant tools.",
  eyebrow: "Comparison",
  h1: "ArtistOS vs Artwork Archive",
  lede: "An honest side-by-side for artists deciding between the two.",
  crumbs: guideCrumbs("/artwork-archive-alternative", "Artwork Archive alternative"),
  type: "article",
  wide: true,
  schema: [article("/artwork-archive-alternative", "ArtistOS vs Artwork Archive", "Comparison of ArtistOS and Artwork Archive for artists.")],
  body: `
<div class="narrow" style="padding:0">
<div class="answer"><strong>The short version:</strong> Artwork Archive is a mature art inventory tool with an iOS app and extensive reports, starting at $10/month with no free plan. ArtistOS is a newer, all-in-one business platform with a free plan, AI descriptions and price suggestions, a contract generator, invoices collectors pay by card through Stripe, and a grant and residency finder on its Studio plan. Choose Artwork Archive for a proven inventory and reporting tool; choose ArtistOS if you want inventory plus pricing, paperwork, payments and funding in one place.</div>
</div>
<h2>Side by side</h2>
<table><thead><tr><th></th><th>ArtistOS</th><th>Artwork Archive</th></tr></thead><tbody>
<tr><td>Free plan</td><td>Yes, up to 25 artworks, no time limit</td><td>No; 14-day free trial</td></tr>
<tr><td>Paid plans</td><td>Pro $29/mo ($290/yr), 200 artworks · Studio $120/mo ($1,200/yr), unlimited</td><td>Apprentice $10/mo, 100 pieces · Professional $21/mo, 500 · Master $42/mo, unlimited, 3 users (lower with annual billing)</td></tr>
<tr><td>AI artwork descriptions</td><td>Yes (Pro, Studio)</td><td>Not found on their site</td></tr>
<tr><td>AI price suggestions</td><td>Yes, from your medium, size and sales history</td><td>Not found</td></tr>
<tr><td>Contracts</td><td>Commission, sales and consignment generator</td><td>Document storage; no generator found</td></tr>
<tr><td>Online invoice payments</td><td>Stripe (card)</td><td>PayPal only, per their help center</td></tr>
<tr><td>Collector CRM</td><td>Yes</td><td>Yes, with sales pipeline</td></tr>
<tr><td>Viewing rooms</td><td>Yes</td><td>Private rooms</td></tr>
<tr><td>Public portfolio</td><td>Artist page, website themes, public CV, artist directory</td><td>Public profile and Discovery directory</td></tr>
<tr><td>Grants and residencies</td><td>Studio: fit-scored matches and application drafts from your CV</td><td>Track and apply to calls on its Call for Entry platform</td></tr>
<tr><td>Reports</td><td>COA, QR codes, PDF catalog; Studio adds provenance, editions, appraisal reports</td><td>COAs, consignment sheets, price lists, labels, inventory reports</td></tr>
<tr><td>Mobile</td><td>Web app that works on phones</td><td>iOS app</td></tr>
<tr><td>Track record</td><td>Launched 2026, New Orleans</td><td>Long-established, large user base</td></tr>
</tbody></table>
<p class="note">Artwork Archive details from <a href="https://www.artworkarchive.com/pricing" rel="nofollow noopener">artworkarchive.com/pricing</a> and <a href="https://help.artworkarchive.com/en/articles/4540291" rel="nofollow noopener">their help center</a>, checked September 24, 2026. If anything here is out of date, email us and we'll correct it.</p>
<div class="narrow" style="padding:0">
<h2>Choose Artwork Archive if…</h2>
<ul><li>You mainly need a proven inventory database with many report templates.</li><li>You want a native iOS app.</li><li>You already take payments through PayPal.</li></ul>
<h2>Choose ArtistOS if…</h2>
<ul><li>You want help pricing and describing work, not just recording it.</li><li>You write commission or consignment agreements and want them generated from your records.</li><li>You want collectors to pay invoices by card through Stripe.</li><li>You apply to grants and residencies and want matches and drafts in one place.</li><li>You want to start free.</li></ul>
<h2>Switching</h2>
<p>You can start on the free Starter plan and add your most recent work first; there's no cost to try it alongside your current system.</p>
</div>
`,
  faq: [
    ["Is ArtistOS cheaper than Artwork Archive?", "ArtistOS has a free plan, which Artwork Archive does not. For paid plans, Artwork Archive's entry tier ($10/month) is cheaper than ArtistOS Pro ($29/month), but Pro includes AI tools, contracts and Stripe invoicing, and covers 200 artworks versus 100."],
    ["Does Artwork Archive have AI pricing?", "We did not find AI description or AI pricing features on Artwork Archive's public site as of September 2026. ArtistOS includes both on Pro and Studio."],
    ["Can I accept card payments with Artwork Archive?", "Artwork Archive's help center says PayPal is currently its only integrated payment processor. ArtistOS uses Stripe for card payments on invoices."],
  ],
}


/* ------------------------------------------------------------------ */
export const statementGuide = {
  path: "/how-to-write-an-artist-statement",
  title: "How to Write an Artist Statement (With Examples by Medium)",
  description:
    "How to write an artist statement in 150–300 words: what to include, a simple 3-part structure, examples for painters, photographers and sculptors, and mistakes to avoid.",
  eyebrow: "Artist statements",
  h1: "How to write an artist statement",
  lede: "A clear, first-person statement in three short paragraphs, with examples by medium and a fill-in template.",
  crumbs: guideCrumbs("/how-to-write-an-artist-statement", "Artist statement"),
  type: "article",
  schema: [article("/how-to-write-an-artist-statement", "How to write an artist statement", "What to include in an artist statement, with a template and examples.")],
  body: `
<div class="answer"><strong>An artist statement</strong> is a short, first-person text (usually 150–300 words) that explains <em>what</em> you make, <em>how</em> you make it and <em>why</em>. Write it in plain language, lead with the work rather than your biography, and name specific materials, processes and subjects. Keep a one-paragraph version for applications and a longer one for your website.</div>
<h2>A simple 3-part structure</h2>
<ol>
<li><strong>What you make.</strong> One or two sentences a stranger could picture: medium, scale, subject. <em>“I make large oil paintings of the flooded streets and shotgun houses of my New Orleans neighborhood.”</em></li>
<li><strong>How you make it.</strong> Your process, materials and choices, and what's distinctive about them.</li>
<li><strong>Why.</strong> The questions, experiences or ideas that drive the work, and what you hope a viewer takes away. Stay concrete.</li>
</ol>
<h2>Fill-in template</h2>
<div class="template">I make [MEDIUM / FORM] that [WHAT THE WORK SHOWS OR DOES].
My process begins with [SOURCE: photos, found objects, memory, research...]. I [KEY PROCESS STEP], which [EFFECT IT HAS ON THE WORK].
I'm interested in [CENTRAL QUESTION OR THEME] because [PERSONAL OR CULTURAL REASON].
In my current series, [SERIES TITLE], I [WHAT'S NEW OR SPECIFIC ABOUT IT].
I want viewers to [FEEL / NOTICE / QUESTION] ...</div>
<h2>Short examples by medium</h2>
<ul>
<li><strong>Painter:</strong> “I paint small interiors from memory, using thinned oil on raw linen so the canvas shows through, the way memory leaves gaps.”</li>
<li><strong>Photographer:</strong> “I photograph second-line parades from inside the crowd, on a 35mm film camera, to keep the viewer at street level rather than above it.”</li>
<li><strong>Sculptor / ceramicist:</strong> “I build vessels from clay dug along the Mississippi and fire them in a wood kiln, so each piece records the place and the fire.”</li>
</ul>
<h2>Mistakes to avoid</h2>
<ul>
<li>Jargon and abstractions (“interrogates liminal spaces”) instead of what the viewer actually sees.</li>
<li>Starting with “Ever since I was a child...”. Your statement is about the work; save biography for your bio.</li>
<li>Writing in the third person. Statements are first person; bios are third person.</li>
<li>One version for everything. Grant and residency forms often set strict word limits, so trim to fit each one.</li>
</ul>
<h2>Artist statement vs. artist bio</h2>
<p>A <strong>statement</strong> is first person and explains the work. A <strong>bio</strong> is third person and lists facts about you: where you're based, education, exhibitions, awards. Most applications ask for both.</p>
<p>In ArtistOS your statement lives with your CV. It appears on your public artist page and CV, and it's already filled in when you apply for grants and residencies.</p>
${sources([
    ["RISD Career Center: Artist statement", "https://careercenter.risd.edu/artist-statement"],
    ["University of Illinois Writers Workshop: Writing an artist statement", "https://writersworkshop.illinois.edu/resources-2/writer-resources/academic-writing/writing-an-artist-statement/"],
    ["The Creative Independent: How to write an artist statement", "https://thecreativeindependent.com/guides/how-to-write-an-artist-statement/"],
    ["Emily Carr University: Professional practice, artist statements", "https://guides.ecuad.ca/professionalpractice/writing"],
  ])}
`,
  faq: [
    ["How long should an artist statement be?", "Usually 150–300 words for a website or general statement, and one paragraph (often 100–150 words) for applications. Always follow the word limit an application gives you."],
    ["Should an artist statement be in first or third person?", "First person. Your bio is the part written in the third person."],
    ["Can I use AI to write my artist statement?", "It can help you get a first draft and find words, but rewrite it in your own voice and cut anything generic. Juries read hundreds of statements and notice boilerplate."],
    ["How often should I update my artist statement?", "Whenever your work changes direction, and at least once a year. Many artists write a short statement for each series."],
  ],
}

/* ------------------------------------------------------------------ */
export const cvGuide = {
  path: "/artist-cv-template",
  title: "Artist CV Template and Format (Free Example for Visual Artists)",
  description:
    "How to format an artist CV: the standard sections in order, reverse-chronological formatting, what emerging artists can include, and a free copy-and-paste template.",
  eyebrow: "Artist CV",
  h1: "Artist CV format and template",
  lede: "The standard sections, the order to put them in, and a free template for emerging and established artists.",
  crumbs: guideCrumbs("/artist-cv-template", "Artist CV"),
  type: "article",
  schema: [article("/artist-cv-template", "Artist CV format and template", "How to format an artist CV, with a free template.")],
  body: `
<div class="answer"><strong>An artist CV</strong> is a factual list of your professional record: contact details, education, exhibitions (solo, then group), awards and grants, residencies, collections, and bibliography. List entries in <strong>reverse chronological order</strong> (newest first), one line each, using a consistent format such as <em>Year, Title, Venue, City, State</em>. Unlike a job résumé, it has no objective or summary, and it grows as your career does.</div>
<h2>Standard sections, in order</h2>
<ol>
<li>Name, city, website and email</li>
<li>Education (degree, school, year). Workshops and mentorships count if you're self-taught.</li>
<li>Solo exhibitions</li>
<li>Group exhibitions</li>
<li>Awards, grants and fellowships</li>
<li>Residencies</li>
<li>Public collections</li>
<li>Bibliography / press (author, title, publication, date)</li>
<li>Commissions, public art, teaching, lectures and panels (as relevant)</li>
</ol>
<h2>Free template</h2>
<div class="template">[YOUR NAME]
[City, State]  ·  [website]  ·  [email]

EDUCATION
[Year]  [Degree], [School], [City, State]

SOLO EXHIBITIONS
[Year]  [Exhibition title], [Venue], [City, State]

GROUP EXHIBITIONS
[Year]  [Exhibition title], [Venue], [City, State] (curated by [Name])

AWARDS, GRANTS AND FELLOWSHIPS
[Year]  [Award name], [Organization]

RESIDENCIES
[Year]  [Residency], [City, State]

COLLECTIONS
[Institution], [City, State]

BIBLIOGRAPHY
[Author], "[Article title]," [Publication], [Month Day, Year]</div>
<h2>Tips for emerging artists</h2>
<ul>
<li>A short, honest CV beats a padded one. Include juried shows, open studios, art markets, pop-ups and community projects, labelled accurately.</li>
<li>Leave out sections you don't have yet rather than writing “none.”</li>
<li>Use “Selected exhibitions” once the list gets long, and keep the full CV on your website.</li>
<li>Don't list personal details (birth date, address) beyond city and contact.</li>
<li>Save a PDF named <em>Firstname-Lastname-CV.pdf</em>.</li>
</ul>
<h2>CV vs. résumé vs. bio</h2>
<p>An artist <strong>CV</strong> is your full exhibition record. An artist <strong>résumé</strong> is a shorter version (one or two pages) for a specific application. A <strong>bio</strong> is a paragraph in the third person.</p>
<p>ArtistOS builds your CV from the exhibitions, awards and residencies you log. It stays up to date and publishes as a shareable page at <em>artistosapp.com/artist/you/cv</em>, which you can also export to PDF.</p>
${sources([
    ["College Art Association: Guidelines for the visual artist CV", "https://www.collegeart.org/standards-and-guidelines/guidelines/visual-art-cv"],
    ["Columbia Career Education: The artist resume and CV", "https://www.careereducation.columbia.edu/resources/artist-resume-and-cv"],
    ["GYST: Resumes and CVs for artists", "https://www.gyst-ink.com/resumes-cvs"],
  ])}
`,
  faq: [
    ["What's the difference between an artist CV and a résumé?", "A CV is your complete professional record as an artist and can run several pages. A résumé is a shortened, tailored version, usually one or two pages."],
    ["What if I don't have a degree or many exhibitions?", "List workshops, mentorships and self-directed study under Education, and include juried shows, markets, open studios and community projects. Label everything accurately."],
    ["Should my artist CV be reverse chronological?", "Yes. Within each section, list the newest entries first."],
    ["How long should an artist CV be?", "As long as your record, but many artists send a “selected” CV of one or two pages when an application sets a limit."],
  ],
}

export const guidePages = [pricingGuide, commissionGuide, invoiceGuide, coaGuide, consignmentGuide, louisianaGuide, inventoryGuide, archiveAlt, statementGuide, cvGuide]
