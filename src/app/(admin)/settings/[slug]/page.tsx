"use client";
import React, { use } from 'react';
import {
  DepartmentsPage,
  DesignationsPage,
  WorkModesPage,
  WorkLocationsPage,
  EmploymentTypesPage,
  JobStatusesPage,
  ReportingManagersPage,
  ShiftsPage,
  LeaveTypesPage,
  LeavePoliciesPage,
  PayrollComponentsPage,
  PenaltiesConfigPage,
  TaxConfigPage,
  GlobalDaysPage
} from '@/components/settings/AllSettings';
import CustomFields from '@/components/settings/CustomFields';
import { notFound } from 'next/navigation';

const SETTINGS_MAP: Record<string, React.ComponentType> = {
  'departments': DepartmentsPage,
  'designations': DesignationsPage,
  'work-modes': WorkModesPage,
  'work-locations': WorkLocationsPage,
  'employment-types': EmploymentTypesPage,
  'job-statuses': JobStatusesPage,
  'reporting-managers': ReportingManagersPage,
  'shifts': ShiftsPage,
  'leave-types': LeaveTypesPage,
  'leave-policies': LeavePoliciesPage,
  'payroll-components': PayrollComponentsPage,
  'penalties-config': PenaltiesConfigPage,
  'tax-config': TaxConfigPage,
  'global-days': GlobalDaysPage,
  'custom-fields': CustomFields,
};

export default function SettingsSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const Component = SETTINGS_MAP[slug];

  if (!Component) {
    notFound();
  }

  return <Component />;
}
