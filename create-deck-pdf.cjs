/**
 * ArtistOS Investor Pitch Deck - PDF Generator (Node.js)
 * Run:  npm install pdfkit  &&  node create-deck-pdf.cjs
 * Output: ArtistOS-PitchDeck.pdf
 */
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Page: 16:9 widescreen
const I = 72; // 1 inch = 72 pts
const PW = 720; // 10"
const PH = 405; // 5.625"

// Brand Colors
const DARK = "#0E0C0A";
const CREAM = "#FAF8F5";
const COPPER = "#B5651D";
const COPPER_L = "#D4854A";
const FOREST = "#2D4A35";
const FOREST_L = "#4A7A57";
const MUTED = "#A89F94";
const ROSE = "#C4705A";
const CARD_BG = "#F2EDE6";
const WHITE = "#FFFFFF";
const DIM = "#6B6560";

// Fonts (built-in PDF fonts)
const S = "Helvetica";
const SB = "Helvetica-Bold";
const SI = "Helvetica-Oblique";
const R = "Times-Roman";
const RB = "Times-Bold";
const RI = "Times-Italic";

// Create PDF
const doc = new PDFDocument({
  size: [PW, PH],
  margin: 0,
  autoFirstPage: false,
  info: {
    Title: "ArtistOS - Investor Pitch Deck 2026",
    Author: "Larry Jones",
    Subject: "Pre-Seed Investment Opportunity",
  },
});

const outPath = "C:\\Users\\larry\\artistos-mvp\\ArtistOS-PitchDeck.pdf";
doc.pipe(fs.createWriteStream(outPath));

// ========================================
// HELPERS
// ========================================

function slide() {
  doc.addPage({ size: [PW, PH], margin: 0 });
}

function bg(color) {
  doc.rect(0, 0, PW, PH).fill(color);
}

function box(x, y, w, h, color, alpha) {
  doc.save();
  if (alpha != null && alpha < 1) doc.fillOpacity(alpha);
  doc.rect(x * I, y * I, w * I, h * I).fill(color);
  doc.restore();
}

function oval(x, y, w, h, color, alpha, sColor, sW) {
  doc.save();
  if (alpha != null && alpha < 1) doc.fillOpacity(alpha);
  const cx = (x + w / 2) * I,
    cy = (y + h / 2) * I,
    rx = (w / 2) * I,
    ry = (h / 2) * I;
  if (sColor) {
    doc.lineWidth(sW || 1);
    doc.ellipse(cx, cy, rx, ry).fillAndStroke(color, sColor);
  } else {
    doc.ellipse(cx, cy, rx, ry).fill(color);
  }
  doc.restore();
}

function t(str, x, y, font, sz, color, opts) {
  opts = opts || {};
  doc.font(font).fontSize(sz).fillColor(color);
  const o = { lineBreak: !!opts.wrap };
  if (opts.w) {
    o.width = opts.w * I;
    o.align = opts.align || "left";
  }
  doc.text(str, x * I, y * I, o);
}

function tc(str, x, y, w, h, font, sz, color) {
  doc.font(font).fontSize(sz).fillColor(color);
  const ty = y * I + (h * I - sz) / 2;
  doc.text(str, x * I, ty, { width: w * I, align: "center", lineBreak: false });
}

function tw(str, x, y, w, font, sz, color) {
  doc.font(font).fontSize(sz).fillColor(color);
  doc.text(str, x * I, y * I, { width: w * I, lineBreak: true });
}

function lbl(str, x, y, color) {
  doc.font(SB).fontSize(11).fillColor(color || COPPER);
  doc.text(str.split("").join(" ").replace(/   /g, "  "), x * I, y * I, {
    lineBreak: false,
  });
}

function hl(x, y, len, color, w, dashed) {
  doc.save();
  doc.strokeColor(color).lineWidth(w || 0.5);
  if (dashed) doc.dash(4, { space: 4 });
  doc
    .moveTo(x * I, y * I)
    .lineTo((x + len) * I, y * I)
    .stroke();
  doc.restore();
}

// ========================================
// SLIDE 1 - TITLE
// ========================================
slide();
bg(DARK);
box(0, 0, 10, 0.06, COPPER);
oval(4.55, 1.2, 0.9, 0.9, COPPER, 0.88);
t("ArtistOS", 0.5, 1.45, RB, 54, CREAM, { align: "center", w: 9 });
t("Run Your Art Practice Like a Business", 0.5, 2.45, SI, 20, COPPER, {
  align: "center",
  w: 9,
});
t("Pre-Seed Investment Deck  |  2026", 0.5, 3.25, S, 13, MUTED, {
  align: "center",
  w: 9,
});
box(0, 5.0, 10, 0.625, COPPER, 0.1);
t("artistos-mvp.vercel.app", 0.5, 5.17, S, 11, MUTED, {
  align: "center",
  w: 9,
});

