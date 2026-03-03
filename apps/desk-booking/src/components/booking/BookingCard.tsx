"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BookingCardProps {
  booking: Doc<"bookings"> & { desk?: Doc<"desks"> | null };
  showCancelButton?: boolean;
}

export function BookingCard({
  booking,
  showCancelButton = true,
}: BookingCardProps) {
  const cancelBooking = useMutation(api.bookings.cancel);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelBooking({ bookingId: booking._id });
      toast.success("Booking cancelled");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel";
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  const isPast = new Date(booking.date + "T23:59:59") < new Date();

  return (
    <div
      className={`
        p-4 rounded-lg border font-mono text-xs
        ${
          booking.status === "cancelled"
            ? "bg-red-950/10 border-red-900/20 opacity-60"
            : isPast
              ? "bg-zinc-900/50 border-teal-900/20 opacity-70"
              : "bg-teal-950/20 border-teal-900/30"
        }
      `}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="text-teal-400 font-bold uppercase tracking-wider">
            {booking.desk?.label ?? "Unknown Desk"}
          </div>
          <div className="text-teal-600">
            {booking.date} {"//"} {booking.slot.toUpperCase()}
          </div>
          <div className="text-teal-500/80">{booking.bookerName}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`
              px-2 py-0.5 rounded text-[10px] uppercase
              ${
                booking.status === "confirmed"
                  ? "bg-green-900/20 text-green-500 border border-green-800/30"
                  : "bg-red-900/20 text-red-500 border border-red-800/30"
              }
            `}
          >
            {booking.status}
          </span>

          {showCancelButton &&
            booking.status === "confirmed" &&
            !isPast && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                className="border-red-900/50 text-red-400 hover:bg-red-900/20 text-[10px] h-6 px-2"
              >
                {isCancelling ? "..." : "CANCEL"}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
