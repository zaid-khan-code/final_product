"use client";
import EmployeeLayoutWrapper from "@/components/layouts/EmployeeLayoutWrapper";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <EmployeeLayoutWrapper>{children}</EmployeeLayoutWrapper>;
}
