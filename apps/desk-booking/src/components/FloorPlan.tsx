"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import BookingForm from "./BookingForm";
import { useUser } from "./UserSwitcher";
import { Monitor, Coffee, Zap } from "lucide-react"; // Icons for desk types

const EMPTY_DESKS: any[] = [];
const EMPTY_BOOKINGS: any[] = [];

interface FloorPlanProps {
  selectedDate: Date;
}

export default function FloorPlan({ selectedDate }: FloorPlanProps) {
  const desks = useQuery(api.desks.list) || EMPTY_DESKS;
  
  // Calculate start/end of the selected day in ms
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const bookings = useQuery(api.bookings.getByDate, { 
    startTime: startOfDay.getTime(),
    endTime: endOfDay.getTime() 
  }) || EMPTY_BOOKINGS;

  const { user } = useUser();
  const [selectedDeskId, setSelectedDeskId] = useState<Id<"desks"> | null>(null);

  const selectedDesk = desks.find(d => d._id === selectedDeskId);

  // Helper to determine desk status
  const getDeskStatus = (deskId: Id<"desks">) => {
    // Find if there is any booking for this desk today
    // In a real app we might care about specific times, but for now: "Booked at all today?"
    const booking = bookings.find(b => b.deskId === deskId);
    
    if (!booking) return "available";
    if (booking.userId === user.id) return "booked-by-me";
    return "booked-by-other";
  };
  
  const getDeskIcon = (type: string) => {
      switch(type) {
          case 'standing': return <Zap size={14} />;
          case 'lounge': return <Coffee size={14} />;
          default: return <Monitor size={14} />;
      }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950/80 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
        {/* Ambient Effects - Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Radial Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

        {desks.map(desk => {
            const status = getDeskStatus(desk._id);
            const isSelected = selectedDeskId === desk._id;
            
            // Color Logic
            let borderColor = "border-teal-500/30";
            let bgColor = "bg-teal-900/20";
            let glow = "";
            let textColor = "text-teal-500";
            
            if (status === 'booked-by-me') {
                borderColor = "border-amber-500/60";
                bgColor = "bg-amber-900/30";
                glow = "shadow-[0_0_15px_rgba(245,158,11,0.3)]";
                textColor = "text-amber-500";
            } else if (status === 'booked-by-other') {
                borderColor = "border-red-500/30";
                bgColor = "bg-red-900/10";
                textColor = "text-red-700 opacity-50";
            } else {
                // Available
                borderColor = "border-teal-500/40 hover:border-teal-400";
                bgColor = "bg-teal-900/30 hover:bg-teal-800/40";
                glow = "hover:shadow-[0_0_20px_rgba(45,212,191,0.2)]";
                textColor = "text-teal-400";
            }

            if (isSelected) {
                borderColor = "border-teal-200";
                glow = "shadow-[0_0_30px_rgba(45,212,191,0.5)]";
                textColor = "text-teal-100";
            }

            return (
                <div
                key={desk._id}
                onClick={() => {
                    if (status !== 'booked-by-other') {
                        setSelectedDeskId(desk._id);
                    }
                }}
                style={{ 
                    left: desk.x, 
                    top: desk.y,
                }}
                className={`
                    absolute w-24 h-20 cursor-pointer transition-all duration-300 group
                    ${status === 'booked-by-other' ? 'cursor-not-allowed grayscale-[0.5]' : 'hover:scale-105'}
                `}
                >
                    {/* Desk Shape */}
                    <div className={`
                        absolute inset-0 rounded-lg border-2 backdrop-blur-md flex flex-col items-center justify-center gap-1
                         transition-all duration-300
                        ${borderColor} ${bgColor} ${glow}
                    `}>
                        <div className={`${textColor} transition-colors`}>
                            {getDeskIcon(desk.type)}
                        </div>
                        <div className="flex flex-col items-center">
                            <span className={`text-[9px] uppercase tracking-widest opacity-60 ${textColor}`}>Unit</span>
                            <span className={`font-bold font-mono text-xs ${textColor}`}>
                                {desk.label}
                            </span>
                        </div>
                    </div>

                    {/* Status Pip */}
                    <div className={`
                        absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-zinc-950 shadow-sm
                        ${status === 'available' ? 'bg-teal-400 animate-pulse' : 
                          status === 'booked-by-me' ? 'bg-amber-500' : 'bg-red-900'}
                    `} />
                    
                    {/* Tooltip on Hover */}
                     <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-teal-800 text-[10px] text-teal-300 px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                        {status === 'available' ? 'AVAILABLE' : status === 'booked-by-me' ? 'BOOKED BY YOU' : 'OCCUPIED'}
                     </div>
                </div>
            );
        })}

        <BookingForm 
            deskId={selectedDeskId}
            deskLabel={selectedDesk?.label || ""}
            isOpen={!!selectedDeskId}
            onClose={() => setSelectedDeskId(null)}
            selectedDate={selectedDate}
        />
    </div>
  );
}
