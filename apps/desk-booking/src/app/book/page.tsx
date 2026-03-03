"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import { FloorPlanViewer } from "@/components/floor-plan/FloorPlanViewer";
import { CalendarView } from "@/components/views/CalendarView";
import { BookingDialog } from "@/components/booking/BookingDialog";
import type { DeskWithBookings } from "@/components/floor-plan/FloorPlanViewer";
import Link from "next/link";

export default function GuestBookPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedDesk, setSelectedDesk] = useState<DeskWithBookings | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"floor-plan" | "list">(
    "floor-plan",
  );

  const floorPlans = useQuery(api.floorPlans.list) ?? [];

  const selectedFloorPlanId = useMemo(() => {
    if (floorPlans.length === 0) return null;
    const defaultPlan = floorPlans.find((p) => p.isDefault) ?? floorPlans[0];
    return defaultPlan._id;
  }, [floorPlans]);

  return (
    <div className="min-h-screen bg-zinc-950 text-teal-100 font-sans">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <main className="relative z-10 flex flex-col h-screen p-6 gap-4">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-teal-900/50 pb-4">
          <div>
            <Link href="/">
              <h1 className="text-3xl font-black bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
                Sanctuary<span className="text-teal-800">.</span>OS
              </h1>
            </Link>
            <p className="text-teal-600 font-mono text-xs tracking-wider mt-1">
              {"// GUEST BOOKING PORTAL"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/lookup"
              className="text-xs font-mono text-teal-700 hover:text-teal-400 transition-colors"
            >
              LOOKUP BOOKINGS
            </Link>
          </div>
        </header>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-900 border border-teal-800/50 text-teal-300 text-xs font-mono rounded px-3 py-1.5"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("floor-plan")}
              className={`px-3 py-1 text-[10px] font-mono uppercase rounded-sm border transition-all ${viewMode === "floor-plan" ? "bg-teal-600/20 border-teal-500/50 text-teal-300" : "bg-zinc-900/50 border-teal-900/30 text-teal-700"}`}
            >
              Floor Plan
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-[10px] font-mono uppercase rounded-sm border transition-all ${viewMode === "list" ? "bg-teal-600/20 border-teal-500/50 text-teal-300" : "bg-zinc-900/50 border-teal-900/30 text-teal-700"}`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "floor-plan" ? (
            <FloorPlanViewer
              date={date}
              onDeskSelect={setSelectedDesk}
              selectedDeskId={selectedDesk?._id}
            />
          ) : (
            <CalendarView
              date={date}
              floorPlanId={selectedFloorPlanId}
              onDeskSelect={setSelectedDesk}
            />
          )}
        </div>

        {/* Booking dialog */}
        <BookingDialog
          desk={selectedDesk}
          date={date}
          isOpen={!!selectedDesk}
          onClose={() => setSelectedDesk(null)}
        />
      </main>
    </div>
  );
}
