import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { BarChart3, ShoppingBag, Briefcase, ArrowRight, CheckCircle2, TrendingUp, DollarSign, Zap, Sparkles } from "lucide-react"
import { useScrollReveal, useStaggerReveal } from "../hooks/useScrollReveal"
import { PLANS } from "../lib/plans"

/* ---- Animated Counter (counts from 0 to target on scroll) ---- */
function AnimatedCounter({ end, duration = 2000, prefix = "", suffix = "", decimals = 0 }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasStarted.current) {
        hasStarted.current = true
        const start = performance.now()
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
          setValue(eased * end)
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
        observer.unobserve(el)
      }
    }, { threshold: 0.5 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  const display = decimals > 0
    ? value.toFixed(decimals)
    : Math.floor(value).toLocaleString()

  return <span ref={ref}>{prefix}{display}{suffix}</span>
}

/* ---- Static Data ---- */
const features = [
  { icon: Briefcase, bg: "#F5E6D8", color: "#B5651D", title: "Business Hub", description: "Manage your portfolio, generate contracts, schedule social content, and track finances — all in one place.", bullets: ["Portfolio & artwork management", "Contract generator with live preview", "QR codes & certificates of authenticity"] },
  { icon: Sparkles, bg: "#FBF2DC", color: "#8A6A1A", title: "AI-Powered Tools", description: "Let AI write gallery-quality descriptions, suggest market-aligned pricing, and generate your professional bio.", bullets: ["AI artwork descriptions", "Smart price suggestions", "Professional bio generator"] },
  { icon: BarChart3, bg: "#E8F2EA", color: "#2D4A35", title: "Analytics & Growth", description: "Track your portfolio value, sales velocity, and inventory status with real-time data visualizations.", bullets: ["Portfolio value tracking", "Medium & status breakdowns", "Market position scoring"] },
]

const steps = [
  { step: "01", title: "Create your artist profile", desc: "Upload your portfolio, set your mediums and styles, and define your commission preferences in minutes." },
  { step: "02", title: "Discover market insights", desc: "See how your work compares to the market. Identify pricing opportunities and trending styles collectors are seeking." },
  { step: "03", title: "Land commissions & get paid", desc: "Receive matched commission requests, generate contracts, and get paid securely with milestone billing." },
]

const whyArtistOS = [
  { icon: Zap, title: "Built for artists, not accountants", desc: "Every feature designed around how creative professionals actually work — not adapted from generic business software." },
  { icon: DollarSign, title: "Get paid faster", desc: "Generate branded invoices, send automatic reminders, and track every dollar — commissions, sales, and expenses in one place." },
  { icon: TrendingUp, title: "Grow with data", desc: "Understand your portfolio value, track what's selling, and price your work confidently with market-informed analytics." },
]

const heroStats = [
  { icon: Briefcase, end: 15, prefix: "", suffix: "+", decimals: 0, label: "Business tools included" },
  { icon: Sparkles, end: 4, prefix: "", suffix: "", decimals: 0, label: "AI-powered features" },
  { icon: DollarSign, end: 0, prefix: "$", suffix: "", decimals: 0, label: "To get started" },
]

const pricing = [
  { name: PLANS.starter.name, price: PLANS.starter.priceLabel, period: "", description: PLANS.starter.tagline, highlight: false, features: PLANS.starter.highlights.slice(0, 6) },
  { name: PLANS.pro.name, price: `$${PLANS.pro.price}`, period: "/ month", description: PLANS.pro.tagline, highlight: true, features: PLANS.pro.highlights.slice(0, 8) },
  { name: PLANS.studio.name, price: `$${PLANS.studio.price}`, period: "/ month", description: PLANS.studio.tagline, highlight: false, features: PLANS.studio.highlights.slice(0, 7) },
]

