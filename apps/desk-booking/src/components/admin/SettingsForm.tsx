"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DEFAULTS = {
  morningSlotStart: "08:00",
  morningSlotEnd: "12:00",
  afternoonSlotStart: "13:00",
  afternoonSlotEnd: "17:00",
  maxAdvanceBookingDays: 30,
  orgName: "AISSA Hub",
  orgEmail: "hub@aissa.org.za",
};

export function SettingsForm() {
  const settings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);

  // Track local overrides; derive form values from server + overrides
  const [overrides, setOverrides] = useState<Record<string, unknown>>({});
  const baseForm = useMemo(() => {
    if (!settings) return DEFAULTS;
    return {
      morningSlotStart: settings.morningSlotStart,
      morningSlotEnd: settings.morningSlotEnd,
      afternoonSlotStart: settings.afternoonSlotStart,
      afternoonSlotEnd: settings.afternoonSlotEnd,
      maxAdvanceBookingDays: settings.maxAdvanceBookingDays,
      orgName: settings.orgName,
      orgEmail: settings.orgEmail,
    };
  }, [settings]);

  const form = { ...baseForm, ...overrides } as typeof DEFAULTS;
  const setForm = (next: typeof DEFAULTS) => setOverrides(next);

  const handleSave = async () => {
    try {
      await updateSettings(form);
      toast.success("Settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Organization */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-teal-500 uppercase tracking-widest font-bold">
          Organization
        </h3>
        <div className="space-y-2">
          <Label className="text-teal-600 text-xs font-mono">Org Name</Label>
          <Input
            value={form.orgName}
            onChange={(e) => setForm({ ...form, orgName: e.target.value })}
            className="bg-teal-900/30 border-teal-700 text-teal-100"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-teal-600 text-xs font-mono">Org Email</Label>
          <Input
            value={form.orgEmail}
            onChange={(e) => setForm({ ...form, orgEmail: e.target.value })}
            className="bg-teal-900/30 border-teal-700 text-teal-100"
          />
        </div>
      </div>

      {/* Slot times */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-teal-500 uppercase tracking-widest font-bold">
          Slot Times
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-teal-600 text-xs font-mono">
              Morning Start
            </Label>
            <Input
              type="time"
              value={form.morningSlotStart}
              onChange={(e) =>
                setForm({ ...form, morningSlotStart: e.target.value })
              }
              className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-teal-600 text-xs font-mono">
              Morning End
            </Label>
            <Input
              type="time"
              value={form.morningSlotEnd}
              onChange={(e) =>
                setForm({ ...form, morningSlotEnd: e.target.value })
              }
              className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-teal-600 text-xs font-mono">
              Afternoon Start
            </Label>
            <Input
              type="time"
              value={form.afternoonSlotStart}
              onChange={(e) =>
                setForm({ ...form, afternoonSlotStart: e.target.value })
              }
              className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-teal-600 text-xs font-mono">
              Afternoon End
            </Label>
            <Input
              type="time"
              value={form.afternoonSlotEnd}
              onChange={(e) =>
                setForm({ ...form, afternoonSlotEnd: e.target.value })
              }
              className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Booking Rules */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-teal-500 uppercase tracking-widest font-bold">
          Booking Rules
        </h3>
        <div className="space-y-2">
          <Label className="text-teal-600 text-xs font-mono">
            Max Advance Booking Days
          </Label>
          <Input
            type="number"
            value={form.maxAdvanceBookingDays}
            onChange={(e) =>
              setForm({
                ...form,
                maxAdvanceBookingDays: parseInt(e.target.value) || 30,
              })
            }
            className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono w-32"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="bg-teal-600 hover:bg-teal-500 text-white font-bold font-mono"
      >
        SAVE SETTINGS
      </Button>
    </div>
  );
}
