"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { NavLink } from "./NavLink";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  CalendarDays,
  User,
  LogOut,
  Zap,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { useData } from "../contexts/DataContext";

export default function EmployeeSidebar() {
  const { user, logout } = useAuth();
  const { attendanceData } = useData();
  const router = useRouter();

  // Find today's attendance for the logged-in user (demo default: EMP001)
  const todayDate = "2026-03-19"; // Unified prototype date
  const myAttendanceToday = attendanceData.find(a => a.empId === 'EMP001' && a.date === todayDate);

  const isPresent = myAttendanceToday?.status === 'Present';
  const isLate = myAttendanceToday?.status === 'Late';
  const isAbsent = myAttendanceToday?.status === 'Absent';

  const links = [
    { href: "/my-dashboard", icon: LayoutDashboard, label: "My Dashboard" },
    { href: "/my-attendance", icon: CalendarCheck, label: "My Attendance" },
    { href: "/my-payslips", icon: Wallet, label: "My Payslips" },
    { href: "/my-leave", icon: CalendarDays, label: "Apply for Leave" },
    { href: "/my-penalties", icon: AlertTriangle, label: "My Penalties" },
    { href: "/my-profile", icon: User, label: "My Profile" },
    { href: "/company-directory", icon: BookOpen, label: "Company Directory" },
  ];

  return (
    <div className="sidebar emp-sidebar">
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
        <button className="btn btn-sm" style={{ marginTop: 12, width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--t2)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onClick={() => router.push('/launchpad')}>
          Apps Launchpad
        </button>
      </div>
      <div className="sb-sec">
        <div className="sb-lbl">Menu</div>
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            className={({ isActive }) => `nav-a ${isActive ? "active" : ""}`}
          >
            <link.icon size={14} className="nav-ico" />
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-chip" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, cursor: 'pointer' }}>
            <div className="sb-av">{user?.username?.substring(0,2).toUpperCase()}</div>
            <div>
              <div className="sb-un">{user?.username || 'Employee'}</div>
              {isPresent || isLate ? (
                <div style={{ fontSize: 9, color: isLate ? 'var(--amber)' : 'var(--green)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLate ? 'var(--amber)' : 'var(--green)' }} /> 
                  {isLate ? 'LATE TODAY' : 'PRESENT TODAY'}
                </div>
              ) : isAbsent ? (
                <div style={{ fontSize: 9, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} /> ABSENT TODAY
                </div>
              ) : (
                <div style={{ fontSize: 9, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--steel)' }} /> NOT CHECKED IN
                </div>
              )}
            </div>
            <LogOut
              size={14}
              style={{ marginLeft: "auto", color: "rgba(255,255,255,.18)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
