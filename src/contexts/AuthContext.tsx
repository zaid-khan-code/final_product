'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { type EmsRole, isEmployee, isHR, isSuperAdmin } from '@/lib/roles'

type BackendUser = {
  id: string
  email: string
  role: EmsRole
  employee_id?: string | null
}

type Session = {
  token: string
  user: BackendUser
}

type AuthCtx = {
  ready: boolean
  session: Session | null
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
  role: EmsRole | null
  isSuperAdmin: boolean
  isHR: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthCtx | null>(null)

const LS_TOKEN = 'ems_token'
const LS_USER = 'ems_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    try {
      const token = localStorage.getItem(LS_TOKEN)
      const rawUser = localStorage.getItem(LS_USER)
      if (token && rawUser) {
        const user = JSON.parse(rawUser) as BackendUser
        setSession({ token, user })
      }
    } finally {
      setReady(true)
    }
  }, [])

  const api = useMemo<AuthCtx>(() => {
    const role = session?.user.role ?? null
    return {
      ready,
      session,
      role,
      isSuperAdmin: !!role && isSuperAdmin(role),
      isHR: !!role && isHR(role),
      isEmployee: !!role && isEmployee(role),
      login: async (email, password) => {
        const res = await apiFetch<{ token: string; user: BackendUser }>('/auth/login', {
          method: 'POST',
          body: { email, password },
          token: null,
        })
        if (!res.ok) return { ok: false, error: res.error }

        const nextSession: Session = { token: res.data.token, user: res.data.user }
        setSession(nextSession)
        localStorage.setItem(LS_TOKEN, nextSession.token)
        localStorage.setItem(LS_USER, JSON.stringify(nextSession.user))
        return { ok: true }
      },
      logout: () => {
        setSession(null)
        localStorage.removeItem(LS_TOKEN)
        localStorage.removeItem(LS_USER)
      },
    }
  }, [ready, session])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

