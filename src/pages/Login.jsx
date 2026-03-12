import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!email || !password) { setError("Please fill in all fields."); return }
    setLoading(true)
    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message === "Invalid login credentials"
        ? "Invalid email or password. Please try again."
        : err.message || "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="font-serif text-2xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Sign in to your artist dashboard</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-7" style={{ border: "1px solid #E8E2DA" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm px-4 py-2.5 rounded-lg" style={{ background: "#F5E2DC", border: "1px solid #C4705A", color: "#C4705A" }}>{error}</div>}
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
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                  className="form-input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#A89F94" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#A89F94" }}>
                <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: "#B5651D" }} />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: "#B5651D" }}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-copper flex items-center justify-center gap-2 py-3 disabled:opacity-70">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign in</span><ArrowRight size={15} /></>}
            </button>
          </form>
          <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid #F2EDE6" }}>
            <p className="text-sm" style={{ color: "#A89F94" }}>
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: "#B5651D" }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
