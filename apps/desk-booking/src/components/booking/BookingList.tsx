"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { BookingCard } from "./BookingCard";

interface BookingListProps {
  bookings: (Doc<"bookings"> & { desk?: Doc<"desks"> | null })[];
  emptyMessage?: string;
  showCancelButton?: boolean;
}

export function BookingList({
  bookings,
  emptyMessage = "No bookings found.",
  showCancelButton = true,
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center text-teal-800 text-sm py-10 font-mono">
        {emptyMessage}
      </div>
    );
  }

  // Sort: upcoming first, then by date
  const sorted = [...bookings].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "confirmed" ? -1 : 1;
    }
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="space-y-2">
      {sorted.map((booking) => (
        <BookingCard
          key={booking._id}
          booking={booking}
          showCancelButton={showCancelButton}
        />
      ))}
    </div>
  );
}
