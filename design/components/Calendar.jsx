// Calendar / Gantt view — Epics and Sprints as horizontal bars across weeks.
// Project-level. Today is May 20, 2026.

function CalendarView() {
  // 8-week window starting May 04, 2026
  const weeks = [
    { label: 'W19', range: 'May 04 – 10' },
    { label: 'W20', range: 'May 11 – 17' },
    { label: 'W21', range: 'May 18 – 24' },
    { label: 'W22', range: 'May 25 – 31' },
    { label: 'W23', range: 'Jun 01 – 07' },
    { label: 'W24', range: 'Jun 08 – 14' },
    { label: 'W25', range: 'Jun 15 – 21' },
    { label: 'W26', range: 'Jun 22 – 28' },
  ];
  const TOTAL_DAYS = weeks.length * 7;
  const dayPct = (d) => (d / TOTAL_DAYS) * 100;

  // Bars described by start day & end day (0 = May 04)
  const epicBars = [
    { id: 'EP-12', title: 'Passkey-first sign-in',    color: '#7c5cff', start: 0,  end: 35, progress: 0.62, sprints: ['sp-31','sp-32','sp-33'] },
    { id: 'EP-14', title: 'Org / workspace switcher', color: '#4cc9e7', start: 14, end: 42, progress: 0.31, sprints: ['sp-32','sp-33'] },
    { id: 'EP-17', title: 'SCIM + SSO hardening',     color: '#f0b34a', start: 28, end: 56, progress: 0.08, sprints: ['sp-33','sp-34'] },
    { id: 'EP-19', title: 'Session telemetry',        color: '#4ade80', start: 4,  end: 28, progress: 0.88, sprints: ['sp-31','sp-32'] },
  ];

  const sprintBars = [
    { id: 'sp-31', label: 'Sprint 31', start:0,  end:14, state:'completed', pts: '34 / 36' },
    { id: 'sp-32', label: 'Sprint 32', start:14, end:28, state:'active',    pts: '19 / 47' },
    { id: 'sp-33', label: 'Sprint 33', start:28, end:42, state:'planned',   pts: '— / 40 (est.)' },
    { id: 'sp-34', label: 'Sprint 34', start:42, end:56, state:'planned',   pts: '— / 42 (est.)' },
  ];

  // Today: May 20 → 16 days from May 04
  const todayDay = 16;

  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateRows:'40px 1fr', background:'var(--bg)' }}>
      {/* Sub-toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 16px', borderBottom:'1px solid var(--border)', fontSize:12 }}>
        <div className="seg">
          <button>Day</button>
          <button>Week</button>
          <button className="active">Sprint</button>
          <button>Quarter</button>
        </div>
        <FilterChip label="Show" value="Epics + Sprints"/>
        <FilterChip label="Project" value="Auth & Identity"/>
        <span style={{ flex:1 }}/>
        <span className="mono" style={{ fontSize:11, color:'var(--fg-3)' }}>May 04 – Jun 28 · 2026</span>
        <button className="btn-ghost" style={{ padding:'3px 6px' }}><Icon name="chevL" size={12}/></button>
        <button className="btn-ghost" style={{ padding:'3px 6px' }}>Today</button>
        <button className="btn-ghost" style={{ padding:'3px 6px' }}><Icon name="chevR" size={12}/></button>
      </div>

      {/* Gantt grid */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'220px 1fr',
        overflow:'auto',
        position:'relative',
      }}>
        {/* Left column header */}
        <div style={{
          position:'sticky', top:0, left:0, zIndex:3,
          background:'var(--bg)',
          borderBottom:'1px solid var(--border)',
          borderRight:'1px solid var(--border)',
          padding:'10px 12px',
          fontSize:10.5, fontWeight:600, color:'var(--fg-3)',
          textTransform:'uppercase', letterSpacing:'0.06em',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <span>Track</span>
          <span style={{ display:'flex', gap:6 }}>
            <span className="mono" style={{ fontWeight:400, color:'var(--fg-4)' }}>{epicBars.length} epics</span>
          </span>
        </div>

        {/* Week header */}
        <div style={{
          position:'sticky', top:0, zIndex:2,
          display:'grid', gridTemplateColumns:`repeat(${weeks.length}, 1fr)`,
          background:'var(--bg)',
          borderBottom:'1px solid var(--border)',
        }}>
          {weeks.map((w, i) => (
            <div key={i} style={{
              padding:'6px 10px',
              borderRight: i === weeks.length-1 ? 'none' : '1px solid var(--border)',
              fontSize:10.5,
              color: i === 2 || i === 3 ? 'var(--fg-1)' : 'var(--fg-3)',
            }}>
              <div style={{ fontWeight:600, letterSpacing:'-0.005em' }}>{w.range}</div>
              <div className="mono" style={{ fontSize:10, color:'var(--fg-4)' }}>{w.label}</div>
            </div>
          ))}
        </div>

        {/* Sprint row (top) */}
        <RowLabel label="Sprints" tag={`${sprintBars.length}`}/>
        <RowBars weeks={weeks} todayDay={todayDay} dayPct={dayPct}>
          {sprintBars.map(b => <SprintBar key={b.id} b={b} dayPct={dayPct}/>)}
        </RowBars>

        {/* Spacer divider */}
        <div style={{ gridColumn:'1 / -1', height:1, background:'var(--border)' }}/>

        {/* Epic rows */}
        {epicBars.map((b, i) => (
          <React.Fragment key={b.id}>
            <RowLabel epic={b}/>
            <RowBars weeks={weeks} todayDay={todayDay} dayPct={dayPct} isLast={i===epicBars.length-1}>
              <EpicBar b={b} dayPct={dayPct}/>
            </RowBars>
          </React.Fragment>
        ))}

        {/* Bottom milestone row */}
        <RowLabel label="Releases" tag="2"/>
        <RowBars weeks={weeks} todayDay={todayDay} dayPct={dayPct} isLast>
          <Milestone day={28} label="v3.0 beta" color="var(--accent)"/>
          <Milestone day={56} label="v3.0 GA"   color="var(--done)"/>
        </RowBars>
      </div>
    </div>
  );
}

