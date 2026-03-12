const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Larry Jones";
pres.title = "ArtistOS — Investor Pitch Deck 2026";

// Colors (no # prefix!)
const C = {
  dark: "0E0C0A",
  cream: "FAF8F5",
  copper: "B5651D",
  copperLight: "D4854A",
  forest: "2D4A35",
  forestLight: "4A7A57",
  muted: "A89F94",
  rose: "C4705A",
  cardBg: "F2EDE6",
  white: "FFFFFF",
  dimText: "6B6560",
};

// Fonts
const SERIF = "Georgia";
const SANS = "Calibri";

// Helpers
const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.18 });

// ================================================================
// SLIDE 1 — TITLE
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };

  // Decorative copper accent bar at top
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.copper } });

  // Small copper dot accent
  s.addShape(pres.shapes.OVAL, { x: 4.55, y: 1.2, w: 0.9, h: 0.9, fill: { color: C.copper, transparency: 12 } });

  s.addText("ArtistOS", {
    x: 0.5, y: 1.3, w: 9, h: 1.0,
    fontFace: SERIF, fontSize: 54, color: C.cream, bold: true, align: "center", margin: 0,
  });

  s.addText("Run Your Art Practice Like a Business", {
    x: 0.5, y: 2.3, w: 9, h: 0.6,
    fontFace: SANS, fontSize: 20, color: C.copper, italic: true, align: "center", margin: 0,
  });

  s.addText("Pre-Seed Investment Deck  \u2014  2026", {
    x: 0.5, y: 3.2, w: 9, h: 0.4,
    fontFace: SANS, fontSize: 13, color: C.muted, align: "center", margin: 0, charSpacing: 2,
  });

  // Bottom bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: C.copper, transparency: 90 } });
  s.addText("artistos-mvp.vercel.app", {
    x: 0.5, y: 5.05, w: 9, h: 0.5,
    fontFace: SANS, fontSize: 11, color: C.muted, align: "center", margin: 0,
  });
})();

// ================================================================
// SLIDE 2 — THE PROBLEM
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addText("THE PROBLEM", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Artists are running businesses\nwithout business tools", {
    x: 0.7, y: 0.9, w: 8.5, h: 1.0,
    fontFace: SERIF, fontSize: 30, color: C.cream, margin: 0,
  });

  const problems = [
    { num: "01", title: "Fragmented Portfolios", desc: "Spreadsheets, folders, emails \u2014 no single source of truth for inventory, pricing, or provenance." },
    { num: "02", title: "No Pricing Guidance", desc: "Artists underprice by 30\u201350% on average. No data, no benchmarks, no market context." },
    { num: "03", title: "Lost Commission Revenue", desc: "No pipeline structure means dropped leads, missed deadlines, and unpaid invoices." },
  ];

  problems.forEach((p, i) => {
    const yBase = 2.15 + i * 1.1;
    // Number badge
    s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: yBase, w: 0.55, h: 0.55, fill: { color: C.copper }, rectRadius: 0.05 });
    s.addText(p.num, {
      x: 0.7, y: yBase, w: 0.55, h: 0.55,
      fontFace: SANS, fontSize: 14, color: C.cream, bold: true, align: "center", valign: "middle", margin: 0,
    });
    // Title
    s.addText(p.title, {
      x: 1.5, y: yBase - 0.02, w: 7.5, h: 0.3,
      fontFace: SANS, fontSize: 16, color: C.cream, bold: true, margin: 0,
    });
    // Description
    s.addText(p.desc, {
      x: 1.5, y: yBase + 0.32, w: 7.5, h: 0.55,
      fontFace: SANS, fontSize: 12, color: C.muted, margin: 0,
    });
  });
})();

