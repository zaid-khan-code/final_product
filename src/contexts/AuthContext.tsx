'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { type EmsRole, isEmployee, isHR, isSuperAdmin } from '@/lib/roles'
import { type Session } from '@/lib/session'

type AuthCtx = {
  ready: boolean
  session: Session | null
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => Promise<void>
  role: EmsRole | null
  isSuperAdmin: boolean
  isHR: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    let isMounted = true

    const hydrateSession = async () => {
      const res = await apiFetch<Session>('/auth/session')
      if (!isMounted) return

      if (res.ok) {
        setSession(res.data)
      } else {
        setSession(null)
      }

      setReady(true)
    }

    void hydrateSession()

    return () => {
      isMounted = false
    }
  }, [])

  const role = session?.user.role ?? null
  const value: AuthCtx = {
    ready,
    session,
    role,
    isSuperAdmin: !!role && isSuperAdmin(role),
    isHR: !!role && isHR(role),
    isEmployee: !!role && isEmployee(role),
    login: async (email, password) => {
      const res = await apiFetch<Session>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      if (!res.ok) return { ok: false, error: res.error }

      setSession(res.data)
      return { ok: true }
    },
    logout: async () => {
      await apiFetch<{ ok: true }>('/auth/logout', { method: 'POST' })
      setSession(null)
      setReady(true)

      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
