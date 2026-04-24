'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { roleLabel } from '@/lib/roles'

const routeNames: Array<[RegExp, string]> = [
  [/^\/dashboard$/, 'Dashboard'],
  [/^\/employees$/, 'Employees'],
  [/^\/employees\/add$/, 'Add Employee'],
  [/^\/employees\/[^/]+$/, 'Employee Details'],
  [/^\/attendance$/, 'Attendance'],
  [/^\/leave$/, 'Leave'],
  [/^\/launchpad$/, 'Launchpad'],
  [/^\/me\/dashboard$/, 'My Dashboard'],
  [/^\/me\/attendance$/, 'My Attendance'],
  [/^\/me\/leave$/, 'My Leave'],
  [/^\/me\/profile$/, 'My Profile'],
]

export default function Topbar() {
  const pathname = usePathname()
  const { session } = useAuth()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = window.setInterval(() => setTime(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const pageName = useMemo(() => {
    for (const [re, name] of routeNames) {
      if (re.test(pathname)) return name
    }
    return 'Page'
  }, [pathname])

  const dateStr = time.toLocaleDateString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="topbar">
      <div className="bc">
        <span className="bc-home">EMS</span>
        <span className="bc-sep">·</span>
        <span className="bc-cur">{pageName}</span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="tdate">{dateStr}</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--t3)' }}>
          {roleLabel(session?.user.role ?? '')}
        </span>
        <div className="t-av">{session?.user.email?.slice(0, 2).toUpperCase() ?? 'U'}</div>
      </div>
    </div>
  )
}

