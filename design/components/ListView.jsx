// List view — stories grouped by Epic, filtered by Sprint 32 (active).

function ListView() {
  const inSprint = STORIES.filter(s => s.sprint === 'sp-32');
  const byEpic = EPICS.map(e => ({
    ...e,
    stories: inSprint.filter(s => s.epic === e.id),
  })).filter(g => g.stories.length > 0);

  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateRows:'36px 1fr', background:'var(--bg)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 16px', borderBottom:'1px solid var(--border)', fontSize:12 }}>
        <FilterChip label="Group by" value="Epic"/>
        <FilterChip label="Sprint" value="32 · active"/>
        <FilterChip label="Status" value="All"/>
        <FilterChip label="Assignee" value="All"/>
        <span style={{ flex:1 }}/>
        <span className="mono" style={{ fontSize:11, color:'var(--fg-3)' }}>12 issues · 4 epics</span>
      </div>

      <div style={{ overflow:'auto' }}>
        {byEpic.map(g => <EpicGroup key={g.id} epic={g}/>)}

        <div style={{ padding:'24px 16px 48px', color:'var(--fg-3)', fontSize:11.5 }}>
          <span className="mono">end of sprint</span>
        </div>
      </div>
    </div>
  );
}

function EpicGroup({ epic }) {
  const totalPts = epic.stories.reduce((a,s) => a+s.pts, 0);
  const donePts  = epic.stories.filter(s => s.status==='done').reduce((a,s) => a+s.pts, 0);
  return (
    <section>
      {/* Group header */}
      <header style={{
        display:'grid',
        gridTemplateColumns:'18px 100px 1fr 200px 100px',
        gap:10,
        alignItems:'center',
        padding:'10px 16px',
        background:'var(--bg-1)',
        borderTop:'1px solid var(--border)',
        borderBottom:'1px solid var(--border)',
        position:'sticky', top:0, zIndex:1,
      }}>
        <button style={{ color:'var(--fg-2)', display:'flex' }}><Icon name="chevD" size={12}/></button>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:epic.color }}/>
          <span className="mono" style={{ fontSize:11, color:'var(--fg-2)' }}>{epic.id}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
          <span style={{ fontSize:13, fontWeight:600 }}>{epic.title}</span>
          <span className="mono" style={{ fontSize:11, color:'var(--fg-3)' }}>{epic.stories.length} stories</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ flex:1, height:4, background:'var(--bg-2)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ width:`${epic.progress*100}%`, height:'100%', background:'var(--accent)' }}/>
          </div>
          <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)', width:36, textAlign:'right' }}>{Math.round(epic.progress*100)}%</span>
        </div>
        <span className="mono" style={{ fontSize:11, color:'var(--fg-2)', textAlign:'right' }}>{donePts}/{totalPts} pts</span>
      </header>

      {/* Stories */}
      <div>
        {epic.stories.map(s => <ListRow key={s.id} s={s}/>)}
      </div>
    </section>
  );
}

function ListRow({ s }) {
  const epic = EPICS.find(e => e.id === s.epic);
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'18px 100px 18px 1fr 120px 90px 60px 50px 26px 24px',
      gap:10,
      alignItems:'center',
      padding:'7px 16px',
      borderBottom:'1px solid var(--border)',
      cursor:'pointer',
      fontSize:12.5,
    }}
      onMouseOver={e => e.currentTarget.style.background='var(--bg-1)'}
      onMouseOut ={e => e.currentTarget.style.background='transparent'}>
      <span/>
      <StoryId id={s.id}/>
      <StatusDot s={s.status} size={9}/>
      <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--fg)' }}>{s.title}</span>
        {s.blocked && <span style={{
          fontSize:9, padding:'1px 4px',
          background:'rgba(248,113,113,0.13)', color:'var(--blocked)',
          borderRadius:2, textTransform:'uppercase', letterSpacing:'0.05em',
          fontWeight:600, flex:'0 0 auto',
        }}>blocked</span>}
      </div>
      <span style={{ display:'flex', gap:4, overflow:'hidden' }}>
        {(s.labels||[]).slice(0,2).map(l => <Label key={l} name={l}/>)}
      </span>
      <span className="mono" style={{ fontSize:11, color:'var(--fg-2)' }}>{s.due || '—'}</span>
      <span style={{ textAlign:'right' }}><Pts n={s.pts}/></span>
      <PriorityBars p={s.priority}/>
      <Avatar id={s.assignee}/>
      <button className="btn-ghost" style={{ padding:2, color:'var(--fg-3)' }}><Icon name="more" size={13}/></button>
    </div>
  );
}

Object.assign(window, { ListView });
