import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", destructive = true }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fadeIn"
        style={{ border: "1px solid #E8E2DA" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ background: destructive ? "rgba(196,112,90,0.12)" : "rgba(181,101,29,0.12)" }}>
            <AlertTriangle size={22} style={{ color: destructive ? "#C4705A" : "#B5651D" }} />
          </div>
          <h3 className="font-serif text-lg font-semibold mb-2" style={{ color: "#0E0C0A" }}>
            {title}
          </h3>
          <p className="text-[13.5px] leading-relaxed" style={{ color: "#A89F94" }}>
            {message}
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg text-[13.5px] font-medium transition-colors"
            style={{ border: "1px solid #E8E2DA", color: "#6B6560", background: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "#F2EDE6"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-2.5 px-4 rounded-lg text-[13.5px] font-medium text-white transition-colors"
            style={{ background: destructive ? "#C4705A" : "#B5651D" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
