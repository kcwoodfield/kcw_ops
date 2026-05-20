// Story detail drawer. Shows full fields including AC and story-point picker.
// Rendered as a freestanding drawer for the artboard.

function StoryDetail() {
  const s = STORIES.find(x => x.id === 'AUTH-247'); // The "blocked" Redis migration
  const epic = EPICS.find(e => e.id === s.epic);
  const fibSeries = [1, 2, 3, 5, 8, 13, 21];

  return (
    <div className="kcw" style={{
      width:'100%', height:'100%',
      background:'var(--panel)',
      borderLeft:'1px solid var(--border)',
      display:'flex', flexDirection:'column',
      overflow:'hidden',
    }}>
      {/* Drawer header */}
      <header style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'10px 14px',
        borderBottom:'1px solid var(--border)',
        flex:'0 0 auto',
      }}>
        <StoryId id={s.id}/>
        <span style={{ color:'var(--fg-4)' }}>·</span>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'var(--fg-2)' }}>
          <span style={{ width:6, height:6, borderRadius:1, background:epic.color }}/>
          {epic.title}
        </span>
        <span style={{ flex:1 }}/>
        <button className="btn-ghost" style={{ padding:5 }}><Icon name="link" size={13}/></button>
        <button className="btn-ghost" style={{ padding:5 }}><Icon name="paperclip" size={13}/></button>
        <button className="btn-ghost" style={{ padding:5 }}><Icon name="more" size={13}/></button>
        <span style={{ width:1, height:14, background:'var(--border)' }}/>
        <button className="btn-ghost" style={{ padding:'4px 6px', fontSize:11.5 }}>
          <Icon name="chevR" size={11}/> Close <span className="kbd" style={{ marginLeft:4 }}>Esc</span>
        </button>
      </header>

      {/* Body — split: main column + properties rail */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 240px', flex:1, minHeight:0 }}>
        {/* Main column */}
        <div style={{ padding:'18px 22px', overflow:'auto', borderRight:'1px solid var(--border)' }}>
          {/* Title row */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:14 }}>
            <span style={{ marginTop:6 }}><StatusDot s="progress" size={12}/></span>
            <h2 style={{
              fontSize:22, fontWeight:600, lineHeight:1.18, margin:0,
              letterSpacing:'-0.015em', color:'var(--fg)',
              textWrap:'balance',
            }}>{s.title}</h2>
          </div>

          {/* Status row */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:18, flexWrap:'wrap' }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'3px 8px',
              background:'rgba(76,201,231,0.12)',
              border:'1px solid rgba(76,201,231,0.3)',
              borderRadius:4,
              fontSize:11.5, fontWeight:500,
              color:'#7ddcec',
            }}>
              <StatusDot s="progress" size={9}/> In progress
              <Icon name="chevD" size={10}/>
            </span>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:5,
              padding:'3px 8px',
              background:'rgba(248,113,113,0.10)',
              border:'1px solid rgba(248,113,113,0.3)',
              borderRadius:4,
              fontSize:11.5, fontWeight:600,
              color:'var(--blocked)',
              textTransform:'uppercase',
              letterSpacing:'0.04em',
            }}>
              ⚠ Blocked by AUTH-244
            </span>
          </div>

          {/* Description */}
          <Section title="Description">
            <p style={{ fontSize:13, color:'var(--fg-1)', lineHeight:1.55, margin:0 }}>
              The single-node Redis instance backing session lookups has begun pushing P99 over 80&nbsp;ms during
              peak. We need to move to a 3-node Redis Cluster behind a TLS-fronted proxy with deterministic
              key hashing, while preserving zero-downtime cutover.
            </p>
            <p style={{ fontSize:13, color:'var(--fg-1)', lineHeight:1.55, marginTop:10, marginBottom:0 }}>
              See <a href="#" style={{ color:'var(--accent-fg)' }}>RFC&nbsp;041</a> for the topology and the
              draft cutover runbook. Coordinate with infra on the &nbsp;
              <span className="mono" style={{ padding:'1px 4px', background:'var(--bg-2)', borderRadius:2 }}>auth-prod-eu</span>
              &nbsp;rollout window.
            </p>
          </Section>

          <Section title="Acceptance criteria" trail="3 of 5 met">
            <ACItem checked label="Cluster reads return identical results to single-node within 5ms p99 in shadow mode (24h)"/>
            <ACItem checked label="TLS terminated at proxy; clients pin CA; no plaintext sessions in transit"/>
            <ACItem checked label="Failover drill: kill primary, secondary promotes in < 8s with zero session loss"/>
            <ACItem      label="Audit log entry emitted for every cluster topology change"/>
            <ACItem      label="Runbook approved by infra on-call AND security; linked from incident SOP"/>
          </Section>

          <Section title="Activity" trail="4">
            <Activity who="jt" when="2h ago" body={<>moved status <kbd>To do</kbd> → <kbd>In progress</kbd></>}/>
            <Activity who="me" when="6h ago" body={<>linked blocker <span className="mono" style={{ color:'var(--fg)' }}>AUTH-244</span></>}/>
            <Activity who="mr" when="yesterday" body={<>increased estimate <span className="mono">5</span> → <span className="mono">8</span> pts</>}/>
            <Activity who="me" when="3d ago" body={<>added to <span className="mono" style={{ color:'var(--fg)' }}>Sprint 32</span></>}/>
          </Section>

          {/* Composer */}
          <div style={{
            marginTop:18,
            background:'var(--bg-1)',
            border:'1px solid var(--border)',
            borderRadius:6,
            padding:'8px 10px',
            display:'flex', alignItems:'center', gap:8,
          }}>
            <Avatar id="me" size={20}/>
            <span style={{ flex:1, color:'var(--fg-3)', fontSize:12.5 }}>Leave a comment… <span style={{ marginLeft:6 }}>Use <span className="kbd">/</span> for commands</span></span>
            <button className="btn-ghost" style={{ padding:4 }}><Icon name="paperclip" size={12}/></button>
            <button className="btn btn-primary" style={{ height:22, padding:'0 8px', fontSize:11.5 }}>Comment</button>
          </div>
        </div>

        {/* Properties rail */}
        <aside style={{ overflow:'auto', padding:'14px 14px 24px' }}>
          <Prop label="Status">
            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
              <StatusDot s="progress" size={9}/> <span style={{ fontSize:12.5 }}>In progress</span>
            </span>
          </Prop>
          <Prop label="Assignee">
            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Avatar id={s.assignee}/> <span style={{ fontSize:12.5 }}>{PEOPLE.find(p=>p.id===s.assignee).name}</span>
            </span>
          </Prop>
          <Prop label="Priority">
            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
              <PriorityBars p={0}/> <span style={{ fontSize:12.5, color:'var(--p0)' }}>Urgent</span>
            </span>
          </Prop>
          <Prop label="Story points">
            <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
              {fibSeries.map(n => (
                <button key={n}
                  style={{
                    width:26, height:24, borderRadius:4,
                    background: n === s.pts ? 'var(--accent)' : 'var(--bg-2)',
                    color: n === s.pts ? 'var(--accent-ink)' : 'var(--fg-1)',
                    fontFamily:'var(--font-mono)',
                    fontSize:11.5, fontWeight:600,
                    border: '1px solid',
                    borderColor: n === s.pts ? 'transparent' : 'var(--border-1)',
                  }}>{n}</button>
              ))}
            </div>
            <div className="mono" style={{ fontSize:10.5, color:'var(--fg-3)', marginTop:6 }}>Fibonacci · last estimated 4d ago</div>
          </Prop>
          <Prop label="Sprint">
            <span style={{
              display:'inline-flex', alignItems:'center', gap:5,
              padding:'2px 8px',
              background:'var(--accent-bg)',
              border:'1px solid var(--accent-line)',
              borderRadius:3,
              fontSize:11.5,
              color:'var(--accent-fg)',
            }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)' }}/>
              <span className="mono">Sprint 32</span>
              <span style={{ color:'var(--fg-3)' }}>· active</span>
            </span>
          </Prop>
          <Prop label="Epic">
            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:6, height:6, borderRadius:1, background: epic.color }}/>
              <span style={{ fontSize:12.5 }}>{epic.title}</span>
            </span>
          </Prop>
          <Prop label="Labels">
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {s.labels.map(l => <Label key={l} name={l}/>)}
              <button style={{
                fontSize:10.5, padding:'1px 6px', borderRadius:2,
                border:'1px dashed var(--border-1)',
                color:'var(--fg-3)',
              }}>+ Add</button>
            </div>
          </Prop>
          <Prop label="Due date">
            <span style={{ fontSize:12.5 }}>May 26, 2026</span>
            <div className="mono" style={{ fontSize:10.5, color:'var(--review)', marginTop:2 }}>6 days · tight</div>
          </Prop>
          <Prop label="Links">
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              <LinkRow icon="branch" text="auth/feat/redis-cluster-cutover" hint="3 commits"/>
              <LinkRow icon="link"   text="RFC 041 · Redis topology" hint="notion"/>
              <LinkRow icon="bug"    text="INC-318 · session p99 spike" hint="post-mortem"/>
            </div>
          </Prop>
          <Prop label="Subtasks" trail="2/4">
            <SubRow done label="Provision 3-node cluster in stg"/>
            <SubRow done label="Shadow-read parity job"/>
            <SubRow      label="Cutover dry-run"/>
            <SubRow      label="Decom single-node"/>
          </Prop>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, trail, children }) {
  return (
    <section style={{ marginTop:24 }}>
      <header style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:10.5, fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{title}</span>
        {trail && <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)' }}>· {trail}</span>}
        <span style={{ flex:1, height:1, background:'var(--border)' }}/>
      </header>
      {children}
    </section>
  );
}

