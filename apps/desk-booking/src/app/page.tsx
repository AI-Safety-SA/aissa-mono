"use client";

import FloorPlan from "@/components/FloorPlan";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-teal-100 font-sans selection:bg-teal-500/30">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <main className="relative z-10 flex flex-col h-screen p-6 gap-6">
        <header className="flex justify-between items-end border-b border-teal-900/50 pb-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-teal-200 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
              Sanctuary<span className="text-teal-800">.</span>OS
            </h1>
            <p className="text-teal-600 font-mono text-sm tracking-wider mt-1">
              // WORKSPACE MONITORING AND ALLOCATION SYSTEM
            </p>
          </div>
          
          <div className="flex items-center gap-6">
              {/* Date Navigation */}
              <div className="flex items-center gap-4 bg-teal-950/40 border border-teal-800/50 rounded-full px-4 py-2 backdrop-blur-sm">
                  <button onClick={() => navigateDate(-1)} className="text-teal-500 hover:text-teal-200 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex items-center gap-2 font-mono text-teal-100 min-w-[140px] justify-center">
                    <CalendarIcon size={14} className="text-teal-600"/>
                    <span className="uppercase tracking-widest text-sm">{format(selectedDate, "MMM dd, yyyy")}</span>
                  </div>
                  <button onClick={() => navigateDate(1)} className="text-teal-500 hover:text-teal-200 transition-colors">
                    <ChevronRight size={18} />
                  </button>
              </div>

              <div className="flex gap-4 text-xs font-mono text-teal-800 border-l border-teal-900/50 pl-6">
                 <div>SYS_STATUS: <span className="text-teal-400">ONLINE</span></div>
                 <div>GRID_LOAD: <span className="text-teal-400">OPTIMAL</span></div>
              </div>
          </div>
        </header>

        <section className="flex-1 flex gap-6 overflow-hidden">
            <div className="flex-1 bg-zinc-900/50 rounded-2xl p-1 border border-teal-900/30 relative shadow-2xl overflow-hidden group">
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-500/30 rounded-tl-lg z-20"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-500/30 rounded-tr-lg z-20"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-500/30 rounded-bl-lg z-20"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-500/30 rounded-br-lg z-20"></div>
                
                <FloorPlan selectedDate={selectedDate} />
            </div>
            
            <aside className="w-80 hidden lg:flex flex-col gap-4">
               <div className="p-6 rounded-2xl bg-teal-950/20 border border-teal-900/30 flex-1 backdrop-blur-sm shadow-xl flex flex-col">
                  <h2 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                    Live Stream
                  </h2>
                  <div className="flex-1 flex items-center justify-center text-center text-teal-800 text-sm font-mono border-t border-b border-teal-900/20 my-4">
                    <div className="space-y-2 opacity-50">
                        <p>[DATA_STREAM_IDLE]</p>
                        <p className="text-[10px]">WAITING FOR INPUT...</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-teal-700 font-mono">
                    &gt; Connected to central node
                  </div>
               </div>

               <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/10 to-teal-950/30 border border-teal-900/30 h-1/3 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                    <div className="text-center space-y-2 relative z-10">
                        <div className="text-3xl font-bold text-amber-500 font-mono tracking-tighter">22°C</div>
                        <div className="text-[10px] text-teal-600 font-mono uppercase tracking-widest">Internal Biome</div>
                    </div>
               </div>
            </aside>
        </section>
      </main>
    </div>
  );
}
