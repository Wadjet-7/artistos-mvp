import pptxgen from "pptxgenjs";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "ArtistOS";
pres.title = "ArtistOS - Investor Pitch Deck";

// Color palette
const INK = "0E0C0A";
const COPPER = "B5651D";
const CREAM = "FAF8F5";
const FOREST = "2D4A35";
const TAUPE = "A89F94";
const COPPER_LIGHT = "D4854A";

// Helper: fresh shadow each time (PptxGenJS mutates shadow objects)
const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.2 });

// ═══════════════════════════════════════════
// SLIDE 1: Title
// ═══════════════════════════════════════════
let s1 = pres.addSlide();
s1.background = { color: INK };
// Copper accent bar at top
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
// Logo/Brand
s1.addText("ArtistOS", { x: 0.7, y: 1.2, w: 8.6, h: 1.0, fontFace: "Georgia", fontSize: 56, color: CREAM, bold: true, margin: 0 });
// Tagline
s1.addText("Run your art practice like a business.", { x: 0.7, y: 2.2, w: 8.6, h: 0.6, fontFace: "Georgia", fontSize: 24, color: COPPER_LIGHT, italic: true, margin: 0 });
// Description
s1.addText("The all-in-one platform for artists to manage their business,\naccess market analytics, and connect with collectors.", { x: 0.7, y: 3.1, w: 7, h: 0.9, fontFace: "Calibri", fontSize: 14, color: TAUPE, margin: 0 });
// Bottom bar with URL
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: FOREST } });
s1.addText("artistos-mvp.vercel.app", { x: 0.7, y: 5.05, w: 8.6, h: 0.55, fontFace: "Calibri", fontSize: 13, color: CREAM, align: "left", valign: "middle", margin: 0 });
s1.addText("March 2026", { x: 0.7, y: 5.05, w: 8.6, h: 0.55, fontFace: "Calibri", fontSize: 13, color: CREAM, align: "right", valign: "middle", margin: 0 });

// ═══════════════════════════════════════════
// SLIDE 2: Problem
// ═══════════════════════════════════════════
let s2 = pres.addSlide();
s2.background = { color: INK };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
s2.addText("THE PROBLEM", { x: 0.7, y: 0.4, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, charSpacing: 4, margin: 0 });
s2.addText("Artists are creators, not administrators.", { x: 0.7, y: 0.9, w: 8.6, h: 0.7, fontFace: "Georgia", fontSize: 32, color: CREAM, margin: 0 });

// Problem cards - 2x2 grid
const problems = [
  { title: "Fragmented Tools", desc: "Artists juggle 5-8 apps for invoicing, contracts, portfolios, scheduling, and communication." },
  { title: "No Market Data", desc: "Artists price their work based on gut feeling, not data. Most undercharge by 30-50%." },
  { title: "Discovery Gap", desc: "Collectors struggle to find artists. Artists struggle to find collectors. No efficient marketplace exists." },
  { title: "Lost Revenue", desc: "Without professional tools, artists lose an estimated $8,000/year to unpaid invoices and underpricing." }
];

problems.forEach((p, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.7 + col * 4.5;
  const y = 2.0 + row * 1.6;
  s2.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.1, h: 1.35, fill: { color: "1A1714" } });
  s2.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.35, fill: { color: COPPER } });
  s2.addText(p.title, { x: x + 0.25, y: y + 0.15, w: 3.6, h: 0.35, fontFace: "Georgia", fontSize: 15, color: CREAM, bold: true, margin: 0 });
  s2.addText(p.desc, { x: x + 0.25, y: y + 0.55, w: 3.6, h: 0.65, fontFace: "Calibri", fontSize: 11, color: TAUPE, margin: 0 });
});

// ═══════════════════════════════════════════
// SLIDE 3: Solution
// ═══════════════════════════════════════════
let s3 = pres.addSlide();
s3.background = { color: CREAM };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
s3.addText("THE SOLUTION", { x: 0.7, y: 0.4, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, charSpacing: 4, margin: 0 });
s3.addText("One platform. Built for artists.", { x: 0.7, y: 0.9, w: 8.6, h: 0.7, fontFace: "Georgia", fontSize: 32, color: INK, margin: 0 });