// ================================================================
// SLIDE 3 — THE SOLUTION
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("THE SOLUTION", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("The all-in-one platform\nbuilt for artists", {
    x: 0.7, y: 0.9, w: 5.5, h: 1.0,
    fontFace: SERIF, fontSize: 30, color: C.dark, margin: 0,
  });

  // Right side tagline card
  s.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 0.9, w: 3.2, h: 1.0, fill: { color: C.copper }, shadow: makeShadow() });
  s.addText([
    { text: "Think ", options: { color: C.cream, fontSize: 13, fontFace: SANS } },
    { text: "Shopify", options: { color: C.cream, fontSize: 13, fontFace: SANS, bold: true } },
    { text: " meets ", options: { color: C.cream, fontSize: 13, fontFace: SANS } },
    { text: "Honeybook", options: { color: C.cream, fontSize: 13, fontFace: SANS, bold: true } },
    { text: ", built for the art world.", options: { color: C.cream, fontSize: 13, fontFace: SANS } },
  ], { x: 6.5, y: 0.95, w: 2.8, h: 0.9, valign: "middle", margin: 0 });

  // Three solution pillars
  const pillars = [
    { icon: "\u{1F3A8}", title: "Portfolio & Inventory", desc: "Upload, catalog, price, and describe artworks with AI assistance" },
    { icon: "\u{1F4B0}", title: "Financial Command Center", desc: "Invoices, expenses, contracts, and revenue tracking in one place" },
    { icon: "\u{1F916}", title: "AI-Powered Intelligence", desc: "Smart descriptions, pricing guidance, and bio generation" },
  ];

  pillars.forEach((p, i) => {
    const xBase = 0.7 + i * 3.05;
    // Card background
    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: 2.3, w: 2.8, h: 2.7, fill: { color: C.white }, shadow: makeShadow() });
    // Copper top border
    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: 2.3, w: 2.8, h: 0.06, fill: { color: C.copper } });
    // Icon
    s.addText(p.icon, {
      x: xBase + 0.2, y: 2.55, w: 0.6, h: 0.6,
      fontSize: 28, align: "center", valign: "middle", margin: 0,
    });
    // Title
    s.addText(p.title, {
      x: xBase + 0.2, y: 3.2, w: 2.4, h: 0.4,
      fontFace: SANS, fontSize: 14, color: C.dark, bold: true, margin: 0,
    });
    // Desc
    s.addText(p.desc, {
      x: xBase + 0.2, y: 3.65, w: 2.4, h: 1.0,
      fontFace: SANS, fontSize: 11, color: C.dimText, margin: 0,
    });
  });
})();

// ================================================================
// SLIDE 4 — PRODUCT OVERVIEW
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("PRODUCT OVERVIEW", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Everything an artist needs, one platform", {
    x: 0.7, y: 0.9, w: 8, h: 0.55,
    fontFace: SERIF, fontSize: 26, color: C.dark, margin: 0,
  });

  const features = [
    { title: "Portfolio Management", desc: "Image uploads, AI descriptions, AI price suggestions, provenance tracking", color: C.copper },
    { title: "Financial Hub", desc: "Invoices with PDF export, expense tracking, revenue charts, CSV export", color: C.forest },
    { title: "Commission Pipeline", desc: "Full CRM with status tracking, deadlines, progress bars, budgets", color: C.rose },
    { title: "AI-Powered Tools", desc: "Artwork descriptions, pricing intelligence, professional bio generator", color: C.copper },
    { title: "Viewing Rooms", desc: "Private shareable galleries for collectors with QR codes and email invites", color: C.forest },
    { title: "Market Analytics", desc: "Portfolio value, sell-through rates, medium breakdown, trend analysis", color: C.rose },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const xBase = 0.7 + col * 3.05;
    const yBase = 1.7 + row * 1.8;

    // Accent dot
    s.addShape(pres.shapes.OVAL, { x: xBase, y: yBase + 0.08, w: 0.18, h: 0.18, fill: { color: f.color } });
    // Title
    s.addText(f.title, {
      x: xBase + 0.35, y: yBase, w: 2.45, h: 0.35,
      fontFace: SANS, fontSize: 13, color: C.dark, bold: true, margin: 0,
    });
    // Desc
    s.addText(f.desc, {
      x: xBase + 0.35, y: yBase + 0.4, w: 2.45, h: 0.9,
      fontFace: SANS, fontSize: 11, color: C.dimText, margin: 0,
    });
  });
})();

