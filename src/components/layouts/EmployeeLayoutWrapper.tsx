"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeSidebar from '@/components/EmployeeSidebar';
import Topbar from '@/components/Topbar';

export default function EmployeeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, activeRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (activeRole !== 'employee') {
      router.push('/dashboard');
    }
  }, [user, activeRole, router]);

  if (!user || activeRole !== 'employee') return null;

  return (
    <div className="app-layout">
      <EmployeeSidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
