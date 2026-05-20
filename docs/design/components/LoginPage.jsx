// Login page — workspace sign-in. Passkey-first (matches the work being done
// in this PM tool's mock data) with SSO fallbacks and email-password link.

function LoginPage() {
  return (
    <div className="kcw" style={{
      width:'100%', height:'100%',
      background:'var(--bg)',
      display:'grid',
      gridTemplateColumns:'1fr 1fr',
      overflow:'hidden',
      position:'relative',
    }}>
      {/* Left — brand panel */}
      <div style={{
        position:'relative',
        borderRight:'1px solid var(--border)',
        background:'var(--panel)',
        padding:'48px 56px',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Dotted grid bg */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'radial-gradient(var(--border-1) 1px, transparent 1px)',
          backgroundSize:'14px 14px',
          opacity:0.5,
          pointerEvents:'none',
          maskImage:'radial-gradient(ellipse at 30% 70%, #000 30%, transparent 75%)',
          WebkitMaskImage:'radial-gradient(ellipse at 30% 70%, #000 30%, transparent 75%)',
        }}/>
        {/* Accent halo */}
        <div style={{
          position:'absolute', bottom:-120, left:-120, width:420, height:420,
          background:'radial-gradient(circle, var(--accent-tint) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>

        {/* Brand */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:10, marginBottom:'auto' }}>
          <div style={{
            width:28, height:28, borderRadius:6,
            background:'linear-gradient(135deg, var(--accent), oklch(0.55 0.20 280))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, color:'var(--accent-ink)',
          }}>k</div>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1.05 }}>
            <span style={{ fontSize:14, fontWeight:600 }}>kcw / ops</span>
            <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)' }}>v3.0 · build 247</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position:'relative', marginTop:80, marginBottom:48 }}>
          <h1 style={{
            fontSize:40, fontWeight:600, lineHeight:1.08, margin:0,
            letterSpacing:'-0.02em', color:'var(--fg)',
            textWrap:'balance', maxWidth:380,
          }}>
            Roadmaps that <span style={{ color:'var(--accent-fg)', background:'var(--accent-bg)', padding:'0 6px', borderRadius:4, border:'1px solid var(--accent-line)' }}>ship</span>.
          </h1>
          <p style={{
            fontSize:14, color:'var(--fg-2)', lineHeight:1.5, marginTop:20,
            maxWidth:380, textWrap:'pretty',
          }}>
            Program · Project · Epic · Sprint · Story. The structured planning surface
            for PMs who still write code on weekends.
          </p>
        </div>

        {/* Stat strip */}
        <div style={{ position:'relative', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:0, marginBottom:32 }}>
          <Stat n="47" l="pts in flight" sub="Sprint 32"/>
          <Stat n="4" l="active epics" sub="auth & identity"/>
          <Stat n="7d" l="until sprint close" sub="May 31"/>
        </div>

        {/* Footer */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:14, color:'var(--fg-3)', fontSize:11 }}>
          <span className="mono">© kcw 2026</span>
          <span style={{ color:'var(--fg-4)' }}>·</span>
          <a href="#" style={{ color:'var(--fg-2)', textDecoration:'none' }}>changelog</a>
          <a href="#" style={{ color:'var(--fg-2)', textDecoration:'none' }}>status</a>
          <a href="#" style={{ color:'var(--fg-2)', textDecoration:'none' }}>docs</a>
          <span style={{ flex:1 }}/>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--done)' }}/>
            <span className="mono">all systems normal</span>
          </span>
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'48px', position:'relative',
      }}>
        {/* Workspace switcher (top-right) */}
        <div style={{
          position:'absolute', top:20, right:20,
          display:'flex', alignItems:'center', gap:8,
          fontSize:11.5, color:'var(--fg-3)',
        }}>
          <span>Not your workspace?</span>
          <button className="btn"><span className="mono" style={{ fontSize:11 }}>kcw.ops/switch</span></button>
        </div>

        <div style={{ width:380, maxWidth:'100%' }}>
          {/* Workspace card */}
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'10px 12px',
            background:'var(--bg-1)',
            border:'1px solid var(--border)',
            borderRadius:6,
            marginBottom:24,
          }}>
            <span style={{
              width:24, height:24, borderRadius:5,
              background:'linear-gradient(135deg, var(--accent), oklch(0.55 0.20 280))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-mono)', fontSize:11.5, fontWeight:700, color:'var(--accent-ink)',
            }}>k</span>
            <div style={{ display:'flex', flexDirection:'column', lineHeight:1.15, flex:1 }}>
              <span style={{ fontSize:12.5, fontWeight:600 }}>kcw · personal</span>
              <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)' }}>kcw.ops · 1 member</span>
            </div>
            <button className="btn-ghost" style={{ padding:3, color:'var(--fg-3)' }}><Icon name="chevD" size={12}/></button>
          </div>

          <h2 style={{
            fontSize:22, fontWeight:600, margin:0, marginBottom:6,
            letterSpacing:'-0.015em',
          }}>Sign in</h2>
          <p style={{ fontSize:13, color:'var(--fg-2)', margin:0, marginBottom:24 }}>
            Welcome back, K. Whitaker. Use a passkey or your IdP.
          </p>

          {/* Passkey primary */}
          <button style={{
            width:'100%', height:40,
            display:'flex', alignItems:'center', gap:10,
            padding:'0 14px',
            background:'var(--accent)', color:'var(--accent-ink)',
            borderRadius:6, fontWeight:600, fontSize:13,
            boxShadow:'0 1px 0 rgba(255,255,255,0.08) inset, 0 1px 2px rgba(0,0,0,0.3)',
          }}>
            <PasskeyIcon/>
            Continue with passkey
            <span style={{ flex:1 }}/>
            <span className="kbd" style={{ background:'rgba(0,0,0,0.18)', borderColor:'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.85)' }}>↵</span>
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:8, margin:'18px 0', color:'var(--fg-3)' }}>
            <span style={{ flex:1, height:1, background:'var(--border)' }}/>
            <span style={{ fontSize:11, fontFamily:'var(--font-mono)' }}>or use SSO</span>
            <span style={{ flex:1, height:1, background:'var(--border)' }}/>
          </div>

          {/* SSO */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <SsoButton glyph={<GoogleG/>}     label="Google"/>
            <SsoButton glyph={<MicrosoftG/>}  label="Microsoft"/>
          </div>
          <SsoButton glyph={<OktaG/>} label="Okta · kcw-prod" wide hint="default for this workspace"/>

          {/* Footer link */}
          <div style={{ marginTop:22, padding:'10px 12px', background:'var(--bg-1)', border:'1px dashed var(--border-1)', borderRadius:5, display:'flex', alignItems:'center', gap:10 }}>
            <Icon name="bug" size={14}/>
            <span style={{ fontSize:11.5, color:'var(--fg-2)' }}>Lost your device? <a href="#" style={{ color:'var(--fg-1)', textDecoration:'none', borderBottom:'1px dotted var(--fg-3)' }}>Use a recovery code</a></span>
          </div>

          <div style={{ marginTop:20, fontSize:11, color:'var(--fg-3)', display:'flex', alignItems:'center', gap:6 }}>
            <span>or</span>
            <a href="#" style={{ color:'var(--fg-1)', textDecoration:'none' }}>sign in with email & password</a>
            <span style={{ marginLeft:'auto' }} className="mono">requires MFA</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l, sub }) {
  return (
    <div style={{ padding:'2px 16px 2px 0', borderLeft:'1px solid var(--border)', paddingLeft:14 }}>
      <div className="mono" style={{ fontSize:26, fontWeight:600, color:'var(--fg)', letterSpacing:'-0.02em', lineHeight:1 }}>{n}</div>
      <div style={{ fontSize:11.5, color:'var(--fg-1)', marginTop:6 }}>{l}</div>
      <div className="mono" style={{ fontSize:10, color:'var(--fg-3)', marginTop:2 }}>{sub}</div>
    </div>
  );
}

