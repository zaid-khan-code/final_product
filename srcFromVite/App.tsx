import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { DataProvider } from "./contexts/DataContext";
import MainLayout from "./layouts/MainLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import Login from "./pages/Login";
import Launchpad from "./pages/Launchpad";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EmployeeDetail from "./pages/EmployeeDetail";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Promotions from "./pages/Promotions";
import Accounts from "./pages/Accounts";
import AuditLog from "./pages/AuditLog";
import MyDashboard from "./pages/MyDashboard";
import MyAttendance from "./pages/MyAttendance";
import MyPayslips from "./pages/MyPayslips";
import MyLeave from "./pages/MyLeave";
import MyPenalties from "./pages/MyPenalties";
import MyProfile from "./pages/MyProfile";
import PenaltiesAdmin from "./pages/PenaltiesAdmin";
import CompanyDirectory from "./pages/CompanyDirectory";
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
  GlobalDaysPage,
} from "./pages/settings/AllSettings";
import CustomFields from "./pages/settings/CustomFields";

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to="/launchpad" />;
}

function RoleGuard({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { user, activeRole } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(activeRole)) return <Navigate to="/launchpad" />;
  return <>{children}</>;
}

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />
            <Route path="/launchpad" element={<Launchpad />} />
            <Route element={<RoleGuard allowedRoles={["super_admin", "hr"]}><MainLayout /></RoleGuard>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/add" element={<AddEmployee />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leave" element={<Leave />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/audit-log" element={<AuditLog />} />
              <Route path="/penalties" element={<PenaltiesAdmin />} />
              <Route path="/company-directory" element={<CompanyDirectory />} />
              <Route path="/settings/departments" element={<RoleGuard allowedRoles={["super_admin"]}><DepartmentsPage /></RoleGuard>} />
              <Route path="/settings/reporting-managers" element={<RoleGuard allowedRoles={["super_admin"]}><ReportingManagersPage /></RoleGuard>} />
              <Route path="/settings/designations" element={<RoleGuard allowedRoles={["super_admin"]}><DesignationsPage /></RoleGuard>} />
              <Route path="/settings/work-modes" element={<RoleGuard allowedRoles={["super_admin"]}><WorkModesPage /></RoleGuard>} />
              <Route path="/settings/work-locations" element={<RoleGuard allowedRoles={["super_admin"]}><WorkLocationsPage /></RoleGuard>} />
              <Route path="/settings/employment-types" element={<RoleGuard allowedRoles={["super_admin"]}><EmploymentTypesPage /></RoleGuard>} />
              <Route path="/settings/job-statuses" element={<RoleGuard allowedRoles={["super_admin"]}><JobStatusesPage /></RoleGuard>} />
              <Route path="/settings/shifts" element={<RoleGuard allowedRoles={["super_admin"]}><ShiftsPage /></RoleGuard>} />
              <Route path="/settings/leave-types" element={<RoleGuard allowedRoles={["super_admin"]}><LeaveTypesPage /></RoleGuard>} />
              <Route path="/settings/leave-policies" element={<RoleGuard allowedRoles={["super_admin"]}><LeavePoliciesPage /></RoleGuard>} />
              <Route path="/settings/payroll-components" element={<RoleGuard allowedRoles={["super_admin"]}><PayrollComponentsPage /></RoleGuard>} />
              <Route path="/settings/penalties-config" element={<RoleGuard allowedRoles={["super_admin"]}><PenaltiesConfigPage /></RoleGuard>} />
              <Route path="/settings/tax-config" element={<RoleGuard allowedRoles={["super_admin"]}><TaxConfigPage /></RoleGuard>} />
              <Route path="/settings/global-days" element={<RoleGuard allowedRoles={["super_admin"]}><GlobalDaysPage /></RoleGuard>} />
              <Route path="/settings/custom-fields" element={<RoleGuard allowedRoles={["super_admin"]}><CustomFields /></RoleGuard>} />
            </Route>
            <Route element={<EmployeeLayout />}>
              <Route path="/my-dashboard" element={<MyDashboard />} />
              <Route path="/my-attendance" element={<MyAttendance />} />
              <Route path="/my-payslips" element={<MyPayslips />} />
              <Route path="/my-leave" element={<MyLeave />} />
              <Route path="/my-penalties" element={<MyPenalties />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/company-directory" element={<CompanyDirectory />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ToastProvider>
  </AuthProvider>
);

export default App;
