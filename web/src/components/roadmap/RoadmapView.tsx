import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEpics, useUpdateEpic } from '../../api/epics'
import { useUiStore } from '../../store/ui'
import type { EpicDto } from '../../types'

const ROW_H = 48
const LABEL_W = 220
const COL_W = 120   // px per month
const MONTHS_VISIBLE = 12

function toDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function addMonths(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

function clampDate(d: Date, minD: Date, maxD: Date) {
  if (d < minD) return new Date(minD)
  if (d > maxD) return new Date(maxD)
  return d
}

function monthsBetween(from: { year: number; month: number }, to: Date) {
  return (to.getFullYear() - from.year) * 12 + (to.getMonth() - from.month)
}

export function RoadmapView() {
  const { activeProjectId } = useUiStore()
  const projectId = activeProjectId ?? ''
  const { data: epics = [], isLoading } = useEpics(projectId)
  const updateEpic = useUpdateEpic(projectId)

  const today = new Date()
  const [startYear, setStartYear] = useState(today.getFullYear())
  const [startMonth, setStartMonth] = useState(today.getMonth())
  const [editing, setEditing] = useState<string | null>(null)

  const months = Array.from({ length: MONTHS_VISIBLE }, (_, i) => {
    const { year, month } = addMonths(startYear, startMonth, i)
    return { year, month, key: monthKey(year, month) }
  })

  const gridStart = new Date(startYear, startMonth, 1)
  const gridEnd = new Date(
    addMonths(startYear, startMonth, MONTHS_VISIBLE).year,
    addMonths(startYear, startMonth, MONTHS_VISIBLE).month,
    1,
  )

  const todayOffset = monthsBetween({ year: startYear, month: startMonth }, today)
  const todayPx = todayOffset * COL_W + (today.getDate() / 31) * COL_W

  const pan = (delta: number) => {
    const { year, month } = addMonths(startYear, startMonth, delta)
    setStartYear(year)
    setStartMonth(month)
  }

  const jumpToToday = () => {
    setStartYear(today.getFullYear())
    setStartMonth(today.getMonth())
  }

  if (!activeProjectId) return <Shell>Select a project</Shell>
  if (isLoading) return <Shell>Loading…</Shell>
  if (epics.length === 0) return <Shell>No epics yet — create one to get started.</Shell>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* ── toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px', height: 40, borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Roadmap</span>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={jumpToToday} style={ghostBtnStyle}>Today</button>
        <button type="button" onClick={() => pan(-3)} style={iconBtnStyle}><ChevronLeft size={13} /></button>
        <button type="button" onClick={() => pan(3)} style={iconBtnStyle}><ChevronRight size={13} /></button>
      </div>

      {/* ── grid ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* label column */}
        <div style={{
          width: LABEL_W, flexShrink: 0,
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* header spacer */}
          <div style={{ height: 32, borderBottom: '1px solid var(--border)', flexShrink: 0 }} />
          {epics.map(epic => (
            <div key={epic.id} style={{
              height: ROW_H, display: 'flex', alignItems: 'center',
              padding: '0 14px', gap: 8,
              borderBottom: '1px solid var(--border)',
              fontSize: 14.5,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: epic.color, flexShrink: 0 }} />
              <span style={{
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                color: 'var(--fg)',
              }}>{epic.title}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', flexShrink: 0 }}>
                {epic.donePoints}/{epic.totalPoints}
              </span>
            </div>
          ))}
        </div>

        {/* scrollable timeline */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <div style={{ width: MONTHS_VISIBLE * COL_W, minHeight: '100%', position: 'relative' }}>
            {/* month headers */}
            <div style={{
              display: 'flex', height: 32, borderBottom: '1px solid var(--border)',
              position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-1)',
            }}>
              {months.map(({ year, month, key }) => (
                <div key={key} style={{
                  width: COL_W, flexShrink: 0,
                  display: 'flex', alignItems: 'center',
                  padding: '0 10px',
                  borderRight: '1px solid var(--border)',
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--fg-3)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {new Date(year, month).toLocaleString('default', { month: 'short' })}
                  {' '}
                  <span style={{ fontWeight: 400, marginLeft: 3 }}>{year}</span>
                </div>
              ))}
            </div>

            {/* today line */}
            {todayPx >= 0 && todayPx <= MONTHS_VISIBLE * COL_W && (
              <div style={{
                position: 'absolute',
                left: todayPx, top: 32, bottom: 0,
                width: 1, background: 'var(--accent)',
                opacity: 0.6, zIndex: 1, pointerEvents: 'none',
              }} />
            )}

            {/* vertical month dividers + row bg */}
            {epics.map((epic, i) => (
              <div
                key={epic.id}
                style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  top: 32 + i * ROW_H,
                  height: ROW_H,
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-1)',
                }}
              />
            ))}

            {/* epic bars */}
            {epics.map((epic, i) => (
              <EpicBar
                key={epic.id}
                epic={epic}
                rowIndex={i}
                gridStart={gridStart}
                gridEnd={gridEnd}
                editing={editing === epic.id}
                onStartEdit={() => setEditing(epic.id)}
                onStopEdit={() => setEditing(null)}
                onSave={(startDate, endDate) => {
                  updateEpic.mutate({
                    id: epic.id,
                    startDate: startDate ?? undefined,
                    endDate: endDate ?? undefined,
                    clearStartDate: !startDate,
                    clearEndDate: !endDate,
                  })
                  setEditing(null)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── EpicBar ───────────────────────────────────────────────────

function EpicBar({ epic, rowIndex, gridStart, gridEnd, editing, onStartEdit, onStopEdit, onSave }: {
  epic: EpicDto
  rowIndex: number
  gridStart: Date
  gridEnd: Date
  editing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
  onSave: (start: string | null, end: string | null) => void
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')

  const startD = epic.startDate ? clampDate(toDateOnly(epic.startDate), gridStart, gridEnd) : null
  const endD = epic.endDate ? clampDate(toDateOnly(epic.endDate), gridStart, gridEnd) : null

  const top = 32 + rowIndex * ROW_H
  const barPad = 6

  let barLeft: number | null = null
  let barWidth: number | null = null

  if (startD && endD) {
    const totalMs = gridEnd.getTime() - gridStart.getTime()
    const startFrac = (startD.getTime() - gridStart.getTime()) / totalMs
    const endFrac = (endD.getTime() - gridStart.getTime()) / totalMs
    barLeft = startFrac * MONTHS_VISIBLE * COL_W
    barWidth = Math.max(8, (endFrac - startFrac) * MONTHS_VISIBLE * COL_W)
  }

  const openEdit = () => {
    setEditStart(epic.startDate ?? '')
    setEditEnd(epic.endDate ?? '')
    onStartEdit()
  }

  const submit = () => {
    onSave(editStart || null, editEnd || null)
  }

  return (
    <>
      {/* bar or placeholder */}
      <div
        ref={anchorRef}
        onClick={openEdit}
        style={{
          position: 'absolute',
          top: top + barPad,
          height: ROW_H - barPad * 2,
          left: barLeft !== null ? barLeft : 12,
          width: barWidth !== null ? barWidth : undefined,
          right: barLeft === null ? undefined : undefined,
          borderRadius: 4,
          background: barLeft !== null
            ? epic.color
            : 'var(--bg-3)',
          border: barLeft !== null
            ? `1px solid ${epic.color}`
            : '1px dashed var(--border-1)',
          display: 'flex', alignItems: 'center',
          padding: '0 8px',
          cursor: 'pointer',
          overflow: 'hidden',
          zIndex: 2,
          minWidth: barLeft === null ? 100 : undefined,
          opacity: barLeft !== null ? 1 : 0.6,
          transition: 'opacity 0.1s',
        }}
        title={barLeft !== null ? `${epic.startDate} → ${epic.endDate}` : 'Click to set dates'}
      >
        {barLeft !== null ? (
          <span style={{
            fontSize: 13.5, fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {epic.title}
          </span>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>Set dates…</span>
        )}
      </div>

      {/* date editor popover */}
      {editing && (
        <DatePopover
          startDate={editStart}
          endDate={editEnd}
          onStartChange={setEditStart}
          onEndChange={setEditEnd}
          onSave={submit}
          onCancel={onStopEdit}
          anchorRef={anchorRef}
          top={top}
        />
      )}
    </>
  )
}

// ── DatePopover ───────────────────────────────────────────────

function DatePopover({ startDate, endDate, onStartChange, onEndChange, onSave, onCancel, anchorRef, top }: {
  startDate: string
  endDate: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  anchorRef: React.RefObject<HTMLDivElement | null>
  top: number
}) {
  const popTop = top + ROW_H + 4

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9 }}
        onClick={onCancel}
      />
      <div style={{
        position: 'absolute',
        top: popTop,
        left: anchorRef.current ? (anchorRef.current.offsetLeft) : 12,
        zIndex: 10,
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '12px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
        display: 'flex', flexDirection: 'column', gap: 10,
        minWidth: 240,
      }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Set dates
        </span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>Start</span>
          <input
            type="date"
            value={startDate}
            onChange={e => onStartChange(e.target.value)}
            style={dateInputStyle}
            autoFocus
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>End</span>
          <input
            type="date"
            value={endDate}
            onChange={e => onEndChange(e.target.value)}
            style={dateInputStyle}
          />
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 2 }}>
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button type="button" onClick={onSave} style={saveBtnStyle}>Save</button>
        </div>
      </div>
    </>
  )
}

// ── helpers ───────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-2)', fontSize: 15 }}>
      {children}
    </div>
  )
}

const ghostBtnStyle: React.CSSProperties = {
  height: 24, padding: '0 10px', borderRadius: 4,
  border: '1px solid var(--border-1)',
  fontSize: 13.5, color: 'var(--fg-2)',
  background: 'transparent',
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 24, height: 24, borderRadius: 4,
  border: '1px solid var(--border-1)',
  color: 'var(--fg-2)', background: 'transparent',
}

const dateInputStyle: React.CSSProperties = {
  height: 28, padding: '0 8px', borderRadius: 4,
  border: '1px solid var(--border-1)',
  background: 'var(--bg-1)', color: 'var(--fg)',
  fontSize: 14,
  colorScheme: 'dark',
}

const cancelBtnStyle: React.CSSProperties = {
  height: 26, padding: '0 10px', borderRadius: 4,
  fontSize: 14, color: 'var(--fg-2)',
  background: 'var(--bg-2)', border: '1px solid var(--border-1)',
}

const saveBtnStyle: React.CSSProperties = {
  height: 26, padding: '0 10px', borderRadius: 4,
  fontSize: 14, fontWeight: 600,
  background: 'var(--accent)', color: 'var(--accent-ink)',
  border: 'none',
}