// ========================================
// SLIDE 2 - THE PROBLEM
// ========================================
slide();
bg(DARK);
lbl("THE PROBLEM", 0.7, 0.45);
t("Artists are running businesses", 0.7, 1.0, R, 30, CREAM);
t("without business tools", 0.7, 1.5, R, 30, CREAM);

const problems = [
  [
    "01",
    "Fragmented Portfolios",
    "Spreadsheets, folders, emails -- no single source of truth for inventory, pricing, or provenance.",
  ],
  [
    "02",
    "No Pricing Guidance",
    "Artists underprice by 30-50% on average. No data, no benchmarks, no market context.",
  ],
  [
    "03",
    "Lost Commission Revenue",
    "No pipeline structure means dropped leads, missed deadlines, and unpaid invoices.",
  ],
];
problems.forEach(([num, title, desc], i) => {
  const yb = 2.25 + i * 1.1;
  box(0.7, yb, 0.55, 0.55, COPPER);
  tc(num, 0.7, yb, 0.55, 0.55, SB, 14, CREAM);
  t(title, 1.5, yb + 0.07, SB, 16, CREAM);
  tw(desc, 1.5, yb + 0.38, 7.5, S, 12, MUTED);
});

// ========================================
// SLIDE 3 - THE SOLUTION
// ========================================
slide();
bg(CREAM);
lbl("THE SOLUTION", 0.7, 0.45);
t("The all-in-one platform", 0.7, 1.0, R, 30, DARK);
t("built for artists", 0.7, 1.5, R, 30, DARK);

box(6.3, 0.9, 3.2, 1.0, COPPER);
tw(
  "Think Shopify meets Honeybook, built for the art world.",
  6.5,
  1.08,
  2.8,
  S,
  13,
  CREAM
);

const pillars = [
  [
    "P",
    "Portfolio & Inventory",
    "Upload, catalog, price, and describe artworks with AI assistance",
  ],
  [
    "$",
    "Financial Command Center",
    "Invoices, expenses, contracts, and revenue tracking in one place",
  ],
  [
    "AI",
    "AI-Powered Intelligence",
    "Smart descriptions, pricing guidance, and bio generation",
  ],
];
pillars.forEach(([icon, title, desc], i) => {
  const xb = 0.7 + i * 3.05;
  box(xb, 2.3, 2.8, 2.7, WHITE);
  box(xb, 2.3, 2.8, 0.06, COPPER);
  oval(xb + 0.2, 2.55, 0.6, 0.6, COPPER);
  tc(icon, xb + 0.2, 2.55, 0.6, 0.6, SB, 18, CREAM);
  t(title, xb + 0.2, 3.3, SB, 14, DARK);
  tw(desc, xb + 0.2, 3.75, 2.4, S, 11, DIM);
});

// ========================================
// SLIDE 4 - PRODUCT OVERVIEW
// ========================================
slide();
bg(CREAM);
lbl("PRODUCT OVERVIEW", 0.7, 0.45);
t("Everything an artist needs, one platform", 0.7, 1.0, R, 26, DARK);

const features = [
  [
    "Portfolio Management",
    "Image uploads, AI descriptions, AI price suggestions, provenance tracking",
    COPPER,
  ],
  [
    "Financial Hub",
    "Invoices with PDF export, expense tracking, revenue charts, CSV export",
    FOREST,
  ],
  [
    "Commission Pipeline",
    "Full CRM with status tracking, deadlines, progress bars, budgets",
    ROSE,
  ],
  [
    "AI-Powered Tools",
    "Artwork descriptions, pricing intelligence, professional bio generator",
    COPPER,
  ],
  [
    "Viewing Rooms",
    "Private shareable galleries for collectors with QR codes and email invites",
    FOREST,
  ],
  [
    "Market Analytics",
    "Portfolio value, sell-through rates, medium breakdown, trend analysis",
    ROSE,
  ],
];
features.forEach(([title, desc, color], i) => {
  const col = i % 3,
    row = Math.floor(i / 3);
  const xb = 0.7 + col * 3.05;
  const yb = 1.75 + row * 1.85;
  oval(xb, yb + 0.06, 0.18, 0.18, color);
  t(title, xb + 0.35, yb + 0.05, SB, 13, DARK);
  tw(desc, xb + 0.35, yb + 0.4, 2.45, S, 11, DIM);
});

