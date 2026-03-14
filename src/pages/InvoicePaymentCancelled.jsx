import { XCircle } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Public page — shown to clients who cancel invoice payment         */
/* ------------------------------------------------------------------ */
export default function InvoicePaymentCancelled() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#FAF8F5" }}>
      <div className="w-full max-w-md text-center">
        <div className="card p-8" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "#F5E2DC" }}>
            <XCircle size={40} style={{ color: "#C4705A" }} />
          </div>
          <h1 className="text-2xl font-serif font-semibold mb-2" style={{ color: "#0E0C0A" }}>
            Payment Cancelled
          </h1>
          <p className="text-sm mb-4" style={{ color: "#A89F94" }}>
            No payment has been processed. If you'd like to try again, use the payment link from the invoice email.
          </p>
          <p className="text-xs" style={{ color: "#C5BDB3" }}>
            You may close this page.
          </p>
        </div>
        <p className="text-xs mt-6" style={{ color: "#C5BDB3" }}>
          Powered by <a href="https://artistos-mvp.vercel.app" style={{ color: "#B5651D", textDecoration: "none" }}>ArtistOS</a>
        </p>
      </div>
    </div>
  )
}
