import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { supabase } from "../lib/supabase"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!email) { setError("Please enter your email address."); return }
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login",
      })
      if (resetError) throw resetError
      setSent(true)
    } catch (err) {
      // Don't reveal whether email exists — just show success
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#0E0C0A" }}>
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(181,101,29,0.3) 0%, transparent 70%)" }} />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="font-serif text-2xl font-semibold text-white tracking-wide">ArtistOS</span>
          </Link>
          <h1 className="font-serif text-2xl font-semibold text-white mb-2">Reset your password</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {sent ? "Check your inbox" : "Enter your email and we'll send a reset link"}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-7" style={{ border: "1px solid #E8E2DA" }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#E8F5E9" }}>
                <CheckCircle2 size={28} style={{ color: "#2D4A35" }} />
              </div>
              <h2 className="font-serif text-lg font-semibold mb-2" style={{ color: "#0E0C0A" }}>
                Reset email sent!
              </h2>
              <p className="text-sm mb-6" style={{ color: "#A89F94" }}>
                If an account exists for <strong style={{ color: "#0E0C0A" }}>{email}</strong>,
                you'll receive a password reset link shortly. Check your spam folder too.
              </p>
              <Link to="/login" className="btn-copper inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm px-4 py-2.5 rounded-lg"
                  style={{ background: "#F5E2DC", border: "1px solid #C4705A", color: "#C4705A" }}>
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#A89F94" }}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A89F94" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10 w-full"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-copper w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Reset Link</>
                )}
              </button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-sm font-medium hover:underline" style={{ color: "#B5651D" }}>
                  <ArrowLeft size={14} className="inline mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
