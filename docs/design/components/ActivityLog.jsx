// Activity log — workspace-wide feed of every state change, comment, push.
// Grouped by day with a small activity sparkline in the header.

function ActivityLog() {
  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateRows:'40px 36px 1fr', background:'var(--bg)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'0 16px', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontSize:14, fontWeight:600 }}>Activity</span>
        <span className="mono" style={{ fontSize:11.5, color:'var(--fg-3)' }}>62 events · last 14 days</span>
        <span style={{ width:1, height:18, background:'var(--border)' }}/>
        <Sparkline/>
        <span style={{ flex:1 }}/>
        <button className="btn"><Icon name="filter" size={12}/>Filter</button>
        <button className="btn"><Icon name="arrow" size={12}/>Export</button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0 16px', borderBottom:'1px solid var(--border)' }}>
        <FilterChip label="Type" value="All events" badge="6"/>
        <FilterChip label="Actor" value="Anyone"/>
        <FilterChip label="Project" value="Auth & Identity"/>
        <FilterChip label="Severity" value="≥ info"/>
        <span style={{ width:1, height:18, background:'var(--border)' }}/>
        <TypeKey color="var(--accent)"   label="comment" />
        <TypeKey color="var(--progress)" label="status" />
        <TypeKey color="var(--review)"   label="estimate" />
        <TypeKey color="var(--done)"     label="merge" />
        <TypeKey color="var(--blocked)"  label="block" />
        <TypeKey color="var(--fg-2)"     label="meta" />
        <span style={{ flex:1 }}/>
        <span className="mono" style={{ fontSize:11, color:'var(--fg-3)' }}>realtime · paused</span>
      </div>

      <div style={{ overflow:'auto', padding:'4px 0 32px' }}>
        <DayGroup label="Today" sub="Wed · May 20" count="11">
          <LogRow t="2 min ago"   who="me" type="status"   target="AUTH-247" verb="moved" detail={<><K>To do</K> → <K>In progress</K></>} />
          <LogRow t="18 min ago"  who="jt" type="comment"  target="AUTH-241" verb="commented" detail="“fixed the rate-limit edge-case — re-running the suite”" />
          <LogRow t="34 min ago"  who="me" type="block"    target="AUTH-247" verb="flagged" detail={<>blocked by <span className="mono" style={{ color:'var(--fg)' }}>AUTH-244</span></>} severity="warn"/>
          <LogRow t="1h ago"      who="mr" type="merge"    target="AUTH-238" verb="merged"  detail={<><span className="mono">auth/feat/recovery-rate-limit</span> → main · <span className="mono" style={{ color:'var(--done)' }}>+218 / −24</span></>} />
          <LogRow t="1h ago"      who="np" type="estimate" target="AUTH-265" verb="estimated" detail={<><K>—</K> → <K>13 pts</K></>} />
          <LogRow t="2h ago"      who="as" type="status"   target="AUTH-244" verb="moved" detail={<><K>To do</K> → <K>In progress</K></>} />
          <LogRow t="2h ago"      who="lc" type="comment"  target="AUTH-252" verb="commented" detail="“empty-state copy proposal in figma, link 👇”" />
          <LogRow t="3h ago"      who="me" type="meta"     target="EP-12"    verb="updated"  detail="rolled progress 58% → 62%" />
          <LogRow t="3h ago"      who="jt" type="status"   target="AUTH-235" verb="moved" detail={<><K>In review</K> → <K>Done</K></>} />
          <LogRow t="4h ago"      who="np" type="merge"    target="AUTH-258" verb="opened PR" detail={<><span className="mono">draft</span> · 3 reviewers requested</>} />
          <LogRow t="5h ago"      who="me" type="meta"     target="Sprint 33" verb="created" detail="planning · goal: SSO hardening / IdP coverage" />
        </DayGroup>

        <DayGroup label="Yesterday" sub="Tue · May 19" count="18">
          <LogRow t="22:14" who="mr" type="comment" target="AUTH-249" verb="commented" detail="“draft schema attached — open Qs on attribute mapping”"/>
          <LogRow t="19:02" who="me" type="status"  target="AUTH-233" verb="moved" detail={<><K>In review</K> → <K>Done</K></>}/>
          <LogRow t="18:33" who="lc" type="meta"    target="AUTH-261" verb="assigned" detail={<>to <span style={{ color:'var(--fg)' }}>L. Chen</span></>}/>
          <LogRow t="16:01" who="jt" type="merge"   target="AUTH-241" verb="pushed" detail={<><span className="mono">3 commits</span> · auth/feat/passkey-errors</>}/>
          <LogRow t="14:48" who="np" type="block"   target="AUTH-244" verb="cleared" detail="dependency landed; unblocking" severity="ok"/>
          <LogRow t="12:20" who="as" type="comment" target="AUTH-244" verb="commented" detail="“cmd-K shortcut wired up, just polishing the modifier hint”"/>
          <LogRow t="09:55" who="me" type="estimate" target="AUTH-247" verb="estimated" detail={<><K>5 pts</K> → <K>8 pts</K> · re-estimated after spike</>}/>
        </DayGroup>

        <DayGroup label="Mon · May 18" sub="Sprint 32 began" count="14" pin>
          <LogRow t="10:30" who="me" type="meta"    target="Sprint 32"  verb="started" detail={<>moved <span className="mono">12 stories · 47 pts</span> into active</>} severity="event"/>
          <LogRow t="10:18" who="me" type="meta"    target="Sprint 31"  verb="closed"  detail={<>34 / 36 pts complete · <span style={{ color:'var(--done)' }}>94% sell-through</span></>} severity="ok"/>
          <LogRow t="09:42" who="jt" type="comment" target="AUTH-251"   verb="commented" detail="“rebased on main, tests are green again”"/>
        </DayGroup>
      </div>
    </div>
  );
}

