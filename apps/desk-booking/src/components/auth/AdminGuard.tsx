"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthMode } from "@/app/AuthProvider";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { isGuestOnly } = useAuthMode();
  const user = useQuery(api.users.getMe);

  if (isGuestOnly) {
    // In guest mode, admin is accessible (no auth to restrict it)
    // In production, you'd protect this with a password or env var
    return <>{children}</>;
  }

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <>{fallback ?? (
        <div className="text-center py-10 text-red-500 font-mono text-sm">
          ACCESS_DENIED: Admin privileges required.
        </div>
      )}</>
    );
  }

  return <>{children}</>;
}
