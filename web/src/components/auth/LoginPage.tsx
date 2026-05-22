import { useEffect, useRef, useState } from 'react'
import { Shield } from '../Shield'
import { useAuthStore } from '../../store/auth'
import { apiLogin, apiVerify } from '../../api/auth'
import { useAuthFade } from '../../context/auth-fade'
import { FadeTransition } from '../../lib/fade-transitions'

type Step = 'password' | 'totp'

export function LoginPage() {
  const { login } = useAuthStore()
  const { crossFade } = useAuthFade()

  const [step, setStep] = useState<Step>('password')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const totpRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'totp') setTimeout(() => totpRef.current?.focus(), 80)
    else setTimeout(() => passwordRef.current?.focus(), 80)
  }, [step])

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(username, password)
      setTempToken(data.tempToken)
      setStep('totp')
    } catch {
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiVerify(tempToken, totp)
      await crossFade(() => { login(data.accessToken) })
    } catch {
      setError('Invalid or expired code. Try again.')
      setTotp('')
      totpRef.current?.focus()
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--fg)',
    }}>
      <FadeTransition show={true} subtle enterDuration={1200}>
        <div style={{
          width: 340,
          display: 'flex', flexDirection: 'column', gap: 28,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={32} variant="dark" />
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 30, fontWeight: 600,
                color: 'var(--fg)', letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>Ops</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>workspace</div>
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 24,
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            {step === 'password' ? (
              <>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>Sign in</div>
                  <div style={{ fontSize: 14, color: 'var(--fg-3)', marginTop: 2 }}>
                    Enter your username and password.
                  </div>
                </div>
                <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Field label="Username">
                    <input
                      ref={passwordRef}
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Password">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      style={inputStyle}
                    />
                  </Field>
                  {error && <p style={{ fontSize: 14, color: 'var(--blocked)', margin: 0 }}>{error}</p>}
                  <button type="submit" disabled={loading} style={btnStyle}>
                    {loading ? 'Checking…' : 'Continue'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>Two-factor auth</div>
                  <div style={{ fontSize: 14, color: 'var(--fg-3)', marginTop: 2 }}>
                    Enter the 6-digit code from your authenticator app.
                  </div>
                </div>
                <form onSubmit={handleTotp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Field label="Code">
                    <input
                      ref={totpRef}
                      value={totp}
                      onChange={e => setTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      placeholder="000000"
                      className="mono"
                      style={{ ...inputStyle, letterSpacing: '0.25em', fontSize: 22, textAlign: 'center' }}
                    />
                  </Field>
                  {error && <p style={{ fontSize: 14, color: 'var(--blocked)', margin: 0 }}>{error}</p>}
                  <button type="submit" disabled={loading || totp.length < 6} style={btnStyle}>
                    {loading ? 'Verifying…' : 'Sign in'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('password'); setError(''); setTotp('') }}
                    style={{ fontSize: 14, color: 'var(--fg-3)', background: 'none', padding: 0 }}
                  >
                    ← Back
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </FadeTransition>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-2)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'var(--bg-1)',
  border: '1px solid var(--border-1)',
  borderRadius: 5,
  fontSize: 15,
  color: 'var(--fg)',
  outline: 'none',
}

const btnStyle: React.CSSProperties = {
  width: '100%',
  height: 36,
  background: 'var(--accent)',
  color: 'var(--accent-ink)',
  borderRadius: 5,
  fontSize: 15,
  fontWeight: 600,
  marginTop: 4,
}
