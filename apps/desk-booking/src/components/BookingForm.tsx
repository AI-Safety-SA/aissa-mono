"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUser } from "@/components/UserSwitcher";
import { CalendarIcon, Clock, Users } from "lucide-react";

interface BookingFormProps {
  deskId: Id<"desks"> | null;
  deskLabel: string;
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export default function BookingForm({ deskId, deskLabel, isOpen, onClose, selectedDate }: BookingFormProps) {
  const createBooking = useMutation(api.bookings.create);
  const { user } = useUser();
  const [name, setName] = useState(user.name);
  const [duration, setDuration] = useState("4"); // hours

  // Update name if user context changes
  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleBook = async () => {
    if (!deskId || !name) return;
    
    // Create start time based on selected date but current time for demo simplicity
    // In a real app we'd have a time picker.
    // For now we assume "Book for the selected day, starting at 9AM" if it's a future date
    // Or "Now" if it's today.
    
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    
    let startTime = selectedDate.getTime();
    if (isToday) {
        startTime = Date.now();
    } else {
        selectedDate.setHours(9, 0, 0, 0); // 9 AM default
        startTime = selectedDate.getTime();
    }

    const endTime = startTime + parseInt(duration) * 60 * 60 * 1000;

    try {
      await createBooking({
        deskId,
        userId: user.id,
        userName: name,
        startTime,
        endTime,
      });
      toast.success(`Unit ${deskLabel} allocation confirmed.`);
      onClose();
    } catch (error) {
      toast.error("Allocation failed. Time slot conflict detected.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-teal-500/20 text-teal-100 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-teal-400 font-mono text-xl tracking-tighter flex items-center gap-2">
            <span className="text-teal-600">ALLOCATE //</span> {deskLabel}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            
          {/* User Identity Section */}
          <div className="space-y-2">
             <Label htmlFor="identity" className="text-[10px] uppercase font-mono text-teal-600 tracking-widest flex items-center gap-2">
               <Users size={12} /> Operator Identity
             </Label>
             <div className="bg-teal-950/50 border border-teal-800 rounded p-2 text-sm text-teal-300 font-mono flex items-center justify-between">
                <span>{user.name}</span>
                <span className="text-[10px] bg-teal-900 px-1 rounded text-teal-500">{user.id}</span>
             </div>
             {user.name !== name && <div className="text-[10px] text-amber-500">Warning: Override active</div>}
          </div>

          {/* Duration Section */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-mono text-teal-600 tracking-widest flex items-center gap-2">
                <Clock size={12} /> Duration Block
            </Label>
            <div className="grid grid-cols-2 gap-2">
                {["4", "8", "12"].map((hours) => (
                    <button
                        key={hours}
                        onClick={() => setDuration(hours)}
                        className={`py-2 px-4 rounded border transition-all text-sm font-mono
                            ${duration === hours 
                                ? 'bg-teal-500/20 border-teal-400 text-teal-100 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                                : 'bg-teal-950/20 border-teal-800/40 text-teal-500 hover:border-teal-600/60 hover:text-teal-300'
                            }`}
                    >
                        {hours} HOURS
                    </button>
                ))}
            </div>
          </div>
          
           {/* Summary */}
           <div className="p-3 bg-teal-950/30 rounded border border-teal-800/30 text-xs font-mono text-teal-400/80">
                <div className="flex justify-between">
                    <span>DATE:</span>
                    <span className="text-teal-200">{selectedDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>EST. RELEASE:</span>
                    <span className="text-teal-200">
                         {/* Simple visual calc */}
                        +{duration}:00 HRS
                    </span>
                </div>
           </div>

        </div>
        <DialogFooter>
          <Button onClick={handleBook} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            Confirm Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
