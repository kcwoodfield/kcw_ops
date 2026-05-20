// Sprint Planning — split view. Backlog (left, scrollable) → Sprint 33 (right).
// Header shows sprint goal + capacity meter; right side shows committed stories.

function SprintPlanning() {
  const backlog = STORIES.filter(s => !s.sprint).slice(0, 8);
  const planned = [
    STORIES.find(s => s.id === 'AUTH-249'),
    STORIES.find(s => s.id === 'AUTH-258'),
    STORIES.find(s => s.id === 'AUTH-256'),
    STORIES.find(s => s.id === 'AUTH-261'),
  ].filter(Boolean);

  const capacity = 42;
  const committed = planned.reduce((a, s) => a + s.pts, 0) + 8; // +8 stretch
  const velocity = 38;

  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateRows: '50px 1fr', background: 'var(--bg)' }}>
      {/* Planning header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Sprint planning</span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>Sprint 33 → Sprint 34</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>Jun 01 – Jun 14 · 10 working days</div>
        </div>
        <div style={{ width: 1, height: 30, background: 'var(--border)' }}/>
        <CapacityMeter committed={committed} capacity={capacity} velocity={velocity}/>

        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {PEOPLE.slice(0,5).map(p => <Avatar key={p.id} id={p.id} size={22}/>)}
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginLeft: 4 }}>5 contributors</span>
        </div>
        <button className="btn"><Icon name="settings" size={12}/>Capacity</button>
        <button className="btn btn-primary"><Icon name="arrow" size={12}/>Start sprint</button>
      </div>

      {/* Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }}>
        <PlanningPane title="Backlog" sub={`${backlog.length} unassigned · 47 pts`} stories={backlog} side="left"/>
        <PlanningPane title="Sprint 33 · planned" sub={`${planned.length} stories · ${committed} pts committed`} stories={planned} side="right" highlight/>
      </div>
    </div>
  );
}

function CapacityMeter({ committed, capacity, velocity }) {
  const pct = Math.min(committed / capacity, 1.1);
  const over = committed > capacity;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 280 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: over ? 'var(--blocked)' : 'var(--fg)' }}>{committed}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>/ {capacity} pts capacity</span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>velocity Ø {velocity}</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--bg-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: '0 auto 0 0',
          width: `${Math.min(pct*100, 100)}%`,
          background: over ? 'var(--blocked)' : 'linear-gradient(90deg, var(--accent), oklch(0.62 0.20 296))',
        }}/>
        {/* Velocity marker */}
        <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${(velocity/capacity)*100}%`, width: 1, background: 'var(--fg-2)' }}/>
      </div>
    </div>
  );
}

function PlanningPane({ title, sub, stories, side, highlight }) {
  return (
    <section style={{
      borderRight: side === 'left' ? '1px solid var(--border)' : 'none',
      display: 'flex', flexDirection: 'column',
      background: highlight ? 'linear-gradient(180deg, var(--accent-tint) 0%, transparent 240px)' : 'transparent',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
      }}>
        {highlight && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>}
        <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{sub}</span>
        <span style={{ flex: 1 }}/>
        {side === 'left' && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn-ghost" style={{ padding: '3px 6px', fontSize: 11.5 }}><Icon name="filter" size={11}/></button>
            <button className="btn-ghost" style={{ padding: '3px 6px', fontSize: 11.5 }}>
              <span className="mono" style={{ fontSize: 10.5 }}>Sort</span>
              <Icon name="chevD" size={10}/>
            </button>
          </div>
        )}
        {side === 'right' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 6px', height: 18,
            background: 'var(--bg-2)', borderRadius: 3, fontSize: 11,
            color: 'var(--fg-2)',
          }}>
            <span>Goal</span>
            <span style={{ color: 'var(--fg)' }}>SSO hardening / IdP coverage</span>
          </div>
        )}
      </div>

      <div style={{
        flex: 1, overflow: 'auto',
        padding: '8px 14px 14px',
      }}>
        {stories.map((s, i) => (
          <PlanningRow key={s.id} s={s} dragging={side==='left' && i === 2} pinned={side==='right' && i === 0}/>
        ))}
        {side === 'right' && (
          <div style={{
            marginTop: 8,
            height: 38,
            border: '1.5px dashed var(--accent-line)',
            borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-fg)',
            fontSize: 11.5,
            background: 'var(--accent-tint)',
          }}>
            Drop story here to commit
          </div>
        )}
      </div>
    </section>
  );
}

function PlanningRow({ s, dragging, pinned }) {
  const epic = EPICS.find(e => e.id === s.epic);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '14px 70px 1fr auto auto auto',
      gap: 10,
      alignItems: 'center',
      padding: '7px 10px',
      borderRadius: 4,
      background: dragging ? 'var(--bg-3)' : 'transparent',
      border: dragging ? '1px solid var(--accent)' : '1px solid transparent',
      borderLeft: dragging ? `2px solid var(--accent)` : `2px solid ${epic.color}`,
      marginBottom: 1,
      cursor: 'grab',
      boxShadow: dragging ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
      transform: dragging ? 'translateX(6px) rotate(-0.5deg)' : 'none',
      opacity: dragging ? 0.95 : 1,
      transition: 'background .12s',
    }}
    onMouseOver={e => { if (!dragging) e.currentTarget.style.background = 'var(--bg-1)'; }}
    onMouseOut ={e => { if (!dragging) e.currentTarget.style.background = 'transparent'; }}>
      <StatusDot s={s.status} size={9}/>
      <StoryId id={s.id}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{ fontSize: 12.5, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {s.title}
        </span>
        {pinned && <span style={{
          fontSize: 9, padding: '1px 4px',
          background: 'var(--accent-bg)', color: 'var(--accent-fg)',
          borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.05em',
          fontWeight: 600,
        }}>goal</span>}
      </div>
      <PriorityBars p={s.priority}/>
      <Pts n={s.pts}/>
      {s.assignee ? <Avatar id={s.assignee}/> : (
        <span style={{
          width: 18, height: 18, borderRadius: '50%',
          border: '1px dashed var(--border-2)', color: 'var(--fg-3)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10,
        }}>?</span>
      )}
    </div>
  );
}

Object.assign(window, { SprintPlanning });
