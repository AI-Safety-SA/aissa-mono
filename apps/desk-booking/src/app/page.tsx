import FloorPlan from "@/components/FloorPlan";

export default function Home() {
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
          <div className="flex gap-4 text-xs font-mono text-teal-800">
             <div>SYS_STATUS: <span className="text-teal-400">ONLINE</span></div>
             <div>GRID_LOAD: <span className="text-teal-400">OPTIMAL</span></div>
          </div>
        </header>

        <section className="flex-1 flex gap-6">
            <div className="flex-1 bg-zinc-900/50 rounded-2xl p-1 border border-teal-900/30 relative">
                <FloorPlan />
            </div>
            
            <aside className="w-80 hidden lg:flex flex-col gap-4">
               <div className="p-6 rounded-2xl bg-teal-950/20 border border-teal-900/30 flex-1 backdrop-blur-sm">
                  <h2 className="text-sm font-bold text-teal-500 uppercase tracking-widest mb-4">Upcoming Bookings</h2>
                  <div className="text-center text-teal-800 text-sm py-10 font-mono">
                    [NO_DATA_STREAM]
                  </div>
               </div>

               <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 to-teal-950/20 border border-teal-900/30 h-1/3 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <div className="text-2xl font-bold text-amber-500">22°C</div>
                        <div className="text-xs text-teal-600 font-mono uppercase">Internal Biome Temp</div>
                    </div>
               </div>
            </aside>
        </section>
      </main>
    </div>
  );
}
