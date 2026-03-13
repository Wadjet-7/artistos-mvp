"""
ArtistOS Investor Pitch Deck - PDF Generator
Run: pip install reportlab && python create-deck-pdf.py
Output: ArtistOS-PitchDeck.pdf
"""
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

# --- Page setup (16:9 widescreen) ---
OUTPUT = r"C:\Users\larry\artistos-mvp\ArtistOS-PitchDeck.pdf"
PW = 720    # 10 inches
PH = 405    # 5.625 inches
I = 72      # points per inch

# --- Brand Colors ---
DARK     = HexColor('#0E0C0A')
CREAM    = HexColor('#FAF8F5')
COPPER   = HexColor('#B5651D')
COPPER_L = HexColor('#D4854A')
FOREST   = HexColor('#2D4A35')
FOREST_L = HexColor('#4A7A57')
MUTED    = HexColor('#A89F94')
ROSE     = HexColor('#C4705A')
CARD_BG  = HexColor('#F2EDE6')
WHITE    = HexColor('#FFFFFF')
DIM      = HexColor('#6B6560')

# --- Fonts ---
S   = 'Helvetica'
SB  = 'Helvetica-Bold'
SI  = 'Helvetica-Oblique'
R   = 'Times-Roman'
RB  = 'Times-Bold'
RI  = 'Times-Italic'


# ============================
# HELPER FUNCTIONS
# ============================

def bg(cv, color):
    cv.setFillColor(color)
    cv.rect(0, 0, PW, PH, fill=1, stroke=0)

def box(cv, x, y, w, h, color, alpha=1.0):
    cv.saveState()
    if alpha < 1: cv.setFillAlpha(alpha)
    cv.setFillColor(color)
    cv.rect(x*I, PH-(y+h)*I, w*I, h*I, fill=1, stroke=0)
    cv.restoreState()

def circ(cv, x, y, w, h, color, alpha=1.0, stroke_color=None, stroke_w=0):
    cv.saveState()
    if alpha < 1: cv.setFillAlpha(alpha)
    cv.setFillColor(color)
    if stroke_color:
        cv.setStrokeColor(stroke_color)
        cv.setLineWidth(stroke_w)
        cv.ellipse(x*I, PH-(y+h)*I, (x+w)*I, PH-y*I, fill=1, stroke=1)
    else:
        cv.ellipse(x*I, PH-(y+h)*I, (x+w)*I, PH-y*I, fill=1, stroke=0)
    cv.restoreState()

def txt(cv, s, x, y, font=S, sz=12, color=DARK, align='left', w=0, spacing=0):
    cv.saveState()
    cv.setFont(font, sz)
    cv.setFillColor(color)
    if spacing: cv.setCharSpace(spacing)
    by = PH - y*I - sz
    if align == 'center' and w:
        cv.drawCentredString(x*I + w*I/2, by, s)
    elif align == 'right' and w:
        cv.drawRightString(x*I + w*I, by, s)
    else:
        cv.drawString(x*I, by, s)
    cv.restoreState()

def txt_box(cv, s, x, y, w, h, font=S, sz=12, color=DARK, align='center'):
    cv.saveState()
    cv.setFont(font, sz)
    cv.setFillColor(color)
    by = PH - y*I - h*I/2 - sz*0.35
    if align == 'center':
        cv.drawCentredString(x*I + w*I/2, by, s)
    else:
        cv.drawString(x*I, by, s)
    cv.restoreState()

def txt_wrap(cv, s, x, y, w, font=S, sz=11, color=DIM, lead=None):
    if lead is None: lead = sz * 1.4
    words = s.split()
    lines, cur = [], ""
    for word in words:
        test = (cur + " " + word).strip()
        if cv.stringWidth(test, font, sz) <= w * I:
            cur = test
        else:
            if cur: lines.append(cur)
            cur = word
    if cur: lines.append(cur)
    cv.saveState()
    cv.setFont(font, sz)
    cv.setFillColor(color)
    for i, line in enumerate(lines):
        cv.drawString(x*I, PH - y*I - sz - i*lead, line)
    cv.restoreState()

