import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [confirmEmail, setConfirmEmail] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !password) { setError("Please fill in all fields."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setLoading(true)
    try {
      const data = await signup(name, email, password)
      // If session exists, user is auto-confirmed → go to dashboard
      if (data?.session) {
        navigate("/dashboard")
      } else {
        // Email confirmation required — show message
        setConfirmEmail(true)
      }
    } catch (err) {
      const msg = err.message || "Something went wrong."
      if (msg.includes("already registered")) {
        setError("An account with this email already exists. Try signing in instead.")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const perks = ["Free forever on Starter plan", "No credit card required", "Portfolio, contracts & analytics"]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#0E0C0A" }}>
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(181,101,29,0.3) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(45,74,53,0.2) 0%, transparent 70%)" }} />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="font-serif text-2xl font-semibold text-white tracking-wide">ArtistOS</span>
          </Link>
          <h1 className="font-serif text-2xl font-semibold text-white mb-2">Create your account</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Start running your art practice like a business</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-7" style={{ border: "1px solid #E8E2DA" }}>
          {confirmEmail ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#F5E6D8" }}>
                <Mail size={24} style={{ color: "#B5651D" }} />
              </div>
              <h2 className="font-serif text-lg font-semibold mb-2" style={{ color: "#0E0C0A" }}>Check your email</h2>
              <p className="text-sm mb-4" style={{ color: "#A89F94" }}>
                We sent a confirmation link to <strong style={{ color: "#0E0C0A" }}>{email}</strong>. Click the link to activate your account.
              </p>
              <Link to="/login" className="btn-copper inline-flex items-center gap-2 px-6 py-2.5">
                Go to Sign in <ArrowRight size={15} />
              </Link>
            </div>
          ) : (<>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm px-4 py-2.5 rounded-lg" style={{ background: "#F5E2DC", border: "1px solid #C4705A", color: "#C4705A" }}>{error}</div>}
            <div>
              <label className="form-label">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maya Chen"
                  className="form-input pl-10" />
              </div>
            </div>
            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="form-input pl-10" />
              </div>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters"
                  className="form-input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#A89F94" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-copper flex items-center justify-center gap-2 py-3 disabled:opacity-70">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create account</span><ArrowRight size={15} /></>}
            </button>
          </form>
          <ul className="mt-5 space-y-2">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-2 text-xs" style={{ color: "#A89F94" }}>
                <CheckCircle2 size={13} className="flex-shrink-0" style={{ color: "#B5651D" }} />{p}
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-5 text-center" style={{ borderTop: "1px solid #F2EDE6" }}>
            <p className="text-sm" style={{ color: "#A89F94" }}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: "#B5651D" }}>Sign in</Link>
            </p>
          </div>
          </>)}
        </div>
      </div>
    </div>
  )
}
