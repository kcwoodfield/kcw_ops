// Shared mock data + tiny SVG icons used across all artboards.
// Exported to window so multiple babel scripts can read them.

const PROGRAMS = [
  {
    id: 'pg-platform',
    name: 'Platform',
    projects: [
      { id: 'pr-auth', name: 'Auth & Identity', key: 'AUTH', color: '#7c5cff' },
      { id: 'pr-billing', name: 'Billing v2', key: 'BIL', color: '#4cc9e7' },
      { id: 'pr-onb', name: 'Onboarding rework', key: 'ONB', color: '#f0b34a' },
    ],
  },
  {
    id: 'pg-growth',
    name: 'Growth',
    projects: [
      { id: 'pr-act', name: 'Activation funnels', key: 'ACT', color: '#4ade80' },
      { id: 'pr-ref', name: 'Referrals', key: 'REF', color: '#f87171' },
    ],
  },
  {
    id: 'pg-infra',
    name: 'Infrastructure',
    projects: [
      { id: 'pr-obs', name: 'Observability', key: 'OBS', color: '#a78bfa' },
      { id: 'pr-mig', name: 'Postgres 16 migration', key: 'MIG', color: '#94a3b8' },
    ],
  },
];

const EPICS = [
  { id: 'EP-12', key: 'AUTH-E12', title: 'Passkey-first sign-in', color: '#7c5cff', progress: 0.62 },
  { id: 'EP-14', key: 'AUTH-E14', title: 'Org / workspace switcher', color: '#4cc9e7', progress: 0.31 },
  { id: 'EP-17', key: 'AUTH-E17', title: 'SCIM + SSO hardening',     color: '#f0b34a', progress: 0.08 },
  { id: 'EP-19', key: 'AUTH-E19', title: 'Session telemetry',         color: '#4ade80', progress: 0.88 },
];

const SPRINTS = [
  { id: 'sp-31', name: 'Sprint 31', start: '2026-05-04', end: '2026-05-17', state: 'completed', goal: 'Passkey enrollment GA' },
  { id: 'sp-32', name: 'Sprint 32', start: '2026-05-18', end: '2026-05-31', state: 'active', goal: 'Org switcher + SCIM ground-work', points: { committed: 47, completed: 19 } },
  { id: 'sp-33', name: 'Sprint 33', start: '2026-06-01', end: '2026-06-14', state: 'planned', goal: 'SSO hardening / IdP coverage' },
  { id: 'sp-34', name: 'Sprint 34', start: '2026-06-15', end: '2026-06-28', state: 'planned', goal: 'TBD' },
];

const PEOPLE = [
  { id: 'me', name: 'You', initials: 'ME', color: '#7c5cff' },
  { id: 'jt', name: 'J. Tanaka',  initials: 'JT', color: '#4cc9e7' },
  { id: 'mr', name: 'M. Reyes',   initials: 'MR', color: '#f0b34a' },
  { id: 'as', name: 'A. Solberg', initials: 'AS', color: '#4ade80' },
  { id: 'np', name: 'N. Park',    initials: 'NP', color: '#f87171' },
  { id: 'lc', name: 'L. Chen',    initials: 'LC', color: '#a78bfa' },
];

