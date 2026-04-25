'use client'

export function ComingSoonOverlay({ label = 'Unavailable in this phase' }: { label?: string }) {
  return (
    <div className="coming-soon-panel">
      <div className="coming-soon-panel__veil" />
      <div className="coming-soon-panel__badge mono">{label}</div>
    </div>
  )
}