function SsoButton({ glyph, label, wide, hint }) {
  return (
    <button style={{
      width:'100%', height:36,
      display:'flex', alignItems:'center', gap:10,
      padding:'0 12px',
      background:'var(--bg-1)', border:'1px solid var(--border-1)',
      borderRadius:5, fontSize:12.5, color:'var(--fg)',
      transition:'background .12s, border-color .12s',
    }}
      onMouseOver={e => { e.currentTarget.style.background='var(--bg-2)'; e.currentTarget.style.borderColor='var(--border-2)'; }}
      onMouseOut ={e => { e.currentTarget.style.background='var(--bg-1)'; e.currentTarget.style.borderColor='var(--border-1)'; }}>
      <span style={{ width:18, height:18, display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>{glyph}</span>
      <span style={{ fontWeight:500 }}>{label}</span>
      {wide && hint && <span style={{ flex:1, textAlign:'right', fontSize:10.5, color:'var(--fg-3)' }} className="mono">{hint}</span>}
    </button>
  );
}

// Tiny brand glyphs — abstract approximations, NOT recreations of real logos.
// Production should use react-icons / brand-icons. These are placeholders.
function GoogleG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 4v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function MicrosoftG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5.5" height="5.5" fill="currentColor" opacity="0.85"/>
      <rect x="7.5" y="1" width="5.5" height="5.5" fill="currentColor" opacity="0.55"/>
      <rect x="1" y="7.5" width="5.5" height="5.5" fill="currentColor" opacity="0.55"/>
      <rect x="7.5" y="7.5" width="5.5" height="5.5" fill="currentColor" opacity="0.85"/>
    </svg>
  );
}
function OktaG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2.2"/>
    </svg>
  );
}
function PasskeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5"/>
      <path d="M9 11.5c-3 0-5 2-5 5h7"/>
      <path d="M17 11l4 4-2 2-1-1-1 1-1-1-1 1"/>
      <circle cx="16.5" cy="10.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}

Object.assign(window, { LoginPage });
