import ComingSoonCard from '@/components/ComingSoonCard'
import MyDashboardActions from '@/components/MyDashboardActions'
import { Card } from '@/components/ui/Card'
import { TableShell } from '@/components/ui/TableShell'
import { getSessionUserFromCookies } from '@/lib/auth'
import { serverFetchBackendJson } from '@/lib/backend'
import { redirect } from 'next/navigation'

type EmployeeInfo = {
  id: string
  employee_id: string
  name: string
  father_name: string | null
  cnic: string | null
  date_of_birth: string | null
}

type JobInfoRow = {
  id: string
  employee_id: string
  department_name: string
  designation_title: string
  employment_type_name: string
  job_status_name: string
  work_mode_name: string
  work_location_name: string
  shift_name: string
  date_of_joining: string
  date_of_exit: string | null
}

type AttendanceRow = {
  employee_id: string
  attendance_id: string | null
  status: string
  ack: boolean
  check_in: string | null
  check_out: string | null
  shift_name: string
}

type AttendanceReportRow = {
  employee_id: string
  total_working_days: number
  presents: number
  lates: number
  half_days: number
  absents: number
  on_leaves: number
  attendance_pct: number | null
}

type LeaveType = {
  id: string
  name: string
  is_active?: boolean
}

type LeaveBalanceRow = {
  employee_id: string
  name: string
  department_name: string
  balances: Array<{
    leave_type: string
    balance: number
    total: number
  }>
}

type LeaveRequestRow = {
  id: string
  leave_type_name: string
  start_date: string
  end_date: string
  end_by_force: string | null
  status: string
  reason: string | null
  days: number
}

type CalendarEventRow = {
  id: string
  date: string
  title: string
  type: string
}

const today = new Date()
const todayIso = today.toISOString().slice(0, 10)
const month = String(today.getMonth() + 1)
const year = String(today.getFullYear())
const monthEndIso = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10)

const readPayload = async <T,>(path: string) => {
  const { response, payload } = await serverFetchBackendJson<T>(path)
  return response.ok ? payload : null
}