const K = ({ children }) => (
  <span style={{
    fontFamily:'var(--font-mono)', fontSize:11,
    padding:'1px 5px', borderRadius:2,
    background:'var(--bg-2)', color:'var(--fg-1)',
    border:'1px solid var(--border)',
  }}>{children}</span>
);

function TypeKey({ color, label }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'var(--fg-2)' }}>
      <span style={{ width:7, height:7, borderRadius:1, background:color }}/>
      {label}
    </span>
  );
}

function Sparkline() {
  // 14-day activity volume
  const vals = [3, 5, 4, 11, 9, 6, 2, 1, 7, 8, 12, 14, 18, 11];
  const max = Math.max(...vals);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:18, padding:'0 2px' }}>
      {vals.map((v, i) => (
        <span key={i} style={{
          width:3,
          height: `${(v/max)*100}%`,
          background: i === vals.length-1 ? 'var(--accent)' : 'var(--fg-3)',
          opacity: i === vals.length-1 ? 1 : (0.3 + 0.5 * (v/max)),
          borderRadius:1,
        }}/>
      ))}
    </div>
  );
}

function DayGroup({ label, sub, count, pin, children }) {
  return (
    <section style={{ marginBottom:8 }}>
      <header style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'10px 16px 6px',
        position:'sticky', top:0, background:'var(--bg)', zIndex:1,
      }}>
        <span style={{ fontSize:11, fontWeight:600, color:'var(--fg)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
        <span style={{ fontSize:11, color:'var(--fg-3)' }}>·</span>
        <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)' }}>{sub}</span>
        {pin && <span style={{
          fontSize:9, fontWeight:600, padding:'1px 5px',
          background:'var(--accent-bg)', color:'var(--accent-fg)',
          borderRadius:2, textTransform:'uppercase', letterSpacing:'0.06em',
          border:'1px solid var(--accent-line)',
        }}>milestone</span>}
        <span style={{ flex:1, height:1, background:'var(--border)' }}/>
        <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)' }}>{count} events</span>
      </header>
      <div style={{ padding:'0 16px' }}>{children}</div>
    </section>
  );
}

const TYPE_COLORS = {
  comment:  'var(--accent)',
  status:   'var(--progress)',
  estimate: 'var(--review)',
  merge:    'var(--done)',
  block:    'var(--blocked)',
  meta:     'var(--fg-2)',
};

function LogRow({ t, who, type, target, verb, detail, severity }) {
  const p = PEOPLE.find(x => x.id === who);
  const color = TYPE_COLORS[type] || 'var(--fg-2)';
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'8px 22px 1fr 80px',
      gap:10,
      alignItems:'start',
      padding:'6px 0',
      position:'relative',
    }}>
      {/* timeline gutter */}
      <div style={{
        position:'relative',
        height:'100%',
      }}>
        <span style={{
          position:'absolute', top:7, left:2,
          width:6, height:6, borderRadius:'50%',
          background: severity==='warn' ? 'var(--blocked)' : severity==='ok' ? 'var(--done)' : color,
          boxShadow: severity==='event' ? `0 0 0 3px ${color}33` : 'none',
        }}/>
        <span style={{
          position:'absolute', top:14, bottom:-8, left:4,
          width:1, background:'var(--border)',
        }}/>
      </div>
      <Avatar id={who}/>
      <div style={{ lineHeight:1.4, fontSize:12.5, color:'var(--fg-1)', minWidth:0 }}>
        <span style={{ color:'var(--fg)', fontWeight:500 }}>{p.name}</span>
        {' '}<span style={{ color:'var(--fg-2)' }}>{verb}</span>{' '}
        <span className="mono" style={{ color:'var(--fg)', fontSize:11.5 }}>{target}</span>
        <div style={{ color:'var(--fg-2)', fontSize:12, marginTop:1 }}>{detail}</div>
      </div>
      <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)', textAlign:'right', paddingTop:2 }}>{t}</span>
    </div>
  );
}

Object.assign(window, { ActivityLog });