def txt_multi(cv, s, x, y, font=S, sz=12, color=DARK, lead=None, align='left', w=0):
    if lead is None: lead = sz * 1.35
    for i, line in enumerate(s.split('\n')):
        txt(cv, line, x, y + i*lead/I, font=font, sz=sz, color=color, align=align, w=w)

def hline(cv, x, y, length, color, width=0.5, dash=None):
    cv.saveState()
    cv.setStrokeColor(color)
    cv.setLineWidth(width)
    if dash: cv.setDash(dash, 0)
    rl_y = PH - y*I
    cv.line(x*I, rl_y, (x+length)*I, rl_y)
    cv.restoreState()

def section_label(cv, text, x, y, color=COPPER):
    txt(cv, text, x, y, font=SB, sz=11, color=color, spacing=4)


# ============================
# SLIDE FUNCTIONS
# ============================

def slide_01_title(cv):
    bg(cv, DARK)
    box(cv, 0, 0, 10, 0.06, COPPER)
    circ(cv, 4.55, 1.2, 0.9, 0.9, COPPER, alpha=0.88)
    txt(cv, "ArtistOS", 0.5, 1.5, font=RB, sz=54, color=CREAM, align='center', w=9)
    txt(cv, "Run Your Art Practice Like a Business", 0.5, 2.5, font=SI, sz=20, color=COPPER, align='center', w=9)
    txt(cv, "Pre-Seed Investment Deck  |  2026", 0.5, 3.3, font=S, sz=13, color=MUTED, align='center', w=9, spacing=2)
    box(cv, 0, 5.0, 10, 0.625, COPPER, alpha=0.1)
    txt(cv, "artistos-mvp.vercel.app", 0.5, 5.15, font=S, sz=11, color=MUTED, align='center', w=9)


def slide_02_problem(cv):
    bg(cv, DARK)
    section_label(cv, "THE PROBLEM", 0.7, 0.5)
    txt_multi(cv, "Artists are running businesses\nwithout business tools", 0.7, 1.05, font=R, sz=30, color=CREAM)

    problems = [
        ("01", "Fragmented Portfolios", "Spreadsheets, folders, emails \u2014 no single source of truth for inventory, pricing, or provenance."),
        ("02", "No Pricing Guidance", "Artists underprice by 30\u201350% on average. No data, no benchmarks, no market context."),
        ("03", "Lost Commission Revenue", "No pipeline structure means dropped leads, missed deadlines, and unpaid invoices."),
    ]
    for i, (num, title, desc) in enumerate(problems):
        yb = 2.3 + i * 1.1
        box(cv, 0.7, yb, 0.55, 0.55, COPPER)
        txt_box(cv, num, 0.7, yb, 0.55, 0.55, font=SB, sz=14, color=CREAM)
        txt(cv, title, 1.5, yb + 0.08, font=SB, sz=16, color=CREAM)
        txt_wrap(cv, desc, 1.5, yb + 0.42, 7.5, font=S, sz=12, color=MUTED)


def slide_03_solution(cv):
    bg(cv, CREAM)
    section_label(cv, "THE SOLUTION", 0.7, 0.5)
    txt_multi(cv, "The all-in-one platform\nbuilt for artists", 0.7, 1.05, font=R, sz=30, color=DARK)

    box(cv, 6.3, 0.9, 3.2, 1.0, COPPER)
    txt_wrap(cv, "Think Shopify meets Honeybook, built for the art world.", 6.5, 1.1, 2.8, font=S, sz=13, color=CREAM)

    pillars = [
        ("P", "Portfolio & Inventory", "Upload, catalog, price, and describe artworks with AI assistance"),
        ("$", "Financial Command Center", "Invoices, expenses, contracts, and revenue tracking in one place"),
        ("AI", "AI-Powered Intelligence", "Smart descriptions, pricing guidance, and bio generation"),
    ]
    for i, (icon, title, desc) in enumerate(pillars):
        xb = 0.7 + i * 3.05
        box(cv, xb, 2.3, 2.8, 2.7, WHITE)
        box(cv, xb, 2.3, 2.8, 0.06, COPPER)
        circ(cv, xb+0.2, 2.55, 0.6, 0.6, COPPER)
        txt_box(cv, icon, xb+0.2, 2.55, 0.6, 0.6, font=SB, sz=18, color=CREAM)
        txt(cv, title, xb+0.2, 3.35, font=SB, sz=14, color=DARK)
        txt_wrap(cv, desc, xb+0.2, 3.8, 2.4, font=S, sz=11, color=DIM)


