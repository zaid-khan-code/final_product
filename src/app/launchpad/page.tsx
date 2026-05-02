"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Settings, User } from 'lucide-react';

export default function LaunchpadPage() {
  const { activeRole, user, logout } = useAuth();
  const router = useRouter();

  const handleLaunch = (path: string) => {
    router.push(path);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 800, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <div className="mono" style={{ fontSize: 13, color: 'var(--t3)', letterSpacing: 1 }}>ESSPL ECOSYSTEM</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--p)' }}>Welcome back, {user?.username}</h1>
          </div>
          <button className="btn btn-secondary" onClick={logout}>Sign Out</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          
          {/* Core HCM (HR & Admin only) */}
          {(activeRole === 'super_admin' || activeRole === 'hr') && (
            <div 
              className="card" 
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', transition: 'all 0.2sease' }}
              onClick={() => handleLaunch('/dashboard')}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--pl)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Users size={32} color="var(--p)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Core HCM</h3>
              <p style={{ fontSize: 12, color: 'var(--t3)' }}>Manage employees, attendance, leaves, and payroll.</p>
            </div>
          )}

          {/* Employee Portal (All roles) */}
          <div 
            className="card" 
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', transition: 'all 0.2sease' }}
            onClick={() => handleLaunch('/my-dashboard')}
          >
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--greenl)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <User size={32} color="var(--green)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Self-Service Portal</h3>
            <p style={{ fontSize: 12, color: 'var(--t3)' }}>View your attendance, leaves, and personal profile.</p>
          </div>

          {/* Settings (Super Admin only) */}
          {activeRole === 'super_admin' && (
            <div 
              className="card" 
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', transition: 'all 0.2s ease' }}
              onClick={() => handleLaunch('/settings/departments')}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--steell)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Settings size={32} color="var(--steel)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>System Config</h3>
              <p style={{ fontSize: 12, color: 'var(--t3)' }}>Manage departments, designations, shifts, and policies.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