// ========================================
// SLIDE 5 - LIVE PRODUCT
// ========================================
slide();
bg(DARK);
lbl("LIVE PRODUCT", 0.7, 0.45);
t("Not a mockup. A working product.", 0.7, 1.0, R, 30, CREAM);
t("artistos-mvp.vercel.app", 0.7, 1.65, SB, 16, COPPER);

const stats = [
  ["28", "Pages Built"],
  ["3", "Pricing Tiers"],
  ["4", "AI Features"],
  ["PWA", "Mobile Ready"],
];
stats.forEach(([val, label], i) => {
  const xb = 0.7 + i * 2.3;
  box(xb, 2.3, 2.0, 1.6, COPPER, 0.12);
  t(val, xb, 2.5, RB, 40, COPPER, { align: "center", w: 2.0 });
  t(label, xb, 3.35, S, 11, MUTED, { align: "center", w: 2.0 });
});

t("TECH STACK", 0.7, 4.35, S, 10, MUTED);
const techs = ["React", "Supabase", "Stripe", "OpenAI", "Resend", "Vercel"];
techs.forEach((name, i) => {
  const xb = 0.7 + i * 1.45;
  box(xb, 4.65, 1.25, 0.45, COPPER, 0.15);
  tc(name, xb, 4.65, 1.25, 0.45, S, 11, MUTED);
});

// ========================================
// SLIDE 6 - MARKET OPPORTUNITY
// ========================================
slide();
bg(CREAM);
lbl("MARKET OPPORTUNITY", 0.7, 0.45);
t("A massive, underserved market", 0.7, 1.0, R, 28, DARK);

const markets = [
  ["TAM", "$64B", "US Creative Economy", 2.6, 1.2],
  ["SAM", "$8.2B", "2.3M Professional Artists", 2.0, 4.2],
  ["SOM", "$82M", "10K Artists at $49/mo avg", 1.5, 6.8],
];
markets.forEach(([label, val, desc, sz, mx]) => {
  const yc = 3.0;
  oval(mx, yc - sz / 2, sz, sz, COPPER, 0.15, COPPER, 2);
  t(label, mx, yc - 0.42, SB, 10, COPPER, { align: "center", w: sz });
  t(val, mx, yc - 0.1, RB, 28, DARK, { align: "center", w: sz });
  t(desc, mx, yc + 0.4, S, 9, DIM, { align: "center", w: sz });
});

box(0.7, 4.55, 8.6, 0.7, WHITE);
box(0.7, 4.55, 8.6, 0.06, COPPER);
t(
  "12% art market YoY growth   |   78% of artists need better tools   |   2.3M professional artists in the US",
  0.9,
  4.78,
  S,
  11,
  DIM,
  { align: "center", w: 8.2 }
);

// ========================================
// SLIDE 7 - BUSINESS MODEL
// ========================================
slide();
bg(CREAM);
lbl("BUSINESS MODEL", 0.7, 0.45);
t("Freemium SaaS with clear upgrade path", 0.7, 1.0, R, 26, DARK);

const plans = [
  [
    "Starter",
    "Free",
    ["25 artworks", "3 viewing rooms", "Basic invoicing", "Contract generator"],
    false,
  ],
  [
    "Pro",
    "$19/mo",
    ["200 artworks", "AI-powered tools", "Market analytics", "Social scheduler"],
    true,
  ],
  [
    "Studio",
    "$49/mo",
    [
      "Unlimited everything",
      "All Pro features",
      "Exhibition planner",
      "Priority support",
    ],
    false,
  ],
];
plans.forEach(([name, price, feats, hl], i) => {
  const xb = 0.7 + i * 3.05;
  const bgC = hl ? COPPER : WHITE;
  const txtC = hl ? CREAM : DARK;
  const subC = hl ? CREAM : DIM;
  const chkC = hl ? CREAM : FOREST_L;

  box(xb, 1.65, 2.8, 3.55, bgC);
  t(name, xb + 0.25, 1.9, SB, 14, txtC);
  t(price, xb + 0.25, 2.3, RB, 30, txtC);

  feats.forEach((f, j) => {
    const fy = 2.95 + j * 0.42;
    t("+  " + f, xb + 0.25, fy, S, 11, subC);
  });
});