def slide_04_product(cv):
    bg(cv, CREAM)
    section_label(cv, "PRODUCT OVERVIEW", 0.7, 0.5)
    txt(cv, "Everything an artist needs, one platform", 0.7, 1.05, font=R, sz=26, color=DARK)

    features = [
        ("Portfolio Management", "Image uploads, AI descriptions, AI price suggestions, provenance tracking", COPPER),
        ("Financial Hub", "Invoices with PDF export, expense tracking, revenue charts, CSV export", FOREST),
        ("Commission Pipeline", "Full CRM with status tracking, deadlines, progress bars, budgets", ROSE),
        ("AI-Powered Tools", "Artwork descriptions, pricing intelligence, professional bio generator", COPPER),
        ("Viewing Rooms", "Private shareable galleries for collectors with QR codes and email invites", FOREST),
        ("Market Analytics", "Portfolio value, sell-through rates, medium breakdown, trend analysis", ROSE),
    ]
    for i, (title, desc, color) in enumerate(features):
        col = i % 3
        row = i // 3
        xb = 0.7 + col * 3.05
        yb = 1.8 + row * 1.8
        circ(cv, xb, yb+0.08, 0.18, 0.18, color)
        txt(cv, title, xb+0.35, yb+0.1, font=SB, sz=13, color=DARK)
        txt_wrap(cv, desc, xb+0.35, yb+0.5, 2.45, font=S, sz=11, color=DIM)


def slide_05_live(cv):
    bg(cv, DARK)
    section_label(cv, "LIVE PRODUCT", 0.7, 0.5)
    txt(cv, "Not a mockup. A working product.", 0.7, 1.05, font=R, sz=30, color=CREAM)
    txt(cv, "artistos-mvp.vercel.app", 0.7, 1.7, font=SB, sz=16, color=COPPER)

    stats = [("28", "Pages Built"), ("3", "Pricing Tiers"), ("4", "AI Features"), ("PWA", "Mobile Ready")]
    for i, (val, lbl) in enumerate(stats):
        xb = 0.7 + i * 2.3
        box(cv, xb, 2.3, 2.0, 1.6, COPPER, alpha=0.12)
        txt(cv, val, xb, 2.55, font=RB, sz=40, color=COPPER, align='center', w=2.0)
        txt(cv, lbl, xb, 3.35, font=S, sz=11, color=MUTED, align='center', w=2.0)

    txt(cv, "TECH STACK", 0.7, 4.4, font=S, sz=10, color=MUTED, spacing=3)
    techs = ["React", "Supabase", "Stripe", "OpenAI", "Resend", "Vercel"]
    for i, t in enumerate(techs):
        xb = 0.7 + i * 1.45
        box(cv, xb, 4.65, 1.25, 0.45, COPPER, alpha=0.15)
        txt_box(cv, t, xb, 4.65, 1.25, 0.45, font=S, sz=11, color=MUTED)


def slide_06_market(cv):
    bg(cv, CREAM)
    section_label(cv, "MARKET OPPORTUNITY", 0.7, 0.5)
    txt(cv, "A massive, underserved market", 0.7, 1.05, font=R, sz=28, color=DARK)

    markets = [
        ("TAM", "$64B", "US Creative Economy", 2.6, 1.2),
        ("SAM", "$8.2B", "2.3M Professional Artists", 2.0, 4.2),
        ("SOM", "$82M", "10K Artists at $49/mo avg", 1.5, 6.8),
    ]
    for lbl, val, desc, sz, mx in markets:
        yc = 3.0
        circ(cv, mx, yc-sz/2, sz, sz, COPPER, alpha=0.15, stroke_color=COPPER, stroke_w=2)
        txt(cv, lbl, mx, yc-0.4, font=SB, sz=10, color=COPPER, align='center', w=sz, spacing=3)
        txt(cv, val, mx, yc-0.05, font=RB, sz=28, color=DARK, align='center', w=sz)
        txt(cv, desc, mx, yc+0.45, font=S, sz=9, color=DIM, align='center', w=sz)

    box(cv, 0.7, 4.55, 8.6, 0.7, WHITE)
    box(cv, 0.7, 4.55, 8.6, 0.06, COPPER)
    txt(cv, "12% art market YoY growth   |   78% of artists need better tools   |   2.3M professional artists in the US",
        0.9, 4.82, font=S, sz=11, color=DIM, align='center', w=8.2)


