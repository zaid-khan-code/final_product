'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

type DailyRow = {
  employee_id: string
  name: string
  department_name: string
  designation: string
  shift_id: string
  shift_name: string
  expected_in: string
  end_time: string
  late_after_minutes: number
  attendance_id: string | null
  check_in: string | null
  check_out: string | null
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
  notes: string | null
  ack: boolean
  notes_readonly: boolean
  late_by_minutes: number | null
}

type EditRow = DailyRow & { dirty?: boolean }

const statusOptions: Array<DailyRow['status']> = ['present', 'late', 'half_day', 'on_leave', 'absent']

export default function AttendancePage() {
  const { showToast } = useToast()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<EditRow[]>([])

  const load = async () => {
    setLoading(true)
    const res = await apiFetch<DailyRow[]>(`/attendance/daily?date=${encodeURIComponent(date)}`)
    setLoading(false)
    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }
    setRows(res.data.map((r) => ({ ...r, dirty: false })))
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const dirtyCount = useMemo(() => rows.filter((r) => r.dirty).length, [rows])

  const setField = (empId: string, patch: Partial<EditRow>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.employee_id !== empId) return r
        return { ...r, ...patch, dirty: true }
      })
    )
  }

  const onSave = async () => {
    const dirty = rows.filter((r) => r.dirty && !r.notes_readonly)
    if (dirty.length === 0) {
      showToast('No changes to save', 'info')
      return
    }

    setSaving(true)
    const res = await apiFetch<{ saved: number; records: any[] }>('/attendance/batch', {
      method: 'POST',
      body: {
        date,
        rows: dirty.map((r) => ({
          employee_id: r.employee_id,
          shift_id: r.shift_id,
          check_in: r.check_in,
          check_out: r.check_out,
          status: r.status,
          notes: r.notes,
        })),
      },
    })
    setSaving(false)

    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }

    showToast(`Saved ${res.data.saved} row(s)`, 'success')
    await load()
  }

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="pg-greet">Attendance</div>
          <div className="pg-sub">Daily sheet (edit grid → batch save)</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 160 }} />
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : `Save (${dirtyCount})`}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Emp</th>
                <th>Name</th>
                <th>Shift</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Ack</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                    No employees match filters for this date.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.employee_id} style={r.dirty ? { background: 'var(--pl)' } : undefined}>
                    <td className="mono">{r.employee_id}</td>
                    <td style={{ fontWeight: 800 }}>{r.name}</td>
                    <td style={{ fontSize: 11.5 }}>
                      {r.shift_name}
                      <div className="mono" style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                        {r.expected_in} → {r.end_time}
                      </div>
                    </td>
                    <td>
                      <select className="input" style={{ padding: '6px 8px' }} disabled={r.notes_readonly} value={r.status} onChange={(e) => setField(r.employee_id, { status: e.target.value as any })}>
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="input mono"
                        style={{ padding: '6px 8px' }}
                        disabled={r.notes_readonly}
                        value={r.check_in ?? ''}
                        placeholder="HH:MM"
                        onChange={(e) => setField(r.employee_id, { check_in: e.target.value || null })}
                      />
                    </td>
                    <td>
                      <input
                        className="input mono"
                        style={{ padding: '6px 8px' }}
                        disabled={r.notes_readonly}
                        value={r.check_out ?? ''}
                        placeholder="HH:MM"
                        onChange={(e) => setField(r.employee_id, { check_out: e.target.value || null })}
                      />
                    </td>
                    <td className="mono" style={{ color: r.ack ? 'var(--green)' : 'var(--t3)', fontWeight: 900 }}>
                      {r.attendance_id ? (r.ack ? 'ACK' : 'NO') : '-'}
                    </td>
                    <td>
                      <input
                        className="input"
                        style={{ padding: '6px 8px' }}
                        disabled={r.notes_readonly}
                        value={r.notes ?? ''}
                        placeholder={r.notes_readonly ? 'On approved leave' : 'Optional…'}
                        onChange={(e) => setField(r.employee_id, { notes: e.target.value || null })}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 10, color: 'var(--t3)', fontSize: 11.5 }}>
          Note: “Ack” is the employee’s digital signature. HR cannot acknowledge.
        </div>
      </div>
    </div>
  )
}

