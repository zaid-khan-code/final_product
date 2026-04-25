import DashboardCharts from '@/components/DashboardCharts'
import DashboardQuickActions from '@/components/DashboardQuickActions'
import NotificationBell from '@/components/NotificationBell'
import ComingSoonCard from '@/components/ComingSoonCard'
import { ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TableShell } from '@/components/ui/TableShell'
import { fetchOrgAggregate, serverFetchBackendJson } from '@/lib/backend'
import { getSessionUserFromCookies } from '@/lib/auth'
import { isEmployee } from '@/lib/roles'
import { redirect } from 'next/navigation'

type SearchParamsValue = string | string[] | undefined

type PageProps = {
  searchParams?: Promise<Record<string, SearchParamsValue>>
}

type DashboardMetricsPayload = {
  range: string
  metrics: {
    total_employees: number
    new_joined_this_month: number
    employee_change_pct: number
    present_today: number
    present_pct: number
    on_leave_today: number
    pending_leave_count: number
    approved_leave_count: number
    penalties: {
      coming_soon: boolean
      count: number
      amount_pkr: number
    }
  }
  charts: {
    attendance: Array<{ month: string; attendance_count: number }>
    headcount: Array<{ month: string; headcount: number }>
  }
}

type PendingAction = {
  employee_id: string
  name: string
  missing_fields: string[]
  status: string
}

type UrgentAlert = {
  employee_id: string
  name: string
  type: string
  due_date: string
  status: string
}

type NotificationFeed = {
  unread_count: number
  items: Array<{
    id: string
    type: string
    message: string
    is_read: boolean
    created_at: string
    created_by_email?: string | null
  }>
}

type CalendarEvent = {
  id: string
  date: string
  title: string
  type: string
  visibility: string
}

type EmployeeInfo = {
  employee_id: string
  name: string
  date_of_birth: string | null
}

type JobInfo = {
  employee_id: string
  date_of_joining: string
  department_name: string
}

const pickParam = (value: SearchParamsValue) => (Array.isArray(value) ? value[0] ?? '' : value ?? '')

const readPayload = async <T,>(path: string) => {
  const { response, payload } = await serverFetchBackendJson<T>(path)
  return response.ok ? payload : null
}

