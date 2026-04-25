import ComingSoonCard from '@/components/ComingSoonCard'
import EmployeeDirectorySearch from '@/components/EmployeeDirectorySearch'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TableShell } from '@/components/ui/TableShell'
import { serverFetchBackendJson } from '@/lib/backend'

type SearchParamsValue = string | string[] | undefined

type PageProps = {
  searchParams?: Promise<Record<string, SearchParamsValue>>
}

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
  work_mode_name?: string
  work_location_name?: string
  shift_name: string
  date_of_joining: string
  date_of_exit: string | null
}

type AttendanceRow = {
  employee_id: string
  attendance_id: string | null
  status: string
  ack: boolean
  shift_name: string
  check_in: string | null
  check_out: string | null
}

type AttendanceReportRow = {
  employee_id: string
  total_working_days: number
  presents: number
  absents: number
  lates: number
  half_days: number
  on_leaves: number
  attendance_pct: number | null
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

const today = new Date()
const todayIso = today.toISOString().slice(0, 10)
const month = String(today.getMonth() + 1)
const year = String(today.getFullYear())

const readPayload = async <T,>(path: string) => {
  const { response, payload } = await serverFetchBackendJson<T>(path)
  return response.ok ? payload : null
}

const pickParam = (value: SearchParamsValue) => (Array.isArray(value) ? value[0] ?? '' : value ?? '')

export default async function EmployeesPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {}
  const search = pickParam(params.search).trim()
  const activeTab = pickParam(params.tab).trim() || 'personal'
  const department = pickParam(params.department).trim()
  const status = pickParam(params.status).trim()
  const workingMode = pickParam(params.workingMode).trim()
  const location = pickParam(params.location).trim()
  const exitFilter = pickParam(params.exit).trim()

  const [employees, allJobRows] = await Promise.all([readPayload<EmployeeInfo[]>('/employees'), readPayload<JobInfoRow[]>('/job-info')])

  const baseEmployees = employees ?? []
  const jobRows = allJobRows ?? []
  const jobByEmployeeId = new Map(jobRows.map((row) => [row.employee_id, row]))

  const directoryRows = baseEmployees
    .map((employee) => ({ employee, job: jobByEmployeeId.get(employee.employee_id) ?? null }))
    .filter(({ employee, job }) => {
      const matchesSearch =
        !search ||
        employee.employee_id.toLowerCase().includes(search.toLowerCase()) ||
        employee.name.toLowerCase().includes(search.toLowerCase())

      const matchesDepartment = !department || job?.department_name === department
      const matchesStatus = !status || job?.job_status_name === status
      const matchesWorkingMode = !workingMode || job?.work_mode_name === workingMode
      const matchesLocation = !location || job?.work_location_name === location
      const matchesExit =
        !exitFilter ||
        (exitFilter === 'active' ? !job?.date_of_exit : exitFilter === 'terminated' ? Boolean(job?.date_of_exit) : true)

      return matchesSearch && matchesDepartment && matchesStatus && matchesWorkingMode && matchesLocation && matchesExit
    })

  const activeMatch = search && directoryRows.length === 1 ? directoryRows[0] : null
  const activeEmployeeId = activeMatch?.employee.employee_id ?? null

  const [jobInfoRows, dailyRows, attendanceReport, leaveBalances, leaveRequests] = activeEmployeeId
    ? await Promise.all([
        readPayload<JobInfoRow[]>(`/job-info?employee=${encodeURIComponent(activeEmployeeId)}`),
        activeTab === 'attendance'
          ? readPayload<AttendanceRow[]>(`/attendance/daily?date=${encodeURIComponent(todayIso)}&employee=${encodeURIComponent(activeEmployeeId)}`)
          : Promise.resolve(null),
        activeTab === 'attendance'
          ? readPayload<AttendanceReportRow[]>(`/attendance/report?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}&employee=${encodeURIComponent(activeEmployeeId)}`)
          : Promise.resolve(null),
        activeTab === 'leave'
          ? readPayload<LeaveBalanceRow[]>(`/leave-requests/balances?employee=${encodeURIComponent(activeEmployeeId)}`)
          : Promise.resolve(null),
        activeTab === 'leave' ? readPayload<LeaveRequestRow[]>(`/leave-requests?employee=${encodeURIComponent(activeEmployeeId)}`) : Promise.resolve(null),
      ])
    : [null, null, null, null, null]

  const distinctValues = {
    departments: [...new Set(jobRows.map((row) => row.department_name).filter(Boolean))].sort(),
    statuses: [...new Set(jobRows.map((row) => row.job_status_name).filter(Boolean))].sort(),
    modes: [...new Set(jobRows.map((row) => row.work_mode_name).filter(Boolean))].sort(),
    locations: [...new Set(jobRows.map((row) => row.work_location_name).filter(Boolean))].sort(),
  }

  const activeJob = jobInfoRows?.[0] ?? activeMatch?.job ?? null
  const activeDaily = dailyRows?.find((row) => row.employee_id === activeEmployeeId) ?? null
  const activeMonthly = attendanceReport?.find((row) => row.employee_id === activeEmployeeId) ?? null
  const activeBalances = leaveBalances?.find((row) => row.employee_id === activeEmployeeId) ?? null

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="pg-greet">Employees</div>
          <div className="pg-sub">URL-driven employee directory with lazy detail tabs.</div>
        </div>
        <ButtonLink href="/employees/add" variant="primary">
          Add Employee
        </ButtonLink>
      </div>

      <EmployeeDirectorySearch
        initialSearch={search}
        initialTab={activeTab}
        suggestions={baseEmployees.map((item) => ({ employee_id: item.employee_id, name: item.name }))}
      />

      <Card style={{ marginBottom: 12 }}>
        <form action="/employees" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <input type="hidden" name="search" value={search} />
          <input type="hidden" name="tab" value={activeTab} />

          <select className="input" name="department" defaultValue={department}>
            <option value="">All departments</option>
            {distinctValues.departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select className="input" name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {distinctValues.statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select className="input" name="workingMode" defaultValue={workingMode}>
            <option value="">All working modes</option>
            {distinctValues.modes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select className="input" name="location" defaultValue={location}>
            <option value="">All locations</option>
            {distinctValues.locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select className="input" name="exit" defaultValue={exitFilter}>
            <option value="">All employment states</option>
            <option value="active">Active</option>
            <option value="terminated">Terminated / resigned</option>
          </select>

          <Button variant="secondary" type="submit">
            Apply Filters
          </Button>
        </form>
      </Card>

      {activeMatch ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div className="pg-greet" style={{ fontSize: 20 }}>
                  {activeMatch.employee.name}
                </div>
                <div className="pg-sub">
                  <span className="mono">{activeMatch.employee.employee_id}</span> · {activeJob?.designation_title ?? 'Designation pending'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['personal', 'job-info', 'attendance', 'leave', 'medical', 'payslips', 'promotions', 'penalties', 'activity', 'documents'].map((tab) => (
                  <ButtonLink
                    key={tab}
                    href={`/employees?search=${encodeURIComponent(activeMatch.employee.employee_id)}&tab=${encodeURIComponent(tab)}`}
                    variant={activeTab === tab ? 'primary' : 'secondary'}
                  >
                    {tab}
                  </ButtonLink>
                ))}
              </div>
            </div>
          </Card>

          {activeTab === 'personal' ? (
            <Card>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Personal</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    employee id
                  </div>
                  <div style={{ fontWeight: 800 }}>{activeMatch.employee.employee_id}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    name
                  </div>
                  <div style={{ fontWeight: 800 }}>{activeMatch.employee.name}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    father name
                  </div>
                  <div style={{ fontWeight: 800 }}>{activeMatch.employee.father_name ?? '-'}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    cnic
                  </div>
                  <div style={{ fontWeight: 800 }}>{activeMatch.employee.cnic ?? '-'}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    date of birth
                  </div>
                  <div style={{ fontWeight: 800 }} className="mono">
                    {activeMatch.employee.date_of_birth ?? '-'}
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {activeTab === 'job-info' ? (
            <Card>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Job Info</div>
              {!activeJob ? (
                <div style={{ color: 'var(--t3)' }}>No job info found for this employee.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                      department
                    </div>
                    <div style={{ fontWeight: 800 }}>{activeJob.department_name}</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                      designation
                    </div>
                    <div style={{ fontWeight: 800 }}>{activeJob.designation_title}</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                      employment type
                    </div>
                    <div style={{ fontWeight: 800 }}>{activeJob.employment_type_name}</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                      status
                    </div>
                    <div style={{ fontWeight: 800 }}>{activeJob.job_status_name}</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                      work mode
                    </div>
                    <div style={{ fontWeight: 800 }}>{activeJob.work_mode_name ?? '-'}</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                      work location
                    </div>
                    <div style={{ fontWeight: 800 }}>{activeJob.work_location_name ?? '-'}</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                      shift
                    </div>
                    <div style={{ fontWeight: 800 }}>{activeJob.shift_name}</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                      joined
                    </div>
                    <div style={{ fontWeight: 800 }} className="mono">
                      {activeJob.date_of_joining}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ) : null}

          {activeTab === 'attendance' ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <Card>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Today&apos;s Attendance</div>
                {!activeDaily ? (
                  <div style={{ color: 'var(--t3)' }}>No attendance row returned for today.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    <div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        status
                      </div>
                      <div style={{ fontWeight: 800 }}>{activeDaily.status}</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        shift
                      </div>
                      <div style={{ fontWeight: 800 }}>{activeDaily.shift_name}</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        check in
                      </div>
                      <div style={{ fontWeight: 800 }} className="mono">
                        {activeDaily.check_in ?? '-'}
                      </div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        acknowledged
                      </div>
                      <div style={{ fontWeight: 800 }}>{activeDaily.ack ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Monthly Attendance Summary</div>
                {!activeMonthly ? (
                  <div style={{ color: 'var(--t3)' }}>No monthly attendance summary found for the selected employee.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                    <Card style={{ padding: 12 }}>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        presents
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{activeMonthly.presents}</div>
                    </Card>
                    <Card style={{ padding: 12 }}>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        absents
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{activeMonthly.absents}</div>
                    </Card>
                    <Card style={{ padding: 12 }}>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        lates
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{activeMonthly.lates}</div>
                    </Card>
                    <Card style={{ padding: 12 }}>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                        attendance %
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{activeMonthly.attendance_pct ?? 0}</div>
                    </Card>
                  </div>
                )}
              </Card>
            </div>
          ) : null}

          {activeTab === 'leave' ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <Card>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Leave Balances</div>
                {!activeBalances?.balances.length ? (
                  <div style={{ color: 'var(--t3)' }}>No leave balances found for this employee.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {activeBalances.balances.map((item) => (
                      <div key={item.leave_type} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <strong>{item.leave_type}</strong>
                          <span className="mono">
                            {item.balance}/{item.total}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Leave Requests</div>
                {!leaveRequests?.length ? (
                  <div style={{ color: 'var(--t3)' }}>No leave requests found.</div>
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
                        {leaveRequests.map((item) => (
                          <tr key={item.id}>
                            <td>{item.leave_type_name}</td>
                            <td className="mono">
                              {item.start_date} → {item.end_by_force ?? item.end_date}
                            </td>
                            <td className="mono">{item.days}</td>
                            <td className="mono" style={{ fontWeight: 900 }}>
                              {item.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableShell>
                )}
              </Card>
            </div>
          ) : null}

          {['medical', 'payslips', 'promotions', 'penalties', 'activity', 'documents'].includes(activeTab) ? (
            <ComingSoonCard
              title={`${activeTab.replace('-', ' ')} integration`}
              description="This employee tab stays visible in the directory flow, but the backend surface for this slice has not been implemented yet."
            />
          ) : null}
        </div>
      ) : (
        <Card>
          <TableShell>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Dept</th>
                  <th>Designation</th>
                  <th>Type</th>
                  <th>Shift</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {directoryRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                      No employees match the current search and filters.
                    </td>
                  </tr>
                ) : (
                  directoryRows.map(({ employee, job }) => (
                    <tr key={employee.id}>
                      <td style={{ fontWeight: 800 }}>{employee.name}</td>
                      <td className="mono">{employee.employee_id}</td>
                      <td>{job?.department_name ?? '-'}</td>
                      <td>{job?.designation_title ?? '-'}</td>
                      <td>{job?.employment_type_name ?? '-'}</td>
                      <td>{job?.shift_name ?? '-'}</td>
                      <td>{job?.job_status_name ?? '-'}</td>
                      <td className="mono">{job?.date_of_joining ?? '-'}</td>
                      <td>
                        <ButtonLink href={`/employees?search=${encodeURIComponent(employee.employee_id)}&tab=personal`}>
                          Open
                        </ButtonLink>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        </Card>
      )}
    </div>
  )
}
