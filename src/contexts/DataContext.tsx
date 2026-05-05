"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  department?: string;
  designation?: string;
  jobStatus?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

interface DataContextType {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  addEmployee: (emp: any) => Promise<void>;
  deactivateEmployee: (id: string) => Promise<void>;
  leaveRequests: any[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<any[]>>;
  payrollData: any[];
  setPayrollData: React.Dispatch<React.SetStateAction<any[]>>;
  promotions: any[];
  setPromotions: React.Dispatch<React.SetStateAction<any[]>>;
  penalties: any[];
  setPenalties: React.Dispatch<React.SetStateAction<any[]>>;
  auditLog: any[];
  setAuditLog: React.Dispatch<React.SetStateAction<any[]>>;
  hrAccounts: any[];
  setHrAccounts: React.Dispatch<React.SetStateAction<any[]>>;
  attendanceData: any[];
  setAttendanceData: React.Dispatch<React.SetStateAction<any[]>>;
  departments: string[];
  designations: string[];
  workModes: string[];
  workLocations: string[];
  employmentTypes: string[];
  jobStatuses: string[];
  reportingManagers: string[];
  shifts: any[];
  leaveTypes: any[];
  leavePolicies: any[];
  payrollComponents: any[];
  penaltiesConfig: any[];
  customFields: any[];
  taxConfig: any;
  globalDays: any[];
  announcements: any[];
  loading: boolean;
  saveAttendance: (date: string, locationId: string, rows: any[]) => Promise<void>;
  ackAttendance: (attendanceId: string) => Promise<void>;
  fetchAttendance: (date: string, locationId?: string) => Promise<any[]>;
  submitLeaveRequest: (data: any) => Promise<void>;
  approveLeaveRequest: (id: string) => Promise<void>;
  rejectLeaveRequest: (id: string, reason: string) => Promise<void>;
  earlyReturnLeave: (id: string, date: string) => Promise<void>;
  proposePenalty: (data: any) => Promise<void>;
  approvePenalty: (id: string, note: string) => Promise<void>;
  rejectPenalty: (id: string, note: string) => Promise<void>;
  ackPenalty: (id: string) => Promise<void>;
  getConfigId: (entity: string, name: string) => string | undefined;
  fetchDashboardMetrics: (range?: string) => Promise<any>;
  fetchMySummary: () => Promise<any>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [hrAccounts, setHrAccounts] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  
  // Config States
  const [departments, setDepartments] = useState<string[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [workLocations, setWorkLocations] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [jobStatuses, setJobStatuses] = useState<string[]>([]);
  const [reportingManagers, setReportingManagers] = useState<string[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<any[]>([]);
  const [payrollComponents, setPayrollComponents] = useState<any[]>([]);
  const [penaltiesConfig, setPenaltiesConfig] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [taxConfig, setTaxConfig] = useState<any>(null);
  const [globalDays, setGlobalDays] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Raw config data for ID mapping
  const [configRaw, setConfigRaw] = useState<Record<string, any[]>>({});

  // Initial fetch of core system entities
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        empList,
        depts,
        desigs,
        shfts,
        lTypes
      ] = await Promise.all([
        apiFetch('/employees').catch(() => []),
        apiFetch('/config/departments').catch(() => []),
        apiFetch('/config/designations').catch(() => []),
        apiFetch('/config/shifts').catch(() => []),
        apiFetch('/config/leave-types').catch(() => []),
      ]);

      if (Array.isArray(empList)) setEmployees(empList);
      if (Array.isArray(depts)) setDepartments(depts.map((i: any) => i.department_name || i.name));
      if (Array.isArray(desigs)) setDesignations(desigs.map((i: any) => i.title || i.name));
      if (Array.isArray(shfts)) setShifts(shfts.map((i: any) => ({ id: i.id, name: i.name, start: i.start_time, end: i.end_time, lateAfter: i.late_after_minutes || i.late_threshold })));
      if (Array.isArray(lTypes)) setLeaveTypes(lTypes.map((i: any) => ({ id: i.id, name: i.name, code: i.code || i.name.substring(0,3).toUpperCase(), active: i.is_active })));

      setConfigRaw({
        departments: Array.isArray(depts) ? depts : [],
        designations: Array.isArray(desigs) ? desigs : [],
        shifts: Array.isArray(shfts) ? shfts : [],
        leaveTypes: Array.isArray(lTypes) ? lTypes : [],
      });
    } catch (err) {
      console.error('Core Data Hydration Failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addEmployee = async (emp: any) => {
    const basicInfo = {
      employee_id: emp.id,
      name: emp.name,
      father_name: emp.fatherName,
      cnic: emp.cnic,
      date_of_birth: emp.dob,
    };
    await apiFetch('/employees', { method: 'POST', body: JSON.stringify(basicInfo) });

    const extraInfo = {
      employee_id: emp.id,
      contact_1: emp.contact1,
      contact_2: emp.contact2 || null,
      emergence_contact_1: emp.emergency1 || null,
      emergence_contact_2: emp.emergency2 || null,
      bank_name: emp.bankName || null,
      bank_acc_num: emp.bankAccount || null,
      perment_address: emp.permanentAddress || null,
      postal_address: emp.postalAddress || null
    };
    await apiFetch('/extra-employees', { method: 'POST', body: JSON.stringify(extraInfo) });

    const jobInfo = {
      employee_id: emp.id,
      department_id: configRaw.departments?.find(i => (i.department_name || i.name) === emp.department)?.id,
      designation_id: configRaw.designations?.find(i => (i.title || i.name) === emp.designation)?.id,
      employment_type_id: configRaw.employmentTypes?.find(i => (i.type_name || i.name) === emp.employmentType)?.id,
      job_status_id: configRaw.jobStatuses?.find(i => (i.status_name || i.name) === emp.jobStatus)?.id,
      work_mode_id: configRaw.workModes?.find(i => (i.mode_name || i.name) === emp.workMode)?.id,
      work_location_id: configRaw.workLocations?.find(i => (i.location_name || i.name) === emp.workLocation)?.id,
      shift_id: configRaw.shifts?.find(i => i.name === emp.shift)?.id,
      date_of_joining: emp.dateOfJoining,
      date_of_exit: emp.dateOfExit || null
    };
    await apiFetch('/job-info', { method: 'POST', body: JSON.stringify(jobInfo) });

    if (emp.email) {
      const userInfo = {
        email: emp.email,
        password: 'Welcome@123',
        employee_id: emp.id,
        role_id: configRaw.roles?.find((r: any) => r.role_name === 'employee')?.id
      };
      await apiFetch('/users', { method: 'POST', body: JSON.stringify(userInfo) }).catch(() => {});
    }

    const newList = await apiFetch('/employees');
    if (Array.isArray(newList)) setEmployees(newList);
  };

  const deactivateEmployee = async (id: string) => {
    const terminatedStatus = configRaw.jobStatuses?.find(i => (i.status_name || i.name) === 'Terminated')?.id;
    const jobRecord = employees.find(e => e.id === id)?.job_info_id;
    if (terminatedStatus && jobRecord) {
      await apiFetch(`/job-info/${jobRecord}`, {
        method: 'PUT',
        body: JSON.stringify({ job_status_id: terminatedStatus }),
      });
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, jobStatus: 'Terminated' } : e));
    }
  };

  const fetchAttendance = useCallback(async (date: string, locationId?: string) => {
    try {
      const url = `/attendance/daily?date=${date}${locationId ? `&location=${locationId}` : ''}`;
      return await apiFetch(url) || [];
    } catch (err) {
      return [];
    }
  }, []);

  const saveAttendance = async (date: string, locationId: string, rows: any[]) => {
    const payload = {
      date,
      rows: rows.map(r => ({
        employee_id: r.empId,
        shift_id: configRaw.shifts?.find(s => s.name === r.shift)?.id,
        status: r.status.toLowerCase(),
        check_in: r.checkIn === '-' ? null : r.checkIn,
        check_out: r.checkOut === '-' ? null : r.checkOut,
        notes: r.notes || null
      }))
    };
    await apiFetch('/attendance/batch', { method: 'POST', body: JSON.stringify(payload) });
  };

  const submitLeaveRequest = async (data: any) => {
    const payload: any = {
      employee_id: data.employeeId || '',
      leave_type_id: configRaw.leaveTypes?.find(i => i.name === data.leaveType)?.id,
      start_date: data.from,
      end_date: data.to,
      reason: data.reason
    };
    await apiFetch('/leave-requests', { method: 'POST', body: JSON.stringify(payload) });
    const leaveList = await apiFetch('/leave-requests');
    if (Array.isArray(leaveList)) setLeaveRequests(leaveList);
  };

  const approveLeaveRequest = async (id: string) => {
    await apiFetch(`/leave-requests/${id}/approve`, { method: 'PATCH' });
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  const rejectLeaveRequest = async (id: string, reason: string) => {
    await apiFetch(`/leave-requests/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) });
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const getConfigId = (entity: string, name: string) => {
    return configRaw[entity]?.find(i => i.name === name)?.id;
  };

  const fetchDashboardMetrics = async (range: string = '6m') => {
    return await apiFetch(`/dashboard/metrics?range=${range}`);
  };

  const fetchMySummary = async () => {
    return await apiFetch('/dashboard/me');
  };

  const ackAttendance = async (attendanceId: string) => {
    await apiFetch(`/attendance/${attendanceId}/ack`, { method: 'PATCH', body: JSON.stringify({}) });
  };

  const earlyReturnLeave = async (id: string, date: string) => {
    await apiFetch(`/leave-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ end_by_force: date }) });
  };

  const proposePenalty = async (data: any) => {
    await apiFetch('/employee-penalties', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: data.employeeId,
        rule_id: configRaw.penaltyRules?.find((r: any) => r.name === data.type)?.id,
        date: data.date,
        reason: data.reason
      }),
    });
  };

  const approvePenalty = async (id: string, note: string) => {
    await apiFetch(`/employee-penalties/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ review_note: note }) });
  };

  const rejectPenalty = async (id: string, note: string) => {
    await apiFetch(`/employee-penalties/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ review_note: note }) });
  };

  const ackPenalty = async (id: string) => {
    await apiFetch(`/penalties/${id}/ack`, { method: 'PATCH' });
  };

  return (
    <DataContext.Provider value={{
      employees, setEmployees, addEmployee, deactivateEmployee,
      leaveRequests, setLeaveRequests,
      payrollData, setPayrollData,
      promotions, setPromotions,
      penalties, setPenalties,
      auditLog, setAuditLog,
      hrAccounts, setHrAccounts,
      attendanceData, setAttendanceData,
      departments, 
      designations, 
      workModes, 
      workLocations, 
      employmentTypes, 
      jobStatuses, 
      reportingManagers, 
      shifts, 
      leaveTypes, 
      leavePolicies, 
      payrollComponents, 
      penaltiesConfig, 
      customFields, 
      taxConfig, 
      globalDays, 
      announcements,
      loading,
      saveAttendance,
      ackAttendance,
      fetchAttendance,
      submitLeaveRequest,
      approveLeaveRequest,
      rejectLeaveRequest,
      earlyReturnLeave,
      proposePenalty,
      approvePenalty,
      rejectPenalty,
      ackPenalty,
      getConfigId,
      fetchDashboardMetrics,
      fetchMySummary
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