def slide_07_business(cv):
    bg(cv, CREAM)
    section_label(cv, "BUSINESS MODEL", 0.7, 0.5)
    txt(cv, "Freemium SaaS with clear upgrade path", 0.7, 1.05, font=R, sz=26, color=DARK)

    plans = [
        ("Starter", "Free", ["25 artworks", "3 viewing rooms", "Basic invoicing", "Contract generator"], False),
        ("Pro", "$19/mo", ["200 artworks", "AI-powered tools", "Market analytics", "Social scheduler"], True),
        ("Studio", "$49/mo", ["Unlimited everything", "All Pro features", "Exhibition planner", "Priority support"], False),
    ]
    for i, (name, price, features, hl) in enumerate(plans):
        xb = 0.7 + i * 3.05
        bg_c = COPPER if hl else WHITE
        tc = CREAM if hl else DARK
        sc = CREAM if hl else DIM
        cc = CREAM if hl else FOREST_L

        box(cv, xb, 1.65, 2.8, 3.45, bg_c)
        txt(cv, name, xb+0.25, 1.95, font=SB, sz=14, color=tc)
        txt(cv, price, xb+0.25, 2.4, font=RB, sz=30, color=tc)

        for j, f in enumerate(features):
            fy = 3.0 + j * 0.42
            txt(cv, "+", xb+0.25, fy, font=SB, sz=12, color=cc)
            txt(cv, f, xb+0.5, fy, font=S, sz=11, color=sc)

    txt(cv, "Future: Marketplace transaction fees (5-8%)  +  Premium AI features",
        0.7, 5.25, font=S, sz=10, color=MUTED, align='center', w=8.6)


def slide_08_competitive(cv):
    bg(cv, CREAM)
    section_label(cv, "COMPETITIVE LANDSCAPE", 0.7, 0.5)
    txt(cv, "The only platform built for artists, by design", 0.7, 1.05, font=R, sz=26, color=DARK)

    cols = [2.2, 1.3, 1.3, 1.3, 1.3, 1.3]
    tx = 0.55
    hy = 1.8

    headers = ["", "ArtistOS", "Artwork Archive", "Honeybook", "Artsy", "Sheets"]
    x_off = 0
    for i, h in enumerate(headers):
        if i == 1:
            box(cv, tx+x_off, hy, cols[i], 0.5, COPPER)
            txt_box(cv, h, tx+x_off, hy, cols[i], 0.5, font=SB, sz=10, color=CREAM)
        elif i > 1:
            box(cv, tx+x_off, hy, cols[i], 0.5, CARD_BG)
            txt_box(cv, h, tx+x_off, hy, cols[i], 0.5, font=SB, sz=9, color=DIM)
        x_off += cols[i]

    rows = [
        ["Portfolio Mgmt", True, True, False, True, False],
        ["AI Tools", True, False, False, False, False],
        ["Financial Tracking", True, False, True, False, True],
        ["Commission CRM", True, False, True, False, False],
        ["Marketplace", True, False, False, True, False],
        ["Art-Specific", True, True, False, True, False],
        ["Price", "Free-$49", "$8/mo", "$19/mo", "Gallery", "Free"],
    ]
    for ri, row in enumerate(rows):
        ry = hy + 0.55 + ri * 0.42
        hline(cv, tx, ry, 8.7, CARD_BG, 0.5)
        x_off = 0
        for ci, cell in enumerate(row):
            if ci == 1:
                box(cv, tx+x_off, ry, cols[ci], 0.42, COPPER, alpha=0.08)
            if ci == 0:
                txt(cv, cell, tx+x_off, ry+0.12, font=SB, sz=11, color=DARK)
            elif isinstance(cell, bool):
                if cell and ci == 1:
                    circ(cv, tx+x_off+cols[ci]/2-0.07, ry+0.13, 0.14, 0.14, COPPER)
                elif cell:
                    circ(cv, tx+x_off+cols[ci]/2-0.07, ry+0.13, 0.14, 0.14, FOREST_L)
                else:
                    txt(cv, "\u2014", tx+x_off, ry+0.1, font=S, sz=12, color=MUTED, align='center', w=cols[ci])
            else:
                clr = COPPER if ci == 1 else DIM
                fnt = SB if ci == 1 else S
                txt(cv, cell, tx+x_off, ry+0.12, font=fnt, sz=10, color=clr, align='center', w=cols[ci])
            x_off += cols[ci]


