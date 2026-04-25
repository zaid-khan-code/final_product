'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarCheck, CalendarDays, LayoutDashboard, LogOut, type LucideIcon, Users, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { roleLabel } from '@/lib/roles'

function NavItem({ href, label, Icon }: { href: string; label: string; Icon: LucideIcon }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)
  return (
    <Link href={href} className={`nav-a ${active ? 'active' : ''}`}>
      <Icon size={14} className="nav-ico" />
      {label}
    </Link>
  )
}

export default function Sidebar() {
  const router = useRouter()
  const { session, logout } = useAuth()

  return (
    <div className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-row">
          <div className="sb-mark">
            <Zap size={17} />
          </div>
          <div>
            <div className="sb-title">EMS</div>
            <div className="sb-subtitle">Core HCM</div>
          </div>
        </div>
        <div className="sb-env">
          <div className="sb-env-dot" />
          <span className="sb-env-text">FINAL PRODUCT</span>
        </div>
        <button
          className="btn btn-sm"
          style={{
            marginTop: 12,
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onClick={() => router.push('/launchpad')}
        >
          Apps Launchpad
        </button>
      </div>

      <div className="sb-sec">
        <div className="sb-lbl">Core Modules</div>
        <NavItem href="/dashboard" label="Dashboard" Icon={LayoutDashboard} />
        <NavItem href="/employees" label="Employees" Icon={Users} />
        <NavItem href="/attendance" label="Attendance" Icon={CalendarCheck} />
        <NavItem href="/leave" label="Leave" Icon={CalendarDays} />
      </div>

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-chip" onClick={() => void logout()} title="Logout">
            <div className="sb-av">{session?.user.email?.slice(0, 2).toUpperCase() ?? 'U'}</div>
            <div>
              <div className="sb-un">{session?.user.email ?? 'User'}</div>
              <div className="sb-ur">{roleLabel(session?.user.role ?? '')}</div>
            </div>
            <LogOut size={14} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,.25)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
