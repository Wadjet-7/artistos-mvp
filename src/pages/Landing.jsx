import { Link } from "react-router-dom"
import { BarChart3, ShoppingBag, Briefcase, ArrowRight, CheckCircle2, Star, TrendingUp, Users, DollarSign, Zap, FileText, Calendar } from "lucide-react"

const features = [
  { icon: Briefcase, bg: "#F5E6D8", color: "#B5651D", title: "Business Hub", description: "Manage your portfolio, generate contracts, schedule social content, and track finances — all in one place.", bullets: ["Portfolio & artwork management", "Contract generator with live preview", "Social media scheduler"] },
  { icon: BarChart3, bg: "#E8F2EA", color: "#2D4A35", title: "Market Analytics", description: "Access real-time art market data, benchmark your prices, and discover emerging trends.", bullets: ["Price benchmarking by medium & style", "Market position scoring", "Emerging artist tracking"] },
  { icon: ShoppingBag, bg: "#FBF2DC", color: "#8A6A1A", title: "Commission Marketplace", description: "Connect directly with collectors and galleries seeking commissioned work that matches your style.", bullets: ["Browse live commission requests", "Smart artist-collector matching", "Secure messaging & contracts"] },
]

const steps = [
  { step: "01", title: "Create your artist profile", desc: "Upload your portfolio, set your mediums and styles, and define your commission preferences in minutes." },
  { step: "02", title: "Discover market insights", desc: "See how your work compares to the market. Identify pricing opportunities and trending styles collectors are seeking." },
  { step: "03", title: "Land commissions & get paid", desc: "Receive matched commission requests, generate contracts, and get paid securely with milestone billing." },
]

const testimonials = [
  { name: "Priya Nair", role: "Illustrator & Surface Designer", avatar: "PN", gradient: "linear-gradient(135deg, #B5651D, #C4705A)", text: "ArtistOS helped me raise my commission rates by 40% after I saw what similar artists were charging. The market data is a game-changer." },
  { name: "Carlos Mendes", role: "Fine Artist, Oil & Acrylic", avatar: "CM", gradient: "linear-gradient(135deg, #C9A84C, #B5651D)", text: "I used to spend hours on invoicing and chasing payments. Now it is all automated. I spend that time painting instead." },
  { name: "Sophie Laurent", role: "Digital Artist & Muralist", avatar: "SL", gradient: "linear-gradient(135deg, #2D4A35, #4A7A57)", text: "Through the marketplace I landed a $4,500 mural commission within my first week. This platform actually delivers." },
]

