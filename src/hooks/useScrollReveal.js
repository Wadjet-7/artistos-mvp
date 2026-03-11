import { useEffect, useRef } from "react"

/**
 * Adds "revealed" class when element scrolls into view (fires once).
 * Usage: const ref = useScrollReveal(); <div ref={ref} className="scroll-reveal">
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed")
          observer.unobserve(el)
        }
      },
      { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || "0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

/**
 * Staggered reveal for child elements. Sets --stagger-delay CSS variable.
 * Usage: const setRef = useStaggerReveal(3, 150); <div ref={setRef(0)} className="scroll-reveal-stagger">
 */
export function useStaggerReveal(count, baseDelay = 100) {
  const refs = useRef([])

  useEffect(() => {
    const observers = []
    refs.current.forEach((el, i) => {
      if (!el) return
      el.style.setProperty("--stagger-delay", `${i * baseDelay}ms`)

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add("revealed")
            observer.unobserve(el)
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [count])

  return (index) => (el) => { refs.current[index] = el }
}
