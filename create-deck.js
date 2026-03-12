import PptxGenJS from "pptxgenjs";

// ── Brand Colors (no # prefix) ──────────────────────────────────────────
const COPPER    = "B5651D";
const CREAM     = "FAF8F5";
const CHARCOAL  = "0E0C0A";
const SAGE      = "2D4A35";
const GOLD      = "D4A843";
const BORDER    = "E8E2DA";
const MUTED     = "A89F94";
const WHITE     = "FFFFFF";
const YES_GREEN = "2D6A4F";
const NO_RED    = "9B2226";

// ── Helpers ──────────────────────────────────────────────────────────────
function darkSlide(pptx) {
  const slide = pptx.addSlide();
  slide.background = { fill: CHARCOAL };
  return slide;
}

function creamSlide(pptx) {
  const slide = pptx.addSlide();
  slide.background = { fill: CREAM };
  return slide;
}

function sectionTitle(slide, text, opts = {}) {
  const color = opts.color || CHARCOAL;
  slide.addText(text, {
    x: 0.7,
    y: 0.4,
    w: 11,
    h: 0.7,
    fontSize: 36,
    fontFace: "Georgia",
    color: color,
    bold: true,
  });
}

// ── Create Presentation ──────────────────────────────────────────────────
const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_16x9";
pptx.author = "Larry Jones";
pptx.title = "ArtistOS Pitch Deck";

// =====================================================================
// SLIDE 1 — Title
// =====================================================================
{
  const slide = darkSlide(pptx);

  slide.addText("ArtistOS", {
    x: 0,
    y: 2.0,
    w: 13.33,
    h: 1.2,
    fontSize: 54,
    fontFace: "Georgia",
    color: COPPER,
    bold: true,
    align: "center",
  });

  slide.addText("The All-in-One Creative Business Platform", {
    x: 0,
    y: 3.3,
    w: 13.33,
    h: 0.6,
    fontSize: 18,
    fontFace: "Calibri",
    color: WHITE,
    align: "center",
  });

  slide.addText("Founded by Larry Jones", {
    x: 0,
    y: 4.1,
    w: 13.33,
    h: 0.4,
    fontSize: 13,
    fontFace: "Calibri",
    color: MUTED,
    align: "center",
  });

  slide.addText("artistos-mvp.vercel.app", {
    x: 0,
    y: 6.7,
    w: 13.33,
    h: 0.4,
    fontSize: 11,
    fontFace: "Calibri",
    color: MUTED,
    align: "center",
  });
}

// =====================================================================
// SLIDE 2 — The Problem
// =====================================================================
{
  const slide = creamSlide(pptx);
  sectionTitle(slide, "The Problem");

  const problems = [
    {
      title: "Artists juggle 5\u201310 different tools",
      desc: "Separate apps for portfolio, invoicing, contracts, social media, CRM \u2014 none of them talk to each other.",
    },
    {
      title: "Existing platforms are expensive",
      desc: "Arternal: $95\u2013195/mo. ArtLogic: $131\u2013409/mo. Priced for galleries, not working artists.",
    },
    {
      title: "Built for galleries, not artists",
      desc: "Enterprise tools designed for gallery operations, not individual creators trying to build a career.",
    },
  ];

  problems.forEach((p, i) => {
    const yPos = 1.5 + i * 1.45;

    // Copper left border
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.7,
      y: yPos,
      w: 0.08,
      h: 1.15,
      fill: { color: COPPER },
      line: { color: COPPER, width: 0 },
    });

    // Card background
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.78,
      y: yPos,
      w: 11.0,
      h: 1.15,
      fill: { color: WHITE },
      line: { color: BORDER, width: 0.5 },
      rectRadius: 0.05,
    });

    // Title
    slide.addText(p.title, {
      x: 1.1,
      y: yPos + 0.12,
      w: 10.4,
      h: 0.4,
      fontSize: 16,
      fontFace: "Georgia",
      color: CHARCOAL,
      bold: true,
      margin: 0,
    });

    // Description
    slide.addText(p.desc, {
      x: 1.1,
      y: yPos + 0.55,
      w: 10.4,
      h: 0.5,
      fontSize: 12,
      fontFace: "Calibri",
      color: MUTED,
      margin: 0,
    });
  });
}

