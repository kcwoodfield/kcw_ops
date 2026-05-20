export function ViewPlaceholder({ name }: { name: string }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fg-2)',
        fontSize: 13,
      }}
    >
      {name} — coming soon
    </div>
  )
}
