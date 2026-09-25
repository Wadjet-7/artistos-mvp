const listeners = {}

export function tourEmit(event, data) {
  ;(listeners[event] || []).forEach(fn => fn(data))
}

export function tourOn(event, fn) {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(fn)
  return () => { listeners[event] = listeners[event].filter(f => f !== fn) }
}