// =====================================================================
// SLIDE 3 — The Solution
// =====================================================================
{
  const slide = darkSlide(pptx);

  slide.addText("The Solution", {
    x: 0.7,
    y: 0.5,
    w: 11,
    h: 0.7,
    fontSize: 36,
    fontFace: "Georgia",
    color: WHITE,
    bold: true,
  });

  slide.addText("One platform. Everything artists need.", {
    x: 0.7,
    y: 1.8,
    w: 11,
    h: 0.7,
    fontSize: 26,
    fontFace: "Georgia",
    color: COPPER,
    bold: true,
  });

  slide.addText(
    "ArtistOS replaces the patchwork of tools with a single, elegant platform built specifically for independent artists \u2014 at a fraction of the cost.",
    {
      x: 0.7,
      y: 3.0,
      w: 10.5,
      h: 1.2,
      fontSize: 16,
      fontFace: "Calibri",
      color: "CCCCCC",
      lineSpacingMultiple: 1.4,
    }
  );
}

// =====================================================================
// SLIDE 4 — Product Overview (Feature Categories)
// =====================================================================
{
  const slide = creamSlide(pptx);
  sectionTitle(slide, "Complete Artist Business Suite");

  const features = [
    { icon: "\uD83C\uDFA8", title: "Create & Manage", items: "Portfolio, Artwork Detail Pages, QR Codes" },
    { icon: "\uD83D\uDCB0", title: "Sell & Earn", items: "Invoicing, Expense Tracking, Contract Generator" },
    { icon: "\uD83D\uDDBC\uFE0F", title: "Exhibit & Share", items: "Viewing Rooms, Exhibition Planner, Consignment Tracker" },
    { icon: "\uD83E\uDD1D", title: "Connect", items: "Collector CRM, Commissions, Messaging" },
    { icon: "\uD83D\uDCE3", title: "Promote", items: "Social Scheduler, Artist CV, Public Profile" },
    { icon: "\uD83D\uDE80", title: "Subscribe & Grow", items: "Stripe Payments, Plan Gating, Onboarding Wizard, Billing Portal" },
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xPos = 0.7 + col * 6.0;
    const yPos = 1.5 + row * 1.55;

    // Card background
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: xPos,
      y: yPos,
      w: 5.6,
      h: 1.3,
      fill: { color: WHITE },
      line: { color: BORDER, width: 0.75 },
      rectRadius: 0.08,
    });

    // Title with icon
    slide.addText(`${f.icon}  ${f.title}`, {
      x: xPos + 0.25,
      y: yPos + 0.15,
      w: 5.0,
      h: 0.4,
      fontSize: 15,
      fontFace: "Georgia",
      color: CHARCOAL,
      bold: true,
      margin: 0,
    });

    // Items
    slide.addText(f.items, {
      x: xPos + 0.25,
      y: yPos + 0.6,
      w: 5.0,
      h: 0.55,
      fontSize: 11,
      fontFace: "Calibri",
      color: MUTED,
      margin: 0,
    });
  });
}