// ================================================================
// SLIDE 5 — LIVE PRODUCT
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addText("LIVE PRODUCT", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Not a mockup. A working product.", {
    x: 0.7, y: 0.9, w: 8, h: 0.6,
    fontFace: SERIF, fontSize: 30, color: C.cream, margin: 0,
  });

  s.addText("artistos-mvp.vercel.app", {
    x: 0.7, y: 1.55, w: 5, h: 0.4,
    fontFace: SANS, fontSize: 16, color: C.copper, bold: true, margin: 0,
    hyperlink: { url: "https://artistos-mvp.vercel.app" },
  });

  const stats = [
    { value: "28", label: "Pages Built" },
    { value: "3", label: "Pricing Tiers" },
    { value: "4", label: "AI Features" },
    { value: "PWA", label: "Mobile Ready" },
  ];

  stats.forEach((st, i) => {
    const xBase = 0.7 + i * 2.3;
    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: 2.3, w: 2.0, h: 1.6, fill: { color: C.copper, transparency: 88 } });
    s.addText(st.value, {
      x: xBase, y: 2.4, w: 2.0, h: 0.8,
      fontFace: SERIF, fontSize: 40, color: C.copper, bold: true, align: "center", valign: "middle", margin: 0,
    });
    s.addText(st.label, {
      x: xBase, y: 3.2, w: 2.0, h: 0.4,
      fontFace: SANS, fontSize: 11, color: C.muted, align: "center", margin: 0,
    });
  });

  // Tech stack
  s.addText("TECH STACK", {
    x: 0.7, y: 4.3, w: 2, h: 0.3,
    fontFace: SANS, fontSize: 10, color: C.muted, charSpacing: 3, margin: 0,
  });

  const techs = ["React", "Supabase", "Stripe", "OpenAI", "Resend", "Vercel"];
  techs.forEach((t, i) => {
    const xBase = 0.7 + i * 1.45;
    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: 4.65, w: 1.25, h: 0.45, fill: { color: C.copper, transparency: 85 } });
    s.addText(t, {
      x: xBase, y: 4.65, w: 1.25, h: 0.45,
      fontFace: SANS, fontSize: 11, color: C.muted, align: "center", valign: "middle", margin: 0,
    });
  });
})();

// ================================================================
// SLIDE 6 — MARKET OPPORTUNITY
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("MARKET OPPORTUNITY", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("A massive, underserved market", {
    x: 0.7, y: 0.9, w: 8, h: 0.55,
    fontFace: SERIF, fontSize: 28, color: C.dark, margin: 0,
  });

  // TAM / SAM / SOM circles
  const markets = [
    { label: "TAM", value: "$64B", desc: "US Creative Economy", size: 2.6, x: 1.2 },
    { label: "SAM", value: "$8.2B", desc: "2.3M Professional Artists", size: 2.0, x: 4.2 },
    { label: "SOM", value: "$82M", desc: "10K Artists at $49/mo avg", size: 1.5, x: 6.8 },
  ];

  markets.forEach((m) => {
    const yCenter = 3.0;
    s.addShape(pres.shapes.OVAL, {
      x: m.x, y: yCenter - m.size / 2, w: m.size, h: m.size,
      fill: { color: C.copper, transparency: 85 },
      line: { color: C.copper, width: 2 },
    });
    s.addText(m.label, {
      x: m.x, y: yCenter - 0.55, w: m.size, h: 0.3,
      fontFace: SANS, fontSize: 10, color: C.copper, bold: true, align: "center", charSpacing: 3, margin: 0,
    });
    s.addText(m.value, {
      x: m.x, y: yCenter - 0.25, w: m.size, h: 0.5,
      fontFace: SERIF, fontSize: 28, color: C.dark, bold: true, align: "center", margin: 0,
    });
    s.addText(m.desc, {
      x: m.x, y: yCenter + 0.25, w: m.size, h: 0.4,
      fontFace: SANS, fontSize: 9, color: C.dimText, align: "center", margin: 0,
    });
  });

  // Key stats bar at bottom
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.55, w: 8.6, h: 0.7, fill: { color: C.white }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.55, w: 8.6, h: 0.06, fill: { color: C.copper } });

  s.addText([
    { text: "12% ", options: { bold: true, color: C.copper, fontSize: 14, fontFace: SANS } },
    { text: "art market YoY growth    \u2022    ", options: { color: C.dimText, fontSize: 12, fontFace: SANS } },
    { text: "78% ", options: { bold: true, color: C.copper, fontSize: 14, fontFace: SANS } },
    { text: "of artists need better business tools    \u2022    ", options: { color: C.dimText, fontSize: 12, fontFace: SANS } },
    { text: "2.3M ", options: { bold: true, color: C.copper, fontSize: 14, fontFace: SANS } },
    { text: "professional artists in the US", options: { color: C.dimText, fontSize: 12, fontFace: SANS } },
  ], { x: 0.9, y: 4.6, w: 8.2, h: 0.6, valign: "middle", margin: 0 });
})();

