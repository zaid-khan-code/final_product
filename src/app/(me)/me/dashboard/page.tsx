'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'

type EmployeeInfo = { employee_id: string; name: string }
type AttendanceRow = { attendance_id: string | null; status: string; ack: boolean; check_in: string | null; check_out: string | null }

export default function MyDashboardPage() {
  const { showToast } = useToast()
  const { session } = useAuth()

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<EmployeeInfo | null>(null)
  const [att, setAtt] = useState<AttendanceRow | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const [empRes, attRes] = await Promise.all([
        apiFetch<EmployeeInfo[]>('/employees'),
        apiFetch<any[]>(`/attendance/daily?date=${encodeURIComponent(today)}`),
      ])
      if (!alive) return
      if (!empRes.ok) showToast(empRes.error, 'error')
      if (!attRes.ok) showToast(attRes.error, 'error')
      const emp = empRes.ok ? empRes.data[0] ?? null : null
      setMe(emp)
      const myRow = attRes.ok ? (attRes.data[0] as AttendanceRow | undefined) ?? null : null
      setAtt(myRow)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [showToast, today])

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="pg-greet">My Dashboard</div>
          <div className="pg-sub">Hello {me?.name ?? session?.user.email ?? 'Employee'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="card">
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            My Employee ID
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }} className="mono">
            {loading ? '…' : me?.employee_id ?? '-'}
          </div>
        </div>

        <div className="card">
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Today ({today})
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6 }}>{loading ? '…' : att?.status ?? 'absent'}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 6 }}>
            Ack: {att?.attendance_id ? (att?.ack ? 'yes' : 'no') : '-'}
          </div>
        </div>
      </div>
    </div>
  )
}