// =====================================================================
// SLIDE 5 — Feature Highlights (Unique Features)
// =====================================================================
{
  const slide = creamSlide(pptx);
  sectionTitle(slide, "Features Nobody Else Has");

  const highlights = [
    {
      title: "Certificate of Authenticity",
      desc: "Generate printable COAs per artwork with artist signature and provenance details.",
    },
    {
      title: "Artist CV Generator",
      desc: "Professional art-world CV with exhibitions, education, awards \u2014 PDF export ready.",
    },
    {
      title: "Artwork QR Codes",
      desc: "Printable QR codes for gallery labels linking directly to artwork detail pages.",
    },
    {
      title: "Stripe Subscription Payments",
      desc: "Built-in Stripe checkout, tiered plans with feature gating, billing portal, and webhook-driven plan management.",
    },
  ];

  highlights.forEach((h, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xPos = 0.7 + col * 6.0;
    const yPos = 1.5 + row * 1.8;

    // Accent dot
    slide.addShape(pptx.shapes.OVAL, {
      x: xPos,
      y: yPos + 0.15,
      w: 0.15,
      h: 0.15,
      fill: { color: COPPER },
      line: { color: COPPER, width: 0 },
    });

    // Title
    slide.addText(h.title, {
      x: xPos + 0.3,
      y: yPos + 0.02,
      w: 5.3,
      h: 0.4,
      fontSize: 16,
      fontFace: "Georgia",
      color: CHARCOAL,
      bold: true,
      margin: 0,
    });

    // Description
    slide.addText(h.desc, {
      x: xPos + 0.3,
      y: yPos + 0.5,
      w: 5.3,
      h: 0.7,
      fontSize: 12,
      fontFace: "Calibri",
      color: MUTED,
      lineSpacingMultiple: 1.3,
      margin: 0,
    });
  });

  // Plus note
  slide.addText("Plus 26 more features including Viewing Rooms, CRM, Social Scheduler, Onboarding Wizard, Exhibition Planner...", {
    x: 0.7,
    y: 6.3,
    w: 11,
    h: 0.3,
    fontSize: 10,
    fontFace: "Calibri",
    color: MUTED,
    italic: true,
  });
}

// =====================================================================
// SLIDE 6 — Competitive Landscape
// =====================================================================
{
  const slide = creamSlide(pptx);
  sectionTitle(slide, "Competitive Landscape");

  const rows = [
    ["Feature",                  "ArtistOS",  "Arternal",       "ArtLogic"],
    ["Price",                    "$0\u201339/mo",  "$95\u2013195/mo",      "$131\u2013409/mo"],
    ["Viewing Rooms",            "Yes",       "Yes ($195)",     "Yes"],
    ["CRM / Contacts",           "Yes",       "Yes",            "Yes"],
    ["Invoicing",                "Yes",       "Yes",            "Yes"],
    ["Certificate of Authenticity","Yes",     "No",             "No"],
    ["Artist CV Generator",      "Yes",       "No",             "No"],
    ["QR Codes",                 "Yes",       "No",             "No"],
    ["Exhibition Planner",       "Yes",       "No",             "No"],
    ["Social Media Tools",       "Yes",       "No",             "No"],
    ["Built-in Payments",        "Yes",       "No",             "No"],
    ["Expense Tracking",         "Yes",       "No",             "No"],
    ["Public Marketplace",       "Yes",       "No",             "No"],
    ["Target User",              "Artists",   "Galleries",      "Galleries"],
  ];

  const colWidths = [2.8, 2.5, 2.5, 2.5];
  const tableX = 0.9;
  const tableY = 1.4;
  const rowH = 0.36;

  rows.forEach((row, rowIdx) => {
    let xOffset = tableX;
    row.forEach((cell, colIdx) => {
      const isHeader = rowIdx === 0;
      const isYes = cell === "Yes" || cell === "Yes ($195)";
      const isNo = cell === "No";

      let bgColor = rowIdx % 2 === 0 ? "F5F0EB" : WHITE;
      if (isHeader) bgColor = CHARCOAL;

      let textColor = CHARCOAL;
      if (isHeader) textColor = WHITE;
      else if (isYes) textColor = YES_GREEN;
      else if (isNo) textColor = NO_RED;

      // Cell background
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: xOffset,
        y: tableY + rowIdx * rowH,
        w: colWidths[colIdx],
        h: rowH,
        fill: { color: bgColor },
        line: { color: BORDER, width: 0.25 },
      });

      // Cell text
      slide.addText(cell, {
        x: xOffset,
        y: tableY + rowIdx * rowH,
        w: colWidths[colIdx],
        h: rowH,
        fontSize: isHeader ? 10 : 9.5,
        fontFace: isHeader ? "Georgia" : "Calibri",
        color: textColor,
        bold: isHeader || isYes || isNo,
        align: colIdx === 0 ? "left" : "center",
        valign: "middle",
        margin: colIdx === 0 ? [0, 0, 0, 8] : 0,
      });

      xOffset += colWidths[colIdx];
    });
  });
}

