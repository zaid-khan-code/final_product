'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

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
  const [emp, setEmp] = useState<EmployeeInfo | null>(null)
  const [job, setJob] = useState<JobInfoRow | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const [empRes, jobRes] = await Promise.all([apiFetch<EmployeeInfo[]>('/employees'), apiFetch<JobInfoRow[]>('/job-info')])
      if (!alive) return
      if (!empRes.ok) showToast(empRes.error, 'error')
      if (!jobRes.ok) showToast(jobRes.error, 'error')

      const me = empRes.ok ? empRes.data[0] ?? null : null
      setEmp(me)
      setJob(jobRes.ok ? jobRes.data[0] ?? null : null)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [showToast])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="pg-head">
        <div>
          <div className="pg-greet">My Profile</div>
          <div className="pg-sub">View your profile details (self-service)</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ color: 'var(--t3)' }}>Loading…</div>
        ) : !emp ? (
          <div style={{ color: 'var(--t3)' }}>No employee info found for your account.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                employee_id
              </div>
              <div className="mono" style={{ fontWeight: 900 }}>
                {emp.employee_id}
              </div>
            </div>
            <div />
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                name
              </div>
              <div style={{ fontWeight: 900 }}>{emp.name}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                father_name
              </div>
              <div style={{ fontWeight: 900 }}>{emp.father_name ?? '-'}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                cnic
              </div>
              <div className="mono" style={{ fontWeight: 900 }}>
                {emp.cnic ?? '-'}
              </div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                date_of_birth
              </div>
              <div className="mono" style={{ fontWeight: 900 }}>
                {emp.date_of_birth ?? '-'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Job Info</div>
        {loading ? (
          <div style={{ color: 'var(--t3)' }}>Loading…</div>
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
  )
}

