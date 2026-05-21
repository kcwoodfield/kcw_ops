import { useState, Fragment } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSprints } from '../../api/stories'
import { useUiStore } from '../../store/ui'
import type { SprintDto } from '../../types'

const WEEKS = 8
const TOTAL_DAYS = WEEKS * 7
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

function mondayOf(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  const day = out.getDay()
  out.setDate(out.getDate() + (day === 0 ? -6 : 1 - day))
  return out
}

function isoWeek(d: Date): number {
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const w1start = mondayOf(jan4)
  return Math.floor((d.getTime() - w1start.getTime()) / (7 * 86400000)) + 1
}

function fmt(d: Date) { return `${MONTHS[d.getMonth()]} ${d.getDate()}` }

export function CalendarView() {
  const { activeProjectId } = useUiStore()
  const { data: sprints = [], isLoading } = useSprints(activeProjectId ?? '')
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const windowStart = addDays(mondayOf(today), (weekOffset - 1) * 7)
  const windowEnd = addDays(windowStart, TOTAL_DAYS)
  const todayOffset = Math.floor((today.getTime() - windowStart.getTime()) / 86400000)

  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const ws = addDays(windowStart, i * 7)
    const we = addDays(ws, 6)
    return {
      label: ws.getMonth() === we.getMonth()
        ? `${MONTHS[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}`
        : `${fmt(ws)}–${fmt(we)}`,
      weekNum: isoWeek(ws),
      isCurrent: ws <= today && today <= we,
    }
  })

  const rangeLabel = `${fmt(windowStart)} – ${fmt(addDays(windowEnd, -1))}, ${windowEnd.getFullYear()}`

  if (!activeProjectId) return <Centered>Select a project</Centered>
  if (isLoading) return <Centered>Loading…</Centered>

  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateRows: '40px 1fr', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Timeline</span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{rangeLabel}</span>
        <button type="button" onClick={() => setWeekOffset(0)} style={navBtn}>Today</button>
        <button type="button" onClick={() => setWeekOffset(o => o - 1)} style={navBtn}><ChevronLeft size={13} /></button>
        <button type="button" onClick={() => setWeekOffset(o => o + 1)} style={navBtn}><ChevronRight size={13} /></button>
      </div>

      {/* ── Gantt ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', overflowY: 'auto', overflowX: 'hidden' }}>

        {/* top-left corner */}
        <div style={{ ...stickyTop, borderRight: '1px solid var(--border)', padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sprints</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginLeft: 'auto' }}>{sprints.length}</span>
        </div>

        {/* week header */}
        <div style={{ ...stickyTop, display: 'grid', gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
          {weeks.map((w, i) => (
            <div key={i} style={{
              padding: '5px 8px',
              borderRight: i < WEEKS - 1 ? '1px solid var(--border)' : 'none',
              borderBottom: '1px solid var(--border)',
              background: w.isCurrent ? 'var(--hover)' : 'var(--bg)',
            }}>
              <div style={{ fontSize: 10.5, fontWeight: w.isCurrent ? 600 : 400, color: w.isCurrent ? 'var(--fg-1)' : 'var(--fg-3)' }}>
                {w.label}
              </div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)' }}>W{w.weekNum}</div>
            </div>
          ))}
        </div>

        {/* Sprint rows */}
        {sprints.length === 0 ? (
          <>
            <div style={labelCell}>
              <span style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic' }}>No sprints yet</span>
            </div>
            <BarsCell weeks={weeks} todayOffset={todayOffset} isLast />
          </>
        ) : (
          sprints.map((sprint, i) => (
            <Fragment key={sprint.id}>
              <div style={labelCell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', minWidth: 0 }}>
                  {sprint.state === 'active' && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: sprint.state === 'active' ? 600 : 500,
                      color: sprint.state === 'completed' ? 'var(--fg-3)' : 'var(--fg)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sprint.name}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>
                      {sprint.state} · {sprint.completedPoints}/{sprint.committedPoints} pts
                    </div>
                  </div>
                </div>
              </div>
              <BarsCell weeks={weeks} todayOffset={todayOffset} isLast={i === sprints.length - 1}>
                <SprintBar sprint={sprint} windowStart={windowStart} dayPct={n => `${(n / TOTAL_DAYS) * 100}%`} />
              </BarsCell>
            </Fragment>
          ))
        )}
      </div>
    </div>
  )
}

function SprintBar({ sprint, windowStart, dayPct }: {
  sprint: SprintDto
  windowStart: Date
  dayPct: (n: number) => string
}) {
  const sStart = parseISO(sprint.startDate)
  const sEnd = addDays(parseISO(sprint.endDate), 1)
  const startDay = Math.floor((sStart.getTime() - windowStart.getTime()) / 86400000)
  const endDay = Math.floor((sEnd.getTime() - windowStart.getTime()) / 86400000)
  const clampedStart = Math.max(0, startDay)
  const clampedEnd = Math.min(TOTAL_DAYS, endDay)
  if (clampedEnd <= clampedStart) return null

  const isActive = sprint.state === 'active'
  const isCompleted = sprint.state === 'completed'
  const widthPct = `${((clampedEnd - clampedStart) / TOTAL_DAYS) * 100}%`

  return (
    <div style={{
      position: 'absolute',
      left: dayPct(clampedStart),
      width: widthPct,
      top: 8, bottom: 8,
      border: `1px ${isCompleted ? 'solid' : 'dashed'} ${isActive ? 'var(--accent-line)' : 'var(--border-1)'}`,
      background: isActive ? 'var(--accent-bg)' : isCompleted ? 'var(--hover)' : 'transparent',
      borderRadius: 4,
      padding: '0 8px',
      display: 'flex', alignItems: 'center', gap: 6,
      overflow: 'hidden',
    }}>
      {isActive && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
      )}
      <span style={{
        fontSize: 11.5, fontWeight: isActive ? 600 : 500,
        color: isActive ? 'var(--accent-fg)' : isCompleted ? 'var(--fg-2)' : 'var(--fg-3)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {sprint.name}
      </span>
      <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginLeft: 'auto', flexShrink: 0 }}>
        {sprint.committedPoints}pt
      </span>
    </div>
  )
}