// =====================================================================
// SLIDE 7 — Business Model
// =====================================================================
{
  const slide = darkSlide(pptx);

  slide.addText("Business Model", {
    x: 0.7,
    y: 0.4,
    w: 11,
    h: 0.7,
    fontSize: 36,
    fontFace: "Georgia",
    color: WHITE,
    bold: true,
  });

  const tiers = [
    {
      name: "Starter",
      price: "$0/mo",
      desc: "Core features, 25 artworks, 3 viewing rooms, 20 contacts. Perfect for getting started.",
    },
    {
      name: "Pro",
      price: "$19/mo",
      desc: "200 artworks, analytics, social scheduler, exhibitions, consignments \u2014 all features unlocked.",
    },
    {
      name: "Studio",
      price: "$49/mo",
      desc: "Unlimited everything, custom domain, white-label options, dedicated support.",
    },
  ];

  tiers.forEach((t, i) => {
    const xPos = 0.7 + i * 4.1;
    const yPos = 1.7;
    const cardW = 3.7;
    const cardH = 3.5;

    // Card background
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: xPos,
      y: yPos,
      w: cardW,
      h: cardH,
      fill: { color: "1A1816" },
      line: { color: "3A3530", width: 0.75 },
      rectRadius: 0.1,
    });

    // Tier name
    slide.addText(t.name, {
      x: xPos,
      y: yPos + 0.3,
      w: cardW,
      h: 0.5,
      fontSize: 22,
      fontFace: "Georgia",
      color: COPPER,
      bold: true,
      align: "center",
      margin: 0,
    });

    // Price
    slide.addText(t.price, {
      x: xPos,
      y: yPos + 1.0,
      w: cardW,
      h: 0.6,
      fontSize: 32,
      fontFace: "Georgia",
      color: WHITE,
      bold: true,
      align: "center",
      margin: 0,
    });

    // Description
    slide.addText(t.desc, {
      x: xPos + 0.35,
      y: yPos + 2.0,
      w: cardW - 0.7,
      h: 1.0,
      fontSize: 11,
      fontFace: "Calibri",
      color: MUTED,
      align: "center",
      lineSpacingMultiple: 1.4,
      margin: 0,
    });
  });

  // Bottom note
  slide.addText("Stripe payments built in. Even our highest tier costs less than competitors\u2019 cheapest plan.", {
    x: 0,
    y: 5.8,
    w: 13.33,
    h: 0.4,
    fontSize: 12,
    fontFace: "Calibri",
    color: GOLD,
    align: "center",
    italic: true,
  });
}

// =====================================================================
// SLIDE 8 — Traction & Current State
// =====================================================================
{
  const slide = creamSlide(pptx);
  sectionTitle(slide, "Built & Ready");

  const stats = [
    { number: "30+", label: "Features Built" },
    { number: "12", label: "Dev Phases Complete" },
    { number: "0", label: "Console Errors" },
    { number: "Live", label: "artistos-mvp.vercel.app" },
  ];

  stats.forEach((s, i) => {
    const xPos = 0.7 + i * 3.05;
    const yPos = 1.6;

    // Card
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: xPos,
      y: yPos,
      w: 2.7,
      h: 1.8,
      fill: { color: WHITE },
      line: { color: BORDER, width: 0.75 },
      rectRadius: 0.08,
    });

    // Big number
    slide.addText(s.number, {
      x: xPos,
      y: yPos + 0.2,
      w: 2.7,
      h: 0.8,
      fontSize: 36,
      fontFace: "Georgia",
      color: COPPER,
      bold: true,
      align: "center",
      margin: 0,
    });

    // Label
    slide.addText(s.label, {
      x: xPos,
      y: yPos + 1.1,
      w: 2.7,
      h: 0.4,
      fontSize: 12,
      fontFace: "Calibri",
      color: MUTED,
      align: "center",
      margin: 0,
    });
  });

  // Body text
  slide.addText(
    "MVP is fully functional with real data. Stripe payments, plan gating, onboarding, portfolio management, invoicing, viewing rooms, CRM, and 22 more features \u2014 all working end-to-end.",
    {
      x: 0.7,
      y: 4.0,
      w: 11.5,
      h: 0.8,
      fontSize: 13,
      fontFace: "Calibri",
      color: CHARCOAL,
      lineSpacingMultiple: 1.4,
    }
  );
}

