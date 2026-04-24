'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

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

export default function LeavePage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<LeaveRequest[]>([])
  const [workingId, setWorkingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await apiFetch<LeaveRequest[]>('/leave-requests')
    setLoading(false)
    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }
    setItems(res.data)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pendingCount = useMemo(() => items.filter((x) => x.status === 'pending').length, [items])

  const act = async (id: string, action: 'approve' | 'reject') => {
    setWorkingId(id)
    const res = await apiFetch<any>(`/leave-requests/${id}/${action}`, { method: 'PATCH', body: {} })
    setWorkingId(null)
    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }
    showToast(`Request ${action}d`, 'success')
    await load()
  }

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="pg-greet">Leave</div>
          <div className="pg-sub">Requests + approvals · {pendingCount} pending</div>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
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
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                    No leave requests
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 900 }}>{r.employee_name}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        {r.employee_id} · {r.department_name}
                      </div>
                    </td>
                    <td>{r.leave_type_name}</td>
                    <td className="mono">
                      {r.start_date} → {r.end_by_force ?? r.end_date}
                    </td>
                    <td className="mono">{r.days}</td>
                    <td className="mono" style={{ fontWeight: 900, color: r.status === 'pending' ? 'var(--amber)' : r.status === 'approved' ? 'var(--green)' : 'var(--red)' }}>
                      {r.status}
                    </td>
                    <td style={{ maxWidth: 280, color: 'var(--t2)' }}>{r.reason ?? '-'}</td>
                    <td>
                      {r.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-primary" disabled={workingId === r.id} onClick={() => act(r.id, 'approve')}>
                            Approve
                          </button>
                          <button className="btn btn-sm btn-secondary" disabled={workingId === r.id} onClick={() => act(r.id, 'reject')}>
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
  )
}