export default async function MyDashboardPage() {
  const sessionUser = await getSessionUserFromCookies()

  if (!sessionUser) {
    redirect('/login')
  }

  if (!sessionUser.employee_id) {
    redirect('/launchpad')
  }

  const employeeId = sessionUser.employee_id

  const [employees, jobRows, dailyRows, attendanceReport, leaveBalances, leaveRequests, leaveTypes, calendarEvents] = await Promise.all([
    readPayload<EmployeeInfo[]>(`/employees?search=${encodeURIComponent(employeeId)}`),
    readPayload<JobInfoRow[]>(`/job-info?employee=${encodeURIComponent(employeeId)}`),
    readPayload<AttendanceRow[]>(`/attendance/daily?date=${encodeURIComponent(todayIso)}&employee=${encodeURIComponent(employeeId)}`),
    readPayload<AttendanceReportRow[]>(`/attendance/report?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}&employee=${encodeURIComponent(employeeId)}`),
    readPayload<LeaveBalanceRow[]>(`/leave-requests/balances?employee=${encodeURIComponent(employeeId)}`),
    readPayload<LeaveRequestRow[]>(`/leave-requests?employee=${encodeURIComponent(employeeId)}`),
    readPayload<LeaveType[]>('/leave-types'),
    readPayload<CalendarEventRow[]>(`/calendar-events?from=${encodeURIComponent(todayIso)}&to=${encodeURIComponent(monthEndIso)}`),
  ])

  const employee = employees?.find((item) => item.employee_id === employeeId) ?? null
  const job = jobRows?.find((item) => item.employee_id === employeeId) ?? null
  const attendance = dailyRows?.find((item) => item.employee_id === employeeId) ?? null
  const monthlyAttendance = attendanceReport?.find((item) => item.employee_id === employeeId) ?? null
  const balanceRow = leaveBalances?.find((item) => item.employee_id === employeeId) ?? null
  const pendingRequests = (leaveRequests ?? []).filter((item) => item.status === 'pending')
  const activeLeaveTypes = (leaveTypes ?? []).filter((item) => item.is_active !== false).sort((left, right) => left.name.localeCompare(right.name))
  const upcomingEvents = (calendarEvents ?? []).slice(0, 5)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="pg-head">
        <div>
          <div className="pg-greet">My Dashboard</div>
          <div className="pg-sub">Welcome back, {employee?.name ?? sessionUser.email ?? employeeId}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <Card>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Employee ID
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }} className="mono">
            {employeeId}
          </div>
          <div style={{ marginTop: 8, color: 'var(--t3)', fontSize: 12 }}>{job?.designation_title ?? 'Designation pending'}</div>
        </Card>

        <Card>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Today&apos;s Attendance
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{attendance?.status ?? 'absent'}</div>
          <div style={{ marginTop: 8, color: 'var(--t3)', fontSize: 12 }}>
            {attendance?.shift_name ? `Shift: ${attendance.shift_name}` : 'Shift not assigned'}
          </div>
        </Card>

        <Card>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Present Days This Month
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {monthlyAttendance ? `${monthlyAttendance.presents}/${monthlyAttendance.total_working_days}` : '0/0'}
          </div>
          <div style={{ marginTop: 8, color: 'var(--t3)', fontSize: 12 }}>
            Attendance: {monthlyAttendance?.attendance_pct ?? 0}%
          </div>
        </Card>

        <Card>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Pending Leave Requests
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{pendingRequests.length}</div>
          <div style={{ marginTop: 8, color: 'var(--t3)', fontSize: 12 }}>
            {balanceRow?.balances.length ? `${balanceRow.balances.length} leave wallet(s) active` : 'No leave balances yet'}
          </div>
        </Card>
      </div>

      <div className="section-grid">
        <div style={{ display: 'grid', gap: 12 }}>
          <Card>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Profile & Job Snapshot</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  name
                </div>
                <div style={{ fontWeight: 800 }}>{employee?.name ?? '-'}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  department
                </div>
                <div style={{ fontWeight: 800 }}>{job?.department_name ?? '-'}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  work location
                </div>
                <div style={{ fontWeight: 800 }}>{job?.work_location_name ?? '-'}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  work mode
                </div>
                <div style={{ fontWeight: 800 }}>{job?.work_mode_name ?? '-'}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  shift
                </div>
                <div style={{ fontWeight: 800 }}>{job?.shift_name ?? attendance?.shift_name ?? '-'}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  joined
                </div>
                <div style={{ fontWeight: 800 }} className="mono">
                  {job?.date_of_joining ?? '-'}
                </div>
              </div>
            </div>
          </Card>

          <MyDashboardActions
            employeeId={employeeId}
            attendance={attendance ? { attendance_id: attendance.attendance_id, ack: attendance.ack } : null}
            leaveTypes={activeLeaveTypes.map((item) => ({ id: item.id, name: item.name }))}
            balances={balanceRow?.balances ?? []}
          />
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <Card>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Leave Wallet</div>
            {!balanceRow?.balances.length ? (
              <div style={{ color: 'var(--t3)' }}>No leave balances available.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {balanceRow.balances.map((entry) => (
                  <div key={entry.leave_type} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <strong>{entry.leave_type}</strong>
                      <span className="mono">
                        {entry.balance}/{entry.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Pending Requests</div>
            {pendingRequests.length === 0 ? (
              <div style={{ color: 'var(--t3)' }}>No pending leave requests.</div>
            ) : (
              <TableShell>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((item) => (
                      <tr key={item.id}>
                        <td>{item.leave_type_name}</td>
                        <td className="mono">
                          {item.start_date} → {item.end_by_force ?? item.end_date}
                        </td>
                        <td className="mono">{item.days}</td>
                        <td className="mono" style={{ color: 'var(--amber)', fontWeight: 900 }}>
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            )}
          </Card>

          <Card>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Calendar Preview</div>
            {upcomingEvents.length === 0 ? (
              <div style={{ color: 'var(--t3)' }}>No upcoming events this month.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {upcomingEvents.map((item) => (
                  <div key={item.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
                      {item.date}
                    </div>
                    <div style={{ fontWeight: 800, marginTop: 4 }}>{item.title}</div>
                    <div style={{ marginTop: 6, color: 'var(--t3)', fontSize: 12 }}>{item.type}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <ComingSoonCard
            title="My Team"
            description="Peer/team insights remain disabled in self-service so the employee dashboard stays strictly self-only."
          />
        </div>
      </div>
    </div>
  )
}