function ACItem({ checked, label }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'4px 0', fontSize:13, lineHeight:1.45 }}>
      <span style={{
        width:14, height:14, borderRadius:3,
        background: checked ? 'var(--done)' : 'transparent',
        border: checked ? '1px solid var(--done)' : '1px solid var(--border-2)',
        flex:'0 0 auto', marginTop:2,
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        color:'#0a0a0d',
      }}>
        {checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <span style={{
        color: checked ? 'var(--fg-2)' : 'var(--fg)',
        textDecoration: checked ? 'line-through' : 'none',
        textDecorationColor: checked ? 'var(--fg-4)' : 'none',
      }}>{label}</span>
    </div>
  );
}

function Activity({ who, when, body }) {
  const p = PEOPLE.find(x => x.id === who);
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'5px 0', fontSize:12.5, color:'var(--fg-1)' }}>
      <Avatar id={who}/>
      <div style={{ lineHeight:1.45 }}>
        <span style={{ color:'var(--fg)', fontWeight:500 }}>{p.name}</span>
        <span style={{ color:'var(--fg-2)' }}> {body}</span>
        <span className="mono" style={{ marginLeft:6, fontSize:10.5, color:'var(--fg-3)' }}>{when}</span>
      </div>
    </div>
  );
}

function Prop({ label, trail, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <span style={{ fontSize:10.5, fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
        {trail && <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)' }}>{trail}</span>}
      </div>
      {children}
    </div>
  );
}

function LinkRow({ icon, text, hint }) {
  return (
    <a href="#" style={{
      display:'flex', alignItems:'center', gap:7,
      fontSize:12, color:'var(--fg-1)',
      padding:'3px 6px', borderRadius:3,
      textDecoration:'none',
    }}
      onMouseOver={e => e.currentTarget.style.background='var(--hover)'}
      onMouseOut ={e => e.currentTarget.style.background='transparent'}>
      <Icon name={icon} size={12}/>
      <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} className="mono">{text}</span>
      <span style={{ fontSize:10, color:'var(--fg-3)' }}>{hint}</span>
    </a>
  );
}

function SubRow({ done, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, padding:'3px 0', color: done ? 'var(--fg-2)':'var(--fg)' }}>
      <span style={{
        width:12, height:12, borderRadius:3,
        background: done ? 'var(--done)' : 'transparent',
        border: done ? 'none' : '1px solid var(--border-2)',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        color:'#0a0a0d',
      }}>
        {done && <svg width="8" height="8" viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <span style={{ textDecoration: done?'line-through':'none', textDecorationColor:'var(--fg-4)' }}>{label}</span>
    </div>
  );
}

Object.assign(window, { StoryDetail });