// =====================================================================
// SLIDE 9 — Technology
// =====================================================================
{
  const slide = creamSlide(pptx);
  sectionTitle(slide, "Modern Tech Stack");

  const stack = [
    { name: "React 18", desc: "Fast, component-based UI" },
    { name: "Supabase", desc: "PostgreSQL database, auth, storage, real-time" },
    { name: "Vite", desc: "Lightning-fast builds" },
    { name: "Vercel", desc: "Global edge deployment, automatic CI/CD" },
    { name: "Tailwind CSS", desc: "Utility-first styling" },
    { name: "Stripe", desc: "Subscription payments, checkout, billing portal" },
  ];

  stack.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const xPos = 0.7 + col * 6.0;
    const yPos = 1.5 + row * 1.45;

    // Sage accent bar
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: xPos,
      y: yPos,
      w: 0.08,
      h: 1.1,
      fill: { color: SAGE },
      line: { color: SAGE, width: 0 },
    });

    // Card
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: xPos + 0.08,
      y: yPos,
      w: 5.52,
      h: 1.1,
      fill: { color: WHITE },
      line: { color: BORDER, width: 0.5 },
    });

    // Tech name
    slide.addText(s.name, {
      x: xPos + 0.35,
      y: yPos + 0.12,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      fontFace: "Georgia",
      color: CHARCOAL,
      bold: true,
      margin: 0,
    });

    // Description
    slide.addText(s.desc, {
      x: xPos + 0.35,
      y: yPos + 0.55,
      w: 5.0,
      h: 0.4,
      fontSize: 12,
      fontFace: "Calibri",
      color: MUTED,
      margin: 0,
    });
  });
}

// =====================================================================
// SLIDE 10 — Vision & Roadmap
// =====================================================================
{
  const slide = creamSlide(pptx);
  sectionTitle(slide, "What\u2019s Next");

  const roadmap = [
    { period: "Q2 2026", items: "Beta launch, 100 artist onboarding, mobile-responsive polish" },
    { period: "Q3 2026", items: "Native mobile app (React Native), AI artwork descriptions" },
    { period: "Q4 2026", items: "Gallery partnership program, white-label option" },
    { period: "2027", items: "International expansion, art fair integrations, NFT support" },
  ];

  roadmap.forEach((r, i) => {
    const yPos = 1.6 + i * 1.2;

    // Timeline dot
    slide.addShape(pptx.shapes.OVAL, {
      x: 1.5,
      y: yPos + 0.15,
      w: 0.2,
      h: 0.2,
      fill: { color: COPPER },
      line: { color: COPPER, width: 0 },
    });

    // Connector line (except last)
    if (i < roadmap.length - 1) {
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 1.58,
        y: yPos + 0.35,
        w: 0.04,
        h: 1.0,
        fill: { color: BORDER },
        line: { color: BORDER, width: 0 },
      });
    }

    // Period label
    slide.addText(r.period, {
      x: 2.0,
      y: yPos,
      w: 1.5,
      h: 0.5,
      fontSize: 16,
      fontFace: "Georgia",
      color: COPPER,
      bold: true,
      margin: 0,
    });

    // Items
    slide.addText(r.items, {
      x: 3.8,
      y: yPos + 0.05,
      w: 8.5,
      h: 0.5,
      fontSize: 13,
      fontFace: "Calibri",
      color: CHARCOAL,
      margin: 0,
    });
  });
}

