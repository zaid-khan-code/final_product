'use client'

import React from 'react'
import EmployeeSidebar from '@/components/EmployeeSidebar'
import Topbar from '@/components/Topbar'
import { useAuth } from '@/contexts/AuthContext'
import { canUseSelfService } from '@/lib/session'

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { ready, session } = useAuth()

  if (!ready) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--t3)' }}>Loading...</div>
  if (!session) return null
  if (!canUseSelfService(session.user)) return null

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}
