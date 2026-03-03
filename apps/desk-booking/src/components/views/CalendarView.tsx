"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { DeskFilterBar } from "./DeskFilterBar";
import type { DeskWithBookings } from "../floor-plan/FloorPlanViewer";

interface CalendarViewProps {
  date: string;
  floorPlanId: Id<"floorPlans"> | null;
  onDeskSelect?: (desk: DeskWithBookings) => void;
}

export function CalendarView({
  date,
  floorPlanId,
  onDeskSelect,
}: CalendarViewProps) {
  const desks = useQuery(
    api.bookings.getByFloorPlanAndDate,
    floorPlanId ? { floorPlanId, date } : "skip",
  ) as DeskWithBookings[] | undefined;

  const [selectedTypeId, setSelectedTypeId] = useState<Id<"deskTypes"> | null>(
    null,
  );
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredDesks = desks?.filter((desk) => {
    if (selectedTypeId && desk.deskTypeId !== selectedTypeId) return false;
    if (showAvailableOnly && desk.morningBooked && desk.afternoonBooked)
      return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <DeskFilterBar
        selectedTypeId={selectedTypeId}
        onTypeChange={setSelectedTypeId}
        showAvailableOnly={showAvailableOnly}
        onAvailableOnlyChange={setShowAvailableOnly}
      />

      {desks === undefined ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !filteredDesks || filteredDesks.length === 0 ? (
        <div className="text-center text-teal-800 text-sm py-10 font-mono">
          No desks match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDesks.map((desk) => {
            const isFullyBooked = desk.morningBooked && desk.afternoonBooked;

            return (
              <button
                key={desk._id}
                onClick={() => !isFullyBooked && onDeskSelect?.(desk)}
                disabled={isFullyBooked}
                className={`
                  p-4 rounded-lg border text-left transition-all font-mono
                  ${
                    isFullyBooked
                      ? "bg-red-950/10 border-red-900/20 opacity-50 cursor-not-allowed"
                      : "bg-teal-950/20 border-teal-900/30 hover:border-teal-600 hover:bg-teal-950/30 cursor-pointer"
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-bold text-teal-300">
                      {desk.label}
                    </div>
                    {desk.deskType && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block"
                        style={{
                          backgroundColor: `${desk.deskType.color}20`,
                          color: desk.deskType.color,
                        }}
                      >
                        {desk.deskType.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <div
                      className={`w-3 h-3 rounded-full ${desk.morningBooked ? "bg-red-500" : "bg-green-500"}`}
                      title={`Morning: ${desk.morningBooked ? "Booked" : "Available"}`}
                    />
                    <div
                      className={`w-3 h-3 rounded-full ${desk.afternoonBooked ? "bg-red-500" : "bg-green-500"}`}
                      title={`Afternoon: ${desk.afternoonBooked ? "Booked" : "Available"}`}
                    />
                  </div>
                </div>

                <div className="mt-2 space-y-1 text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-700">AM:</span>
                    <span
                      className={
                        desk.morningBooked ? "text-red-400" : "text-green-400"
                      }
                    >
                      {desk.morningBooked
                        ? desk.bookings.find((b) => b.slot === "morning")
                            ?.bookerName ?? "Booked"
                        : "Available"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-teal-700">PM:</span>
                    <span
                      className={
                        desk.afternoonBooked
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {desk.afternoonBooked
                        ? desk.bookings.find((b) => b.slot === "afternoon")
                            ?.bookerName ?? "Booked"
                        : "Available"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
