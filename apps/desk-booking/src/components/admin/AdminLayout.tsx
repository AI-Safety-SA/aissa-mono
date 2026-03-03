"use client";

import { ReactNode } from "react";
import { AdminNav } from "./AdminNav";
import { AdminGuard } from "@/components/auth/AdminGuard";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-zinc-950 text-teal-100">
        <AdminNav />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </AdminGuard>
  );
}