// Status: todo | progress | review | done | blocked
// Priority: 0 (urgent) | 1 (high) | 2 (med) | 3 (low)
const STORIES = [
  // ── Sprint 32 (active) ──
  { id: 'AUTH-241', title: 'Passkey enrollment flow — error states', epic: 'EP-12', pts: 5, status: 'progress', priority: 1, assignee: 'jt',  sprint: 'sp-32', due: 'May 28', labels: ['frontend','a11y'], blocked: false },
  { id: 'AUTH-247', title: 'Migrate session store to Redis cluster', epic: 'EP-19', pts: 8, status: 'progress', priority: 0, assignee: 'me',  sprint: 'sp-32', due: 'May 26', labels: ['backend','infra'], blocked: true },
  { id: 'AUTH-244', title: 'Org switcher keyboard shortcuts',         epic: 'EP-14', pts: 3, status: 'progress', priority: 2, assignee: 'as',  sprint: 'sp-32', due: 'May 29', labels: ['frontend'] },
  { id: 'AUTH-251', title: 'Audit log entry for org-role change',     epic: 'EP-14', pts: 2, status: 'review',   priority: 2, assignee: 'mr',  sprint: 'sp-32', due: 'May 24', labels: ['backend','audit'] },
  { id: 'AUTH-238', title: 'Recovery codes regen rate-limit',         epic: 'EP-12', pts: 3, status: 'review',   priority: 1, assignee: 'np',  sprint: 'sp-32', due: 'May 25', labels: ['backend','security'] },
  { id: 'AUTH-252', title: 'Empty-state for new workspaces',          epic: 'EP-14', pts: 2, status: 'review',   priority: 3, assignee: 'lc',  sprint: 'sp-32', due: 'May 25', labels: ['frontend','design'] },
  { id: 'AUTH-233', title: 'Magic-link deprecation banner',           epic: 'EP-12', pts: 1, status: 'done',     priority: 2, assignee: 'lc',  sprint: 'sp-32', due: 'May 19', labels: ['frontend'] },
  { id: 'AUTH-235', title: 'Telemetry: failed passkey attempts',      epic: 'EP-19', pts: 3, status: 'done',     priority: 2, assignee: 'me',  sprint: 'sp-32', due: 'May 20', labels: ['backend','telemetry'] },
  { id: 'AUTH-249', title: 'Per-IdP claim mapping schema',            epic: 'EP-17', pts: 5, status: 'todo',     priority: 1, assignee: 'mr',  sprint: 'sp-32', due: 'May 31', labels: ['backend','spec'] },
  { id: 'AUTH-256', title: 'Workspace-scoped feature flag plumbing',  epic: 'EP-14', pts: 5, status: 'todo',     priority: 2, assignee: 'jt',  sprint: 'sp-32', due: 'May 30', labels: ['frontend','backend'] },
  { id: 'AUTH-258', title: 'Block stale session resume across orgs',  epic: 'EP-19', pts: 2, status: 'todo',     priority: 0, assignee: 'np',  sprint: 'sp-32', due: 'May 27', labels: ['security'] },
  { id: 'AUTH-261', title: 'i18n string sweep for switcher',          epic: 'EP-14', pts: 1, status: 'todo',     priority: 3, assignee: 'lc',  sprint: 'sp-32', due: 'Jun 02', labels: ['i18n'] },

  // ── Backlog ──
  { id: 'AUTH-263', title: 'OIDC discovery doc caching',              epic: 'EP-17', pts: 3, status: 'todo', priority: 2, assignee: null, sprint: null, labels: ['backend'] },
  { id: 'AUTH-264', title: 'Per-org branding on sign-in page',        epic: 'EP-14', pts: 8, status: 'todo', priority: 2, assignee: null, sprint: null, labels: ['frontend','design'] },
  { id: 'AUTH-265', title: 'Hardware-key fallback for passkey',       epic: 'EP-12', pts: 13, status: 'todo', priority: 1, assignee: null, sprint: null, labels: ['backend','security'] },
  { id: 'AUTH-266', title: 'Bulk org-member CSV import',              epic: 'EP-14', pts: 5, status: 'todo', priority: 3, assignee: null, sprint: null, labels: ['backend'] },
  { id: 'AUTH-267', title: 'Session heatmap dashboard',               epic: 'EP-19', pts: 5, status: 'todo', priority: 3, assignee: null, sprint: null, labels: ['analytics'] },
  { id: 'AUTH-268', title: 'Just-in-time provisioning for Okta',      epic: 'EP-17', pts: 8, status: 'todo', priority: 1, assignee: null, sprint: null, labels: ['backend','sso'] },
  { id: 'AUTH-269', title: 'Force-MFA policy per org',                epic: 'EP-17', pts: 5, status: 'todo', priority: 1, assignee: null, sprint: null, labels: ['backend','security'] },
  { id: 'AUTH-270', title: 'Investigate WebAuthn L3 attestation',     epic: 'EP-12', pts: 2, status: 'todo', priority: 3, assignee: null, sprint: null, labels: ['spike'] },
  { id: 'AUTH-271', title: 'Doc: passkey FAQ for support',            epic: 'EP-12', pts: 1, status: 'todo', priority: 3, assignee: null, sprint: null, labels: ['docs'] },
];

