'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, User, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { roleLabel } from '@/lib/roles'

export default function LaunchpadPage() {
  const router = useRouter()
  const { ready, session, isEmployee, isHR, isSuperAdmin, logout } = useAuth()

  useEffect(() => {
    if (!ready) return
    if (!session) router.replace('/login')
  }, [ready, session, router])

  if (!ready) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--t3)' }}>Loading...</div>
  if (!session) return null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--page)', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 860, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12 }}>
          <div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--t3)', letterSpacing: 1 }}>
              ESSPL ECOSYSTEM
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--t1)' }}>
              Welcome back, {session.user.email ?? session.user.employee_id ?? 'User'}
            </h1>
            <div className="mono" style={{ marginTop: 6, color: 'var(--t3)' }}>
              Role: {roleLabel(session.user.role)}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => void logout()}>
            Sign Out
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {(isSuperAdmin || isHR) && (
            <div
              className="card"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '34px 18px', textAlign: 'center' }}
              onClick={() => router.push('/dashboard')}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--pl)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Users size={32} color="var(--p)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Core HCM</h3>
              <p style={{ fontSize: 12, color: 'var(--t3)' }}>Employees, Attendance, Leaves</p>
            </div>
          )}

          <div
            className="card"
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '34px 18px', textAlign: 'center' }}
            onClick={() => router.push('/me/dashboard')}
          >
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--greenl)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <User size={32} color="var(--green)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>Self-Service</h3>
            <p style={{ fontSize: 12, color: 'var(--t3)' }}>Attendance Ack, Leave, Profile</p>
          </div>

          {isSuperAdmin && (
            <div
              className="card"
              style={{ cursor: 'not-allowed', opacity: 0.75, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '34px 18px', textAlign: 'center' }}
              title="Config UI will be added after MVP pages are stable"
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--steell)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Settings size={32} color="var(--steel)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>System Config</h3>
              <p style={{ fontSize: 12, color: 'var(--t3)' }}>Planned (Super Admin)</p>
            </div>
          )}
        </div>

        {isEmployee && (
          <div style={{ marginTop: 16 }} className="mono">
            Tip: Use the sidebar inside Self-Service to reach Ack and Leave pages.
          </div>
        )}
      </div>
    </div>
  )
}
