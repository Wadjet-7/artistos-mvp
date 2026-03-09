import { useEffect } from "react"
import { X } from "lucide-react"

export default function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={"relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto " + (wide ? "max-w-2xl" : "max-w-md")}
        style={{ border: "1px solid #E8E2DA" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white rounded-t-2xl z-10"
          style={{ borderBottom: "1px solid #F2EDE6" }}>
          <h2 className="font-serif text-xl font-semibold" style={{ color: "#0E0C0A" }}>{title}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "#A89F94" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F2EDE6"; e.currentTarget.style.color = "#0E0C0A"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A89F94"; }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