// ================================================================
// SLIDE 7 — BUSINESS MODEL
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("BUSINESS MODEL", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Freemium SaaS with clear upgrade path", {
    x: 0.7, y: 0.9, w: 8, h: 0.55,
    fontFace: SERIF, fontSize: 26, color: C.dark, margin: 0,
  });

  // Three pricing cards
  const plans = [
    { name: "Starter", price: "Free", features: ["25 artworks", "3 viewing rooms", "Basic invoicing", "Contract generator"], highlight: false },
    { name: "Pro", price: "$19/mo", features: ["200 artworks", "AI-powered tools", "Market analytics", "Social scheduler"], highlight: true },
    { name: "Studio", price: "$49/mo", features: ["Unlimited everything", "All Pro features", "Exhibition planner", "Priority support"], highlight: false },
  ];

  plans.forEach((p, i) => {
    const xBase = 0.7 + i * 3.05;
    const bgColor = p.highlight ? C.copper : C.white;
    const textColor = p.highlight ? C.cream : C.dark;
    const subColor = p.highlight ? C.cream : C.dimText;

    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: 1.65, w: 2.8, h: 3.45, fill: { color: bgColor }, shadow: makeShadow() });

    s.addText(p.name, {
      x: xBase + 0.25, y: 1.85, w: 2.3, h: 0.35,
      fontFace: SANS, fontSize: 14, color: textColor, bold: true, margin: 0,
    });
    s.addText(p.price, {
      x: xBase + 0.25, y: 2.25, w: 2.3, h: 0.5,
      fontFace: SERIF, fontSize: 30, color: textColor, bold: true, margin: 0,
    });

    p.features.forEach((f, j) => {
      s.addText([
        { text: "\u2713 ", options: { color: p.highlight ? C.cream : C.forestLight, bold: true, fontSize: 12 } },
        { text: f, options: { color: subColor, fontSize: 11 } },
      ], {
        x: xBase + 0.25, y: 2.9 + j * 0.42, w: 2.3, h: 0.35,
        fontFace: SANS, margin: 0,
      });
    });
  });

  // Revenue projection
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.25, w: 8.6, h: 0.0, fill: { color: C.cardBg } });
})();

// ================================================================
// SLIDE 8 — COMPETITIVE LANDSCAPE
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("COMPETITIVE LANDSCAPE", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("The only platform built for artists, by design", {
    x: 0.7, y: 0.9, w: 8, h: 0.55,
    fontFace: SERIF, fontSize: 26, color: C.dark, margin: 0,
  });

  // Comparison table header
  const colW = [2.2, 1.3, 1.3, 1.3, 1.3, 1.3];
  const tableX = 0.55;
  const headerY = 1.7;

  const headers = ["", "ArtistOS", "Artwork\nArchive", "Honeybook", "Artsy", "Spreadsheets"];
  headers.forEach((h, i) => {
    const xOff = colW.slice(0, i).reduce((a, b) => a + b, 0);
    const bg = i === 1 ? C.copper : (i === 0 ? "transparent" : C.cardBg);
    const tc = i === 1 ? C.cream : C.dimText;
    if (i > 0) s.addShape(pres.shapes.RECTANGLE, { x: tableX + xOff, y: headerY, w: colW[i], h: 0.55, fill: { color: bg } });
    s.addText(h, {
      x: tableX + xOff, y: headerY, w: colW[i], h: 0.55,
      fontFace: SANS, fontSize: 10, color: tc, bold: true, align: i === 0 ? "left" : "center", valign: "middle", margin: 0,
    });
  });

  // Rows
  const rows = [
    ["Portfolio Mgmt", "\u2713", "\u2713", "\u2717", "\u2713", "\u2717"],
    ["AI Tools", "\u2713", "\u2717", "\u2717", "\u2717", "\u2717"],
    ["Financial Tracking", "\u2713", "\u2717", "\u2713", "\u2717", "\u2713"],
    ["Commission CRM", "\u2713", "\u2717", "\u2713", "\u2717", "\u2717"],
    ["Marketplace", "\u2713", "\u2717", "\u2717", "\u2713", "\u2717"],
    ["Art-Specific", "\u2713", "\u2713", "\u2717", "\u2713", "\u2717"],
    ["Price", "Free\u2013$49", "$8/mo", "$19/mo", "Gallery only", "Free"],
  ];

  rows.forEach((row, ri) => {
    const yOff = headerY + 0.6 + ri * 0.45;
    row.forEach((cell, ci) => {
      const xOff = colW.slice(0, ci).reduce((a, b) => a + b, 0);
      const isArtistOS = ci === 1;
      let cellColor = C.dimText;
      if (cell === "\u2713" && isArtistOS) cellColor = C.copper;
      else if (cell === "\u2713") cellColor = C.forestLight;
      else if (cell === "\u2717") cellColor = C.rose;
      else if (ci === 0) cellColor = C.dark;

      if (isArtistOS && ri < rows.length) {
        s.addShape(pres.shapes.RECTANGLE, { x: tableX + xOff, y: yOff, w: colW[ci], h: 0.45, fill: { color: C.copper, transparency: 92 } });
      }

      s.addText(cell, {
        x: tableX + xOff, y: yOff, w: colW[ci], h: 0.45,
        fontFace: SANS, fontSize: ci === 0 ? 11 : 12, color: cellColor,
        bold: ci === 0 || (cell === "\u2713" && isArtistOS),
        align: ci === 0 ? "left" : "center", valign: "middle", margin: 0,
      });
    });
  });

  // Separator lines
  rows.forEach((_, ri) => {
    const yOff = headerY + 0.6 + ri * 0.45;
    s.addShape(pres.shapes.LINE, { x: tableX, y: yOff, w: 8.7, h: 0, line: { color: C.cardBg, width: 0.5 } });
  });
})();

