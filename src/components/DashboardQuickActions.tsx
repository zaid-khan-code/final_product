'use client'

import { startTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type QuickAction = {
  label: string
  href?: string
  comingSoon?: boolean
}

const actions: QuickAction[] = [
  { label: 'Approve Leave', href: '/leave' },
  { label: 'Mark Attendance', href: '/attendance' },
  { label: 'Add Employee', href: '/employees/add' },
  { label: 'Record Promotion', comingSoon: true },
  { label: 'Add Penalty', comingSoon: true },
]

export default function DashboardQuickActions() {
  const router = useRouter()
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  return (
    <Card>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>Quick Actions</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.comingSoon ? 'secondary' : 'primary'}
            disabled={action.comingSoon}
            onClick={() => {
              if (!action.href) return
              setActiveLabel(action.label)
              startTransition(() => {
                router.push(action.href!)
              })
            }}
          >
            {action.comingSoon ? `${action.label} (Coming Soon)` : activeLabel === action.label ? 'Opening...' : action.label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
