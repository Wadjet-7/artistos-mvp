const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "2C1810", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Arial", size: 20, color: "FFFFFF" })] })]
  });
}

function cell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20 })] })]
  });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, bold: true, font: "Arial", size: 36, color: "2C1810" })] });
}

function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, bold: true, font: "Arial", size: 28, color: "B5651D" })] });
}

function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true, font: "Arial", size: 24, color: "2C1810" })] });
}

function para(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: "Arial", size: 22 })] });
}

function boldPara(label, text) {
  return new Paragraph({ spacing: { after: 120 }, children: [
    new TextRun({ text: label, bold: true, font: "Arial", size: 22 }),
    new TextRun({ text, font: "Arial", size: 22 }),
  ]});
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "2C1810" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "B5651D" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2C1810" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets3", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets4", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets5", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets6", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets7", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets8", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "week1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "ArtistOS Go-To-Market Strategy", font: "Arial", size: 18, color: "999999", italics: true })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "ArtistOS  |  Page ", font: "Arial", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" })
          ]
        })]
      })
    },
    children: [
      // Title page
      new Paragraph({ spacing: { before: 2400 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "ArtistOS", font: "Arial", size: 60, bold: true, color: "2C1810" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Go-To-Market Strategy", font: "Arial", size: 40, color: "B5651D" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: "B5651D", space: 1 } },
        children: []
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Target: $2K MRR in 90 Days", font: "Arial", size: 28, color: "2C1810" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "artistos-mvp.vercel.app", font: "Arial", size: 22, color: "B5651D" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Larry Jones  |  Founder", font: "Arial", size: 22, color: "666666" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "larry@synergysourceadvisors.com", font: "Arial", size: 20, color: "999999" })]
      }),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Phase 1
      heading1("Phase 1: Foundation (Week 1\u20132)"),

      heading2("1.1 Product Hunt Launch"),
      boldPara("Goal: ", "200+ upvotes, 500+ signups, press mentions"),
      heading3("Pre-launch (start NOW)"),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Create Product Hunt maker profile at producthunt.com", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Start engaging on PH \u2014 comment on 3\u20135 products daily for 2 weeks", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Build a \u201CComing Soon\u201D page on PH to collect subscribers", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Reach out to 5 hunters in the SaaS/creative tools space", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Prepare launch assets: 6 product screenshots, 1 demo GIF, tagline", font: "Arial", size: 22 })] }),

      heading3("Launch Day Assets Needed"),
      new Paragraph({ numbering: { reference: "bullets2", level: 0 }, children: [new TextRun({ text: "Tagline: \u201CRun your art practice like a business\u201D", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets2", level: 0 }, children: [new TextRun({ text: "First comment (maker story): Why you built ArtistOS, the problem it solves", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets2", level: 0 }, children: [new TextRun({ text: "6 screenshots: Dashboard, Portfolio, AI descriptions, Contracts, Analytics, Mobile view", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets2", level: 0 }, children: [new TextRun({ text: "Short demo GIF (30 seconds)", font: "Arial", size: 22 })] }),

      boldPara("Launch timing: ", "Tuesday or Wednesday, 12:01 AM PT"),
      boldPara("Post-launch: ", "Respond to every comment within 2 hours"),

      heading2("1.2 SaaS Directory Listings (Free Traffic)"),
      para("Submit to all of these within Week 1:"),
      new Paragraph({ numbering: { reference: "bullets3", level: 0 }, children: [new TextRun({ text: "Product Hunt (producthunt.com)", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets3", level: 0 }, children: [new TextRun({ text: "BetaList (betalist.com)", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets3", level: 0 }, children: [new TextRun({ text: "Launching Next (launchingnext.com)", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets3", level: 0 }, children: [new TextRun({ text: "SaaSHub (saashub.com)", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets3", level: 0 }, children: [new TextRun({ text: "AlternativeTo (alternativeto.net) \u2014 list as alternative to Artwork Archive, Artlogic", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets3", level: 0 }, children: [new TextRun({ text: "GetApp, Capterra, G2", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets3", level: 0 }, children: [new TextRun({ text: "StartupStash, SideProjectors", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets3", level: 0 }, children: [new TextRun({ text: "There\u2019s An AI For That (theresanaiforthat.com) \u2014 for AI features", font: "Arial", size: 22 })] }),

      heading2("1.3 Domain & Branding"),
      new Paragraph({ numbering: { reference: "bullets4", level: 0 }, children: [new TextRun({ text: "Consider getting artistos.app or artistos.io for production", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets4", level: 0 }, children: [new TextRun({ text: "Set up Google Analytics + Vercel Analytics", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets4", level: 0 }, children: [new TextRun({ text: "Set up a simple Crisp or Tawk.to chat widget (free) for visitor questions", font: "Arial", size: 22 })] }),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Phase 2
      heading1("Phase 2: Community Infiltration (Week 2\u20134)"),

      heading2("2.1 Reddit (Highest ROI Free Channel)"),
      heading3("Target Subreddits"),
      new Paragraph({ numbering: { reference: "bullets5", level: 0 }, children: [new TextRun({ text: "r/ArtBusiness (47K members) \u2014 primary target", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets5", level: 0 }, children: [new TextRun({ text: "r/artcommissions (150K+)", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets5", level: 0 }, children: [new TextRun({ text: "r/freelance (500K+), r/SideProject (100K+)", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets5", level: 0 }, children: [new TextRun({ text: "r/SaaS (50K+), r/startups (1M+), r/indiehackers, r/smallbusiness", font: "Arial", size: 22 })] }),

      heading3("Content Strategy"),
      new Paragraph({ numbering: { reference: "bullets6", level: 0 }, children: [new TextRun({ text: "Week 1: Post helpful comments answering questions about art pricing, invoicing, contracts", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets6", level: 0 }, children: [new TextRun({ text: "Week 2: Share a \u201CShow Reddit\u201D post in r/SideProject", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets6", level: 0 }, children: [new TextRun({ text: "Week 3: Post in r/ArtBusiness: \u201CWhat tools do you use?\u201D", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets6", level: 0 }, children: [new TextRun({ text: "Week 4: Share results/learnings post in r/SaaS", font: "Arial", size: 22 })] }),

      heading3("Rules"),
      new Paragraph({ numbering: { reference: "bullets7", level: 0 }, children: [new TextRun({ text: "NEVER hard-sell. Provide value first.", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets7", level: 0 }, children: [new TextRun({ text: "Only mention ArtistOS when it\u2019s genuinely relevant", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets7", level: 0 }, children: [new TextRun({ text: "Share your builder story (artists relate to creators)", font: "Arial", size: 22 })] }),

      heading2("2.2 Discord Communities"),
      para("Join and participate in: Art Club Discord, Studio Lounge, 1228 Studios, Coldburger\u2019s Server, Pure Imagination"),
      boldPara("Strategy: ", "Spend 2 weeks being helpful before ever mentioning ArtistOS. Answer questions about art business, pricing, contracts."),

      heading2("2.3 Facebook Groups"),
      para("\u201CArt Business\u201D groups (10K\u201350K members), \u201CArtists Helping Artists\u201D, \u201CSelling Art Online\u201D, \u201CProfessional Artist Alliance\u201D"),

      heading2("2.4 LinkedIn"),
      new Paragraph({ numbering: { reference: "bullets8", level: 0 }, children: [new TextRun({ text: "Post 2\u20133x/week about building ArtistOS (build-in-public narrative)", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets8", level: 0 }, children: [new TextRun({ text: "Connect with: art consultants, gallery owners, art school professors", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets8", level: 0 }, children: [new TextRun({ text: "Share insights about the art market and business tools", font: "Arial", size: 22 })] }),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Phase 3
      heading1("Phase 3: Content Marketing (Week 3\u20138)"),

      heading2("3.1 Blog Posts (SEO Long-Term Play)"),
      para("High-intent keywords to target:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [600, 4380, 4380],
        rows: [
          new TableRow({ children: [
            headerCell("#", 600), headerCell("Keyword", 4380), headerCell("Content Hook", 4380)
          ]}),
          new TableRow({ children: [cell("1", 600), cell("artist invoice template free", 4380), cell("Offer free invoice with signup", 4380)] }),
          new TableRow({ children: [cell("2", 600), cell("how to price artwork", 4380), cell("Link to AI pricing tool", 4380)] }),
          new TableRow({ children: [cell("3", 600), cell("artist contract template", 4380), cell("Offer free contract with signup", 4380)] }),
          new TableRow({ children: [cell("4", 600), cell("art commission agreement", 4380), cell("Link to contract generator", 4380)] }),
          new TableRow({ children: [cell("5", 600), cell("how to manage art portfolio", 4380), cell("Link to portfolio feature", 4380)] }),
          new TableRow({ children: [cell("6", 600), cell("artist CRM", 4380), cell("Direct product page", 4380)] }),
          new TableRow({ children: [cell("7", 600), cell("art business management software", 4380), cell("Comparison post", 4380)] }),
          new TableRow({ children: [cell("8", 600), cell("how to sell art online", 4380), cell("Comprehensive guide", 4380)] }),
          new TableRow({ children: [cell("9", 600), cell("artist social media strategy", 4380), cell("Link to social scheduler", 4380)] }),
          new TableRow({ children: [cell("10", 600), cell("consignment agreement for artists", 4380), cell("Link to consignment tracker", 4380)] }),
        ]
      }),

      heading2("3.2 YouTube (Medium-Term)"),
      para("Short tutorials (3\u20135 min):"),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: "\u201CHow I invoice my art clients in 30 seconds\u201D", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: "\u201CAI wrote my artwork descriptions and they\u2019re actually good\u201D", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: "\u201CFree artist contract generator \u2014 no lawyer needed\u201D", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: [new TextRun({ text: "\u201CTrack your art business finances for free\u201D", font: "Arial", size: 22 })] }),

      heading2("3.3 Twitter/X Build-in-Public"),
      para("Daily updates on user count, features shipped, MRR. Tags: #buildinpublic #indiehackers #saas #artbusiness"),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Phase 4
      heading1("Phase 4: Partnerships (Week 4\u20138)"),

      heading2("4.1 Art Schools & Programs"),
      para("Email art departments at 20 local colleges. Offer free Pro accounts for students. Offer to do a \u201CBusiness of Art\u201D guest lecture (virtual). Target: RISD, SAIC, SVA, Pratt, CalArts, etc."),

      heading2("4.2 Art Influencers"),
      para("Identify 20 art YouTubers/Instagrammers with 10K\u2013100K followers. Offer free lifetime Pro accounts in exchange for honest reviews. Target art business content creators, NOT just art tutorial creators."),

      heading2("4.3 Gallery Partnerships"),
      para("Approach 10 small/mid galleries. Offer to set up their artists on ArtistOS for free. Each gallery = 10\u201350 potential artists as a distribution channel."),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Phase 5
      heading1("Phase 5: Paid Acquisition (Week 6+)"),
      para("Only after organic validation confirms product-market fit."),

      heading2("5.1 Google Ads (High Intent)"),
      para("Bid on high-intent keywords: \u201Cartist business software\u201D, \u201Cart portfolio management tool\u201D, \u201Cartist invoice generator\u201D"),
      boldPara("Budget: ", "$10\u201320/day to start, scale what converts"),

      heading2("5.2 Instagram/Facebook Ads"),
      para("Target: artists, art students, gallery owners. Interest targeting: oil painting, commission art, art business."),
      boldPara("Creative: ", "Before/after showing messy spreadsheet vs ArtistOS dashboard"),
      boldPara("Budget: ", "$10\u201315/day"),

      heading2("5.3 Retargeting"),
      para("Pixel everyone who visits landing page. Show ads to visitors who didn\u2019t sign up. Show upgrade ads to free users."),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Revenue Model
      heading1("Revenue Model & MRR Targets"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1872, 1872, 1872, 1872, 1872],
        rows: [
          new TableRow({ children: [
            headerCell("Month", 1872), headerCell("Free Users", 1872), headerCell("Pro ($19)", 1872), headerCell("Studio ($49)", 1872), headerCell("MRR", 1872)
          ]}),
          new TableRow({ children: [cell("1", 1872), cell("100", 1872), cell("5", 1872), cell("1", 1872), cell("$144", 1872)] }),
          new TableRow({ children: [cell("2", 1872), cell("300", 1872), cell("15", 1872), cell("3", 1872), cell("$432", 1872)] }),
          new TableRow({ children: [cell("3", 1872), cell("600", 1872), cell("40", 1872), cell("8", 1872), cell("$1,152", 1872)] }),
          new TableRow({ children: [cell("4", 1872), cell("1,000", 1872), cell("80", 1872), cell("15", 1872), cell("$2,255", 1872)] }),
        ]
      }),
      new Paragraph({ spacing: { before: 120 } }),
      boldPara("Conversion assumptions: ", "5% free-to-Pro, 1% free-to-Studio (conservative for SaaS)"),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Metrics
      heading1("Metrics to Track"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({ children: [
            headerCell("Metric", 3120), headerCell("Tool", 3120), headerCell("Target", 3120)
          ]}),
          new TableRow({ children: [cell("Landing page visitors", 3120), cell("Vercel Analytics", 3120), cell("1,000/week by Month 2", 3120)] }),
          new TableRow({ children: [cell("Signup conversion rate", 3120), cell("Supabase + Analytics", 3120), cell(">5%", 3120)] }),
          new TableRow({ children: [cell("Free-to-paid conversion", 3120), cell("Stripe Dashboard", 3120), cell(">5%", 3120)] }),
          new TableRow({ children: [cell("Churn rate", 3120), cell("Stripe Dashboard", 3120), cell("<8%/month", 3120)] }),
          new TableRow({ children: [cell("MRR", 3120), cell("Stripe Dashboard", 3120), cell("$2K by Month 4", 3120)] }),
          new TableRow({ children: [cell("NPS score", 3120), cell("In-app survey", 3120), cell(">40", 3120)] }),
        ]
      }),

      // Page break
      new Paragraph({ children: [new PageBreak()] }),

      // Week 1 Action Items
      heading1("Week 1 Action Items (Do These NOW)"),

      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Create Product Hunt maker account", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Submit to BetaList, SaaSHub, AlternativeTo", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Join r/ArtBusiness, r/artcommissions, r/SideProject", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Join 3 Discord art communities", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Set up Google Analytics on the site", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Post first Reddit comment (helpful, not promotional)", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Connect with 10 art business people on LinkedIn", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Prepare Product Hunt launch assets", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Set up Twitter/X account for ArtistOS", font: "Arial", size: 22 })] }),
      new Paragraph({ numbering: { reference: "week1", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "Email 5 art schools about free accounts", font: "Arial", size: 22 })] }),

      // Footer
      new Paragraph({ spacing: { before: 600 }, border: { top: { style: BorderStyle.SINGLE, size: 2, color: "B5651D", space: 8 } }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "ArtistOS  \u2014  Run your art practice like a business", font: "Arial", size: 20, color: "B5651D", italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "artistos-mvp.vercel.app  |  larry@synergysourceadvisors.com", font: "Arial", size: 18, color: "999999" })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:\\Users\\larry\\artistos-mvp\\marketing\\ArtistOS-Go-To-Market-Strategy.docx", buffer);
  console.log("Document created successfully at marketing/ArtistOS-Go-To-Market-Strategy.docx");
}).catch(err => {
  console.error("Error creating document:", err);
});
