'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useAuth } from '@/contexts/AuthContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { ready, session, isEmployee } = useAuth()

  useEffect(() => {
    if (!ready) return
    if (!session) {
      router.replace('/login')
      return
    }
    if (isEmployee) {
      router.replace('/me/dashboard')
    }
  }, [ready, session, isEmployee, router])

  if (!ready) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--t3)' }}>Loading…</div>
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