const solutions = [
  { title: "Business Hub", desc: "Portfolio management, contract generator, social media scheduler, and financial tracking in one place.", color: FOREST },
  { title: "Market Analytics", desc: "Real-time price benchmarking, market position scoring, and emerging trend tracking powered by live data.", color: COPPER },
  { title: "Commission Marketplace", desc: "Two-sided marketplace connecting artists directly with collectors seeking custom work. Smart matching.", color: INK }
];

solutions.forEach((s, i) => {
  const x = 0.7 + i * 3.1;
  s3.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 2.8, h: 3.0, fill: { color: "FFFFFF" }, shadow: makeShadow() });
  s3.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 2.8, h: 0.06, fill: { color: s.color } });
  s3.addText(s.title, { x: x + 0.2, y: 2.3, w: 2.4, h: 0.4, fontFace: "Georgia", fontSize: 16, color: INK, bold: true, margin: 0 });
  s3.addText(s.desc, { x: x + 0.2, y: 2.8, w: 2.4, h: 1.8, fontFace: "Calibri", fontSize: 11.5, color: TAUPE, margin: 0 });
});

// ═══════════════════════════════════════════
// SLIDE 4: Product - Live MVP
// ═══════════════════════════════════════════
let s4 = pres.addSlide();
s4.background = { color: INK };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
s4.addText("LIVE PRODUCT", { x: 0.7, y: 0.4, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, charSpacing: 4, margin: 0 });
s4.addText("A working MVP, not a mockup.", { x: 0.7, y: 0.9, w: 8.6, h: 0.7, fontFace: "Georgia", fontSize: 32, color: CREAM, margin: 0 });

const features = [
  "Full authentication (signup, login, sessions)",
  "Artist dashboard with real-time revenue charts",
  "Portfolio management with artwork CRUD",
  "Contract generator with live PDF preview",
  "Commission tracking with milestone billing",
  "Public artist profiles with commission request forms",
  "Artist discovery page for collectors",
  "Social media content scheduler"
];

s4.addText(features.map((f, i) => ({
  text: f,
  options: { bullet: true, color: i < 4 ? CREAM : TAUPE, breakLine: i < features.length - 1 }
})), { x: 0.7, y: 1.9, w: 5, h: 3.2, fontFace: "Calibri", fontSize: 13, paraSpaceAfter: 6, margin: 0 });

// Right side - tech stack card
s4.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 1.9, w: 3.3, h: 3.2, fill: { color: "1A1714" } });
s4.addText("Tech Stack", { x: 6.4, y: 2.1, w: 2.9, h: 0.35, fontFace: "Georgia", fontSize: 15, color: COPPER, bold: true, margin: 0 });
const techStack = [
  "React + Vite (frontend)",
  "Supabase (backend + auth)",
  "Tailwind CSS (design)",
  "Recharts (data viz)",
  "Vercel (hosting)",
  "PostgreSQL (database)"
];
s4.addText(techStack.map((t, i) => ({
  text: t,
  options: { bullet: true, color: TAUPE, breakLine: i < techStack.length - 1 }
})), { x: 6.4, y: 2.6, w: 2.9, h: 2.3, fontFace: "Calibri", fontSize: 11, paraSpaceAfter: 4, margin: 0 });

// Demo URL callout
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: COPPER } });
s4.addText("Try the live demo:  artistos-mvp.vercel.app", { x: 0.7, y: 5.0, w: 8.6, h: 0.625, fontFace: "Calibri", fontSize: 14, color: "FFFFFF", bold: true, valign: "middle", margin: 0 });

// ═══════════════════════════════════════════
// SLIDE 5: Market Opportunity
// ═══════════════════════════════════════════
let s5 = pres.addSlide();
s5.background = { color: CREAM };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
s5.addText("MARKET OPPORTUNITY", { x: 0.7, y: 0.4, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, charSpacing: 4, margin: 0 });
s5.addText("A massive, underserved market.", { x: 0.7, y: 0.9, w: 8.6, h: 0.7, fontFace: "Georgia", fontSize: 32, color: INK, margin: 0 });

