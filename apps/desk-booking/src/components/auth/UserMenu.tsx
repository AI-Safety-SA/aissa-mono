"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthMode } from "@/app/AuthProvider";

export function UserMenu() {
  const { isGuestOnly } = useAuthMode();
  const user = useQuery(api.users.getMe);

  if (isGuestOnly) {
    return (
      <div className="text-xs font-mono text-teal-700">
        MODE: <span className="text-amber-400">GUEST</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-xs font-mono text-teal-400">{user.name}</div>
        <div className="text-[10px] font-mono text-teal-700 uppercase">
          {user.role}
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-teal-800 border border-teal-600 flex items-center justify-center text-teal-300 text-sm font-bold">
        {user.name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}