t(
  "Future: Marketplace transaction fees (5-8%)  +  Premium AI features",
  0.7,
  5.3,
  S,
  10,
  MUTED,
  { align: "center", w: 8.6 }
);

// ========================================
// SLIDE 8 - COMPETITIVE LANDSCAPE
// ========================================
slide();
bg(CREAM);
lbl("COMPETITIVE LANDSCAPE", 0.7, 0.45);
t("The only platform built for artists, by design", 0.7, 1.0, R, 26, DARK);

const colW = [2.2, 1.3, 1.3, 1.3, 1.3, 1.3];
const tx = 0.55;
const hy = 1.75;

// Header row
const headers = [
  "",
  "ArtistOS",
  "Artwork Archive",
  "Honeybook",
  "Artsy",
  "Sheets",
];
let xOff = 0;
headers.forEach((h, i) => {
  if (i === 1) {
    box(tx + xOff, hy, colW[i], 0.5, COPPER);
    tc(h, tx + xOff, hy, colW[i], 0.5, SB, 10, CREAM);
  } else if (i > 1) {
    box(tx + xOff, hy, colW[i], 0.5, CARD_BG);
    tc(h, tx + xOff, hy, colW[i], 0.5, SB, 9, DIM);
  }
  xOff += colW[i];
});

// Data rows: true = has feature, false = no, string = text
const rows = [
  ["Portfolio Mgmt", true, true, false, true, false],
  ["AI Tools", true, false, false, false, false],
  ["Financial Tracking", true, false, true, false, true],
  ["Commission CRM", true, false, true, false, false],
  ["Marketplace", true, false, false, true, false],
  ["Art-Specific", true, true, false, true, false],
  ["Price", "Free-$49", "$8/mo", "$19/mo", "Gallery", "Free"],
];

rows.forEach((row, ri) => {
  const ry = hy + 0.55 + ri * 0.42;
  hl(tx, ry, 8.7, CARD_BG, 0.5);

  xOff = 0;
  row.forEach((cell, ci) => {
    // Highlight ArtistOS column
    if (ci === 1) box(tx + xOff, ry, colW[ci], 0.42, COPPER, 0.08);

    if (ci === 0) {
      t(cell, tx + xOff + 0.05, ry + 0.1, SB, 11, DARK);
    } else if (typeof cell === "boolean") {
      if (cell && ci === 1) {
        oval(
          tx + xOff + colW[ci] / 2 - 0.07,
          ry + 0.12,
          0.14,
          0.14,
          COPPER
        );
      } else if (cell) {
        oval(
          tx + xOff + colW[ci] / 2 - 0.07,
          ry + 0.12,
          0.14,
          0.14,
          FOREST_L
        );
      } else {
        t("--", tx + xOff, ry + 0.08, S, 12, MUTED, {
          align: "center",
          w: colW[ci],
        });
      }
    } else {
      const clr = ci === 1 ? COPPER : DIM;
      const fnt = ci === 1 ? SB : S;
      t(cell, tx + xOff, ry + 0.1, fnt, 10, clr, {
        align: "center",
        w: colW[ci],
      });
    }
    xOff += colW[ci];
  });
});

// ========================================
// SLIDE 9 - TRACTION & MILESTONES
// ========================================
slide();
bg(CREAM);
lbl("TRACTION & MILESTONES", 0.7, 0.45);
t("Built and launched in record time", 0.7, 1.0, R, 26, DARK);

const milestones = [
  "Full MVP live and functional (28 pages, 11 components)",
  "Stripe payments integrated -- 3 subscription tiers active",
  "AI features powered by OpenAI (4 distinct tools)",
  "Email infrastructure deployed (Resend + fallback)",
  "SEO optimized with Open Graph, Twitter Cards, JSON-LD",
  "PWA-ready -- installable on mobile devices",
  "Real analytics dashboard with portfolio intelligence",
  "Legal pages (Terms of Service, Privacy Policy)",
];
milestones.forEach((m, i) => {
  const col = i < 4 ? 0 : 1;
  const row = i % 4;
  const xb = 0.7 + col * 4.5;
  const yb = 1.75 + row * 0.85;
  oval(xb, yb + 0.04, 0.28, 0.28, FOREST_L);
  tc("+", xb, yb + 0.02, 0.28, 0.28, SB, 14, CREAM);
  tw(m, xb + 0.45, yb + 0.05, 3.85, S, 12, DARK);
});

