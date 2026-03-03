"use client";

import { SettingsForm } from "@/components/admin/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
        Settings
      </h1>
      <SettingsForm />
    </div>
  );
}