def slide_09_traction(cv):
    bg(cv, CREAM)
    section_label(cv, "TRACTION & MILESTONES", 0.7, 0.5)
    txt(cv, "Built and launched in record time", 0.7, 1.05, font=R, sz=26, color=DARK)

    milestones = [
        "Full MVP live and functional (28 pages, 11 components)",
        "Stripe payments integrated \u2014 3 subscription tiers active",
        "AI features powered by OpenAI (4 distinct tools)",
        "Email infrastructure deployed (Resend + fallback)",
        "SEO optimized with Open Graph, Twitter Cards, JSON-LD",
        "PWA-ready \u2014 installable on mobile devices",
        "Real analytics dashboard with portfolio intelligence",
        "Legal pages (Terms of Service, Privacy Policy)",
    ]
    for i, m in enumerate(milestones):
        col = 0 if i < 4 else 1
        row = i % 4
        xb = 0.7 + col * 4.5
        yb = 1.8 + row * 0.85
        circ(cv, xb, yb+0.08, 0.28, 0.28, FOREST_L)
        txt_box(cv, "+", xb, yb+0.08, 0.28, 0.28, font=SB, sz=14, color=CREAM)
        txt_wrap(cv, m, xb+0.45, yb+0.1, 3.85, font=S, sz=12, color=DARK)


def slide_10_gtm(cv):
    bg(cv, CREAM)
    section_label(cv, "GO-TO-MARKET STRATEGY", 0.7, 0.5)
    txt(cv, "Community-first growth engine", 0.7, 1.05, font=R, sz=26, color=DARK)

    phases = [
        ("Phase 1: Community", "MONTHS 1-6", [
            "Reddit r/artbusiness (500K+)",
            "Instagram art hashtags",
            "MFA programs & art schools",
            "Art business YouTube content",
        ], COPPER),
        ("Phase 2: Partnerships", "MONTHS 6-12", [
            "Onboard 50 gallery referral partners",
            "Art fair presence & sponsorships",
            "Referral program (free Pro month)",
            "Art supply brand partnerships",
        ], FOREST),
        ("Phase 3: Marketplace", "YEAR 2+", [
            "Connect artists with collectors",
            "5% transaction fee on sales",
            "Curator-led collections",
            "International expansion",
        ], ROSE),
    ]
    for i, (title, period, items, color) in enumerate(phases):
        xb = 0.7 + i * 3.05
        box(cv, xb, 1.7, 2.8, 3.4, WHITE)
        box(cv, xb, 1.7, 2.8, 0.06, color)
        txt(cv, period, xb+0.2, 2.0, font=SB, sz=9, color=color, spacing=2)
        txt(cv, title, xb+0.2, 2.35, font=SB, sz=14, color=DARK)
        for j, item in enumerate(items):
            iy = 2.85 + j * 0.5
            txt_wrap(cv, "- " + item, xb+0.2, iy, 2.4, font=S, sz=11, color=DIM)


