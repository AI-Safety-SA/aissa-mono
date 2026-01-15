"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface BookingFormProps {
  deskId: Id<"desks"> | null;
  deskLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingForm({ deskId, deskLabel, isOpen, onClose }: BookingFormProps) {
  const createBooking = useMutation(api.bookings.create);
  const [name, setName] = useState("");
  // Simple duration selection for prototype
  const [duration, setDuration] = useState("4"); // hours

  const handleBook = async () => {
    if (!deskId || !name) return;
    
    const now = Date.now();
    const startTime = now;
    const endTime = now + parseInt(duration) * 60 * 60 * 1000;

    try {
      await createBooking({
        deskId,
        userId: "user-" + Math.floor(Math.random() * 1000), // Mock User ID
        userName: name,
        startTime,
        endTime,
      });
      toast.success("Desk booked successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to book desk. It might be taken.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-teal-950 border-teal-800 text-teal-100">
        <DialogHeader>
          <DialogTitle className="text-teal-400 uppercase tracking-widest font-mono">Book Unit: {deskLabel}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-teal-500">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-teal-900/30 border-teal-700 text-teal-100 placeholder:text-teal-700 focus-visible:ring-teal-500"
              placeholder="Enter your name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right text-teal-500">
              Duration
            </Label>
            <div className="col-span-3 flex gap-2">
                {["4", "8"].map((hours) => (
                    <button
                        key={hours}
                        onClick={() => setDuration(hours)}
                        className={`flex-1 py-1 rounded border ${duration === hours ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-teal-900/20 border-teal-800 hover:border-teal-600'}`}
                    >
                        {hours}h
                    </button>
                ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleBook} type="submit" className="bg-teal-600 hover:bg-teal-500 text-white font-bold tracking-wide">
            CONFIRM ALLOCATION
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
