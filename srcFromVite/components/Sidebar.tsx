import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, CalendarDays, DollarSign, TrendingUp,
  Settings, Building2, Briefcase, Monitor, MapPin, UserCheck, ClipboardList,
  Clock, CalendarRange, Wallet, AlertTriangle, FormInput, ShieldCheck,
  ScrollText, LogOut, ChevronDown, ChevronRight, Zap, BookOpen
} from 'lucide-react';

export default function Sidebar() {
  const { user, activeRole, logout } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const isSettingsActive = location.pathname.startsWith('/settings');

  const mainLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance', badge: '3' },
    { to: '/leave', icon: CalendarDays, label: 'Leave', badge: '3' },
    { to: '/payroll', icon: DollarSign, label: 'Payroll' },
    { to: '/promotions', icon: TrendingUp, label: 'Promotions' },
    { to: '/penalties', icon: AlertTriangle, label: 'Penalties' },
    { to: '/company-directory', icon: BookOpen, label: 'Directory' },
  ];

  const settingsLinks = [
    { to: '/settings/departments', label: 'Departments' },
    { to: '/settings/designations', label: 'Designations' },
    { to: '/settings/job-statuses', label: 'Job Statuses' },
    { to: '/settings/reporting-managers', label: 'Reporting Mgrs' },
    { to: '/settings/work-modes', label: 'Work Modes' },
    { to: '/settings/work-locations', label: 'Work Locations' },
    { to: '/settings/employment-types', label: 'Emp. Types' },
    { to: '/settings/shifts', label: 'Shifts' },
    { to: '/settings/leave-types', label: 'Leave Types' },
    { to: '/settings/leave-policies', label: 'Leave Policies' },
    { to: '/settings/payroll-components', label: 'Salary Components' },
    { to: '/settings/penalties-config', label: 'Penalties Config' },
    { to: '/settings/tax-config', label: 'Tax Config' },
    { to: '/settings/global-days', label: 'Global Days' },
  ];

  const adminLinks = [
    { to: '/accounts', icon: ShieldCheck, label: 'HR Accounts' },
    { to: '/audit-log', icon: ScrollText, label: 'Audit Log' },
    { to: '/settings/custom-fields', icon: FormInput, label: 'Custom Fields' },
  ];

  return (
    <div className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-row">
          <div className="sb-mark"><Users size={17} /></div>
          <div>
            <div className="sb-title">EMS</div>
            <div className="sb-subtitle">Employee Management</div>
          </div>
        </div>
        <div className="sb-env">
          <div className="sb-env-dot" />
          <span className="sb-env-text">PROTOTYPE · v1.0</span>
        </div>
        <button className="btn btn-sm" style={{ marginTop: 12, width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--t2)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onClick={() => navigate('/launchpad')}>
          Apps Launchpad
        </button>
      </div>

      <div className="sb-sec">
        <div className="sb-lbl">Core Modules</div>
        {mainLinks.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-a ${isActive ? 'active' : ''}`}>
            <link.icon size={14} className="nav-ico" />
            {link.label}
            {link.badge && <span className="nav-badge">{link.badge}</span>}
          </NavLink>
        ))}
      </div>

      <div className="sb-div" />

      <div className="sb-sec">
        <button
          className="collapsible-toggle"
          onClick={() => setSettingsOpen(!settingsOpen)}
          style={{ color: isSettingsActive ? '#90caf9' : 'var(--sb-lbl)' }}
        >
          {settingsOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          Configuration
        </button>
        {settingsOpen && settingsLinks.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-a ${isActive ? 'active' : ''}`}>
            <Settings size={14} className="nav-ico" />
            {link.label}
          </NavLink>
        ))}
      </div>

      {activeRole === 'super_admin' && (
        <>
          <div className="sb-div" />
          <div className="sb-sec">
            <div className="sb-lbl">Administration</div>
            {adminLinks.map(link => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-a ${isActive ? 'active' : ''}`}>
                <link.icon size={14} className="nav-ico" />
                {link.label}
              </NavLink>
            ))}
          </div>
        </>
      )}

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-chip" onClick={logout}>
            <div className="sb-av">{user?.username?.substring(0, 2).toUpperCase()}</div>
            <div>
              <div className="sb-un">{user?.username}</div>
              <div className="sb-ur">{activeRole}</div>
            </div>
            <LogOut size={14} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,.18)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
