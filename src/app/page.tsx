'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RootPage() {
  const router = useRouter()
  const { ready, session, isEmployee } = useAuth()

  useEffect(() => {
    if (!ready) return
    if (!session) {
      router.replace('/login')
      return
    }
    router.replace(isEmployee ? '/me/dashboard' : '/launchpad')
  }, [ready, session, isEmployee, router])

  return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'var(--t3)' }}>
      Loading...
    </div>
  )
}

