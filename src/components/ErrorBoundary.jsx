import { Component } from "react"
import { Link } from "react-router-dom"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAF8F5" }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: "#F5E2DC" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4705A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="font-serif text-[22px] font-semibold mb-2" style={{ color: "#0E0C0A" }}>
              Something went wrong
            </h1>
            <p className="text-[13.5px] mb-6" style={{ color: "#A89F94" }}>
              An unexpected error occurred. Don't worry, your data is safe.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="btn-copper"
              >
                Reload Page
              </button>
              <Link to="/dashboard" className="btn-outline"
                onClick={() => this.setState({ hasError: false, error: null })}>
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
