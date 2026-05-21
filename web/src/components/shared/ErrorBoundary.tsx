import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 13, color: 'var(--fg)' }}>Something went wrong</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', maxWidth: 400, textAlign: 'center' }}>
            {error.message}
          </span>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: 4, fontSize: 12, color: 'var(--accent)', padding: '4px 8px' }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
