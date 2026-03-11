import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { navSections } from "../data/navigation"

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  // Flatten all nav items
  const allItems = useMemo(() =>
    navSections.flatMap(section =>
      section.items.map(item => ({ ...item, section: section.label }))
    ), []
  )

  // Filter by query
  const filtered = useMemo(() => {
    if (!query.trim()) return allItems
    const q = query.toLowerCase()
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q)
    )
  }, [query, allItems])

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered.length])

  // Body overflow lock
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === "Escape") { onClose(); return }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      }
      if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault()
        navigateTo(filtered[selectedIndex].to)
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, filtered, selectedIndex, onClose])

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.children[selectedIndex]
    if (el) el.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  const navigateTo = (path) => {
    navigate(path)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn"
        style={{ border: "1px solid #E8E2DA" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid #F2EDE6" }}>
          <Search size={16} style={{ color: "#A89F94", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-[14px] bg-transparent outline-none"
            style={{ color: "#0E0C0A" }}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "#F2EDE6", color: "#A89F94" }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px]" style={{ color: "#A89F94" }}>
              No pages found
            </div>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon
              return (
                <button
                  key={item.to}
                  onClick={() => navigateTo(item.to)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{
                    background: i === selectedIndex ? "#F2EDE6" : "transparent",
                    color: i === selectedIndex ? "#0E0C0A" : "#6B6560",
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <Icon size={16} style={{ opacity: 0.7, flexShrink: 0 }} />
                  <span className="text-[13.5px] font-medium">{item.label}</span>
                  <span className="ml-auto text-[11px]" style={{ color: "#A89F94" }}>{item.section}</span>
                </button>
              )
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 flex items-center gap-4 text-[11px]" style={{ borderTop: "1px solid #F2EDE6", color: "#A89F94" }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>esc Close</span>
        </div>
      </div>
    </div>
  )
}
