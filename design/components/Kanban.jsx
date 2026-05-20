// Kanban board — the primary view.
// Columns: To Do · In Progress · In Review · Done
// Cards are dense; epic stripe on the left, status dot before title, mono ID, meta row.

function Kanban() {
  const cols = [
    { id: 'todo',     label: 'Backlog',     count: 4, sub: '11 pts' },
    { id: 'progress', label: 'In Progress', count: 3, sub: '16 pts', accent: true },
    { id: 'review',   label: 'In Review',   count: 3, sub: '7 pts'  },
    { id: 'done',     label: 'Done',        count: 2, sub: '4 pts'  },
  ];
  const inSprint = STORIES.filter(s => s.sprint === 'sp-32');
  const grouped = Object.fromEntries(cols.map(c => [c.id, inSprint.filter(s => s.status === c.id)]));

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid',
      gridTemplateRows: '36px 1fr',
      background: 'var(--bg)',
    }}>
      {/* Sub-toolbar — group/filter chips */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 14px',
        borderBottom: '1px solid var(--border)',
        fontSize: 12,
        color: 'var(--fg-2)',
      }}>
        <FilterChip label="Group by" value="Status" />
        <FilterChip label="Epic" value="All" badge="4" />
        <FilterChip label="Assignee" value="All" />
        <FilterChip label="Priority" value="≥ Med" />
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>12 issues · 38 pts</span>
        <span style={{ width: 1, height: 14, background: 'var(--border)' }}/>
        <button className="btn-ghost" style={{ padding: '3px 6px', fontSize: 11.5 }}>
          <Icon name="settings" size={12}/>
        </button>
      </div>

      {/* Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 0,
        overflow: 'hidden',
      }}>
        {cols.map((c, i) => (
          <Column key={c.id} col={c} stories={grouped[c.id]} isLast={i === cols.length-1} dropTarget={c.id === 'review'} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, value, badge }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 22, padding: '0 8px',
      background: 'transparent',
      border: '1px dashed var(--border-1)',
      borderRadius: 4,
      color: 'var(--fg-2)',
      fontSize: 11.5,
    }}>
      <span style={{ color: 'var(--fg-3)' }}>{label}</span>
      <span style={{ color: 'var(--fg)' }}>{value}</span>
      {badge && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>· {badge}</span>}
    </button>
  );
}

function Column({ col, stories, isLast, dropTarget }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRight: isLast ? 'none' : '1px solid var(--border)',
      minWidth: 0,
      background: col.accent ? 'linear-gradient(180deg, var(--accent-tint) 0%, transparent 200px)' : 'transparent',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px 8px',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1,
      }}>
        <StatusDot s={col.id} size={9}/>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg)', letterSpacing: '-0.005em' }}>{col.label}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{col.count}</span>
        <span style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{col.sub}</span>
        <button className="btn-ghost" style={{ padding: 3, color: 'var(--fg-3)' }}><Icon name="plus" size={12}/></button>
      </div>

      <div style={{
        flex: 1,
        padding: '0 10px 12px',
        overflow: 'auto',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {stories.map((s, i) => <KanbanCard key={s.id} s={s} ghost={dropTarget && i === 1}/> )}
        {dropTarget && <DropIndicator/> }
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 8px', fontSize: 11.5, color: 'var(--fg-3)',
          borderRadius: 4, border: '1px dashed transparent',
          marginTop: 2,
        }} onMouseOver={e => e.currentTarget.style.borderColor='var(--border-1)'}
           onMouseOut={e => e.currentTarget.style.borderColor='transparent'}>
          <Icon name="plus" size={11}/> Add issue
        </button>
      </div>
    </div>
  );
}

function DropIndicator() {
  return (
    <div style={{
      height: 56, borderRadius: 5,
      border: '1px dashed var(--accent)',
      background: 'var(--accent-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--accent-fg)',
      fontSize: 11, fontWeight: 500,
    }}>
      Drop to move · AUTH-244
    </div>
  );
}

function KanbanCard({ s, ghost }) {
  const epic = EPICS.find(e => e.id === s.epic);
  return (
    <article style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 5,
      padding: '8px 10px 8px 11px',
      position: 'relative',
      opacity: ghost ? 0.4 : 1,
      cursor: 'grab',
      transition: 'border-color .12s, background .12s',
    }}
    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
    onMouseOut ={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
      {/* Epic stripe */}
      <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: epic.color }}/>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <StoryId id={s.id}/>
        {s.blocked && <span style={{
          fontSize: 9, fontWeight: 600, padding: '1px 4px',
          background: 'rgba(248,113,113,0.13)', color: 'var(--blocked)',
          borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>blocked</span>}
        <span style={{ flex: 1 }}/>
        <PriorityBars p={s.priority}/>
        <Pts n={s.pts}/>
      </div>

      {/* Title */}
      <div style={{
        display: 'flex', gap: 6, alignItems: 'flex-start',
        fontSize: 13, color: 'var(--fg)', fontWeight: 450,
        lineHeight: 1.32,
        marginBottom: s.labels?.length ? 8 : 6,
      }}>
        <span style={{ marginTop: 3, flex: '0 0 auto' }}><StatusDot s={s.status} size={9}/></span>
        <span style={{ textWrap: 'pretty' }}>{s.title}</span>
      </div>

      {/* Labels */}
      {s.labels?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {s.labels.map(l => <Label key={l} name={l}/>)}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fg-3)', fontSize: 11 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 1, background: epic.color, opacity: 0.85 }}/>
          <span className="mono" style={{ fontSize: 10.5 }}>{s.epic}</span>
        </span>
        <span style={{ flex: 1 }}/>
        {s.due && <span style={{ fontSize: 10.5 }}>{s.due}</span>}
        <Avatar id={s.assignee}/>
      </div>
    </article>
  );
}

const LABEL_COLORS = {
  frontend:    '#7c5cff',
  backend:     '#4cc9e7',
  a11y:        '#f0b34a',
  infra:       '#94a3b8',
  audit:       '#a78bfa',
  security:    '#f87171',
  telemetry:   '#4ade80',
  design:      '#f0b34a',
  spec:        '#94a3b8',
  i18n:        '#4cc9e7',
  sso:         '#a78bfa',
  docs:        '#94a3b8',
  spike:       '#f87171',
  analytics:   '#4ade80',
};

function Label({ name }) {
  const c = LABEL_COLORS[name] || '#94a3b8';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 16, padding: '0 5px 0 4px',
      fontSize: 10.5, fontWeight: 500,
      background: 'transparent',
      border: '1px solid var(--border-1)',
      borderRadius: 2,
      color: 'var(--fg-1)',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c }}/>
      {name}
    </span>
  );
}

Object.assign(window, { Kanban, KanbanCard, Label });
