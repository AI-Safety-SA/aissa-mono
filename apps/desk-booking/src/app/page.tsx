"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format } from "date-fns";
import { FloorPlanViewer } from "@/components/floor-plan/FloorPlanViewer";
import { CalendarView } from "@/components/views/CalendarView";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { UserMenu } from "@/components/auth/UserMenu";
import type { DeskWithBookings } from "@/components/floor-plan/FloorPlanViewer";
import Link from "next/link";

export default function Home() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedDesk, setSelectedDesk] = useState<DeskWithBookings | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"floor-plan" | "list">(
    "floor-plan",
  );

  const floorPlans = useQuery(api.floorPlans.list) ?? [];
  const todayBookings = useQuery(api.bookings.listAll, { date });

  const selectedFloorPlanId = useMemo(() => {
    if (floorPlans.length === 0) return null;
    const defaultPlan = floorPlans.find((p) => p.isDefault) ?? floorPlans[0];
    return defaultPlan._id;
  }, [floorPlans]);

  const confirmedCount =
    todayBookings?.filter((b) => b.status === "confirmed").length ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-teal-100 font-sans selection:bg-teal-500/30">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <main className="relative z-10 flex flex-col h-screen p-6 gap-4">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-teal-900/50 pb-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
              Sanctuary<span className="text-teal-800">.</span>OS
            </h1>
            <p className="text-teal-600 font-mono text-sm tracking-wider mt-1">
              {"// WORKSPACE MONITORING AND ALLOCATION SYSTEM"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-xs font-mono text-teal-800">
              <div>
                SYS_STATUS: <span className="text-teal-400">ONLINE</span>
              </div>
              <div>
                BOOKINGS_TODAY:{" "}
                <span className="text-teal-400">{confirmedCount}</span>
              </div>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Controls bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-zinc-900 border border-teal-800/50 text-teal-300 text-xs font-mono rounded px-3 py-1.5"
            />
          </div>
          <div className="flex items-center gap-3">
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
                List
              </button>
            </div>
            <div className="flex gap-2 text-[10px] font-mono">
              <Link
                href="/book"
                className="text-teal-700 hover:text-teal-400 transition-colors"
              >
                GUEST_BOOK
              </Link>
              <Link
                href="/lookup"
                className="text-teal-700 hover:text-teal-400 transition-colors"
              >
                LOOKUP
              </Link>
              <Link
                href="/admin"
                className="text-amber-700 hover:text-amber-400 transition-colors"
              >
                ADMIN
              </Link>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <section className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 bg-zinc-900/50 rounded-2xl p-1 border border-teal-900/30 relative overflow-hidden">
            {viewMode === "floor-plan" ? (
              <FloorPlanViewer
                date={date}
                onDeskSelect={setSelectedDesk}
                selectedDeskId={selectedDesk?._id}
              />
            ) : (
              <div className="p-4 overflow-auto h-full">
                <CalendarView
                  date={date}
                  floorPlanId={selectedFloorPlanId}
                  onDeskSelect={setSelectedDesk}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-80 hidden lg:flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-teal-950/20 border border-teal-900/30 flex-1 backdrop-blur-sm overflow-auto">
              <h2 className="text-sm font-bold text-teal-500 uppercase tracking-widest mb-4 font-mono">
                Today&apos;s Activity
              </h2>
              {todayBookings === undefined ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : todayBookings.length === 0 ? (
                <div className="text-center text-teal-800 text-sm py-10 font-mono">
                  [NO_DATA_STREAM]
                </div>
              ) : (
                <div className="space-y-2">
                  {todayBookings
                    .filter((b) => b.status === "confirmed")
                    .map((booking) => (
                      <div
                        key={booking._id}
                        className="p-3 bg-zinc-900/50 rounded-lg border border-teal-900/20 text-xs font-mono"
                      >
                        <div className="flex justify-between text-teal-400">
                          <span className="font-bold">
                            {booking.desk?.label ?? "?"}
                          </span>
                          <span className="text-teal-600">
                            {booking.slot.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-teal-600 mt-0.5">
                          {booking.bookerName}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 to-teal-950/20 border border-teal-900/30 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-xs text-teal-700 font-mono uppercase tracking-wider">
                  {format(new Date(), "EEEE")}
                </div>
                <div className="text-2xl font-bold text-teal-400 font-mono">
                  {format(new Date(), "d MMM")}
                </div>
                <div className="text-[10px] text-teal-700 font-mono">
                  {confirmedCount} CONFIRMED
                </div>
              </div>
            </div>
          </aside>
        </section>

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