// ========================================
// SLIDE 10 - GO-TO-MARKET
// ========================================
slide();
bg(CREAM);
lbl("GO-TO-MARKET STRATEGY", 0.7, 0.45);
t("Community-first growth engine", 0.7, 1.0, R, 26, DARK);

const phases = [
  [
    "Phase 1: Community",
    "MONTHS 1-6",
    [
      "Reddit r/artbusiness (500K+)",
      "Instagram art hashtags",
      "MFA programs & art schools",
      "Art business YouTube content",
    ],
    COPPER,
  ],
  [
    "Phase 2: Partnerships",
    "MONTHS 6-12",
    [
      "Onboard 50 gallery referral partners",
      "Art fair presence & sponsorships",
      "Referral program (free Pro month)",
      "Art supply brand partnerships",
    ],
    FOREST,
  ],
  [
    "Phase 3: Marketplace",
    "YEAR 2+",
    [
      "Connect artists with collectors",
      "5% transaction fee on sales",
      "Curator-led collections",
      "International expansion",
    ],
    ROSE,
  ],
];
phases.forEach(([title, period, items, color], i) => {
  const xb = 0.7 + i * 3.05;
  box(xb, 1.7, 2.8, 3.4, WHITE);
  box(xb, 1.7, 2.8, 0.06, color);
  t(period, xb + 0.2, 1.95, SB, 9, color);
  t(title, xb + 0.2, 2.25, SB, 14, DARK);
  items.forEach((item, j) => {
    tw("-  " + item, xb + 0.2, 2.75 + j * 0.5, 2.4, S, 11, DIM);
  });
});

// ========================================
// SLIDE 11 - REVENUE PROJECTIONS
// ========================================
slide();
bg(DARK);
lbl("REVENUE PROJECTIONS", 0.7, 0.45);
t("Clear path to $1.2M ARR", 0.7, 1.0, R, 28, CREAM);

const years = [
  ["Year 1", "$0", "1,000", "User acquisition focus", "Free tier growth"],
  [
    "Year 2",
    "$180K",
    "500 paid",
    "Conversion optimization",
    "$30/mo blended ARPU",
  ],
  [
    "Year 3",
    "$1.2M",
    "3,000 paid",
    "Marketplace revenue",
    "Enterprise expansion",
  ],
];
years.forEach(([year, arr, users, d1, d2], i) => {
  const xb = 0.7 + i * 3.05;
  box(xb, 1.8, 2.8, 2.4, COPPER, 0.12);
  t(year, xb + 0.25, 2.0, SB, 11, COPPER);
  t(arr, xb + 0.25, 2.4, RB, 34, CREAM);
  t("ARR", xb + 0.25, 2.9, S, 10, MUTED);
  t(users + " users", xb + 0.25, 3.2, S, 12, COPPER_L);
  t(d1, xb + 0.25, 3.55, S, 10, MUTED);
  t(d2, xb + 0.25, 3.75, S, 10, MUTED);
});

t(
  "Future revenue: Marketplace fees (5-8%)  |  Premium AI features  |  Gallery enterprise plans",
  0.7,
  4.65,
  S,
  11,
  MUTED,
  { align: "center", w: 8.6 }
);

// ========================================
// SLIDE 12 - THE TEAM
// ========================================
slide();
bg(CREAM);
lbl("THE TEAM", 0.7, 0.45);
t("Builder-founder with domain expertise", 0.7, 1.0, R, 26, DARK);

// Founder card
box(0.7, 1.7, 4.3, 3.3, WHITE);
box(0.7, 1.7, 0.08, 3.3, COPPER);
oval(1.1, 2.0, 0.9, 0.9, COPPER);
tc("LJ", 1.1, 2.0, 0.9, 0.9, RB, 22, CREAM);
t("Larry Jones", 2.25, 2.15, SB, 18, DARK);
t("Founder & CEO", 2.25, 2.5, S, 12, COPPER);

const fPts = [
  "Background at Synergy Source Advisors",
  "Deep understanding of creative economy",
  "Built full MVP from concept to live product",
  "Passion for empowering creative professionals",
];
fPts.forEach((p, i) => {
  t("-  " + p, 1.1, 3.15 + i * 0.42, S, 12, DIM);
});

// Hiring card
box(5.3, 1.7, 4.2, 3.3, WHITE);
box(5.3, 1.7, 0.08, 3.3, FOREST);
t("HIRING PLAN", 5.65, 1.95, SB, 10, FOREST);
t("With funding, we'll build the team", 5.65, 2.3, S, 13, DARK);

