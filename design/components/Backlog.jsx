// Backlog — all unassigned stories. Dense table. Filter rail.

function Backlog() {
  const items = STORIES.filter(s => !s.sprint);
  const totalPts = items.reduce((a,s) => a+s.pts, 0);

  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateRows:'40px 36px 1fr', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 16px', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontSize:14, fontWeight:600 }}>Backlog</span>
        <span className="mono" style={{ fontSize:11.5, color:'var(--fg-3)' }}>{items.length} stories · {totalPts} pts</span>
        <span style={{ flex:1 }}/>
        <button className="btn"><Icon name="filter" size={12}/>Filter <span className="kbd">F</span></button>
        <button className="btn"><Icon name="arrow" size={12}/>Move to sprint</button>
        <button className="btn btn-primary"><Icon name="plus" size={12}/>New issue</button>
      </div>

      {/* Saved-filter rail */}
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0 16px', borderBottom:'1px solid var(--border)', overflow:'hidden' }}>
        <SavedFilter label="All open" count="9" active/>
        <SavedFilter label="P0 / P1" count="3"/>
        <SavedFilter label="Spikes" count="1"/>
        <SavedFilter label="Tech debt" count="2"/>
        <span style={{ width:1, height:18, background:'var(--border)' }}/>
        <FilterChip label="Epic" value="All"/>
        <FilterChip label="Labels" value="Any"/>
        <FilterChip label="Points" value="≤ 8"/>
        <span style={{ flex:1 }}/>
        <span className="mono" style={{ fontSize:11, color:'var(--fg-3)' }}>sorted by · priority ↓</span>
      </div>

      {/* Table */}
      <div style={{ overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
          <colgroup>
            <col style={{ width: 36 }}/>
            <col style={{ width: 90 }}/>
            <col style={{ width: 32 }}/>
            <col/>
            <col style={{ width: 150 }}/>
            <col style={{ width: 180 }}/>
            <col style={{ width: 60 }}/>
            <col style={{ width: 50 }}/>
            <col style={{ width: 36 }}/>
          </colgroup>
          <thead>
            <tr style={{ background:'var(--bg-1)', color:'var(--fg-3)', fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
              <th></th>
              <th style={th()}>ID</th>
              <th></th>
              <th style={th()}>Title</th>
              <th style={th()}>Epic</th>
              <th style={th()}>Labels</th>
              <th style={th({textAlign:'right'})}>Pts</th>
              <th style={th({textAlign:'center'})}>Pri</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s, i) => <BacklogRow key={s.id} s={s} odd={i%2===1}/> )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function th(extra={}) { return { padding:'6px 10px', textAlign:'left', borderBottom:'1px solid var(--border)', fontWeight:600, ...extra }; }

function SavedFilter({ label, count, active }) {
  return (
    <button style={{
      display:'inline-flex', alignItems:'center', gap:6,
      height:22, padding:'0 10px',
      borderRadius:3,
      background: active ? 'var(--bg-2)' : 'transparent',
      color: active ? 'var(--fg)' : 'var(--fg-2)',
      boxShadow: active ? '0 0 0 1px var(--border-1)' : 'none',
      fontSize:12, fontWeight: active?500:400,
    }}>
      {label}
      <span className="mono" style={{ fontSize:10.5, color:'var(--fg-3)' }}>{count}</span>
    </button>
  );
}

function BacklogRow({ s, odd }) {
  const epic = EPICS.find(e => e.id === s.epic);
  return (
    <tr style={{
      background: odd ? 'var(--bg-1)' : 'transparent',
      cursor:'pointer',
    }}
      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-2)'}
      onMouseOut ={e => e.currentTarget.style.background = odd ? 'var(--bg-1)' : 'transparent'}>
      <td style={td()}>
        <input type="checkbox" style={{
          width:13, height:13, accentColor:'var(--accent)',
          background:'var(--bg-2)', cursor:'pointer',
        }}/>
      </td>
      <td style={td()}><StoryId id={s.id}/></td>
      <td style={td()}><StatusDot s={s.status} size={9}/></td>
      <td style={{ ...td(), color:'var(--fg)', fontSize:13 }}>
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{s.title}</span>
      </td>
      <td style={td()}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
          <span style={{ width:6, height:6, borderRadius:1, background: epic.color }}/>
          <span style={{ fontSize:12, color:'var(--fg-1)' }}>{epic.title.split('—')[0].trim()}</span>
        </span>
      </td>
      <td style={td()}>
        <span style={{ display:'inline-flex', gap:4 }}>
          {(s.labels||[]).slice(0,3).map(l => <Label key={l} name={l}/>)}
        </span>
      </td>
      <td style={{ ...td(), textAlign:'right' }}><Pts n={s.pts}/></td>
      <td style={{ ...td(), textAlign:'center' }}><PriorityBars p={s.priority}/></td>
      <td style={td()}>
        <button className="btn-ghost" style={{ padding:3, color:'var(--fg-3)' }}><Icon name="more" size={13}/></button>
      </td>
    </tr>
  );
}

function td(extra={}) { return { padding:'8px 10px', borderBottom:'1px solid var(--border)', verticalAlign:'middle', ...extra }; }

Object.assign(window, { Backlog });
