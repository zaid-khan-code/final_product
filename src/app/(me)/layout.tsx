'use client'

import React from 'react'
import EmployeeSidebar from '@/components/EmployeeSidebar'
import Topbar from '@/components/Topbar'
import { useAuth } from '@/contexts/AuthContext'
import { canUseSelfService } from '@/lib/session'

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { ready, session } = useAuth()

  // While auth hydrates, show content without chrome — middleware already guards the route
  if (!ready) {
    return (
      <div className="app-layout">
        <div className="main-area">
          <div className="page-content">{children}</div>
        </div>
      </div>
    )
  }

  // Middleware should redirect before this, but guard as a fallback
  if (!session || !canUseSelfService(session.user)) return null

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