// Big stat callouts
const stats = [
  { num: "2M+", label: "Working artists\nin the US alone", color: INK },
  { num: "$65B", label: "Global art\nmarket (2025)", color: COPPER },
  { num: "73%", label: "Use no dedicated\nbusiness tools", color: FOREST }
];
stats.forEach((st, i) => {
  const x = 0.7 + i * 3.1;
  s5.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 2.8, h: 2.2, fill: { color: "FFFFFF" }, shadow: makeShadow() });
  s5.addText(st.num, { x, y: 2.2, w: 2.8, h: 0.9, fontFace: "Georgia", fontSize: 44, color: st.color, bold: true, align: "center", margin: 0 });
  s5.addText(st.label, { x, y: 3.15, w: 2.8, h: 0.8, fontFace: "Calibri", fontSize: 12, color: TAUPE, align: "center", margin: 0 });
});

// Bottom insight
s5.addText("The art market is booming, but artists still run their businesses with spreadsheets, DMs, and paper invoices.", { x: 0.7, y: 4.6, w: 8.6, h: 0.5, fontFace: "Calibri", fontSize: 13, color: TAUPE, italic: true, margin: 0 });

// ═══════════════════════════════════════════
// SLIDE 6: Business Model
// ═══════════════════════════════════════════
let s6 = pres.addSlide();
s6.background = { color: INK };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
s6.addText("BUSINESS MODEL", { x: 0.7, y: 0.4, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, charSpacing: 4, margin: 0 });
s6.addText("SaaS + Marketplace.", { x: 0.7, y: 0.9, w: 8.6, h: 0.7, fontFace: "Georgia", fontSize: 32, color: CREAM, margin: 0 });

// Pricing tiers
const tiers = [
  { name: "Starter", price: "Free", features: "10 artworks, 3 contracts/mo,\nBasic analytics, Marketplace browsing", accent: TAUPE },
  { name: "Pro", price: "$19/mo", features: "Unlimited artworks & contracts,\nFull analytics, Social scheduler,\nUnlimited marketplace applications", accent: COPPER },
  { name: "Studio", price: "$49/mo", features: "Everything in Pro,\nUp to 5 team members,\nGallery portal, API access,\nAdvanced market reports", accent: FOREST }
];

tiers.forEach((t, i) => {
  const x = 0.7 + i * 3.1;
  s6.addShape(pres.shapes.RECTANGLE, { x, y: 1.9, w: 2.8, h: 2.9, fill: { color: "1A1714" } });
  s6.addShape(pres.shapes.RECTANGLE, { x, y: 1.9, w: 2.8, h: 0.06, fill: { color: t.accent } });
  s6.addText(t.name, { x: x + 0.2, y: 2.15, w: 2.4, h: 0.35, fontFace: "Georgia", fontSize: 16, color: CREAM, bold: true, margin: 0 });
  s6.addText(t.price, { x: x + 0.2, y: 2.5, w: 2.4, h: 0.45, fontFace: "Georgia", fontSize: 28, color: t.accent, bold: true, margin: 0 });
  s6.addText(t.features, { x: x + 0.2, y: 3.05, w: 2.4, h: 1.5, fontFace: "Calibri", fontSize: 11, color: TAUPE, margin: 0 });
});

// Additional revenue line
s6.addText("Additional revenue: 5-8% transaction fee on marketplace commissions facilitated through the platform.", { x: 0.7, y: 5.05, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: TAUPE, italic: true, margin: 0 });

// ═══════════════════════════════════════════
// SLIDE 7: Traction
// ═══════════════════════════════════════════
let s7 = pres.addSlide();
s7.background = { color: CREAM };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
s7.addText("EARLY TRACTION", { x: 0.7, y: 0.4, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, charSpacing: 4, margin: 0 });
s7.addText("Building momentum.", { x: 0.7, y: 0.9, w: 8.6, h: 0.7, fontFace: "Georgia", fontSize: 32, color: INK, margin: 0 });