export default function Landing() {
  /* Scroll-reveal refs for section headers */
  const featuresHeaderRef = useScrollReveal()
  const howItWorksHeaderRef = useScrollReveal()
  const testimonialsHeaderRef = useScrollReveal()
  const pricingHeaderRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  /* Stagger refs for card groups */
  const featureRef = useStaggerReveal(features.length, 150)
  const stepRef = useStaggerReveal(steps.length, 200)
  const testimonialRef = useStaggerReveal(testimonials.length, 150)
  const pricingRef = useStaggerReveal(pricing.length, 150)
  const statRef = useStaggerReveal(heroStats.length, 120)

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
            <Zap size={12} style={{ color: "#C9A84C" }} /> Now live — free to get started
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
            <Link to="/artists" className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}>
              Browse artists
            </Link>
          </div>
          <p className="mt-5 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No credit card required. Free forever on Starter plan.</p>
        </div>

        {/* Hero Stats with Animated Counters */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-6 relative z-10">
          {heroStats.map(({ icon: Icon, end, prefix, suffix, decimals, label }, i) => (
            <div key={label} ref={statRef(i)} className="scroll-reveal-stagger text-center rounded-2xl py-5 px-4"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Icon size={20} className="mx-auto mb-2" style={{ color: "#D4854A" }} />
              <p className="text-2xl font-bold text-white font-serif">
                <AnimatedCounter end={end} prefix={prefix} suffix={suffix} decimals={decimals} duration={2000} />
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6" style={{ background: "#FAF8F5" }}>
        <div className="max-w-6xl mx-auto">
          <div ref={featuresHeaderRef} className="scroll-reveal text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: "#B5651D" }}>Three powerful modules</p>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: "#0E0C0A" }}>Everything you need, nothing you dont</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "#A89F94" }}>Purpose-built for artists. Not adapted from generic business software.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {features.map((f, i) => (
              <div key={f.title} ref={featureRef(i)} className="scroll-reveal-stagger card p-7 hover:shadow-md transition-shadow">
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
          <div ref={howItWorksHeaderRef} className="scroll-reveal text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: "#B5651D" }}>Simple by design</p>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: "#0E0C0A" }}>From sign-up to first commission in days</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <div key={s.step} ref={stepRef(i)} className="scroll-reveal-stagger flex flex-col items-start">
                <span className="text-4xl font-black mb-4 font-serif" style={{ color: "#F5E6D8" }}>{s.step}</span>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#0E0C0A" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#A89F94" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ArtistOS */}
      <section className="py-24 px-6" style={{ background: "#FAF8F5" }}>
        <div className="max-w-5xl mx-auto">
          <div ref={testimonialsHeaderRef} className="scroll-reveal text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: "#B5651D" }}>Why ArtistOS</p>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: "#0E0C0A" }}>The platform your art practice deserves</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "#A89F94" }}>Stop juggling spreadsheets, invoicing apps, and social media schedulers. One platform. Everything you need.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {whyArtistOS.map((item, i) => (
              <div key={item.title} ref={testimonialRef(i)} className="scroll-reveal-stagger card p-7 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "#F5E6D8" }}>
                  <item.icon size={22} style={{ color: "#B5651D" }} />
                </div>
                <h3 className="text-lg font-semibold mb-3 font-serif" style={{ color: "#0E0C0A" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#A89F94" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div ref={pricingHeaderRef} className="scroll-reveal text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[2px] mb-3" style={{ color: "#B5651D" }}>Pricing</p>
            <h2 className="font-serif text-4xl font-semibold" style={{ color: "#0E0C0A" }}>Simple, transparent pricing</h2>
            <p className="mt-4 text-lg" style={{ color: "#A89F94" }}>Start free. Upgrade when you are ready to grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7 items-start">
            {pricing.map((plan, i) => (
              <div key={plan.name} ref={pricingRef(i)} className="scroll-reveal-stagger rounded-2xl p-7"
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
                  {plan.highlight ? "Start free trial" : plan.price === "Free" ? "Get started free" : "Get started"}
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
        <div ref={ctaRef} className="scroll-reveal max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-semibold text-white mb-5">Ready to professionalize your practice?</h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            Portfolio management, invoicing, contracts, AI tools, analytics, and more — free to start, no credit card required.
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
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:larry@synergysourceadvisors.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
