'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useAuth } from '@/contexts/AuthContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, session, isEmployee } = useAuth()

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
  if (!session || isEmployee) return null

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}
