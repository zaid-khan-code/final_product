'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useAuth } from '@/contexts/AuthContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, session, isEmployee } = useAuth()

  if (!ready) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--t3)' }}>Loading...</div>
  if (!session) return null
  if (isEmployee) return null

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
