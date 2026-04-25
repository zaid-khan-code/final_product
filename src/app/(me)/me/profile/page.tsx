'use client'

import React, { useEffect, useState } from 'react'
import ComingSoonCard from '@/components/ComingSoonCard'
import { useToast } from '@/contexts/ToastContext'
import { apiFetch } from '@/lib/api'

type EmployeeInfo = {
  employee_id: string
  name: string
  father_name: string | null
  cnic: string | null
  date_of_birth: string | null
}

type JobInfoRow = {
  employee_id: string
  department_name: string
  designation_title: string
  employment_type_name: string
  job_status_name: string
  work_mode_name: string
  work_location_name: string
  shift_name: string
  date_of_joining: string
}

export default function MyProfilePage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [job, setJob] = useState<JobInfoRow | null>(null)

  useEffect(() => {
    let alive = true

    ;(async () => {
      setLoading(true)
      const [employeeRes, jobRes] = await Promise.all([apiFetch<EmployeeInfo[]>('/employees'), apiFetch<JobInfoRow[]>('/job-info')])

      if (!alive) return
      if (!employeeRes.ok) showToast(employeeRes.error, 'error')
      if (!jobRes.ok) showToast(jobRes.error, 'error')

      setEmployee(employeeRes.ok ? (employeeRes.data[0] ?? null) : null)
      setJob(jobRes.ok ? (jobRes.data[0] ?? null) : null)
      setLoading(false)
    })()

    return () => {
      alive = false
    }
  }, [showToast])

  return (
    <div className="section-grid">
      <div>
        <div className="pg-head">
          <div>
            <div className="pg-greet">My Profile</div>
            <div className="pg-sub">View your profile details (self-service)</div>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div style={{ color: 'var(--t3)' }}>Loading...</div>
          ) : !employee ? (
            <div style={{ color: 'var(--t3)' }}>No employee info found for your account.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  employee_id
                </div>
                <div className="mono" style={{ fontWeight: 900 }}>
                  {employee.employee_id}
                </div>
              </div>
              <div />
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  name
                </div>
                <div style={{ fontWeight: 900 }}>{employee.name}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  father_name
                </div>
                <div style={{ fontWeight: 900 }}>{employee.father_name ?? '-'}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  cnic
                </div>
                <div className="mono" style={{ fontWeight: 900 }}>
                  {employee.cnic ?? '-'}
                </div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  date_of_birth
                </div>
                <div className="mono" style={{ fontWeight: 900 }}>
                  {employee.date_of_birth ?? '-'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Job Info</div>
          {loading ? (
            <div style={{ color: 'var(--t3)' }}>Loading...</div>
          ) : !job ? (
            <div style={{ color: 'var(--t3)' }}>No job info found.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  department
                </div>
                <div style={{ fontWeight: 900 }}>{job.department_name}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  designation
                </div>
                <div style={{ fontWeight: 900 }}>{job.designation_title}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  employment type
                </div>
                <div style={{ fontWeight: 900 }}>{job.employment_type_name}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  status
                </div>
                <div style={{ fontWeight: 900 }}>{job.job_status_name}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  work mode
                </div>
                <div style={{ fontWeight: 900 }}>{job.work_mode_name}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  work location
                </div>
                <div style={{ fontWeight: 900 }}>{job.work_location_name}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  shift
                </div>
                <div style={{ fontWeight: 900 }}>{job.shift_name}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  joined
                </div>
                <div className="mono" style={{ fontWeight: 900 }}>
                  {job.date_of_joining}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section-grid-2">
        <ComingSoonCard
          title="Profile update request"
          description="Profile change requests, approval routing, and HR review workflows are not available in this phase."
        />
        <ComingSoonCard
          title="Employee documents"
          description="Document storage for contracts, letters, and personal-file attachments is not connected yet."
        />
        <ComingSoonCard
          title="Promotion history"
          description="Promotion timelines and title-change history remain unavailable until the related backend module is delivered."
        />
      </div>
    </div>
  )
}
