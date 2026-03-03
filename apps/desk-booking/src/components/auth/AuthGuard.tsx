"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthMode } from "@/app/AuthProvider";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isGuestOnly } = useAuthMode();
  const user = useQuery(api.users.getMe);

  if (isGuestOnly) {
    return <>{fallback ?? <GuestFallback />}</>;
  }

  if (user === undefined) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <>{fallback ?? <LoginPrompt />}</>;
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function GuestFallback() {
  return (
    <div className="text-center py-10 text-teal-600 font-mono text-sm">
      Authentication not configured. Running in guest-only mode.
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="text-center py-10 text-teal-600 font-mono text-sm">
      Please sign in to access this section.
    </div>
  );
}
