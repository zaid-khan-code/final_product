'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'

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

export default function MyLeavePage() {
  const { showToast } = useToast()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeOption[]>([])
  const [requests, setRequests] = useState<LeaveRequest[]>([])

  const [leave_type_id, setLeaveTypeId] = useState('')
  const [start_date, setStartDate] = useState('')
  const [end_date, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    const [typesRes, reqRes] = await Promise.all([apiFetch<LeaveTypeApi[]>('/leave-types'), apiFetch<LeaveRequest[]>('/leave-requests')])
    setLoading(false)
    if (!typesRes.ok) showToast(typesRes.error, 'error')
    if (!reqRes.ok) showToast(reqRes.error, 'error')
    setLeaveTypes(
      typesRes.ok
        ? typesRes.data
            .filter((t) => t.is_active !== false)
            .map((t) => ({ id: t.id, name: t.name }))
            .sort((a, b) => a.name.localeCompare(b.name))
        : []
    )
    setRequests(reqRes.ok ? reqRes.data : [])
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canSubmit = useMemo(() => {
    return leaveTypes.length > 0 && !!leave_type_id && !!start_date && !!end_date
  }, [leave_type_id, start_date, end_date])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      showToast('Please select leave type and dates', 'error')
      return
    }
    setSubmitting(true)
    const res = await apiFetch<any>('/leave-requests', {
      method: 'POST',
      body: {
        employee_id: session?.user.employee_id, // backend will enforce self-service anyway
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
    await load()
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
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
              <select className="input" value={leave_type_id} onChange={(e) => setLeaveTypeId(e.target.value)} disabled={loading || leaveTypes.length === 0}>
                <option value="">Select…</option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {!loading && leaveTypes.length === 0 && (
                <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.35 }}>
                  No leave types are available. If this is unexpected, verify your account has <span className="mono">leave:read</span> permission.
                </div>
              )}
            </div>
            <div />
            <div>
              <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                start_date
              </label>
              <input className="input" type="date" value={start_date} onChange={(e) => setStartDate(e.target.value)} disabled={loading || leaveTypes.length === 0} />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                end_date
              </label>
              <input className="input" type="date" value={end_date} onChange={(e) => setEndDate(e.target.value)} disabled={loading || leaveTypes.length === 0} />
            </div>
          </div>
          <div>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
              reason (optional)
            </label>
            <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional…" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" disabled={submitting || !canSubmit}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ fontWeight: 900, marginBottom: 10 }}>My Requests</div>
        {loading ? (
          <div style={{ color: 'var(--t3)' }}>Loading…</div>
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
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.leave_type_name}</td>
                    <td className="mono">
                      {r.start_date} → {r.end_by_force ?? r.end_date}
                    </td>
                    <td className="mono">{r.days}</td>
                    <td className="mono" style={{ fontWeight: 900, color: r.status === 'pending' ? 'var(--amber)' : r.status === 'approved' ? 'var(--green)' : 'var(--red)' }}>
                      {r.status}
                    </td>
                    <td style={{ maxWidth: 280, color: 'var(--t2)' }}>{r.reason ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
