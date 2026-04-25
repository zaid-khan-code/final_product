import { type EmsRole } from '@/lib/roles'

export type SessionUser = {
  id: string
  email: string | null
  role: EmsRole
  employee_id: string | null
  is_super_admin: boolean
}

export type Session = {
  user: SessionUser
}

export const canUseSelfService = (user: Pick<SessionUser, 'employee_id'> | null | undefined) => {
  return Boolean(user?.employee_id)
}
