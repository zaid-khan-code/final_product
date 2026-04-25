'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import ComingSoonCard from '@/components/ComingSoonCard'
import { useToast } from '@/contexts/ToastContext'
import { apiFetch } from '@/lib/api'

type Department = { id: string; department_name: string }
type Designation = { id: string; title: string }
type EmploymentType = { id: string; type_name: string }
type JobStatus = { id: string; status_name: string }
type WorkMode = { id: string; mode_name: string }
type WorkLocation = { id: string; location_name: string }
type Shift = { id: string; name: string }
type EmployeeCreateResponse = { id: string; employee_id: string }
type JobInfoCreateResponse = { id: string; employee_id: string }

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

      const [departmentRes, designationRes, employmentTypeRes, jobStatusRes, workModeRes, workLocationRes, shiftRes] = results

      if (!departmentRes.ok) showToast(`Departments: ${departmentRes.error}`, 'error')
      if (!designationRes.ok) showToast(`Designations: ${designationRes.error}`, 'error')
      if (!employmentTypeRes.ok) showToast(`Employment types: ${employmentTypeRes.error}`, 'error')
      if (!jobStatusRes.ok) showToast(`Job statuses: ${jobStatusRes.error}`, 'error')
      if (!workModeRes.ok) showToast(`Work modes: ${workModeRes.error}`, 'error')
      if (!workLocationRes.ok) showToast(`Work locations: ${workLocationRes.error}`, 'error')
      if (!shiftRes.ok) showToast(`Shifts: ${shiftRes.error}`, 'error')

      setDepartments(departmentRes.ok ? departmentRes.data : [])
      setDesignations(designationRes.ok ? designationRes.data : [])
      setEmploymentTypes(employmentTypeRes.ok ? employmentTypeRes.data : [])
      setJobStatuses(jobStatusRes.ok ? jobStatusRes.data : [])
      setWorkModes(workModeRes.ok ? workModeRes.data : [])
      setWorkLocations(workLocationRes.ok ? workLocationRes.data : [])
      setShifts(shiftRes.ok ? shiftRes.data : [])
      setLoading(false)
    })()

    return () => {
      alive = false
    }
  }, [showToast])

  const canSubmit = useMemo(
    () =>
      Boolean(
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
      ),
    [
      cnic,
      date_of_birth,
      date_of_joining,
      department_id,
      designation_id,
      employee_id,
      employment_type_id,
      father_name,
      job_status_id,
      name,
      shift_id,
      work_location_id,
      work_mode_id,
    ]
  )

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) {
      showToast('Please fill all required fields', 'error')
      return
    }

    setSaving(true)

    const employeeRes = await apiFetch<EmployeeCreateResponse>('/employees', {
      method: 'POST',
      body: { employee_id: employee_id.trim(), name: name.trim(), father_name: father_name.trim(), cnic: cnic.trim(), date_of_birth },
    })

    if (!employeeRes.ok) {
      setSaving(false)
      showToast(employeeRes.error, 'error')
      return
    }

    const jobRes = await apiFetch<JobInfoCreateResponse>('/job-info', {
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
    <div className="section-grid">
      <div>
        <div className="pg-head">
          <div>
            <div className="pg-greet">Add Employee</div>
            <div className="pg-sub">Two-step creation: employee info followed by job info</div>
          </div>
          <button className="btn btn-ghost" onClick={() => router.push('/employees')}>
            Back
          </button>
        </div>

        {loading ? (
          <div className="card">Loading configuration...</div>
        ) : (
          <form onSubmit={onSave} className="section-grid">
            <div className="card">
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Employee Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    employee_id (EMP###)
                  </label>
                  <input className="input" value={employee_id} onChange={(event) => setEmployeeId(event.target.value)} placeholder="EMP123" />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    name
                  </label>
                  <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    father_name
                  </label>
                  <input className="input" value={father_name} onChange={(event) => setFatherName(event.target.value)} placeholder="Father name" />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    cnic
                  </label>
                  <input className="input" value={cnic} onChange={(event) => setCnic(event.target.value)} placeholder="CNIC" />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    date_of_birth
                  </label>
                  <input className="input" type="date" value={date_of_birth} onChange={(event) => setDob(event.target.value)} />
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
                  <select className="input" value={department_id} onChange={(event) => setDepartmentId(event.target.value)}>
                    <option value="">Select...</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.department_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    designation
                  </label>
                  <select className="input" value={designation_id} onChange={(event) => setDesignationId(event.target.value)}>
                    <option value="">Select...</option>
                    {designations.map((designation) => (
                      <option key={designation.id} value={designation.id}>
                        {designation.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    employment type
                  </label>
                  <select className="input" value={employment_type_id} onChange={(event) => setEmploymentTypeId(event.target.value)}>
                    <option value="">Select...</option>
                    {employmentTypes.map((employmentType) => (
                      <option key={employmentType.id} value={employmentType.id}>
                        {employmentType.type_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    job status
                  </label>
                  <select className="input" value={job_status_id} onChange={(event) => setJobStatusId(event.target.value)}>
                    <option value="">Select...</option>
                    {jobStatuses.map((jobStatus) => (
                      <option key={jobStatus.id} value={jobStatus.id}>
                        {jobStatus.status_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    work mode
                  </label>
                  <select className="input" value={work_mode_id} onChange={(event) => setWorkModeId(event.target.value)}>
                    <option value="">Select...</option>
                    {workModes.map((workMode) => (
                      <option key={workMode.id} value={workMode.id}>
                        {workMode.mode_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    work location
                  </label>
                  <select className="input" value={work_location_id} onChange={(event) => setWorkLocationId(event.target.value)}>
                    <option value="">Select...</option>
                    {workLocations.map((workLocation) => (
                      <option key={workLocation.id} value={workLocation.id}>
                        {workLocation.location_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    shift
                  </label>
                  <select className="input" value={shift_id} onChange={(event) => setShiftId(event.target.value)}>
                    <option value="">Select...</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
                    date_of_joining
                  </label>
                  <input className="input" type="date" value={date_of_joining} onChange={(event) => setDoj(event.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/employees')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Employee'}
              </button>
            </div>
          </form>
        )}
      </div>

      <ComingSoonCard
        title="Documents and onboarding artifacts"
        description="Document upload, signed forms, and employee-file attachments are not wired yet for this flow."
      />
    </div>
  )
}