const pricing = [
  { name: "Starter", price: "Free", period: "", description: "Perfect for artists just getting started.", highlight: false, features: ["Up to 10 portfolio artworks", "3 contracts per month", "Basic market overview", "Marketplace browsing"] },
  { name: "Pro", price: "$19", period: "/ month", description: "For emerging artists growing their practice.", highlight: true, features: ["Unlimited portfolio artworks", "Unlimited contracts & invoices", "Full analytics & benchmarking", "Social media scheduler", "Unlimited marketplace applications", "Priority support"] },
  { name: "Studio", price: "$49", period: "/ month", description: "For established artists and small studios.", highlight: false, features: ["Everything in Pro", "Up to 5 team members", "Gallery & collector portal", "Advanced market reports", "API access"] },
]

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "#FAF8F5" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur" style={{ background: "rgba(250,248,245,0.92)", borderBottom: "1px solid #E8E2DA" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-xl font-semibold" style={{ color: "#0E0C0A" }}>ArtistOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#A89F94" }}>
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium" style={{ color: "#A89F94" }}>Sign in</Link>
            <Link to="/signup" className="btn-copper">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden" style={{ background: "#0E0C0A" }}>
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(181,101,29,0.3) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(45,74,53,0.2) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}>
            <Zap size={12} style={{ color: "#C9A84C" }} /> Now in public beta - join 2,400+ artists
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold leading-tight mb-6 tracking-wide" style={{ color: "#FAF8F5" }}>
            Run your art practice<br /><span style={{ color: "#D4854A", fontStyle: "italic" }}>like a business.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            ArtistOS gives emerging and mid-career artists the tools, data, and marketplace connections they need to grow - all in one platform built for creative professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
              style={{ background: "#B5651D", color: "white" }}>
              Start for free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}>
              Browse marketplace
            </Link>
          </div>
          <p className="mt-5 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No credit card required. Free forever on Starter plan.</p>
        </div>
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-6 relative z-10">
          {[
            { icon: Users, value: "2,400+", label: "Artists on platform" },
            { icon: DollarSign, value: "$1.2M+", label: "Commissions facilitated" },
            { icon: TrendingUp, value: "87%", label: "Avg. revenue increase" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center rounded-2xl py-5 px-4"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Icon size={20} className="mx-auto mb-2" style={{ color: "#D4854A" }} />
              <p className="text-2xl font-bold text-white font-serif">{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6" style={{ background: "#FAF8F5" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: "#B5651D" }}>Three powerful modules</p>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: "#0E0C0A" }}>Everything you need, nothing you dont</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "#A89F94" }}>Purpose-built for artists. Not adapted from generic business software.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {features.map((f) => (
              <div key={f.title} className="card p-7 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: f.bg }}>
                  <f.icon size={21} style={{ color: f.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-3 font-serif" style={{ color: "#0E0C0A" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#A89F94" }}>{f.description}</p>
                <ul className="space-y-2">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "#0E0C0A" }}>
                      <CheckCircle2 size={15} style={{ color: "#B5651D" }} />{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: "#B5651D" }}>Simple by design</p>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: "#0E0C0A" }}>From sign-up to first commission in days</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-start">
                <span className="text-4xl font-black mb-4 font-serif" style={{ color: "#F5E6D8" }}>{s.step}</span>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0E0C0A" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#A89F94" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6" style={{ background: "#FAF8F5" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: "#B5651D" }}>Artist stories</p>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: "#0E0C0A" }}>Built for artists, loved by artists</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-7">
                <div className="flex mb-4">{[...Array(5)].map((_, i) => <Star key={i} size={14} style={{ color: "#C9A84C", fill: "#C9A84C" }} />)}</div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#0E0C0A" }}>{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold font-serif"
                    style={{ background: t.gradient }}>{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0E0C0A" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "#A89F94" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: "#B5651D" }}>Pricing</p>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: "#0E0C0A" }}>Simple, transparent pricing</h2>
            <p className="mt-4 text-lg" style={{ color: "#A89F94" }}>Start free. Upgrade when you are ready to grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7 items-start">
            {pricing.map((plan) => (
              <div key={plan.name} className="rounded-2xl p-7"
                style={{
                  background: plan.highlight ? "#0E0C0A" : "white",
                  border: plan.highlight ? "1px solid #0E0C0A" : "1px solid #E8E2DA",
                  boxShadow: plan.highlight ? "0 8px 32px rgba(0,0,0,0.15)" : "none",
                }}>
                {plan.highlight && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
                    style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>
                    <Zap size={11} style={{ color: "#C9A84C" }} /> Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold mb-1" style={{ color: plan.highlight ? "#FAF8F5" : "#0E0C0A" }}>{plan.name}</h3>
                <p className="text-sm mb-5" style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "#A89F94" }}>{plan.description}</p>
                <div className="flex items-end gap-1 mb-7">
                  <span className="text-4xl font-bold font-serif" style={{ color: plan.highlight ? "#FAF8F5" : "#0E0C0A" }}>{plan.price}</span>
                  <span className="text-sm pb-1" style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "#A89F94" }}>{plan.period}</span>
                </div>
                <Link to="/signup" className="block text-center py-2.5 rounded-lg text-sm font-semibold mb-7 transition-colors"
                  style={{
                    background: plan.highlight ? "#B5651D" : "#0E0C0A",
                    color: plan.highlight ? "white" : "#FAF8F5",
                  }}>
                  {plan.highlight ? "Start free trial" : plan.price === "Free" ? "Get started free" : "Contact sales"}
                </Link>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 size={15} style={{ color: plan.highlight ? "rgba(255,255,255,0.4)" : "#B5651D" }} />
                      <span style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "#0E0C0A" }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: "#0E0C0A" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-semibold text-white mb-5">Ready to professionalize your practice?</h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            Join thousands of artists using ArtistOS to grow their revenue, understand the market, and land commissions.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
            style={{ background: "#B5651D", color: "white" }}>
            Get started for free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6" style={{ background: "#0E0C0A", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="font-serif font-semibold text-white">ArtistOS</span>
            <span className="text-sm ml-2" style={{ color: "rgba(255,255,255,0.25)" }}>2026 All rights reserved.</span>
          </div>
          <div className="flex gap-8 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            {["Privacy", "Terms", "Blog", "Help Center"].map((link) => (
              <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
