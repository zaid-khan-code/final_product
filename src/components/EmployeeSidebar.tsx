'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CalendarCheck, CalendarDays, LayoutDashboard, LogOut, User, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

function NavItem({ href, label, Icon }: { href: string; label: string; Icon: any }) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)
  return (
    <Link href={href} className={`nav-a ${active ? 'active' : ''}`}>
      <Icon size={14} className="nav-ico" />
      {label}
    </Link>
  )
}

export default function EmployeeSidebar() {
  const router = useRouter()
  const { session, logout } = useAuth()

  return (
    <div className="sidebar" style={{ width: 200 }}>
      <div className="sb-logo">
        <div className="sb-logo-row">
          <div className="sb-mark">
            <Zap size={17} />
          </div>
          <div>
            <div className="sb-title">EMS</div>
            <div className="sb-subtitle">Self Service</div>
          </div>
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
        <div className="sb-lbl">Menu</div>
        <NavItem href="/me/dashboard" label="My Dashboard" Icon={LayoutDashboard} />
        <NavItem href="/me/attendance" label="My Attendance" Icon={CalendarCheck} />
        <NavItem href="/me/leave" label="My Leave" Icon={CalendarDays} />
        <NavItem href="/me/profile" label="My Profile" Icon={User} />
      </div>

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-chip" onClick={logout} title="Logout">
            <div className="sb-av">{session?.user.email?.slice(0, 2).toUpperCase() ?? 'ME'}</div>
            <div>
              <div className="sb-un">{session?.user.email ?? 'Employee'}</div>
              <div className="sb-ur">{session?.user.employee_id ?? ''}</div>
            </div>
            <LogOut size={14} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,.25)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