function BarsCell({ children, weeks, todayOffset, isLast }: {
  children?: React.ReactNode
  weeks: { isCurrent: boolean }[]
  todayOffset: number
  isLast: boolean
}) {
  return (
    <div style={{ position: 'relative', minHeight: 52, borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
      {/* column stripes */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
        {weeks.map((w, i) => (
          <div key={i} style={{
            borderRight: i < WEEKS - 1 ? '1px solid var(--border)' : 'none',
            background: w.isCurrent ? 'var(--hover)' : 'transparent',
          }} />
        ))}
      </div>
      {/* today line */}
      {todayOffset >= 0 && todayOffset <= TOTAL_DAYS && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${(todayOffset / TOTAL_DAYS) * 100}%`,
          width: 1, background: 'var(--accent)', opacity: 0.6, zIndex: 2,
        }} />
      )}
      {/* bars */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-2)', fontSize: 13 }}>
      {children}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  height: 26, padding: '0 8px',
  background: 'var(--bg-1)', border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--fg-2)',
}

const stickyTop: React.CSSProperties = {
  position: 'sticky', top: 0, zIndex: 2,
  background: 'var(--bg)', borderBottom: '1px solid var(--border)',
}

const labelCell: React.CSSProperties = {
  position: 'sticky', left: 0,
  borderRight: '1px solid var(--border)',
  borderBottom: '1px solid var(--border)',
  padding: '10px 12px',
  background: 'var(--bg)',
  minHeight: 52,
  display: 'flex', alignItems: 'center',
}
