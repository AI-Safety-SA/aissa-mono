"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import Link from "next/link";

export default function AdminDashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayBookings = useQuery(api.bookings.listAll, { date: today });
  const floorPlans = useQuery(api.floorPlans.list);
  const deskTypes = useQuery(api.deskTypes.list);

  const confirmedToday =
    todayBookings?.filter((b) => b.status === "confirmed").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
          Dashboard
        </h1>
        <p className="text-xs text-teal-700 font-mono mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Today's Bookings"
          value={confirmedToday}
          subtext="confirmed"
        />
        <StatCard
          label="Floor Plans"
          value={floorPlans?.length ?? 0}
          subtext="configured"
        />
        <StatCard
          label="Desk Types"
          value={deskTypes?.filter((t) => t.isActive).length ?? 0}
          subtext="active"
        />
      </div>

      {/* Today's bookings list */}
      <div className="bg-teal-950/20 border border-teal-900/30 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-teal-500 uppercase tracking-widest font-mono">
            Today&apos;s Bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="text-[10px] text-teal-700 hover:text-teal-400 font-mono"
          >
            {"VIEW ALL ->"}
          </Link>
        </div>

        {todayBookings === undefined ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : todayBookings.length === 0 ? (
          <div className="text-center text-teal-800 text-sm py-6 font-mono">
            No bookings for today.
          </div>
        ) : (
          <div className="space-y-2">
            {todayBookings
              .filter((b) => b.status === "confirmed")
              .map((booking) => (
                <div
                  key={booking._id}
                  className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-teal-900/20 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-teal-400 font-bold">
                      {booking.desk?.label ?? "?"}
                    </span>
                    <span className="text-teal-600">
                      {booking.slot.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-teal-500">{booking.bookerName}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: number;
  subtext: string;
}) {
  return (
    <div className="bg-teal-950/20 border border-teal-900/30 rounded-xl p-5">
      <div className="text-[10px] font-mono text-teal-700 uppercase tracking-widest">
        {label}
      </div>
      <div className="text-3xl font-bold text-teal-300 mt-1">{value}</div>
      <div className="text-[10px] font-mono text-teal-700 mt-1">
        {subtext}
      </div>
    </div>
  );
}
