"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayoutWrapper from '@/components/layouts/AdminLayoutWrapper';
import EmployeeLayoutWrapper from '@/components/layouts/EmployeeLayoutWrapper';

export default function CompanyDirectoryLayout({ children }: { children: React.ReactNode }) {
  const { activeRole } = useAuth();

  if (activeRole === 'employee') {
    return <EmployeeLayoutWrapper>{children}</EmployeeLayoutWrapper>;
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
