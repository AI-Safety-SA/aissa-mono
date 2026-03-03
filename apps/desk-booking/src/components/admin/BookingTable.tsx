"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { BookingList } from "@/components/booking/BookingList";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export function BookingTable() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [dateFilter, setDateFilter] = useState(today);
  const [statusFilter, setStatusFilter] = useState<
    "confirmed" | "cancelled" | ""
  >("");

  const bookings = useQuery(api.bookings.listAll, {
    date: dateFilter || undefined,
    status: statusFilter || undefined,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono text-xs w-44"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "confirmed" | "cancelled" | "")
          }
          className="bg-zinc-900 border border-teal-800/50 text-teal-300 text-xs font-mono rounded px-2 py-1.5"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => {
            setDateFilter("");
            setStatusFilter("");
          }}
          className="text-[10px] text-teal-700 hover:text-teal-400 font-mono"
        >
          CLEAR
        </button>
      </div>

      {/* Results */}
      {bookings === undefined ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <BookingList
          bookings={bookings}
          emptyMessage="No bookings match your filters."
          showCancelButton={true}
        />
      )}
    </div>
  );
}
