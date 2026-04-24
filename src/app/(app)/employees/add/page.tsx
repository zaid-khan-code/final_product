'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

type Department = { id: string; department_name: string }
type Designation = { id: string; title: string }
type EmploymentType = { id: string; type_name: string }
type JobStatus = { id: string; status_name: string }
type WorkMode = { id: string; mode_name: string }
type WorkLocation = { id: string; location_name: string }
type Shift = { id: string; name: string }

export default function AddEmployeePage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([])
  const [jobStatuses, setJobStatuses] = useState<JobStatus[]>([])
  const [workModes, setWorkModes] = useState<WorkMode[]>([])
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])

  const [employee_id, setEmployeeId] = useState('')
  const [name, setName] = useState('')
  const [father_name, setFatherName] = useState('')
  const [cnic, setCnic] = useState('')
  const [date_of_birth, setDob] = useState('')

  const [department_id, setDepartmentId] = useState('')
  const [designation_id, setDesignationId] = useState('')
  const [employment_type_id, setEmploymentTypeId] = useState('')
  const [job_status_id, setJobStatusId] = useState('')
  const [work_mode_id, setWorkModeId] = useState('')
  const [work_location_id, setWorkLocationId] = useState('')
  const [shift_id, setShiftId] = useState('')
  const [date_of_joining, setDoj] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const results = await Promise.all([
        apiFetch<Department[]>('/departments'),
        apiFetch<Designation[]>('/designations'),
        apiFetch<EmploymentType[]>('/employment-types'),
        apiFetch<JobStatus[]>('/job-statuses'),
        apiFetch<WorkMode[]>('/work-modes'),
        apiFetch<WorkLocation[]>('/work-locations'),
        apiFetch<Shift[]>('/shifts'),
      ])

      if (!alive) return
      const [d, des, et, js, wm, wl, sh] = results
      if (!d.ok) showToast(`Departments: ${d.error}`, 'error')
      if (!des.ok) showToast(`Designations: ${des.error}`, 'error')
      if (!et.ok) showToast(`Employment types: ${et.error}`, 'error')
      if (!js.ok) showToast(`Job statuses: ${js.error}`, 'error')
      if (!wm.ok) showToast(`Work modes: ${wm.error}`, 'error')
      if (!wl.ok) showToast(`Work locations: ${wl.error}`, 'error')
      if (!sh.ok) showToast(`Shifts: ${sh.error}`, 'error')

      setDepartments(d.ok ? d.data : [])
      setDesignations(des.ok ? des.data : [])
      setEmploymentTypes(et.ok ? et.data : [])
      setJobStatuses(js.ok ? js.data : [])
      setWorkModes(wm.ok ? wm.data : [])
      setWorkLocations(wl.ok ? wl.data : [])
      setShifts(sh.ok ? sh.data : [])
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [showToast])

  const canSubmit = useMemo(() => {
    return (
      employee_id.trim() &&
      name.trim() &&
      father_name.trim() &&
      cnic.trim() &&
      date_of_birth &&
      department_id &&
      designation_id &&
      employment_type_id &&
      job_status_id &&
      work_mode_id &&
      work_location_id &&
      shift_id &&
      date_of_joining
    )
  }, [
    employee_id,
    name,
    father_name,
    cnic,
    date_of_birth,
    department_id,
    designation_id,
    employment_type_id,
    job_status_id,
    work_mode_id,
    work_location_id,
    shift_id,
    date_of_joining,
  ])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      showToast('Please fill all required fields', 'error')
      return
    }

    setSaving(true)

    // Step 1: employee_info
    const empRes = await apiFetch<any>('/employees', {
      method: 'POST',
      body: { employee_id: employee_id.trim(), name: name.trim(), father_name: father_name.trim(), cnic: cnic.trim(), date_of_birth },
    })
    if (!empRes.ok) {
      setSaving(false)
      showToast(empRes.error, 'error')
      return
    }

    // Step 2: job_info
    const jobRes = await apiFetch<any>('/job-info', {
      method: 'POST',
      body: {
        employee_id: employee_id.trim(),
        department_id,
        designation_id,
        employment_type_id,
        job_status_id,
        work_mode_id,
        work_location_id,
        shift_id,
        date_of_joining,
        date_of_exit: null,
      },
    })

    setSaving(false)

    if (!jobRes.ok) {
      showToast(`Employee created, but job info failed: ${jobRes.error}`, 'error')
      return
    }

    showToast('Employee created successfully', 'success')
    router.push('/employees')
  }

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="pg-greet">Add Employee</div>
          <div className="pg-sub">Two-step creation: Employee Info → Job Info</div>
        </div>
        <button className="btn btn-ghost" onClick={() => router.push('/employees')}>
          Back
        </button>
      </div>

      {loading ? (
        <div className="card">Loading configuration…</div>
      ) : (
        <form onSubmit={onSave} style={{ display: 'grid', gap: 12 }}>
          <div className="card">
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Employee Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  employee_id (EMP###)
                </label>
                <input className="input" value={employee_id} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP123" />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  name
                </label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  father_name
                </label>
                <input className="input" value={father_name} onChange={(e) => setFatherName(e.target.value)} placeholder="Father name" />
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  cnic
                </label>
                <input className="input" value={cnic} onChange={(e) => setCnic(e.target.value)} placeholder="CNIC" />
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  department
                </label>
                <select className="input" value={department_id} onChange={(e) => setDepartmentId(e.target.value)}>
                  <option value="">Select…</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  designation
                </label>
                <select className="input" value={designation_id} onChange={(e) => setDesignationId(e.target.value)}>
                  <option value="">Select…</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  employment type
                </label>
                <select className="input" value={employment_type_id} onChange={(e) => setEmploymentTypeId(e.target.value)}>
                  <option value="">Select…</option>
                  {employmentTypes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.type_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  job status
                </label>
                <select className="input" value={job_status_id} onChange={(e) => setJobStatusId(e.target.value)}>
                  <option value="">Select…</option>
                  {jobStatuses.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.status_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  work mode
                </label>
                <select className="input" value={work_mode_id} onChange={(e) => setWorkModeId(e.target.value)}>
                  <option value="">Select…</option>
                  {workModes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.mode_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  work location
                </label>
                <select className="input" value={work_location_id} onChange={(e) => setWorkLocationId(e.target.value)}>
                  <option value="">Select…</option>
                  {workLocations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.location_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  shift
                </label>
                <select className="input" value={shift_id} onChange={(e) => setShiftId(e.target.value)}>
                  <option value="">Select…</option>
                  {shifts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                  date_of_joining
                </label>
                <input className="input" type="date" value={date_of_joining} onChange={(e) => setDoj(e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/employees')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Employee'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

