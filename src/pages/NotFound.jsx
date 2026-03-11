import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAF8F5" }}>
      <div className="text-center">
        <div className="font-serif font-semibold select-none" style={{ fontSize: 120, color: "#E8E2DA", lineHeight: 1 }}>
          404
        </div>
        <h1 className="font-serif text-[22px] font-semibold mt-2" style={{ color: "#0E0C0A" }}>
          Page not found
        </h1>
        <p className="text-[13.5px] mt-2 max-w-xs mx-auto" style={{ color: "#A89F94" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="btn-copper inline-flex items-center gap-2 mt-6"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
