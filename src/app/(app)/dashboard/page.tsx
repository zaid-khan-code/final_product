'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { apiFetch } from '@/lib/api'

type EmployeeSummary = { employee_id: string }
type LeaveSummary = { id: string; status: 'pending' | 'approved' | 'rejected' }
type AttendanceSummary = { attendance_id: string | null }

export default function DashboardPage() {
  const { showToast } = useToast()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<{ employees: number; pendingLeaves: number; todaysMarked: number } | null>(null)

  useEffect(() => {
    let alive = true

    ;(async () => {
      setLoading(true)

      const [employeesRes, leaveRes, attendanceRes] = await Promise.all([
        apiFetch<EmployeeSummary[]>('/employees'),
        apiFetch<LeaveSummary[]>('/leave-requests'),
        apiFetch<AttendanceSummary[]>(`/attendance/daily?date=${encodeURIComponent(today)}`),
      ])

      if (!alive) return

      if (!employeesRes.ok) showToast(`Employees: ${employeesRes.error}`, 'error')
      if (!leaveRes.ok) showToast(`Leaves: ${leaveRes.error}`, 'error')
      if (!attendanceRes.ok) showToast(`Attendance: ${attendanceRes.error}`, 'error')

      const pendingLeaves = leaveRes.ok ? leaveRes.data.filter((row) => row.status === 'pending').length : 0
      const todaysMarked = attendanceRes.ok ? attendanceRes.data.filter((row) => row.attendance_id).length : 0

      setMetrics({
        employees: employeesRes.ok ? employeesRes.data.length : 0,
        pendingLeaves,
        todaysMarked,
      })
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
          <div className="pg-greet">Dashboard</div>
          <div className="pg-sub">Quick overview for {today}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="card">
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Employees
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{loading ? '...' : metrics?.employees ?? 0}</div>
        </div>

        <div className="card">
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Pending Leave Requests
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{loading ? '...' : metrics?.pendingLeaves ?? 0}</div>
        </div>

        <div className="card">
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Attendance Marked Today
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{loading ? '...' : metrics?.todaysMarked ?? 0}</div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 6 }}>Marked rows have an attendance record.</div>
        </div>
      </div>
    </div>
  )
}