// =====================================================================
// SLIDE 11 — The Ask
// =====================================================================
{
  const slide = darkSlide(pptx);

  slide.addText("The Ask", {
    x: 0.7,
    y: 0.4,
    w: 11,
    h: 0.7,
    fontSize: 36,
    fontFace: "Georgia",
    color: WHITE,
    bold: true,
  });

  const asks = [
    {
      title: "Seed Funding",
      amount: "$500K",
      desc: "Hire 2 engineers, fund marketing, and build 18 months of runway.",
    },
    {
      title: "Beta Artists",
      amount: "100 Artists",
      desc: "Onboard 100 artists to validate product-market fit and gather feedback.",
    },
    {
      title: "Gallery Partners",
      amount: "10 Galleries",
      desc: "Launch B2B pilot program for gallery-artist collaboration features.",
    },
  ];

  asks.forEach((a, i) => {
    const xPos = 0.7 + i * 4.1;
    const yPos = 1.7;
    const cardW = 3.7;
    const cardH = 3.5;

    // Card
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: xPos,
      y: yPos,
      w: cardW,
      h: cardH,
      fill: { color: "1A1816" },
      line: { color: "3A3530", width: 0.75 },
      rectRadius: 0.1,
    });

    // Copper top accent
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: xPos,
      y: yPos,
      w: cardW,
      h: 0.06,
      fill: { color: COPPER },
      line: { color: COPPER, width: 0 },
    });

    // Title
    slide.addText(a.title, {
      x: xPos,
      y: yPos + 0.4,
      w: cardW,
      h: 0.5,
      fontSize: 14,
      fontFace: "Calibri",
      color: MUTED,
      align: "center",
      margin: 0,
    });

    // Amount
    slide.addText(a.amount, {
      x: xPos,
      y: yPos + 1.0,
      w: cardW,
      h: 0.7,
      fontSize: 28,
      fontFace: "Georgia",
      color: COPPER,
      bold: true,
      align: "center",
      margin: 0,
    });

    // Description
    slide.addText(a.desc, {
      x: xPos + 0.35,
      y: yPos + 2.0,
      w: cardW - 0.7,
      h: 1.0,
      fontSize: 11,
      fontFace: "Calibri",
      color: MUTED,
      align: "center",
      lineSpacingMultiple: 1.4,
      margin: 0,
    });
  });
}

// =====================================================================
// SLIDE 12 — Contact / Thank You
// =====================================================================
{
  const slide = darkSlide(pptx);

  slide.addText("Thank You", {
    x: 0,
    y: 1.8,
    w: 13.33,
    h: 1.0,
    fontSize: 48,
    fontFace: "Georgia",
    color: COPPER,
    bold: true,
    align: "center",
  });

  slide.addText("ArtistOS", {
    x: 0,
    y: 2.9,
    w: 13.33,
    h: 0.6,
    fontSize: 20,
    fontFace: "Georgia",
    color: WHITE,
    align: "center",
  });

  // Divider line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 5.5,
    y: 3.8,
    w: 2.33,
    h: 0.02,
    fill: { color: COPPER },
    line: { color: COPPER, width: 0 },
  });

  slide.addText("artistos-mvp.vercel.app", {
    x: 0,
    y: 4.2,
    w: 13.33,
    h: 0.4,
    fontSize: 14,
    fontFace: "Calibri",
    color: GOLD,
    align: "center",
  });

  slide.addText("larry@synergysourceadvisors.com", {
    x: 0,
    y: 4.7,
    w: 13.33,
    h: 0.4,
    fontSize: 14,
    fontFace: "Calibri",
    color: "CCCCCC",
    align: "center",
  });

  slide.addText("Larry Jones, Founder", {
    x: 0,
    y: 5.3,
    w: 13.33,
    h: 0.4,
    fontSize: 14,
    fontFace: "Georgia",
    color: WHITE,
    align: "center",
  });

  slide.addText("Built with passion for the creative community.", {
    x: 0,
    y: 6.3,
    w: 13.33,
    h: 0.4,
    fontSize: 11,
    fontFace: "Calibri",
    color: MUTED,
    align: "center",
    italic: true,
  });
}

// ── Write File ───────────────────────────────────────────────────────────
const outputPath = "ArtistOS-Pitch-Deck.pptx";
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log(`\nDeck created successfully: ${outputPath}`);
  console.log("12 slides generated with ArtistOS brand styling (updated for Phase 12).");
}).catch((err) => {
  console.error("Error creating deck:", err);
});
