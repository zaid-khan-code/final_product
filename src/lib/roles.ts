export type EmsRole = 'super_admin' | 'hr_manager' | 'hr_executive' | 'employee' | string

export const isSuperAdmin = (role: EmsRole) => role === 'super_admin'
export const isHR = (role: EmsRole) => role === 'hr_manager' || role === 'hr_executive'
export const isEmployee = (role: EmsRole) => role === 'employee'

export const roleLabel = (role: EmsRole) => {
  if (isSuperAdmin(role)) return 'Super Admin'
  if (role === 'hr_manager') return 'HR Manager'
  if (role === 'hr_executive') return 'HR Executive'
  if (isEmployee(role)) return 'Employee'
  return role
}