// ================================================================
// SLIDE 9 — TRACTION & MILESTONES
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("TRACTION & MILESTONES", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Built and launched in record time", {
    x: 0.7, y: 0.9, w: 8, h: 0.55,
    fontFace: SERIF, fontSize: 26, color: C.dark, margin: 0,
  });

  const milestones = [
    { check: true, text: "Full MVP live and functional (28 pages, 11 components)" },
    { check: true, text: "Stripe payments integrated \u2014 3 subscription tiers active" },
    { check: true, text: "AI features powered by OpenAI (4 distinct tools)" },
    { check: true, text: "Email infrastructure deployed (Resend + fallback)" },
    { check: true, text: "SEO optimized with Open Graph, Twitter Cards, JSON-LD" },
    { check: true, text: "PWA-ready \u2014 installable on mobile devices" },
    { check: true, text: "Real analytics dashboard with portfolio intelligence" },
    { check: true, text: "Legal pages (Terms of Service, Privacy Policy)" },
  ];

  milestones.forEach((m, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const xBase = 0.7 + col * 4.5;
    const yBase = 1.7 + row * 0.85;

    s.addShape(pres.shapes.OVAL, { x: xBase, y: yBase + 0.08, w: 0.28, h: 0.28, fill: { color: C.forestLight } });
    s.addText("\u2713", {
      x: xBase, y: yBase + 0.06, w: 0.28, h: 0.28,
      fontFace: SANS, fontSize: 12, color: C.cream, bold: true, align: "center", valign: "middle", margin: 0,
    });
    s.addText(m.text, {
      x: xBase + 0.45, y: yBase, w: 3.85, h: 0.65,
      fontFace: SANS, fontSize: 12, color: C.dark, margin: 0,
    });
  });
})();

// ================================================================
// SLIDE 10 — GO-TO-MARKET
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("GO-TO-MARKET STRATEGY", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Community-first growth engine", {
    x: 0.7, y: 0.9, w: 8, h: 0.55,
    fontFace: SERIF, fontSize: 26, color: C.dark, margin: 0,
  });

  const phases = [
    {
      title: "Phase 1: Community", period: "Months 1\u20136",
      items: ["Reddit r/artbusiness (500K+)", "Instagram art hashtags", "MFA programs & art schools", "Art business YouTube content"],
      color: C.copper,
    },
    {
      title: "Phase 2: Partnerships", period: "Months 6\u201312",
      items: ["Onboard 50 galleries as referral partners", "Art fair presence & sponsorships", "Artist referral program (free Pro month)", "Art supply brand partnerships"],
      color: C.forest,
    },
    {
      title: "Phase 3: Marketplace", period: "Year 2+",
      items: ["Connect artists with collectors", "5% transaction fee on sales", "Curator-led collections", "International expansion"],
      color: C.rose,
    },
  ];

  phases.forEach((p, i) => {
    const xBase = 0.7 + i * 3.05;
    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: 1.7, w: 2.8, h: 3.4, fill: { color: C.white }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: 1.7, w: 2.8, h: 0.06, fill: { color: p.color } });

    s.addText(p.period, {
      x: xBase + 0.2, y: 1.9, w: 2.4, h: 0.25,
      fontFace: SANS, fontSize: 9, color: p.color, bold: true, charSpacing: 2, margin: 0,
    });
    s.addText(p.title, {
      x: xBase + 0.2, y: 2.2, w: 2.4, h: 0.35,
      fontFace: SANS, fontSize: 14, color: C.dark, bold: true, margin: 0,
    });

    p.items.forEach((item, j) => {
      s.addText([
        { text: "\u2022 ", options: { color: p.color, fontSize: 11 } },
        { text: item, options: { color: C.dimText, fontSize: 11 } },
      ], {
        x: xBase + 0.2, y: 2.7 + j * 0.5, w: 2.4, h: 0.45,
        fontFace: SANS, margin: 0,
      });
    });
  });
})();