// Traction stats - large callouts
const traction = [
  { num: "4", label: "Artists on\nplatform" },
  { num: "29", label: "Artworks\nlisted" },
  { num: "$11.7K", label: "Commissions\nfacilitated" },
  { num: "100%", label: "MVP feature\ncompletion" }
];
traction.forEach((t, i) => {
  const x = 0.5 + i * 2.35;
  s7.addShape(pres.shapes.RECTANGLE, { x, y: 1.9, w: 2.1, h: 1.8, fill: { color: "FFFFFF" }, shadow: makeShadow() });
  s7.addText(t.num, { x, y: 2.05, w: 2.1, h: 0.7, fontFace: "Georgia", fontSize: 36, color: COPPER, bold: true, align: "center", margin: 0 });
  s7.addText(t.label, { x, y: 2.8, w: 2.1, h: 0.7, fontFace: "Calibri", fontSize: 11, color: TAUPE, align: "center", margin: 0 });
});

// Milestones
s7.addText("Key Milestones", { x: 0.7, y: 4.1, w: 8.6, h: 0.35, fontFace: "Georgia", fontSize: 16, color: INK, bold: true, margin: 0 });
const milestones = [
  "Full-stack MVP built and deployed (React + Supabase + Vercel)",
  "Public artist profiles with commission request flow live",
  "Two-sided marketplace: collectors can discover and commission artists",
  "Revenue tracking, contract generation, and social scheduling operational"
];
s7.addText(milestones.map((m, i) => ({
  text: m,
  options: { bullet: true, color: INK, breakLine: i < milestones.length - 1 }
})), { x: 0.7, y: 4.5, w: 8.6, h: 1.0, fontFace: "Calibri", fontSize: 12, paraSpaceAfter: 3, margin: 0 });

// ═══════════════════════════════════════════
// SLIDE 8: Competitive Advantage
// ═══════════════════════════════════════════
let s8 = pres.addSlide();
s8.background = { color: INK };
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
s8.addText("WHY WE WIN", { x: 0.7, y: 0.4, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, charSpacing: 4, margin: 0 });
s8.addText("Purpose-built, not adapted.", { x: 0.7, y: 0.9, w: 8.6, h: 0.7, fontFace: "Georgia", fontSize: 32, color: CREAM, margin: 0 });

// Comparison table
const comparisons = [
  { feature: "Portfolio + Business Tools", us: true, them: "Separate apps" },
  { feature: "Art Market Price Data", us: true, them: "Not available" },
  { feature: "Artist-Collector Matching", us: true, them: "Manual outreach" },
  { feature: "Commission Workflow", us: true, them: "Email/DMs" },
  { feature: "Built for Artists", us: true, them: "Generic SaaS" }
];

// Table header
s8.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.85, w: 8.6, h: 0.45, fill: { color: FOREST } });
s8.addText("Feature", { x: 0.9, y: 1.85, w: 4, h: 0.45, fontFace: "Calibri", fontSize: 12, color: CREAM, bold: true, valign: "middle", margin: 0 });
s8.addText("ArtistOS", { x: 5.2, y: 1.85, w: 2, h: 0.45, fontFace: "Calibri", fontSize: 12, color: CREAM, bold: true, align: "center", valign: "middle", margin: 0 });
s8.addText("Alternatives", { x: 7.3, y: 1.85, w: 2, h: 0.45, fontFace: "Calibri", fontSize: 12, color: CREAM, bold: true, align: "center", valign: "middle", margin: 0 });

comparisons.forEach((c, i) => {
  const y = 2.35 + i * 0.5;
  const bgColor = i % 2 === 0 ? "1A1714" : "15130F";
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.6, h: 0.48, fill: { color: bgColor } });
  s8.addText(c.feature, { x: 0.9, y, w: 4, h: 0.48, fontFace: "Calibri", fontSize: 12, color: CREAM, valign: "middle", margin: 0 });
  s8.addText("Yes", { x: 5.2, y, w: 2, h: 0.48, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, align: "center", valign: "middle", margin: 0 });
  s8.addText(c.them, { x: 7.3, y, w: 2, h: 0.48, fontFace: "Calibri", fontSize: 11, color: TAUPE, align: "center", valign: "middle", margin: 0 });
});

