'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

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
  shift_name: string
  date_of_joining: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<EmployeeInfo[]>([])
  const [jobRows, setJobRows] = useState<JobInfoRow[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const [eRes, jRes] = await Promise.all([apiFetch<EmployeeInfo[]>('/employees'), apiFetch<JobInfoRow[]>('/job-info')])
      if (!alive) return
      if (!eRes.ok) showToast(eRes.error, 'error')
      if (!jRes.ok) showToast(jRes.error, 'error')
      setEmployees(eRes.ok ? eRes.data : [])
      setJobRows(jRes.ok ? jRes.data : [])
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [showToast])

  const jobByEmp = useMemo(() => new Map(jobRows.map((r) => [r.employee_id, r])), [jobRows])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return employees
    return employees.filter((e) => e.employee_id.toLowerCase().includes(s) || e.name.toLowerCase().includes(s))
  }, [employees, search])

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="pg-greet">Employees</div>
          <div className="pg-sub">Manage employees and their job assignments</div>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/employees/add')}>
          <Plus size={13} /> Add Employee
        </button>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)' }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder="Search by name or EMP ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Shift</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--t3)' }}>
                    No employees found
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const ji = jobByEmp.get(e.employee_id)
                  return (
                    <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/employees/${e.id}`)}>
                      <td className="mono">{e.employee_id}</td>
                      <td style={{ fontWeight: 800 }}>{e.name}</td>
                      <td>{ji?.department_name ?? '-'}</td>
                      <td>{ji?.designation_title ?? '-'}</td>
                      <td>{ji?.job_status_name ?? '-'}</td>
                      <td>{ji?.shift_name ?? '-'}</td>
                      <td className="mono">{ji?.date_of_joining ?? '-'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