// ── Tiny inline icons (stroke=currentColor) ──
const Icon = ({ name, size = 14, ...rest }) => {
  const paths = {
    search:   <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    plus:     <><path d="M12 5v14M5 12h14"/></>,
    filter:   <><path d="M3 5h18M6 12h12M10 19h4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    chevR:    <><path d="m9 6 6 6-6 6"/></>,
    chevD:    <><path d="m6 9 6 6 6-6"/></>,
    chevL:    <><path d="m15 6-6 6 6 6"/></>,
    kanban:   <><rect x="3" y="3" width="6" height="14" rx="1"/><rect x="11" y="3" width="6" height="9" rx="1"/><rect x="19" y="-2" width="0" height="0"/></>,
    list:     <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    cal:      <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></>,
    more:     <><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></>,
    folder:   <><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
    inbox:    <><path d="M3 13h4l2 3h6l2-3h4"/><path d="M5 3h14l2 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></>,
    star:     <><path d="M12 2 14.5 9H22l-6 4.5L18 21l-6-4.5L6 21l2-7.5L2 9h7.5z"/></>,
    sprint:   <><path d="M5 12h8M5 12 9 8M5 12l4 4M14 4l4 4-4 4M18 8H9"/></>,
    epic:     <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></>,
    flag:     <><path d="M4 21V4h13l-2 4 2 4H4"/></>,
    link:     <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></>,
    paperclip:<><path d="M21 10 12 19a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4 4l-9 9a1 1 0 1 1-2-2l8-8"/></>,
    branch:   <><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10M8 12h8"/></>,
    bug:      <><path d="M8 3v3M16 3v3M5 8h14M6 8v6a6 6 0 0 0 12 0V8M3 13h3M18 13h3M4 19l3-2M20 19l-3-2"/></>,
    spark:    <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
    eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>,
    arrow:    <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    bell:     <><path d="M18 16V11a6 6 0 0 0-12 0v5l-2 3h16zM10 21a2 2 0 0 0 4 0"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths[name]}
    </svg>
  );
};

// Avatar pip
const Avatar = ({ id, size = 18 }) => {
  const p = PEOPLE.find(x => x.id === id);
  if (!p) return <span className="avatar" style={{ width: size, height: size, color: 'var(--fg-3)', borderStyle: 'dashed' }}>?</span>;
  return <span className="avatar" style={{ width: size, height: size, color: p.color, fontSize: Math.max(8, size*0.5) }}>{p.initials}</span>;
};

const StatusDot = ({ s, size = 9 }) => (
  <span className={`status-dot ${s}`} style={{ width: size, height: size }} />
);

const PriorityBars = ({ p }) => (
  <span className={`priority-bars p${p}`}>
    <span/><span/><span/>
  </span>
);

const Pts = ({ n }) => <span className="pts mono">{n}</span>;

const StoryId = ({ id, dim }) => (
  <span className="mono" style={{ color: dim ? 'var(--fg-3)' : 'var(--fg-2)', fontSize: 11, letterSpacing: '-0.01em' }}>{id}</span>
);

Object.assign(window, { PROGRAMS, EPICS, SPRINTS, PEOPLE, STORIES, Icon, Avatar, StatusDot, PriorityBars, Pts, StoryId });
