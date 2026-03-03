"use client";

import { Doc } from "../../../convex/_generated/dataModel";

interface DeskTooltipProps {
  desk: Doc<"desks"> & {
    deskType: Doc<"deskTypes"> | null;
    morningBooked: boolean;
    afternoonBooked: boolean;
    bookings: Doc<"bookings">[];
  };
  x: number;
  y: number;
}

export function DeskTooltip({ desk, x, y }: DeskTooltipProps) {
  const morningBooking = desk.bookings.find((b) => b.slot === "morning");
  const afternoonBooking = desk.bookings.find((b) => b.slot === "afternoon");

  return (
    <foreignObject x={x + 90} y={y - 10} width={220} height={160}>
      <div className="bg-zinc-900/95 backdrop-blur-md border border-teal-800/50 rounded-lg p-3 text-xs font-mono shadow-xl">
        <div className="text-teal-400 font-bold uppercase tracking-wider mb-2">
          {desk.label}
          {desk.deskType && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
              style={{
                backgroundColor: `${desk.deskType.color}20`,
                color: desk.deskType.color,
              }}
            >
              {desk.deskType.name}
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-teal-300/80">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: desk.morningBooked ? "#ef4444" : "#22c55e",
              }}
            />
            <span>Morning:</span>
            <span className={desk.morningBooked ? "text-red-400" : "text-green-400"}>
              {morningBooking ? morningBooking.bookerName : "Available"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: desk.afternoonBooked ? "#ef4444" : "#22c55e",
              }}
            />
            <span>Afternoon:</span>
            <span className={desk.afternoonBooked ? "text-red-400" : "text-green-400"}>
              {afternoonBooking ? afternoonBooking.bookerName : "Available"}
            </span>
          </div>
        </div>

        {desk.status === "maintenance" && (
          <div className="mt-2 text-amber-500 text-[10px] uppercase">
            Under maintenance
          </div>
        )}
      </div>
    </foreignObject>
  );
}
