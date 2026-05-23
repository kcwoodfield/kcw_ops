import { useEffect, useRef, useState } from 'react'
import { X, Send, ChevronDown, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { useUiStore, type LoboModel, type LoboMessage } from '../../store/ui'
import { useActiveProjectId } from '../../hooks/useAppNavigate'
import { getAccessToken } from '../../api/client'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5050'

type Message = LoboMessage

interface OfflineState {
  show: boolean
  model: LoboModel
}

const MODEL_LABELS: Record<LoboModel, string> = {
  'claude-sonnet': 'Claude Sonnet',
  'claude-haiku':  'Claude Haiku',
  'ollama':        'Local (Ollama)',
}

export function LoboPanel() {
  const { loboPanelOpen, loboModel, toggleLoboPanel, setLoboModel, loboMessages: messages, setLoboMessages: setMessages, clearLoboMessages } = useUiStore()
  const activeProjectId = useActiveProjectId()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [modelPickerOpen, setModelPickerOpen] = useState(false)
  const [offline, setOffline] = useState<OfflineState>({ show: false, model: loboModel })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (loboPanelOpen) setTimeout(() => inputRef.current?.focus(), 80)
  }, [loboPanelOpen])

  // ⌘L toggle · Esc collapses (closing any open sub-layer first)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault()
        toggleLoboPanel()
        return
      }
      if (e.key === 'Escape' && loboPanelOpen) {
        if (offline.show) { setOffline(o => ({ ...o, show: false })); return }
        if (modelPickerOpen) { setModelPickerOpen(false); return }
        e.preventDefault()
        toggleLoboPanel()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleLoboPanel, loboPanelOpen, offline.show, modelPickerOpen])

  const checkHealth = async (model: LoboModel): Promise<boolean> => {
    try {
      const token = getAccessToken()
      const res = await fetch(`${API}/api/ai/health?model=${model}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      return res.ok
    } catch {
      return false
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const healthy = await checkHealth(loboModel)
    if (!healthy) {
      setOffline({ show: true, model: loboModel })
      return
    }

    const userMsg: Message = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...history, assistantMsg])

    try {
      const token = getAccessToken()
      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          model: loboModel,
          projectId: activeProjectId ?? null,
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No response stream')

      let done = false
      let accumulated = ''
      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone
        if (value) {
          const text = decoder.decode(value)
          const lines = text.split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const json = line.slice(6).trim()
            if (!json) continue
            const chunk = JSON.parse(json) as { type: string; delta?: string }
            if (chunk.type === 'text' && chunk.delta) {
              accumulated += chunk.delta
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { role: 'assistant', content: accumulated }
                return next
              })
            }
            if (chunk.type === 'error') {
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { role: 'assistant', content: chunk.delta ?? 'Something went wrong.', error: true }
                return next
              })
            }
          }
        }
      }
    } catch {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: 'Connection error. Is the API running?', error: true }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  if (!loboPanelOpen) return null

  return (
    <>
      {/* Offline modal */}
      {offline.show && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setOffline({ show: false, model: loboModel })}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--panel)', border: '1px solid var(--border)',
              borderRadius: 10, padding: 28, width: 340,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} style={{ color: 'var(--blocked)', flexShrink: 0 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)' }}>
                {offline.model === 'ollama' ? 'Ollama isn\'t running' : 'Claude API unavailable'}
              </div>
            </div>
            <p style={{ fontSize: 14.5, color: 'var(--fg-2)', margin: 0, lineHeight: 1.5 }}>
              {offline.model === 'ollama'
                ? 'The local Ollama model isn\'t responding. Start it with:'
                : 'ANTHROPIC_API_KEY is not set in appsettings.Development.json.'}
            </p>
            {offline.model === 'ollama' && (
              <code style={{
                display: 'block', background: 'var(--bg-1)',
                border: '1px solid var(--border)', borderRadius: 5,
                padding: '8px 12px', fontSize: 14, color: 'var(--fg)',
                fontFamily: 'monospace',
              }}>
                ollama serve
              </code>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {offline.model === 'ollama' && (
                <ModalBtn
                  onClick={() => { setLoboModel('claude-sonnet'); setOffline({ show: false, model: loboModel }) }}
                >
                  Switch to Claude
                </ModalBtn>
              )}
              <ModalBtn
                onClick={async () => {
                  const ok = await checkHealth(loboModel)
                  if (ok) setOffline({ show: false, model: loboModel })
                }}
              >
                <RefreshCw size={12} /> Retry
              </ModalBtn>
              <ModalBtn onClick={() => setOffline({ show: false, model: loboModel })} secondary>
                Cancel
              </ModalBtn>
            </div>
          </div>
        </div>
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 400, zIndex: 100,
        background: 'var(--panel)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          height: 52, padding: '0 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18, fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--fg)', flex: 1,
          }}>
            Lobo
          </span>

          {/* Model picker */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setModelPickerOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 8px', borderRadius: 4,
                background: 'var(--bg-1)', border: '1px solid var(--border)',
                fontSize: 13.5, color: 'var(--fg-2)',
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--border-1)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {MODEL_LABELS[loboModel]}
              <ChevronDown size={11} />
            </button>
            {modelPickerOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: 'var(--panel)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '4px 0', minWidth: 160, zIndex: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
              }}>
                {(Object.keys(MODEL_LABELS) as LoboModel[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setLoboModel(m); setModelPickerOpen(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '7px 14px', fontSize: 14.5,
                      color: m === loboModel ? 'var(--fg)' : 'var(--fg-1)',
                      fontWeight: m === loboModel ? 600 : 400,
                      background: 'transparent',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {MODEL_LABELS[m]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearLoboMessages}
              title="Clear history"
              style={{ color: 'var(--fg-3)', padding: 4, borderRadius: 3, display: 'flex' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleLoboPanel}
            title="Close Lobo (⌘L)"
            style={{ color: 'var(--fg-3)', padding: 4, borderRadius: 3, display: 'flex' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.length === 0 && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              color: 'var(--fg-3)', textAlign: 'center', padding: '0 24px',
            }}>
              <span style={{ fontSize: 30 }}>🐺</span>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg-2)' }}>Lobo is ready.</div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                Ask about your projects, sprints, or stories. Type to begin.
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: m.role === 'user' ? 'var(--accent)' : 'var(--fg-3)',
              }}>
                {m.role === 'user' ? 'You' : 'Lobo'}
              </div>
              <div style={{
                fontSize: 15, lineHeight: 1.6, color: m.error ? 'var(--blocked)' : 'var(--fg)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
                {m.role === 'assistant' && loading && i === messages.length - 1 && m.content === '' && (
                  <span style={{ opacity: 0.4 }}>thinking…</span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lobo anything…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1, resize: 'none', overflow: 'hidden',
              background: 'var(--bg-1)', border: '1px solid var(--border-1)',
              borderRadius: 6, padding: '8px 10px',
              fontSize: 15, color: 'var(--fg)', lineHeight: 1.5,
              outline: 'none',
              opacity: loading ? 0.6 : 1,
            }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 34, height: 34, borderRadius: 6, flexShrink: 0,
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--bg-1)',
              color: input.trim() && !loading ? 'var(--accent-ink)' : 'var(--fg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  )
}

function ModalBtn({ children, onClick, secondary }: {
  children: React.ReactNode
  onClick: () => void
  secondary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, height: 34, borderRadius: 5, fontSize: 14.5, fontWeight: 600,
        background: secondary ? 'transparent' : 'var(--accent)',
        color: secondary ? 'var(--fg-2)' : 'var(--accent-ink)',
        border: secondary ? '1px solid var(--border)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}
    >
      {children}
    </button>
  )
}
