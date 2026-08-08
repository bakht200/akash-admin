import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * Catches render errors in a page and shows what failed.
 *
 * Without this, one component reading a field the API does not return unmounts the
 * whole tree and leaves a blank white page with only a console message — which reads
 * as "the dashboard is broken" rather than "this page expects a field that is missing".
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Kept so the stack survives in the console for anyone inspecting a report.
    console.error('Page failed to render:', error, info?.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="rounded-[12px] border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-rose-800">
                This page could not be displayed.
              </div>
              <p className="mt-1 text-sm text-rose-700">
                Something the page expected was missing from the API response. The details
                below identify what.
              </p>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-[8px] bg-white/70 p-3 text-[11px] leading-relaxed text-rose-900">
                {String(error?.message ?? error)}
              </pre>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => this.setState({ error: null })}
                  className="rounded-[8px] border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => window.location.assign('/dashboard')}
                  className="rounded-[8px] border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
