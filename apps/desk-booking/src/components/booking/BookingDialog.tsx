"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookingSlotPicker } from "./BookingSlotPicker";
import { GuestBookingForm } from "./GuestBookingForm";
import { useAuthMode } from "@/app/AuthProvider";
import type { DeskWithBookings } from "../floor-plan/FloorPlanViewer";

interface BookingDialogProps {
  desk: DeskWithBookings | null;
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDialog({
  desk,
  date,
  isOpen,
  onClose,
}: BookingDialogProps) {
  const createBooking = useMutation(api.bookings.create);
  const { isGuestOnly } = useAuthMode();
  const user = useQuery(api.users.getMe);

  const [selectedSlot, setSelectedSlot] = useState<
    "morning" | "afternoon" | null
  >(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBook = async () => {
    if (!desk || !selectedSlot) return;

    const bookerName = user?.name ?? name;
    const bookerEmail = user?.email ?? email;

    if (!bookerName || !bookerEmail) {
      toast.error("Name and email are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        deskId: desk._id,
        date,
        slot: selectedSlot,
        bookerName,
        bookerEmail,
      });
      toast.success(`Desk ${desk.label} booked for ${selectedSlot}!`);
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to book desk";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedSlot(null);
    setName("");
    setEmail("");
    onClose();
  };

  const needsGuestInfo = isGuestOnly || !user;
  const canSubmit =
    selectedSlot &&
    (needsGuestInfo ? name && email : true) &&
    !isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-950 border-teal-800/50 text-teal-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-teal-400 uppercase tracking-widest font-mono text-sm">
            Book Unit: {desk?.label}
          </DialogTitle>
          {desk?.deskType && (
            <div className="flex items-center gap-2 mt-1">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono"
                style={{
                  backgroundColor: `${desk.deskType.color}20`,
                  color: desk.deskType.color,
                }}
              >
                {desk.deskType.name}
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date display */}
          <div className="text-xs font-mono text-teal-600">
            DATE: <span className="text-teal-400">{date}</span>
          </div>

          {/* Slot picker */}
          <BookingSlotPicker
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            morningBooked={desk?.morningBooked ?? false}
            afternoonBooked={desk?.afternoonBooked ?? false}
          />

          {/* Guest booking form */}
          {needsGuestInfo && (
            <GuestBookingForm
              name={name}
              email={email}
              onNameChange={setName}
              onEmailChange={setEmail}
            />
          )}

          {/* Authenticated user info */}
          {user && !isGuestOnly && (
            <div className="text-xs font-mono text-teal-600 bg-teal-950/30 rounded-lg p-3 border border-teal-900/30">
              Booking as:{" "}
              <span className="text-teal-300">{user.name}</span> (
              {user.email})
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-teal-800 text-teal-400 hover:bg-teal-900/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={!canSubmit}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold tracking-wide font-mono disabled:opacity-50"
          >
            {isSubmitting ? "ALLOCATING..." : "CONFIRM ALLOCATION"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