// ================================================================
// SLIDE 11 — REVENUE PROJECTIONS
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addText("REVENUE PROJECTIONS", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Clear path to $1.2M ARR", {
    x: 0.7, y: 0.9, w: 8, h: 0.55,
    fontFace: SERIF, fontSize: 28, color: C.cream, margin: 0,
  });

  // Year cards
  const years = [
    { year: "Year 1", arr: "$0", users: "1,000", desc: "User acquisition focus\nFree tier growth" },
    { year: "Year 2", arr: "$180K", users: "500 paid", desc: "Conversion optimization\n$30/mo blended ARPU" },
    { year: "Year 3", arr: "$1.2M", users: "3,000 paid", desc: "Marketplace revenue\nEnterprise expansion" },
  ];

  years.forEach((y, i) => {
    const xBase = 0.7 + i * 3.05;
    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: 1.8, w: 2.8, h: 2.4, fill: { color: C.copper, transparency: 88 } });

    s.addText(y.year, {
      x: xBase + 0.25, y: 1.95, w: 2.3, h: 0.3,
      fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 2, margin: 0,
    });
    s.addText(y.arr, {
      x: xBase + 0.25, y: 2.3, w: 2.3, h: 0.5,
      fontFace: SERIF, fontSize: 34, color: C.cream, bold: true, margin: 0,
    });
    s.addText("ARR", {
      x: xBase + 0.25, y: 2.8, w: 1, h: 0.25,
      fontFace: SANS, fontSize: 10, color: C.muted, margin: 0,
    });
    s.addText(y.users + " users", {
      x: xBase + 0.25, y: 3.15, w: 2.3, h: 0.25,
      fontFace: SANS, fontSize: 12, color: C.copperLight, margin: 0,
    });
    s.addText(y.desc, {
      x: xBase + 0.25, y: 3.5, w: 2.3, h: 0.55,
      fontFace: SANS, fontSize: 10, color: C.muted, margin: 0,
    });
  });

  // Future revenue note
  s.addText("Future revenue streams: Marketplace transaction fees (5\u20138%) \u2022 Premium AI features \u2022 Gallery enterprise plans", {
    x: 0.7, y: 4.6, w: 8.6, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.muted, align: "center", margin: 0,
  });
})();

