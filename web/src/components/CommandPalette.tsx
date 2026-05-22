import { useEffect, useRef, useState } from 'react'
import { Command } from 'cmdk'
import * as Dialog from '@radix-ui/react-dialog'
import {
  LayoutDashboard, List, CalendarDays, Inbox,
  Zap, ArrowRight, Search, Plus,
} from 'lucide-react'
import { useProjects } from '../api/projects'
import { useStories, useCreateStory } from '../api/stories'
import { useEpics } from '../api/epics'
import { useUiStore } from '../store/ui'
import { useAppNavigate } from '../hooks/useAppNavigate'
import type { AppView } from '../lib/routes'
import { StatusDot, StoryId, PriorityBars } from './story/StoryPrimitives'

const VIEWS: { id: AppView; label: string; icon: React.ReactNode }[] = [
  { id: 'board',    label: 'Board',          icon: <LayoutDashboard size={13} /> },
  { id: 'backlog',  label: 'Backlog',         icon: <Inbox size={13} /> },
  { id: 'planning', label: 'Sprint planning', icon: <Zap size={13} /> },
  { id: 'list',     label: 'List view',       icon: <List size={13} /> },
  { id: 'calendar', label: 'Calendar',        icon: <CalendarDays size={13} /> },
]

// Always show the create item regardless of search text
const paletteFilter = (value: string, search: string) => {
  if (value === '__create__') return 1
  if (!search) return 1
  return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
}

const isEditable = (el: Element | null) => {
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
}

export function CommandPalette() {
  const { activeProjectId, activeSprintId, cmdPaletteOpen, setCmdPaletteOpen } = useUiStore()
  const { data: projects = [] } = useProjects()
  const { data: stories = [] } = useStories(activeProjectId ?? '', activeSprintId ?? undefined)
  const { data: epics = [] } = useEpics(activeProjectId ?? '')
  const { goToProject, goToView, openStory } = useAppNavigate()
  const createStory = useCreateStory()

  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  // ⌘K / Ctrl+K and bare C when nothing is focused
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdPaletteOpen(true)
        return
      }
      if (
        (e.key === 'c' || e.key === 'C') &&
        !e.metaKey && !e.ctrlKey && !e.altKey &&
        !cmdPaletteOpen &&
        !isEditable(document.activeElement)
      ) {
        setCmdPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cmdPaletteOpen, setCmdPaletteOpen])

  // Focus input + reset query on open
  useEffect(() => {
    if (cmdPaletteOpen) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [cmdPaletteOpen])

  const close = () => setCmdPaletteOpen(false)

  const handleCreate = (title: string) => {
    if (!activeProjectId || !title.trim()) return
    const epicId = epics[0]?.id
    if (!epicId) return
    createStory.mutate(
      {
        projectId: activeProjectId,
        epicId,
        title: title.trim(),
        sprintId: activeSprintId ?? undefined,
      },
      { onSuccess: s => { openStory(s.id); close() } },
    )
  }

  return (
    <Dialog.Root open={cmdPaletteOpen} onOpenChange={v => !v && close()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.60)',
          zIndex: 60,
        }} />
        <Dialog.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed',
            top: '18vh',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(580px, calc(100vw - 32px))',
            zIndex: 61,
            background: 'var(--panel)',
            border: '1px solid var(--border-1)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-pop)',
            overflow: 'hidden',
            outline: 'none',
          }}
        >
          {/* scoped cmdk styles — only active inside this modal */}
          <style>{`
            [cmdk-item][data-selected=true] { background: var(--active); }
            [cmdk-item] { outline: none; cursor: pointer; }
          `}</style>

          <Command loop filter={paletteFilter} style={{ display: 'flex', flexDirection: 'column', maxHeight: '62vh' }}>
            {/* Search row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0 14px', height: 46,
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <Search size={14} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
              <Command.Input
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder="Search issues, go to view, create…"
                style={{
                  flex: 1, fontSize: 16,
                  color: 'var(--fg)', background: 'transparent',
                  border: 'none', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <Kbd>Esc</Kbd>
            </div>

            <Command.List style={{ overflowY: 'auto', padding: '6px 6px 8px' }}>
              <Command.Empty style={{
                padding: '20px', textAlign: 'center',
                color: 'var(--fg-3)', fontSize: 14.5,
              }}>
                No results
              </Command.Empty>

              {/* Actions */}
              <Command.Group>
                <GH>Actions</GH>
                <Command.Item
                  value="__create__"
                  onSelect={() => query.trim() ? handleCreate(query) : undefined}
                  style={item}
                >
                  <Plus size={13} style={{ color: 'var(--fg-3)', flexShrink: 0 }} />
                  {query.trim() ? (
                    <span style={{ color: 'var(--fg-2)' }}>
                      Create story: <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>{query}</strong>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--fg-2)' }}>New story…</span>
                  )}
                  <Kbd style={{ marginLeft: 'auto' }}>C</Kbd>
                </Command.Item>
              </Command.Group>

              {/* Navigation */}
              <Command.Group>
                <GH>Go to</GH>
                {VIEWS.map(v => (
                  <Command.Item
                    key={v.id}
                    value={`go ${v.label} ${v.id}`}
                    onSelect={() => { goToView(v.id); close() }}
                    style={item}
                  >
                    <span style={{ color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}>{v.icon}</span>
                    <span style={{ flex: 1, color: 'var(--fg-1)' }}>{v.label}</span>
                    <ArrowRight size={11} style={{ color: 'var(--fg-4)' }} />
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Projects */}
              {projects.length > 0 && (
                <Command.Group>
                  <GH>Projects</GH>
                  {projects.map(p => (
                    <Command.Item
                      key={p.id}
                      value={`project ${p.name} ${p.key}`}
                      onSelect={() => { goToProject(p.key, 'board'); close() }}
                      style={item}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, color: 'var(--fg-1)' }}>{p.name}</span>
                      <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{p.key}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Stories */}
              {stories.length > 0 && (
                <Command.Group>
                  <GH>Stories</GH>
                  {stories.map(s => (
                    <Command.Item
                      key={s.id}
                      value={`story ${s.storyId} ${s.title} ${s.status}`}
                      onSelect={() => { openStory(s.id); close() }}
                      style={item}
                    >
                      <StatusDot status={s.status} size={8} />
                      <StoryId id={s.storyId} />
                      <span style={{
                        flex: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        color: 'var(--fg-1)',
                      }}>{s.title}</span>
                      <PriorityBars priority={s.priority} />
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── tiny helpers ─────────────────────────────────────────────────

const item: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '6px 8px', borderRadius: 5,
  fontSize: 15, minHeight: 32,
}

function GH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '6px 8px 3px',
      fontSize: 12.5, fontWeight: 600,
      color: 'var(--fg-3)',
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {children}
    </div>
  )
}

function Kbd({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <kbd style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 5px', borderRadius: 3,
      border: '1px solid var(--border-2)',
      background: 'var(--bg-2)',
      fontSize: 12.5, color: 'var(--fg-3)',
      fontFamily: 'var(--font-mono)',
      ...style,
    }}>
      {children}
    </kbd>
  )
}