const toMonthDay = (isoDate: string | null) => {
  if (!isoDate) return null
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getUpcomingPeopleMoments = (employees: EmployeeInfo[], jobs: JobInfo[]) => {
  const today = new Date()
  const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const birthdays = employees
    .map((employee) => ({
      kind: 'Birthday',
      name: employee.name,
      employee_id: employee.employee_id,
      date: toMonthDay(employee.date_of_birth),
      department_name: jobs.find((job) => job.employee_id === employee.employee_id)?.department_name ?? 'Unassigned',
    }))
    .filter((item): item is { kind: string; name: string; employee_id: string; date: string; department_name: string } => Boolean(item.date))

  const anniversaries = jobs
    .map((job) => ({
      kind: 'Anniversary',
      name: employees.find((employee) => employee.employee_id === job.employee_id)?.name ?? job.employee_id,
      employee_id: job.employee_id,
      date: toMonthDay(job.date_of_joining),
      department_name: job.department_name,
    }))
    .filter((item): item is { kind: string; name: string; employee_id: string; date: string; department_name: string } => Boolean(item.date))

  return [...birthdays, ...anniversaries]
    .filter((item) => item.date >= currentMonthDay)
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, 6)
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const sessionUser = await getSessionUserFromCookies()

  if (!sessionUser) {
    redirect('/login')
  }

  if (isEmployee(sessionUser.role)) {
    redirect('/me/dashboard')
  }

  const params = searchParams ? await searchParams : {}
  const range = pickParam(params.range) === '12m' ? '12m' : '6m'

  const metricsResponse = await fetchOrgAggregate(`/dashboard/metrics?range=${encodeURIComponent(range)}`, 300)
  const metrics = (await metricsResponse.json()) as DashboardMetricsPayload

  const today = new Date()
  const from = today.toISOString().slice(0, 10)
  const to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10)

  const [pendingActions, urgentAlerts, notifications, calendarEvents, employees, jobs] = await Promise.all([
    readPayload<PendingAction[]>('/pending-actions'),
    readPayload<UrgentAlert[]>('/urgent-alerts?days=30'),
    readPayload<NotificationFeed>('/notifications?scope=me'),
    readPayload<CalendarEvent[]>(`/calendar-events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
    readPayload<EmployeeInfo[]>('/employees'),
    readPayload<JobInfo[]>('/job-info'),
  ])

  const peopleMoments = getUpcomingPeopleMoments(employees ?? [], jobs ?? [])
  const recentActivity = (notifications?.items ?? []).slice(0, 5)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="pg-head">
        <div>
          <div className="pg-greet">Dashboard</div>
          <div className="pg-sub">Operations overview for HR and Super Admin with range-aware metrics and support queues.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <ButtonLink href="/dashboard?range=6m" variant={range === '6m' ? 'primary' : 'secondary'}>
            Last 6 Months
          </ButtonLink>
          <ButtonLink href="/dashboard?range=12m" variant={range === '12m' ? 'primary' : 'secondary'}>
            Last 12 Months
          </ButtonLink>
          <NotificationBell initialData={notifications ?? { unread_count: 0, items: [] }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <Card>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Total Employees
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{metrics.metrics.total_employees}</div>
          <div style={{ marginTop: 8, color: 'var(--t3)', fontSize: 12 }}>
            New this month: {metrics.metrics.new_joined_this_month} ({metrics.metrics.employee_change_pct}% vs last month)
          </div>
        </Card>

        <Card>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Present Today
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{metrics.metrics.present_today}</div>
          <div style={{ marginTop: 8, color: 'var(--t3)', fontSize: 12 }}>{metrics.metrics.present_pct}% of active headcount</div>
        </Card>

        <Card>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Leave Snapshot
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{metrics.metrics.on_leave_today}</div>
          <div style={{ marginTop: 8, color: 'var(--t3)', fontSize: 12 }}>
            Pending {metrics.metrics.pending_leave_count} • Approved {metrics.metrics.approved_leave_count}
          </div>
        </Card>

        <Card>
          <div className="mono" style={{ fontSize: 11, color: 'var(--t3)' }}>
            Penalties
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{metrics.metrics.penalties.count}</div>
          <div style={{ marginTop: 8, color: 'var(--t3)', fontSize: 12 }}>
            {metrics.metrics.penalties.coming_soon ? 'Coming Soon' : `PKR ${metrics.metrics.penalties.amount_pkr}`}
          </div>
        </Card>
      </div>

      <DashboardQuickActions />
      <DashboardCharts attendance={metrics.charts.attendance} headcount={metrics.charts.headcount} />

      <div className="section-grid-2">
        <Card>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>People Moments</div>
          {peopleMoments.length === 0 ? (
            <div style={{ color: 'var(--t3)' }}>No birthdays or anniversaries left in the current window.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {peopleMoments.map((item) => (
                <div key={`${item.kind}-${item.employee_id}`} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong>{item.name}</strong>
                    <span className="mono">{item.date}</span>
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--t3)', fontSize: 12 }}>
                    {item.kind} • {item.department_name} • {item.employee_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Announcements & Events</div>
          {!(calendarEvents ?? []).length ? (
            <div style={{ color: 'var(--t3)' }}>No calendar events scheduled for the rest of this month.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {(calendarEvents ?? []).slice(0, 6).map((event) => (
                <div key={event.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong>{event.title}</strong>
                    <span className="mono">{event.date}</span>
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--t3)', fontSize: 12 }}>
                    {event.type} • visibility: {event.visibility}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Pending Actions</div>
          {!(pendingActions ?? []).length ? (
            <div style={{ color: 'var(--t3)' }}>No employee records are currently blocked by missing core HR fields.</div>
          ) : (
            <TableShell>
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Missing Fields</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(pendingActions ?? []).slice(0, 6).map((item) => (
                    <tr key={item.employee_id}>
                      <td>
                        <strong>{item.name}</strong>
                        <div className="mono">{item.employee_id}</div>
                      </td>
                      <td>{item.missing_fields.join(', ')}</td>
                      <td className="mono">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Card>

        <Card>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Urgent Alerts</div>
          {!(urgentAlerts ?? []).length ? (
            <div style={{ color: 'var(--t3)' }}>No probation or contract deadlines are within the alert window.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {(urgentAlerts ?? []).slice(0, 6).map((item) => (
                <div key={`${item.employee_id}-${item.type}`} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong>{item.name}</strong>
                    <span className="mono">{item.due_date}</span>
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--t3)', fontSize: 12 }}>
                    {item.type} • {item.employee_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="section-grid-2">
        <Card>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Recent Activity</div>
          {recentActivity.length === 0 ? (
            <div style={{ color: 'var(--t3)' }}>No recent system activity is available from notifications yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {recentActivity.map((item) => (
                <div key={item.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong>{item.type}</strong>
                    <span className="mono">{new Date(item.created_at).toLocaleDateString('en-PK')}</span>
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--t2)', fontSize: 12 }}>{item.message}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <ComingSoonCard
          title="Recent Activity Extensions"
          description="Promotion and penalty activity stay visible as a reserved dashboard block, but the underlying modules remain intentionally out of scope for this migration slice."
        />
      </div>
    </div>
  )
}
