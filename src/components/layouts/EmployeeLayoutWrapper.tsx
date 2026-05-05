"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeSidebar from '@/components/EmployeeSidebar';
import Topbar from '@/components/Topbar';

export default function EmployeeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

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
