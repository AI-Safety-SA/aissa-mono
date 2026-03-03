"use client";

import { BookingTable } from "@/components/admin/BookingTable";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
        All Bookings
      </h1>
      <BookingTable />
    </div>
  );
}