function RowLabel({ label, tag, epic }) {
  return (
    <div style={{
      position:'sticky', left:0, zIndex:1,
      background:'var(--bg)',
      borderRight:'1px solid var(--border)',
      borderBottom:'1px solid var(--border)',
      padding:'10px 12px',
      display:'flex', alignItems:'center', gap:8,
      minHeight: 44,
    }}>
      {epic ? (
        <>
          <span style={{ width:3, height:18, borderRadius:2, background: epic.color, flex:'0 0 auto' }}/>
          <div style={{ display:'flex', flexDirection:'column', minWidth:0, flex:1 }}>
            <span style={{ fontSize:12.5, fontWeight:500, color:'var(--fg)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{epic.title}</span>
            <span className="mono" style={{ fontSize:10, color:'var(--fg-3)' }}>{epic.id} · {Math.round(epic.progress*100)}%</span>
          </div>
        </>
      ) : (
        <>
          <span style={{ fontSize:10.5, fontWeight:600, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
          <span style={{ flex:1 }}/>
          {tag && <span className="mono" style={{ fontSize:10, color:'var(--fg-4)' }}>{tag}</span>}
        </>
      )}
    </div>
  );
}

function RowBars({ children, weeks, todayDay, dayPct, isLast }) {
  return (
    <div style={{
      position:'relative',
      display:'grid', gridTemplateColumns:`repeat(${weeks.length}, 1fr)`,
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      minHeight: 44,
    }}>
      {/* Week column dividers */}
      {weeks.map((_, i) => (
        <div key={i} style={{
          borderRight: i === weeks.length-1 ? 'none' : '1px solid var(--border)',
          background: i === 2 ? 'var(--hover)' : 'transparent',
        }}/>
      ))}
      {/* Today line */}
      <div style={{
        position:'absolute', top:0, bottom:0,
        left: `${dayPct(todayDay)}%`,
        width:1,
        background:'var(--accent)',
        boxShadow:'0 0 8px var(--accent)',
        zIndex:2,
      }}/>
      {/* Bars overlay */}
      <div style={{ position:'absolute', inset:'8px 0', pointerEvents:'none' }}>
        {children}
      </div>
    </div>
  );
}

function EpicBar({ b, dayPct }) {
  const left = dayPct(b.start);
  const width = dayPct(b.end - b.start);
  return (
    <div style={{
      position:'absolute',
      left:`${left}%`, width:`${width}%`,
      top:4, bottom:4,
      pointerEvents:'auto',
    }}>
      <div style={{
        position:'absolute', inset:0,
        background: `${b.color}20`,
        border:`1px solid ${b.color}55`,
        borderRadius:5,
        overflow:'hidden',
      }}>
        {/* Progress fill */}
        <div style={{
          position:'absolute', left:0, top:0, bottom:0,
          width:`${b.progress*100}%`,
          background:`${b.color}55`,
          borderRight:`1px solid ${b.color}`,
        }}/>
        {/* Title */}
        <div style={{
          position:'relative',
          padding:'4px 8px',
          display:'flex', alignItems:'center', gap:6,
          height:'100%',
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:b.color, flex:'0 0 auto' }}/>
          <span className="mono" style={{ fontSize:10, color:'var(--fg-2)' }}>{b.id}</span>
          <span style={{ fontSize:11.5, fontWeight:500, color:'var(--fg)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {b.title}
          </span>
        </div>
      </div>
    </div>
  );
}

function SprintBar({ b, dayPct }) {
  const left = dayPct(b.start);
  const width = dayPct(b.end - b.start);
  const isActive = b.state === 'active';
  const isCompleted = b.state === 'completed';
  const bg = isActive ? 'var(--accent-bg)' : isCompleted ? 'var(--hover)' : 'transparent';
  const border = isActive ? 'var(--accent-line)' : isCompleted ? 'var(--border-1)' : 'var(--border)';
  return (
    <div style={{
      position:'absolute', left:`${left}%`, width:`${width}%`,
      top:6, bottom:6,
      border:`1px ${isCompleted?'solid':'dashed'} ${border}`,
      background:bg,
      borderRadius:4,
      padding:'3px 8px',
      display:'flex', alignItems:'center', gap:6,
      pointerEvents:'auto',
    }}>
      {isActive && <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)' }}/>}
      <span style={{ fontSize:11.5, fontWeight: isActive?600:500, color: isActive ? 'var(--accent-fg)' : isCompleted ? 'var(--fg-2)' : 'var(--fg-3)' }}>
        {b.label}
      </span>
      <span className="mono" style={{ fontSize:10, color:'var(--fg-3)', marginLeft:'auto' }}>{b.pts}</span>
    </div>
  );
}

function Milestone({ day, label, color }) {
  return (
    <div style={{
      position:'absolute',
      left:`calc(${(day/56)*100}% - 8px)`,
      top:'50%', transform:'translateY(-50%)',
      display:'flex', alignItems:'center', gap:6,
      pointerEvents:'auto',
    }}>
      <span style={{
        width:14, height:14, transform:'rotate(45deg)',
        background:color, borderRadius:2,
      }}/>
      <span style={{ fontSize:11.5, fontWeight:500, color:'var(--fg-1)' }}>{label}</span>
    </div>
  );
}

Object.assign(window, { CalendarView });
