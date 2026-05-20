// AppShell — left sidebar (program/project tree) + topbar + main area.
// Used as the wrapper for the Kanban primary view and other artboards.

function AppShell({ view = 'kanban', activeProject = 'pr-auth', children, sprintBadge = 'Sprint 32', breadcrumb = ['Platform', 'Auth & Identity'] }) {
  const sashStyle = {
    width: '100%', height: '100%',
    display: 'grid',
    gridTemplateColumns: '232px 1fr',
    gridTemplateRows: '40px 1fr',
    background: 'var(--bg)',
    color: 'var(--fg)',
  };
  return (
    <div className="kcw" style={sashStyle}>
      <Sidebar activeProject={activeProject} />
      <TopBar view={view} breadcrumb={breadcrumb} sprintBadge={sprintBadge} />
      <main style={{ background: 'var(--bg)', overflow: 'hidden', position: 'relative', borderTop: '1px solid var(--border)' }}>
        {children}
      </main>
    </div>
  );
}

function Sidebar({ activeProject }) {
  return (
    <aside style={{
      gridRow: '1 / span 2',
      background: 'var(--panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      minWidth: 0,
    }}>
      {/* Workspace header */}
      <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)', height: 40 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background: 'linear-gradient(135deg, var(--accent), oklch(0.55 0.20 280))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent-ink)',
          letterSpacing: '-0.02em',
        }}>k</div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg)' }}>kcw / ops</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>personal workspace</span>
        </div>
        <button className="btn-ghost" style={{ padding: 4, borderRadius: 4 }}>
          <Icon name="chevD" size={12} />
        </button>
      </div>

      {/* Quick filters */}
      <nav style={{ padding: '8px 6px 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <NavRow icon="inbox" label="Inbox" trail="3" />
        <NavRow icon="eye" label="My issues" trail="14" />
        <NavRow icon="star" label="Starred" />
        <NavRow icon="branch" label="Drafts" />
      </nav>

      <div style={{ padding: '12px 14px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Programs</span>
        <button className="btn-ghost" style={{ padding: 2, borderRadius: 4, color: 'var(--fg-3)' }}><Icon name="plus" size={12}/></button>
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 6px 12px' }}>
        {PROGRAMS.map((pg, i) => (
          <ProgramNode key={pg.id} pg={pg} defaultOpen={i === 0} activeProject={activeProject} />
        ))}

        <div style={{ padding: '20px 8px 6px' }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Views</span>
        </div>
        <NavRow icon="sprint" label="Sprint planning" />
        <NavRow icon="epic" label="Roadmap" />
        <NavRow icon="cal" label="Releases" />
      </div>

      {/* Footer / user */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar id="me" size={22}/>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.1 }}>
          <div style={{ fontSize: 12, fontWeight: 500 }}>You</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>staff PM</div>
        </div>
        <button className="btn-ghost" style={{ padding: 4 }}><Icon name="settings" size={13} /></button>
      </div>
    </aside>
  );
}

function NavRow({ icon, label, trail, active }) {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 8px', borderRadius: 4,
      color: active ? 'var(--fg)' : 'var(--fg-1)',
      background: active ? 'var(--active)' : 'transparent',
      fontSize: 12.5, fontWeight: active ? 500 : 400,
      width: '100%', textAlign: 'left',
    }}>
      <Icon name={icon} size={14} />
      <span style={{ flex: 1 }}>{label}</span>
      {trail && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{trail}</span>}
    </button>
  );
}

function ProgramNode({ pg, defaultOpen, activeProject }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 6px', borderRadius: 4, fontSize: 12.5, fontWeight: 500,
          color: 'var(--fg-1)',
        }}>
        <span style={{ display: 'inline-flex', width: 12, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .12s', color: 'var(--fg-3)' }}>
          <Icon name="chevR" size={11} />
        </span>
        <Icon name="folder" size={13} />
        <span style={{ flex: 1, textAlign: 'left' }}>{pg.name}</span>
      </button>
      {open && (
        <div style={{ marginLeft: 18, borderLeft: '1px solid var(--border)', paddingLeft: 8, marginTop: 2 }}>
          {pg.projects.map(pr => (
            <button key={pr.id}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 8px', borderRadius: 4, marginBottom: 1,
                background: pr.id === activeProject ? 'var(--active)' : 'transparent',
                color: pr.id === activeProject ? 'var(--fg)' : 'var(--fg-1)',
              }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: pr.color }}/>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 12.5 }}>{pr.name}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{pr.key}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TopBar({ view, breadcrumb, sprintBadge }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 14px',
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      minWidth: 0,
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
        {breadcrumb.map((c, i) => (
          <React.Fragment key={i}>
            <span style={{ fontSize: 12.5, color: i === breadcrumb.length-1 ? 'var(--fg)' : 'var(--fg-2)', fontWeight: i === breadcrumb.length-1 ? 500 : 400 }}>{c}</span>
            {i < breadcrumb.length-1 && <span style={{ color: 'var(--fg-4)' }}><Icon name="chevR" size={10}/></span>}
          </React.Fragment>
        ))}
      </div>

      {/* Sprint chip */}
      {sprintBadge && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 8px 3px 6px',
          background: 'var(--accent-bg)',
          color: 'var(--accent-fg)',
          borderRadius: 4,
          fontSize: 11.5, fontWeight: 500,
          border: '1px solid var(--accent-line)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
          <span className="mono">{sprintBadge}</span>
          <span style={{ color: 'var(--fg-3)', fontSize: 10.5, marginLeft: 2 }}>· 7d left</span>
        </div>
      )}

      {/* View switcher */}
      <div style={{ marginLeft: 8 }} className="seg">
        <button className={view==='kanban'?'active':''}><Icon name="kanban" size={12}/>Board</button>
        <button className={view==='list'?'active':''}><Icon name="list" size={12}/>List</button>
        <button className={view==='cal'?'active':''}><Icon name="cal" size={12}/>Calendar</button>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 8px', height: 26,
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: 4, color: 'var(--fg-3)',
        minWidth: 240,
      }}>
        <Icon name="search" size={13} />
        <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Search issues, epics…</span>
        <span style={{ flex: 1 }}/>
        <span className="kbd">⌘K</span>
      </div>

      <button className="btn-ghost" style={{ padding: 5 }}><Icon name="filter" size={14}/></button>
      <button className="btn-ghost" style={{ padding: 5 }}><Icon name="bell" size={14}/></button>
      <button className="btn btn-primary"><Icon name="plus" size={12}/>New issue<span style={{ marginLeft: 4 }} className="kbd">C</span></button>
    </header>
  );
}

Object.assign(window, { AppShell });
