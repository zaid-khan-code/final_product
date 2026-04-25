'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ComingSoonCard from '@/components/ComingSoonCard'
import { useToast } from '@/contexts/ToastContext'
import { apiFetch } from '@/lib/api'

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
type BatchSaveResponse = { saved: number; records: DailyRow[] }

const statusOptions: Array<DailyRow['status']> = ['present', 'late', 'half_day', 'on_leave', 'absent']

export default function AttendancePage() {
  const { showToast } = useToast()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [rows, setRows] = useState<EditRow[]>([])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      const res = await apiFetch<DailyRow[]>(`/attendance/daily?date=${encodeURIComponent(date)}`)
      if (!active) return

      setLoading(false)
      if (!res.ok) {
        showToast(res.error, 'error')
        return
      }
      setRows(res.data.map((row) => ({ ...row, dirty: false })))
    }

    void load()

    return () => {
      active = false
    }
  }, [date, reloadKey, showToast])

  const dirtyCount = useMemo(() => rows.filter((row) => row.dirty).length, [rows])

  const setField = (employeeId: string, patch: Partial<EditRow>) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.employee_id !== employeeId) return row
        return { ...row, ...patch, dirty: true }
      })
    )
  }

  const onSave = async () => {
    const dirty = rows.filter((row) => row.dirty && !row.notes_readonly)
    if (dirty.length === 0) {
      showToast('No changes to save', 'info')
      return
    }

    setSaving(true)
    const res = await apiFetch<BatchSaveResponse>('/attendance/batch', {
      method: 'POST',
      body: {
        date,
        rows: dirty.map((row) => ({
          employee_id: row.employee_id,
          shift_id: row.shift_id,
          check_in: row.check_in,
          check_out: row.check_out,
          status: row.status,
          notes: row.notes,
        })),
      },
    })
    setSaving(false)

    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }

    showToast(`Saved ${res.data.saved} row(s)`, 'success')
    setReloadKey((current) => current + 1)
  }

  return (
    <div className="section-grid">
      <div>
        <div className="pg-head">
          <div>
            <div className="pg-greet">Attendance</div>
            <div className="pg-sub">Daily sheet for HR review and batch save</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ width: 160 }} />
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : `Save (${dirtyCount})`}
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
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                      No employees match filters for this date.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.employee_id} style={row.dirty ? { background: 'var(--pl)' } : undefined}>
                      <td className="mono">{row.employee_id}</td>
                      <td style={{ fontWeight: 800 }}>{row.name}</td>
                      <td style={{ fontSize: 11.5 }}>
                        {row.shift_name}
                        <div className="mono" style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>
                          {row.expected_in} → {row.end_time}
                        </div>
                      </td>
                      <td>
                        <select
                          className="input"
                          style={{ padding: '6px 8px' }}
                          disabled={row.notes_readonly}
                          value={row.status}
                          onChange={(event) => setField(row.employee_id, { status: event.target.value as DailyRow['status'] })}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="input mono"
                          style={{ padding: '6px 8px' }}
                          disabled={row.notes_readonly}
                          value={row.check_in ?? ''}
                          placeholder="HH:MM"
                          onChange={(event) => setField(row.employee_id, { check_in: event.target.value || null })}
                        />
                      </td>
                      <td>
                        <input
                          className="input mono"
                          style={{ padding: '6px 8px' }}
                          disabled={row.notes_readonly}
                          value={row.check_out ?? ''}
                          placeholder="HH:MM"
                          onChange={(event) => setField(row.employee_id, { check_out: event.target.value || null })}
                        />
                      </td>
                      <td className="mono" style={{ color: row.ack ? 'var(--green)' : 'var(--t3)', fontWeight: 900 }}>
                        {row.attendance_id ? (row.ack ? 'ACK' : 'NO') : '-'}
                      </td>
                      <td>
                        <input
                          className="input"
                          style={{ padding: '6px 8px' }}
                          disabled={row.notes_readonly}
                          value={row.notes ?? ''}
                          placeholder={row.notes_readonly ? 'On approved leave' : 'Optional...'}
                          onChange={(event) => setField(row.employee_id, { notes: event.target.value || null })}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 10, color: 'var(--t3)', fontSize: 11.5 }}>
            Note: &quot;Ack&quot; is the employee&apos;s digital signature. HR cannot acknowledge attendance on their behalf.
          </div>
        </div>
      </div>

      <ComingSoonCard
        title="Penalty automation"
        description="Attendance-linked penalties and disciplinary automation are intentionally held for a later backend phase."
      />
    </div>
  )
}
