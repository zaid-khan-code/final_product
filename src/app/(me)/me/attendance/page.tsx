'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

type DailyRow = {
  employee_id: string
  name: string
  attendance_id: string | null
  check_in: string | null
  check_out: string | null
  status: string
  ack: boolean
  notes: string | null
  expected_in: string
  end_time: string
  shift_name: string
}

export default function MyAttendancePage() {
  const { showToast } = useToast()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [row, setRow] = useState<DailyRow | null>(null)
  const [acking, setAcking] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await apiFetch<DailyRow[]>(`/attendance/daily?date=${encodeURIComponent(date)}`)
    setLoading(false)
    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }
    setRow(res.data[0] ?? null)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const onAck = async () => {
    if (!row?.attendance_id) {
      showToast('No attendance record to acknowledge for this date.', 'error')
      return
    }
    setAcking(true)
    const res = await apiFetch<any>(`/attendance/${row.attendance_id}/ack`, { method: 'PATCH', body: {} })
    setAcking(false)
    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }
    showToast('Attendance acknowledged', 'success')
    await load()
  }

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="pg-greet">My Attendance</div>
          <div className="pg-sub">Your attendance record and digital signature</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 160 }} />
          <button className="btn btn-primary" disabled={acking || !row?.attendance_id || row?.ack} onClick={onAck}>
            {row?.ack ? 'Acknowledged' : acking ? 'Acknowledging…' : 'Acknowledge'}
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ color: 'var(--t3)' }}>Loading…</div>
        ) : !row ? (
          <div style={{ color: 'var(--t3)' }}>No data for this date.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                status
              </div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{row.status}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                ack
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, color: row.ack ? 'var(--green)' : 'var(--amber)' }}>{row.ack ? 'yes' : 'no'}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                shift
              </div>
              <div style={{ fontWeight: 800 }}>{row.shift_name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                expected {row.expected_in} → {row.end_time}
              </div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                time
              </div>
              <div className="mono" style={{ fontWeight: 900 }}>
                {row.check_in ?? '--:--'} → {row.check_out ?? '--:--'}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                notes
              </div>
              <div style={{ color: 'var(--t2)' }}>{row.notes ?? '-'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

