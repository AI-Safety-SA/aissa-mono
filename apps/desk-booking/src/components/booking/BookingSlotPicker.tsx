"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface BookingSlotPickerProps {
  selectedSlot: "morning" | "afternoon" | null;
  onSelectSlot: (slot: "morning" | "afternoon") => void;
  morningBooked: boolean;
  afternoonBooked: boolean;
}

export function BookingSlotPicker({
  selectedSlot,
  onSelectSlot,
  morningBooked,
  afternoonBooked,
}: BookingSlotPickerProps) {
  const settings = useQuery(api.settings.get);

  const slots = [
    {
      id: "morning" as const,
      label: "Morning",
      time: settings
        ? `${settings.morningSlotStart} - ${settings.morningSlotEnd}`
        : "08:00 - 12:00",
      isBooked: morningBooked,
    },
    {
      id: "afternoon" as const,
      label: "Afternoon",
      time: settings
        ? `${settings.afternoonSlotStart} - ${settings.afternoonSlotEnd}`
        : "13:00 - 17:00",
      isBooked: afternoonBooked,
    },
  ];

  return (
    <div className="flex gap-2">
      {slots.map((slot) => (
        <button
          key={slot.id}
          onClick={() => !slot.isBooked && onSelectSlot(slot.id)}
          disabled={slot.isBooked}
          className={`
            flex-1 py-3 px-3 rounded-lg border text-center transition-all font-mono text-xs
            ${
              slot.isBooked
                ? "bg-red-950/20 border-red-900/30 text-red-700 cursor-not-allowed"
                : selectedSlot === slot.id
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "bg-teal-900/20 border-teal-800/50 text-teal-400 hover:border-teal-600 hover:bg-teal-900/30"
            }
          `}
        >
          <div className="font-bold uppercase tracking-wider">{slot.label}</div>
          <div className="text-[10px] mt-0.5 opacity-70">{slot.time}</div>
          {slot.isBooked && (
            <div className="text-[10px] mt-1 text-red-500">BOOKED</div>
          )}
        </button>
      ))}
    </div>
  );
}