const hires = [
  ["CTO / Lead Engineer", "Month 1"],
  ["Full-Stack Developer", "Month 2"],
  ["Head of Product", "Month 4"],
  ["Community Manager", "Month 6"],
];
hires.forEach(([role, when], i) => {
  const hy2 = 2.8 + i * 0.55;
  oval(5.65, hy2 + 0.04, 0.22, 0.22, FOREST);
  t(role, 6.05, hy2, SB, 12, DARK);
  t(when, 6.05, hy2 + 0.25, S, 10, MUTED);
});

// ========================================
// SLIDE 13 - THE ASK
// ========================================
slide();
bg(DARK);
lbl("THE ASK", 0.7, 0.45);
t("$500K Pre-Seed Round", 0.7, 1.05, RB, 36, CREAM);
t("18-month runway to Series A metrics", 0.7, 1.65, S, 14, MUTED);

// Use of funds progress bar
const funds = [
  ["40%", "Engineering", "Hire CTO + engineer, scale infra", COPPER, 3.44],
  ["25%", "Marketing", "Community, content, partnerships", FOREST, 2.15],
  ["20%", "Product Dev", "Mobile app, marketplace, AI", ROSE, 1.72],
  ["15%", "Operations", "Legal, compliance, runway", MUTED, 1.29],
];
let bx = 0.7;
funds.forEach(([, , , color, w]) => {
  box(bx, 2.2, w, 0.35, color);
  bx += w;
});

funds.forEach(([pct, name, desc, color], i) => {
  const xb = 0.7 + i * 2.15;
  t(pct, xb, 2.8, RB, 24, color);
  t(name, xb, 3.2, SB, 13, CREAM);
  t(desc, xb, 3.5, S, 10, MUTED);
});

// Target metrics
box(0.7, 4.2, 8.6, 1.0, COPPER, 0.12);
t("TARGET METRICS AT SERIES A", 0.7, 4.32, SB, 9, COPPER, {
  align: "center",
  w: 8.6,
});

const targets = [
  ["3,000", "Paid Artists"],
  ["$1.2M", "ARR"],
  ["< 5%", "Monthly Churn"],
  ["12:1", "LTV:CAC Ratio"],
];
targets.forEach(([val, label], i) => {
  const xb = 1.0 + i * 2.15;
  t(val, xb, 4.65, RB, 22, CREAM, { align: "center", w: 1.8 });
  t(label, xb, 4.95, S, 10, MUTED, { align: "center", w: 1.8 });
});

// ========================================
// SLIDE 14 - VISION & CONTACT
// ========================================
slide();
bg(DARK);
box(0, 0, 10, 0.06, COPPER);
oval(4.2, 0.6, 1.6, 1.6, COPPER, 0.12);

t("Every artist deserves the tools", 0.7, 1.1, R, 28, CREAM, {
  align: "center",
  w: 8.6,
});
t("to turn their passion into a", 0.7, 1.55, R, 28, CREAM, {
  align: "center",
  w: 8.6,
});
t("sustainable career.", 0.7, 2.0, RI, 28, COPPER, {
  align: "center",
  w: 8.6,
});

// Roadmap pills
const roadmap = [
  "Mobile App",
  "Marketplace",
  "Art Market Data API",
  "International",
];
roadmap.forEach((r, i) => {
  const xb = 0.7 + i * 2.3;
  box(xb, 2.85, 2.1, 0.4, COPPER, 0.15);
  tc(r, xb, 2.85, 2.1, 0.4, S, 10, MUTED);
  if (i < 3) tc("->", xb + 2.1, 2.85, 0.2, 0.4, S, 12, COPPER);
});

// Dashed separator
hl(2, 3.65, 6, COPPER, 0.5, true);

// Contact
t("Larry Jones", 0.7, 3.95, RB, 22, CREAM, { align: "center", w: 8.6 });
t("Founder & CEO", 0.7, 4.35, S, 12, COPPER, { align: "center", w: 8.6 });
t("larry@synergysourceadvisors.com", 0.7, 4.75, S, 13, MUTED, {
  align: "center",
  w: 8.6,
});
t("artistos-mvp.vercel.app", 0.7, 5.05, SB, 13, COPPER_L, {
  align: "center",
  w: 8.6,
});

// ========================================
// FINALIZE
// ========================================
doc.end();
console.log("PDF pitch deck created: " + outPath);
console.log("14 slides | 16:9 widescreen | Ready for AngelList upload");