def slide_11_revenue(cv):
    bg(cv, DARK)
    section_label(cv, "REVENUE PROJECTIONS", 0.7, 0.5)
    txt(cv, "Clear path to $1.2M ARR", 0.7, 1.05, font=R, sz=28, color=CREAM)

    years = [
        ("Year 1", "$0", "1,000", "User acquisition focus", "Free tier growth"),
        ("Year 2", "$180K", "500 paid", "Conversion optimization", "$30/mo blended ARPU"),
        ("Year 3", "$1.2M", "3,000 paid", "Marketplace revenue", "Enterprise expansion"),
    ]
    for i, (year, arr, users, d1, d2) in enumerate(years):
        xb = 0.7 + i * 3.05
        box(cv, xb, 1.8, 2.8, 2.4, COPPER, alpha=0.12)
        txt(cv, year, xb+0.25, 2.05, font=SB, sz=11, color=COPPER, spacing=2)
        txt(cv, arr, xb+0.25, 2.5, font=RB, sz=34, color=CREAM)
        txt(cv, "ARR", xb+0.25, 2.95, font=S, sz=10, color=MUTED)
        txt(cv, users + " users", xb+0.25, 3.3, font=S, sz=12, color=COPPER_L)
        txt(cv, d1, xb+0.25, 3.65, font=S, sz=10, color=MUTED)
        txt(cv, d2, xb+0.25, 3.85, font=S, sz=10, color=MUTED)

    txt(cv, "Future revenue: Marketplace fees (5-8%)  |  Premium AI features  |  Gallery enterprise plans",
        0.7, 4.7, font=S, sz=11, color=MUTED, align='center', w=8.6)


def slide_12_team(cv):
    bg(cv, CREAM)
    section_label(cv, "THE TEAM", 0.7, 0.5)
    txt(cv, "Builder-founder with domain expertise", 0.7, 1.05, font=R, sz=26, color=DARK)

    # Founder card
    box(cv, 0.7, 1.7, 4.3, 3.3, WHITE)
    box(cv, 0.7, 1.7, 0.08, 3.3, COPPER)
    circ(cv, 1.1, 2.0, 0.9, 0.9, COPPER)
    txt_box(cv, "LJ", 1.1, 2.0, 0.9, 0.9, font=RB, sz=22, color=CREAM)
    txt(cv, "Larry Jones", 2.25, 2.2, font=SB, sz=18, color=DARK)
    txt(cv, "Founder & CEO", 2.25, 2.55, font=S, sz=12, color=COPPER)

    points = [
        "Background at Synergy Source Advisors",
        "Deep understanding of creative economy",
        "Built full MVP from concept to live product",
        "Passion for empowering creative professionals",
    ]
    for i, p in enumerate(points):
        py = 3.2 + i * 0.42
        txt(cv, "-", 1.1, py, font=SB, sz=12, color=COPPER)
        txt(cv, p, 1.35, py, font=S, sz=12, color=DIM)

    # Hiring card
    box(cv, 5.3, 1.7, 4.2, 3.3, WHITE)
    box(cv, 5.3, 1.7, 0.08, 3.3, FOREST)
    txt(cv, "HIRING PLAN", 5.65, 2.0, font=SB, sz=10, color=FOREST, spacing=3)
    txt(cv, "With funding, we'll build the team", 5.65, 2.35, font=S, sz=13, color=DARK)

    hires = [
        ("CTO / Lead Engineer", "Month 1"),
        ("Full-Stack Developer", "Month 2"),
        ("Head of Product", "Month 4"),
        ("Community Manager", "Month 6"),
    ]
    for i, (role, when) in enumerate(hires):
        hy = 2.85 + i * 0.55
        circ(cv, 5.65, hy+0.06, 0.22, 0.22, FOREST)
        txt(cv, role, 6.05, hy+0.05, font=SB, sz=12, color=DARK)
        txt(cv, when, 6.05, hy+0.32, font=S, sz=10, color=MUTED)


