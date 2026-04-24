'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

type EmployeeInfo = {
  id: string
  employee_id: string
  name: string
  father_name: string | null
  cnic: string | null
  date_of_birth: string | null
  created_at?: string
  updated_at?: string
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

export default function EmployeeDetailPage() {
  const router = useRouter()
  const params = useParams<{ uuid: string }>()
  const { showToast } = useToast()

  const uuid = params.uuid

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [job, setJob] = useState<JobInfoRow | null>(null)

  const [name, setName] = useState('')
  const [father_name, setFatherName] = useState('')
  const [cnic, setCnic] = useState('')
  const [date_of_birth, setDob] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const empRes = await apiFetch<EmployeeInfo>(`/employees/${uuid}`)
      if (!alive) return
      if (!empRes.ok) {
        showToast(empRes.error, 'error')
        setLoading(false)
        return
      }

      setEmployee(empRes.data)
      setName(empRes.data.name ?? '')
      setFatherName(empRes.data.father_name ?? '')
      setCnic(empRes.data.cnic ?? '')
      setDob(empRes.data.date_of_birth ?? '')

      const jobsRes = await apiFetch<JobInfoRow[]>('/job-info')
      if (!alive) return
      if (jobsRes.ok) {
        const found = jobsRes.data.find((r) => r.employee_id === empRes.data.employee_id) ?? null
        setJob(found)
      }

      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [uuid, showToast])

  const canSave = useMemo(() => {
    return !!employee && name.trim() && father_name.trim() && cnic.trim() && !!date_of_birth
  }, [employee, name, father_name, cnic, date_of_birth])

  const onSave = async () => {
    if (!employee) return
    if (!canSave) {
      showToast('Please fill required fields', 'error')
      return
    }
    setSaving(true)
    const res = await apiFetch<EmployeeInfo>(`/employees/${employee.id}`, {
      method: 'PUT',
      body: {
        name: name.trim(),
        father_name: father_name.trim(),
        cnic: cnic.trim(),
        date_of_birth,
      },
    })
    setSaving(false)
    if (!res.ok) {
      showToast(res.error, 'error')
      return
    }
    setEmployee(res.data)
    showToast('Employee updated', 'success')
  }

  if (loading) return <div className="card">Loading…</div>
  if (!employee) return <div className="card">Employee not found.</div>

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="pg-head">
        <div>
          <div className="pg-greet">{employee.name}</div>
          <div className="pg-sub">
            <span className="mono">{employee.employee_id}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => router.push('/employees')}>
            Back
          </button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving || !canSave}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Employee Info</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
              name
            </label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
              father_name
            </label>
            <input className="input" value={father_name} onChange={(e) => setFatherName(e.target.value)} />
          </div>
          <div>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
              cnic
            </label>
            <input className="input" value={cnic} onChange={(e) => setCnic(e.target.value)} />
          </div>
          <div>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
              date_of_birth
            </label>
            <input className="input" type="date" value={date_of_birth} onChange={(e) => setDob(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Job Info</div>
        {!job ? (
          <div style={{ color: 'var(--t3)' }}>No job info found for this employee yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                department
              </div>
              <div style={{ fontWeight: 800 }}>{job.department_name}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                designation
              </div>
              <div style={{ fontWeight: 800 }}>{job.designation_title}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                employment type
              </div>
              <div style={{ fontWeight: 800 }}>{job.employment_type_name}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                status
              </div>
              <div style={{ fontWeight: 800 }}>{job.job_status_name}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                work mode
              </div>
              <div style={{ fontWeight: 800 }}>{job.work_mode_name}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                work location
              </div>
              <div style={{ fontWeight: 800 }}>{job.work_location_name}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                shift
              </div>
              <div style={{ fontWeight: 800 }}>{job.shift_name}</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                date_of_joining
              </div>
              <div style={{ fontWeight: 800 }} className="mono">
                {job.date_of_joining}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

