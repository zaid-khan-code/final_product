'use client'

type ComingSoonCardProps = {
  title: string
  description: string
}

export default function ComingSoonCard({ title, description }: ComingSoonCardProps) {
  return (
    <div className="card coming-soon-card">
      <div className="coming-soon-badge mono">COMING SOON</div>
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
      <div style={{ color: 'var(--t3)', lineHeight: 1.45 }}>{description}</div>
      <div className="coming-soon-overlay">
        <div className="coming-soon-overlay__label mono">Unavailable in this phase</div>
      </div>
    </div>
  )
}
