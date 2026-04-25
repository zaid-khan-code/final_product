'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ComingSoonCard from '@/components/ComingSoonCard'
import { useToast } from '@/contexts/ToastContext'
import { apiFetch } from '@/lib/api'

type LeaveRequest = {
  id: string
  employee_id: string
  employee_name: string
  leave_type_name: string
  department_name: string
  start_date: string
  end_date: string
  end_by_force: string | null
  days: number
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
}

type LeaveActionResponse = LeaveRequest

export default function LeavePage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [items, setItems] = useState<LeaveRequest[]>([])
  const [workingId, setWorkingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      const res = await apiFetch<LeaveRequest[]>('/leave-requests')
      if (!active) return

      setLoading(false)
      if (!res.ok) {
        showToast(res.error, 'error')
        return
      }
      setItems(res.data)
    }

    void load()

    return () => {
      active = false
    }
  }, [reloadKey, showToast])

  const pendingCount = useMemo(() => items.filter((item) => item.status === 'pending').length, [items])

  const act = async (id: string, action: 'approve' | 'reject') => {
    setWorkingId(id)
    const res = await apiFetch<LeaveActionResponse>(`/leave-requests/${id}/${action}`, { method: 'PATCH', body: {} })
    setWorkingId(null)
    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }
    showToast(`Request ${action}d`, 'success')
    setReloadKey((current) => current + 1)
  }

  return (
    <div className="section-grid">
      <div>
        <div className="pg-head">
          <div>
            <div className="pg-greet">Leave</div>
            <div className="pg-sub">Requests and approvals · {pendingCount} pending</div>
          </div>
          <button className="btn btn-secondary" onClick={() => setReloadKey((current) => current + 1)} disabled={loading}>
            Refresh
          </button>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                      No leave requests
                    </td>
                  </tr>
                ) : (
                  items.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div style={{ fontWeight: 900 }}>{request.employee_name}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                          {request.employee_id} · {request.department_name}
                        </div>
                      </td>
                      <td>{request.leave_type_name}</td>
                      <td className="mono">
                        {request.start_date} → {request.end_by_force ?? request.end_date}
                      </td>
                      <td className="mono">{request.days}</td>
                      <td
                        className="mono"
                        style={{
                          fontWeight: 900,
                          color:
                            request.status === 'pending'
                              ? 'var(--amber)'
                              : request.status === 'approved'
                                ? 'var(--green)'
                                : 'var(--red)',
                        }}
                      >
                        {request.status}
                      </td>
                      <td style={{ maxWidth: 280, color: 'var(--t2)' }}>{request.reason ?? '-'}</td>
                      <td>
                        {request.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm btn-primary" disabled={workingId === request.id} onClick={() => act(request.id, 'approve')}>
                              Approve
                            </button>
                            <button className="btn btn-sm btn-secondary" disabled={workingId === request.id} onClick={() => act(request.id, 'reject')}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ComingSoonCard
        title="Payroll impact and payslips"
        description="Leave-linked payroll adjustments and payslip publishing are not available yet in the current backend scope."
      />
    </div>
  )
}
