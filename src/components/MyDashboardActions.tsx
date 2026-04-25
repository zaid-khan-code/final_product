'use client'

import React, { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mutateJson, ApiMutationError, getFieldIssueMessage } from '@/lib/mutations'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'

type LeaveType = {
  id: string
  name: string
}

type LeaveBalanceEntry = {
  leave_type: string
  balance: number
  total: number
}

type AttendanceRow = {
  attendance_id: string | null
  ack: boolean
}

type Props = {
  employeeId: string
  attendance: AttendanceRow | null
  leaveTypes: LeaveType[]
  balances: LeaveBalanceEntry[]
}

const getDaysInclusive = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000)
  return diff + 1
}

export default function MyDashboardActions({ employeeId, attendance, leaveTypes, balances }: Props) {
  const queryClient = useQueryClient()
  const [leaveTypeId, setLeaveTypeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const balanceByType = useMemo(() => new Map(balances.map((entry) => [entry.leave_type.toLowerCase(), entry.balance])), [balances])

  const selectedLeaveType = useMemo(() => leaveTypes.find((item) => item.id === leaveTypeId) ?? null, [leaveTypeId, leaveTypes])

  const requestedDays = useMemo(() => {
    if (!startDate || !endDate) return null
    if (endDate < startDate) return null
    return getDaysInclusive(startDate, endDate)
  }, [endDate, startDate])

  const availableBalance = selectedLeaveType ? balanceByType.get(selectedLeaveType.name.toLowerCase()) ?? null : null

  const leaveValidationError = useMemo(() => {
    if (!startDate || !endDate || !selectedLeaveType) return null
    if (endDate < startDate) return 'End date must be on or after the start date.'
    if (requestedDays && availableBalance !== null && requestedDays > availableBalance) {
      return `${selectedLeaveType.name} balance is ${availableBalance} day(s), but the selected range needs ${requestedDays}.`
    }
    return null
  }, [availableBalance, endDate, requestedDays, selectedLeaveType, startDate])

  const ackMutation = useMutation({
    mutationFn: async () => {
      if (!attendance?.attendance_id) {
        throw new Error('No attendance record is available for acknowledgement.')
      }

      return mutateJson(`/attendance/${attendance.attendance_id}/ack`, {
        method: 'PATCH',
        body: {},
      })
    },
    onSuccess: () => {
      window.location.reload()
    },
  })

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!leaveTypeId || !startDate || !endDate) {
        throw new Error('Leave type and both dates are required.')
      }

      return mutateJson('/leave-requests', {
        method: 'POST',
        body: {
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim() || null,
        },
      })
    },
    onSuccess: async () => {
      setLeaveTypeId('')
      setStartDate('')
      setEndDate('')
      setReason('')
      setFormError(null)
      await queryClient.invalidateQueries()
      window.location.reload()
    },
    onError: (error) => {
      if (error instanceof ApiMutationError) {
        setFormError(getFieldIssueMessage(error.details) ?? error.message)
        return
      }

      setFormError(error instanceof Error ? error.message : 'Unable to submit leave request.')
    },
  })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (leaveValidationError) {
      setFormError(leaveValidationError)
      return
    }

    leaveMutation.mutate()
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 900 }}>Attendance Acknowledgement</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 6 }}>
              Acknowledge today&apos;s attendance once it has been marked by HR.
            </div>
          </div>
          {attendance?.attendance_id ? (
            attendance.ack ? (
              <Pill tone="success">Acknowledged</Pill>
            ) : (
              <Button variant="primary" disabled={ackMutation.isPending} onClick={() => ackMutation.mutate()}>
                {ackMutation.isPending ? 'Saving...' : 'Acknowledge'}
              </Button>
            )
          ) : (
            <Pill>No record yet</Pill>
          )}
        </div>
        {ackMutation.isError ? (
          <div style={{ marginTop: 10, color: 'var(--red)', fontSize: 12 }}>
            {ackMutation.error instanceof Error ? ackMutation.error.message : 'Unable to acknowledge attendance.'}
          </div>
        ) : null}
      </Card>

      <Card>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Apply Leave</div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                leave type
              </label>
              <select className="input" value={leaveTypeId} onChange={(event) => setLeaveTypeId(event.target.value)}>
                <option value="">Select...</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                available balance
              </label>
              <div className="input" style={{ display: 'flex', alignItems: 'center' }}>
                {selectedLeaveType ? `${availableBalance ?? 0} day(s)` : 'Select a leave type'}
              </div>
            </div>
            <div>
              <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                start date
              </label>
              <input className="input" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                end date
              </label>
              <input className="input" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
          </div>

          <div>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
              reason (optional)
            </label>
            <input className="input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>
              {requestedDays ? `Requested duration: ${requestedDays} day(s)` : 'Select dates to calculate duration.'}
            </div>
            <Button variant="primary" disabled={leaveMutation.isPending || !leaveTypeId || !startDate || !endDate}>
              {leaveMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>

          {formError ? <div style={{ color: 'var(--red)', fontSize: 12 }}>{formError}</div> : null}
        </form>
      </Card>
    </div>
  )
}