// ================================================================
// SLIDE 12 — TEAM
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("THE TEAM", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Builder-founder with domain expertise", {
    x: 0.7, y: 0.9, w: 8, h: 0.55,
    fontFace: SERIF, fontSize: 26, color: C.dark, margin: 0,
  });

  // Founder card
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.7, w: 4.3, h: 3.3, fill: { color: C.white }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.7, w: 0.08, h: 3.3, fill: { color: C.copper } });

  // Avatar circle
  s.addShape(pres.shapes.OVAL, { x: 1.1, y: 2.0, w: 0.9, h: 0.9, fill: { color: C.copper } });
  s.addText("LJ", {
    x: 1.1, y: 2.0, w: 0.9, h: 0.9,
    fontFace: SERIF, fontSize: 22, color: C.cream, bold: true, align: "center", valign: "middle", margin: 0,
  });

  s.addText("Larry Jones", {
    x: 2.25, y: 2.05, w: 2.5, h: 0.35,
    fontFace: SANS, fontSize: 18, color: C.dark, bold: true, margin: 0,
  });
  s.addText("Founder & CEO", {
    x: 2.25, y: 2.4, w: 2.5, h: 0.3,
    fontFace: SANS, fontSize: 12, color: C.copper, margin: 0,
  });

  const founderPoints = [
    "Background at Synergy Source Advisors",
    "Deep understanding of creative economy",
    "Built full MVP from concept to live product",
    "Passion for empowering creative professionals",
  ];

  founderPoints.forEach((fp, i) => {
    s.addText([
      { text: "\u2022 ", options: { color: C.copper, fontSize: 12 } },
      { text: fp, options: { color: C.dimText, fontSize: 12 } },
    ], {
      x: 1.1, y: 3.1 + i * 0.42, w: 3.7, h: 0.38,
      fontFace: SANS, margin: 0,
    });
  });

  // Hiring plan card
  s.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.7, w: 4.2, h: 3.3, fill: { color: C.white }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.7, w: 0.08, h: 3.3, fill: { color: C.forest } });

  s.addText("HIRING PLAN", {
    x: 5.65, y: 1.9, w: 3.6, h: 0.3,
    fontFace: SANS, fontSize: 10, color: C.forest, bold: true, charSpacing: 3, margin: 0,
  });
  s.addText("With funding, we\u2019ll build the team", {
    x: 5.65, y: 2.2, w: 3.6, h: 0.35,
    fontFace: SANS, fontSize: 13, color: C.dark, margin: 0,
  });

  const hires = [
    { role: "CTO / Lead Engineer", when: "Month 1" },
    { role: "Full-Stack Developer", when: "Month 2" },
    { role: "Head of Product", when: "Month 4" },
    { role: "Community Manager", when: "Month 6" },
  ];

  hires.forEach((h, i) => {
    const yBase = 2.75 + i * 0.55;
    s.addShape(pres.shapes.OVAL, { x: 5.65, y: yBase + 0.06, w: 0.22, h: 0.22, fill: { color: C.forest } });
    s.addText(h.role, {
      x: 6.05, y: yBase, w: 2.5, h: 0.25,
      fontFace: SANS, fontSize: 12, color: C.dark, bold: true, margin: 0,
    });
    s.addText(h.when, {
      x: 6.05, y: yBase + 0.25, w: 2.5, h: 0.2,
      fontFace: SANS, fontSize: 10, color: C.muted, margin: 0,
    });
  });
})();

// ================================================================
// SLIDE 13 — THE ASK
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };

  s.addText("THE ASK", {
    x: 0.7, y: 0.4, w: 8, h: 0.4,
    fontFace: SANS, fontSize: 11, color: C.copper, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("$500K Pre-Seed Round", {
    x: 0.7, y: 0.9, w: 8, h: 0.7,
    fontFace: SERIF, fontSize: 36, color: C.cream, bold: true, margin: 0,
  });

  s.addText("18-month runway to Series A metrics", {
    x: 0.7, y: 1.55, w: 8, h: 0.35,
    fontFace: SANS, fontSize: 14, color: C.muted, margin: 0,
  });

  // Use of funds
  const funds = [
    { pct: "40%", label: "Engineering", desc: "Hire CTO + engineer, scale infra", color: C.copper, w: 3.44 },
    { pct: "25%", label: "Marketing", desc: "Community, content, partnerships", color: C.forest, w: 2.15 },
    { pct: "20%", label: "Product Dev", desc: "Mobile app, marketplace, AI", color: C.rose, w: 1.72 },
    { pct: "15%", label: "Operations", desc: "Legal, compliance, runway", color: C.muted, w: 1.29 },
  ];

  // Progress bar
  let barX = 0.7;
  funds.forEach((f) => {
    s.addShape(pres.shapes.RECTANGLE, { x: barX, y: 2.2, w: f.w, h: 0.35, fill: { color: f.color } });
    barX += f.w;
  });

  // Fund labels
  funds.forEach((f, i) => {
    const xBase = 0.7 + i * 2.15;
    s.addText(f.pct, {
      x: xBase, y: 2.75, w: 2.0, h: 0.35,
      fontFace: SERIF, fontSize: 24, color: f.color, bold: true, margin: 0,
    });
    s.addText(f.label, {
      x: xBase, y: 3.1, w: 2.0, h: 0.3,
      fontFace: SANS, fontSize: 13, color: C.cream, bold: true, margin: 0,
    });
    s.addText(f.desc, {
      x: xBase, y: 3.4, w: 2.0, h: 0.35,
      fontFace: SANS, fontSize: 10, color: C.muted, margin: 0,
    });
  });

  // Target metrics
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.2, w: 8.6, h: 1.0, fill: { color: C.copper, transparency: 88 } });

  s.addText("TARGET METRICS AT SERIES A", {
    x: 0.7, y: 4.25, w: 8.6, h: 0.3,
    fontFace: SANS, fontSize: 9, color: C.copper, bold: true, charSpacing: 3, align: "center", margin: 0,
  });

  const targets = [
    { val: "3,000", label: "Paid Artists" },
    { val: "$1.2M", label: "ARR" },
    { val: "< 5%", label: "Monthly Churn" },
    { val: "12:1", label: "LTV:CAC Ratio" },
  ];

  targets.forEach((t, i) => {
    const xBase = 1.0 + i * 2.15;
    s.addText(t.val, {
      x: xBase, y: 4.55, w: 1.8, h: 0.3,
      fontFace: SERIF, fontSize: 22, color: C.cream, bold: true, align: "center", margin: 0,
    });
    s.addText(t.label, {
      x: xBase, y: 4.85, w: 1.8, h: 0.25,
      fontFace: SANS, fontSize: 10, color: C.muted, align: "center", margin: 0,
    });
  });
})();

