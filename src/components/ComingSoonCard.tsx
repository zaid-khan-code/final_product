'use client'

import { Card } from '@/components/ui/Card'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

type ComingSoonCardProps = {
  title: string
  description: string
}

export default function ComingSoonCard({ title, description }: ComingSoonCardProps) {
  return (
    <Card className="coming-soon-card">
      <div className="coming-soon-badge mono">COMING SOON</div>
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
      <div style={{ color: 'var(--t3)', lineHeight: 1.45 }}>{description}</div>
      <ComingSoonOverlay />
    </Card>
  )
}
