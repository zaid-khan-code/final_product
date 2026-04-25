'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ComingSoonCard from '@/components/ComingSoonCard'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { apiFetch } from '@/lib/api'

type LeaveTypeApi = { id: string; name: string; is_active?: boolean }
type LeaveTypeOption = { id: string; name: string }
type LeaveRequest = {
  id: string
  leave_type_name: string
  start_date: string
  end_date: string
  end_by_force: string | null
  status: string
  reason: string | null
  days: number
}

type LeaveRequestCreateResponse = {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  reason: string | null
  status: string
}

export default function MyLeavePage() {
  const { showToast } = useToast()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeOption[]>([])
  const [requests, setRequests] = useState<LeaveRequest[]>([])

  const [leave_type_id, setLeaveTypeId] = useState('')
  const [start_date, setStartDate] = useState('')
  const [end_date, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      const [typesRes, requestRes] = await Promise.all([apiFetch<LeaveTypeApi[]>('/leave-types'), apiFetch<LeaveRequest[]>('/leave-requests')])
      if (!active) return

      setLoading(false)
      if (!typesRes.ok) showToast(typesRes.error, 'error')
      if (!requestRes.ok) showToast(requestRes.error, 'error')

      setLeaveTypes(
        typesRes.ok
          ? typesRes.data
              .filter((type) => type.is_active !== false)
              .map((type) => ({ id: type.id, name: type.name }))
              .sort((left, right) => left.name.localeCompare(right.name))
          : []
      )
      setRequests(requestRes.ok ? requestRes.data : [])
    }

    void load()

    return () => {
      active = false
    }
  }, [reloadKey, showToast])

  const canSubmit = useMemo(() => leaveTypes.length > 0 && Boolean(leave_type_id && start_date && end_date), [end_date, leaveTypes.length, leave_type_id, start_date])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) {
      showToast('Please select leave type and dates', 'error')
      return
    }

    setSubmitting(true)
    const res = await apiFetch<LeaveRequestCreateResponse>('/leave-requests', {
      method: 'POST',
      body: {
        employee_id: session?.user.employee_id,
        leave_type_id,
        start_date,
        end_date,
        reason: reason.trim() || null,
      },
    })
    setSubmitting(false)

    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }

    showToast('Leave request submitted', 'success')
    setLeaveTypeId('')
    setStartDate('')
    setEndDate('')
    setReason('')
    setReloadKey((current) => current + 1)
  }

  return (
    <div className="section-grid">
      <div>
        <div className="pg-head">
          <div>
            <div className="pg-greet">My Leave</div>
            <div className="pg-sub">Apply for leave and track approvals</div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Apply</div>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  leave type
                </label>
                <select className="input" value={leave_type_id} onChange={(event) => setLeaveTypeId(event.target.value)} disabled={loading || leaveTypes.length === 0}>
                  <option value="">Select...</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {!loading && leaveTypes.length === 0 ? (
                  <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.35 }}>
                    No leave types are available. If this is unexpected, verify your account has <span className="mono">leave:read</span> permission.
                  </div>
                ) : null}
              </div>
              <div />
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  start_date
                </label>
                <input className="input" type="date" value={start_date} onChange={(event) => setStartDate(event.target.value)} disabled={loading || leaveTypes.length === 0} />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  end_date
                </label>
                <input className="input" type="date" value={end_date} onChange={(event) => setEndDate(event.target.value)} disabled={loading || leaveTypes.length === 0} />
              </div>
            </div>
            <div>
              <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                reason (optional)
              </label>
              <input className="input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" disabled={submitting || !canSubmit}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div style={{ fontWeight: 900, marginBottom: 10 }}>My Requests</div>
          {loading ? (
            <div style={{ color: 'var(--t3)' }}>Loading...</div>
          ) : requests.length === 0 ? (
            <div style={{ color: 'var(--t3)' }}>No requests yet.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ComingSoonCard
        title="Payslips and payroll deductions"
        description="Leave-linked payroll deductions and payslip publication are tracked for a later self-service phase."
      />
    </div>
  )
}