// ═══════════════════════════════════════════
// SLIDE 9: The Ask
// ═══════════════════════════════════════════
let s9 = pres.addSlide();
s9.background = { color: CREAM };
s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
s9.addText("THE ASK", { x: 0.7, y: 0.4, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 12, color: COPPER, bold: true, charSpacing: 4, margin: 0 });
s9.addText("Fuel the next phase of growth.", { x: 0.7, y: 0.9, w: 8.6, h: 0.7, fontFace: "Georgia", fontSize: 32, color: INK, margin: 0 });

// Use of funds
const funds = [
  { area: "Product Development", pct: "40%", desc: "Mobile app, AI-powered pricing recommendations, advanced analytics" },
  { area: "Growth & Marketing", pct: "30%", desc: "Artist acquisition campaigns, art school partnerships, social media" },
  { area: "Marketplace Expansion", pct: "20%", desc: "Gallery partnerships, collector onboarding, international markets" },
  { area: "Operations", pct: "10%", desc: "Infrastructure, compliance, customer support team" }
];

funds.forEach((f, i) => {
  const y = 1.9 + i * 0.85;
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.6, h: 0.7, fill: { color: "FFFFFF" }, shadow: makeShadow() });
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.06, h: 0.7, fill: { color: COPPER } });
  s9.addText(f.pct, { x: 0.95, y, w: 0.7, h: 0.7, fontFace: "Georgia", fontSize: 20, color: COPPER, bold: true, valign: "middle", margin: 0 });
  s9.addText(f.area, { x: 1.75, y: y + 0.08, w: 3, h: 0.3, fontFace: "Georgia", fontSize: 14, color: INK, bold: true, margin: 0 });
  s9.addText(f.desc, { x: 1.75, y: y + 0.36, w: 6.5, h: 0.28, fontFace: "Calibri", fontSize: 11, color: TAUPE, margin: 0 });
});

// ═══════════════════════════════════════════
// SLIDE 10: Contact / Demo
// ═══════════════════════════════════════════
let s10 = pres.addSlide();
s10.background = { color: INK };
s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: COPPER } });
// Brand
s10.addText("ArtistOS", { x: 0.7, y: 1.4, w: 8.6, h: 0.9, fontFace: "Georgia", fontSize: 48, color: CREAM, bold: true, align: "center", margin: 0 });
// Tagline
s10.addText("The future of the creative economy.", { x: 0.7, y: 2.3, w: 8.6, h: 0.5, fontFace: "Georgia", fontSize: 20, color: COPPER_LIGHT, italic: true, align: "center", margin: 0 });

// Demo URL card
s10.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 3.2, w: 5, h: 1.1, fill: { color: COPPER } });
s10.addText("Try the Live Demo", { x: 2.5, y: 3.25, w: 5, h: 0.45, fontFace: "Calibri", fontSize: 13, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
s10.addText("artistos-mvp.vercel.app", { x: 2.5, y: 3.7, w: 5, h: 0.5, fontFace: "Georgia", fontSize: 22, color: "FFFFFF", bold: true, align: "center", valign: "middle", margin: 0 });

// Contact
s10.addText("Larry Wade  |  larrywade.art@gmail.com", { x: 0.7, y: 4.7, w: 8.6, h: 0.4, fontFace: "Calibri", fontSize: 14, color: TAUPE, align: "center", margin: 0 });

// Footer
s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: FOREST } });
s10.addText("Thank you.", { x: 0.7, y: 5.0, w: 8.6, h: 0.625, fontFace: "Georgia", fontSize: 16, color: CREAM, align: "center", valign: "middle", italic: true, margin: 0 });

// ═══════════════════════════════════════════
// Generate file
// ═══════════════════════════════════════════
const outPath = join(__dirname, "ArtistOS-Pitch-Deck.pptx");
pres.write("nodebuffer")
  .then(buffer => {
    writeFileSync(outPath, buffer);
    console.log("✅ Created: " + outPath);
  })
  .catch(err => console.error("Error:", err));