def slide_13_ask(cv):
    bg(cv, DARK)
    section_label(cv, "THE ASK", 0.7, 0.5)
    txt(cv, "$500K Pre-Seed Round", 0.7, 1.1, font=RB, sz=36, color=CREAM)
    txt(cv, "18-month runway to Series A metrics", 0.7, 1.7, font=S, sz=14, color=MUTED)

    # Progress bar
    funds = [
        ("40%", "Engineering", "Hire CTO + engineer, scale infra", COPPER, 3.44),
        ("25%", "Marketing", "Community, content, partnerships", FOREST, 2.15),
        ("20%", "Product Dev", "Mobile app, marketplace, AI", ROSE, 1.72),
        ("15%", "Operations", "Legal, compliance, runway", MUTED, 1.29),
    ]
    bx = 0.7
    for _, _, _, color, w in funds:
        box(cv, bx, 2.2, w, 0.35, color)
        bx += w

    for i, (pct, label, desc, color, _) in enumerate(funds):
        xb = 0.7 + i * 2.15
        txt(cv, pct, xb, 2.85, font=RB, sz=24, color=color)
        txt(cv, label, xb, 3.25, font=SB, sz=13, color=CREAM)
        txt(cv, desc, xb, 3.55, font=S, sz=10, color=MUTED)

    # Targets
    box(cv, 0.7, 4.2, 8.6, 1.0, COPPER, alpha=0.12)
    txt(cv, "TARGET METRICS AT SERIES A", 0.7, 4.35, font=SB, sz=9, color=COPPER, align='center', w=8.6, spacing=3)

    targets = [("3,000", "Paid Artists"), ("$1.2M", "ARR"), ("< 5%", "Monthly Churn"), ("12:1", "LTV:CAC Ratio")]
    for i, (val, lbl) in enumerate(targets):
        xb = 1.0 + i * 2.15
        txt(cv, val, xb, 4.7, font=RB, sz=22, color=CREAM, align='center', w=1.8)
        txt(cv, lbl, xb, 5.0, font=S, sz=10, color=MUTED, align='center', w=1.8)


def slide_14_vision(cv):
    bg(cv, DARK)
    box(cv, 0, 0, 10, 0.06, COPPER)
    circ(cv, 4.2, 0.6, 1.6, 1.6, COPPER, alpha=0.12)

    txt(cv, "Every artist deserves the tools", 0.7, 1.15, font=R, sz=28, color=CREAM, align='center', w=8.6)
    txt(cv, "to turn their passion into a", 0.7, 1.6, font=R, sz=28, color=CREAM, align='center', w=8.6)
    txt(cv, "sustainable career.", 0.7, 2.05, font=RI, sz=28, color=COPPER, align='center', w=8.6)

    roadmap = ["Mobile App", "Marketplace", "Art Market Data API", "International"]
    for i, r in enumerate(roadmap):
        xb = 0.7 + i * 2.3
        box(cv, xb, 2.9, 2.1, 0.4, COPPER, alpha=0.15)
        txt_box(cv, r, xb, 2.9, 2.1, 0.4, font=S, sz=10, color=MUTED)
        if i < 3:
            txt_box(cv, "->", xb+2.1, 2.9, 0.2, 0.4, font=S, sz=12, color=COPPER)

    hline(cv, 2, 3.7, 6, COPPER, 0.5, dash=[4, 4])

    txt(cv, "Larry Jones", 0.7, 4.1, font=RB, sz=22, color=CREAM, align='center', w=8.6)
    txt(cv, "Founder & CEO", 0.7, 4.55, font=S, sz=12, color=COPPER, align='center', w=8.6)
    txt(cv, "larry@synergysourceadvisors.com", 0.7, 4.95, font=S, sz=13, color=MUTED, align='center', w=8.6)
    txt(cv, "artistos-mvp.vercel.app", 0.7, 5.25, font=SB, sz=13, color=COPPER_L, align='center', w=8.6)


# ============================
# GENERATE PDF
# ============================
def main():
    cv = canvas.Canvas(OUTPUT, pagesize=(PW, PH))
    cv.setTitle("ArtistOS \u2014 Investor Pitch Deck 2026")
    cv.setAuthor("Larry Jones")
    cv.setSubject("Pre-Seed Investment Opportunity")

    slides = [
        slide_01_title,
        slide_02_problem,
        slide_03_solution,
        slide_04_product,
        slide_05_live,
        slide_06_market,
        slide_07_business,
        slide_08_competitive,
        slide_09_traction,
        slide_10_gtm,
        slide_11_revenue,
        slide_12_team,
        slide_13_ask,
        slide_14_vision,
    ]

    for i, slide_fn in enumerate(slides):
        slide_fn(cv)
        if i < len(slides) - 1:
            cv.showPage()

    cv.save()
    print(f"PDF pitch deck created: {OUTPUT}")
    print(f"14 slides | 16:9 widescreen | Ready for AngelList upload")


if __name__ == "__main__":
    main()
