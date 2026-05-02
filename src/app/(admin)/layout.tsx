"use client";
import AdminLayoutWrapper from "@/components/layouts/AdminLayoutWrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
