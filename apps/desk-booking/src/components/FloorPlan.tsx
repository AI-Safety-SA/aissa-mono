"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import BookingForm from "./BookingForm";

export default function FloorPlan() {
  const desks = useQuery(api.desks.list) || [];
  // We can fetch bookings here to visualize status
  // For now, let's just make them clickable
  
  const [selectedDeskId, setSelectedDeskId] = useState<Id<"desks"> | null>(null);

  const selectedDesk = desks.find(d => d._id === selectedDeskId);

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950/80 backdrop-blur-sm shadow-[0_0_50px_rgba(20,184,166,0.1)] rounded-xl border border-teal-900/30">
        {/* Ambient Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0)_40%,rgba(20,184,166,0.05)_50%,rgba(0,0,0,0)_60%)] bg-[length:400%_400%] animate-pulse pointer-events-none" />

        {desks.map(desk => (
            <div
            key={desk._id}
            onClick={() => setSelectedDeskId(desk._id)}
            style={{ 
                left: desk.x, 
                top: desk.y,
            }}
            className="absolute w-20 h-16 cursor-pointer group hover:scale-105 transition-transform duration-300"
            >
                {/* Desk Glow */}
                <div className="absolute inset-0 bg-teal-500/20 blur-xl group-hover:bg-amber-400/20 transition-colors duration-500 rounded-full opacity-60" />
                
                {/* Desk Shape */}
                <div className={`
                    absolute inset-0 rounded-lg border-2 flex items-center justify-center backdrop-blur-md
                    ${selectedDeskId === desk._id ? 'border-amber-400 bg-amber-900/40' : 'border-teal-500/40 bg-teal-900/40 group-hover:border-teal-400 group-hover:bg-teal-800/60'}
                `}>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-teal-300/80 uppercase tracking-widest">Unit</span>
                        <span className={`font-bold font-mono text-lg ${selectedDeskId === desk._id ? 'text-amber-300' : 'text-teal-100'}`}>
                            {desk.label}
                        </span>
                    </div>
                </div>

                {/* Status Indicator Dot */}
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,1)] group-hover:animate-ping" />
            </div>
        ))}

        <BookingForm 
            deskId={selectedDeskId}
            deskLabel={selectedDesk?.label || ""}
            isOpen={!!selectedDeskId}
            onClose={() => setSelectedDeskId(null)}
        />
    </div>
  );
}
