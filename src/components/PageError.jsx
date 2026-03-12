import { AlertTriangle, RefreshCw } from "lucide-react"

export default function PageError({ message, onRetry }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: "#F5E2DC" }}>
        <AlertTriangle size={24} style={{ color: "#C4705A" }} />
      </div>
      <h3 className="font-serif text-lg font-semibold mb-1" style={{ color: "#0E0C0A" }}>
        Failed to load data
      </h3>
      <p className="text-sm mb-4 max-w-xs mx-auto" style={{ color: "#A89F94" }}>
        {message || "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline inline-flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  )
}
