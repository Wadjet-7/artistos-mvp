const listeners = {}

export function tourEmit(event, data) {
  ;(listeners[event] || []).forEach(fn => fn(data))
  // Also fire wildcard listeners with the event name
  ;(listeners["*"] || []).forEach(fn => fn(event, data))
}

export function tourOn(event, fn) {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(fn)
  return () => { listeners[event] = listeners[event].filter(f => f !== fn) }
}