// ================================================================
// SLIDE 14 — VISION & CONTACT
// ================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };

  // Copper accent bar at top
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.copper } });

  // Decorative copper circle
  s.addShape(pres.shapes.OVAL, { x: 4.2, y: 0.6, w: 1.6, h: 1.6, fill: { color: C.copper, transparency: 88 } });

  s.addText([
    { text: "Every artist deserves the tools\n", options: { fontSize: 28, fontFace: SERIF, color: C.cream } },
    { text: "to turn their passion into a\n", options: { fontSize: 28, fontFace: SERIF, color: C.cream } },
    { text: "sustainable career.", options: { fontSize: 28, fontFace: SERIF, color: C.copper, italic: true } },
  ], { x: 0.7, y: 0.9, w: 8.6, h: 1.8, align: "center", margin: 0 });

  // Roadmap pills
  const roadmap = ["Mobile App", "Marketplace Transactions", "Art Market Data API", "International"];
  const pillY = 2.9;
  roadmap.forEach((r, i) => {
    const xBase = 0.7 + i * 2.3;
    s.addShape(pres.shapes.RECTANGLE, { x: xBase, y: pillY, w: 2.1, h: 0.4, fill: { color: C.copper, transparency: 85 } });
    s.addText(r, {
      x: xBase, y: pillY, w: 2.1, h: 0.4,
      fontFace: SANS, fontSize: 10, color: C.muted, align: "center", valign: "middle", margin: 0,
    });
    if (i < 3) {
      s.addText("\u2192", {
        x: xBase + 2.1, y: pillY, w: 0.2, h: 0.4,
        fontFace: SANS, fontSize: 12, color: C.copper, align: "center", valign: "middle", margin: 0,
      });
    }
  });

  // Separator
  s.addShape(pres.shapes.LINE, { x: 2, y: 3.7, w: 6, h: 0, line: { color: C.copper, width: 0.5, dashType: "dash" } });

  // Contact info
  s.addText("Larry Jones", {
    x: 0.7, y: 3.95, w: 8.6, h: 0.5,
    fontFace: SERIF, fontSize: 22, color: C.cream, bold: true, align: "center", margin: 0,
  });
  s.addText("Founder & CEO", {
    x: 0.7, y: 4.4, w: 8.6, h: 0.3,
    fontFace: SANS, fontSize: 12, color: C.copper, align: "center", margin: 0,
  });

  s.addText("larry@synergysourceadvisors.com", {
    x: 0.7, y: 4.8, w: 8.6, h: 0.3,
    fontFace: SANS, fontSize: 13, color: C.muted, align: "center", margin: 0,
  });
  s.addText("artistos-mvp.vercel.app", {
    x: 0.7, y: 5.1, w: 8.6, h: 0.3,
    fontFace: SANS, fontSize: 13, color: C.copperLight, bold: true, align: "center", margin: 0,
    hyperlink: { url: "https://artistos-mvp.vercel.app" },
  });
})();

// ================================================================
// GENERATE
// ================================================================
pres.writeFile({ fileName: "C:\\Users\\larry\\artistos-mvp\\ArtistOS-PitchDeck.pptx" })
  .then(() => console.log("Pitch deck created successfully!"))
  .catch(err => console.error("Error:", err));
