"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";

export default function AdminFloorPlanEditor() {
  const desks = useQuery(api.desks.list) || [];
  const createDesk = useMutation(api.desks.create);
  const updateDesk = useMutation(api.desks.update);
  const removeDesk = useMutation(api.desks.remove);

  const [draggingId, setDraggingId] = useState<Id<"desks"> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCreateDesk = async () => {
    // Determine number for label based on existing count
    const label = `D-${desks.length + 1}`;
    await createDesk({
      label,
      x: 100,
      y: 100,
      type: "standard",
      status: "active",
    });
  };

  const handleMouseDown = (e: React.MouseEvent, id: Id<"desks">) => {
    e.stopPropagation();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; // Center offset roughly
    const y = e.clientY - rect.top - 20;

    // Use a local optimization or just optimistic updates via convex?
    // For smooth drag, we should typically use local state, but creating a local override is complex.
    // Let's spam updates for now or use a "drag preview".
    // Better: update only on mouse up, but move visually via local state.
    // Wait, simpler: update convex on mouse up.
  };
  
  // We need local state for the dragging item to make it smooth.
  const [localDesks, setLocalDesks] = useState(desks);
  
  useEffect(() => {
    if (!draggingId) {
        setLocalDesks(desks);
    }
  }, [desks, draggingId]);

  const handleDragOver = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 30);
    const y = Math.max(0, e.clientY - rect.top - 20);
    
    setLocalDesks(desks.map(d => d._id === draggingId ? { ...d, x, y } : d));
  };

  const handleMouseUp = async (e: React.MouseEvent) => {
    if (!draggingId) return;
    
    // Find the current position from localDesks
    const desk = localDesks.find(d => d._id === draggingId);
    if (desk) {
        await updateDesk({ id: desk._id, x: desk.x, y: desk.y });
    }
    setDraggingId(null);
  };

  return (
    <div className="flex flex-col h-screen text-teal-100 font-mono">
      <div className="p-4 border-b border-teal-900/50 flex justify-between items-center bg-teal-950/20 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-widest text-teal-400">FLOORPLAN // ADMIN_MODE</h1>
        <button 
          onClick={handleCreateDesk}
          className="px-4 py-2 bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/50 rounded-sm text-teal-300 transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)]"
        >
          + ADD DESK NODE
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-zinc-950 bg-[linear-gradient(rgba(20,184,166,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"
        onMouseMove={handleDragOver}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Decorative Grid Numbers */}
        <div className="absolute top-2 left-2 text-xs text-teal-900 select-none">SEQ_001</div>
        <div className="absolute bottom-2 right-2 text-xs text-teal-900 select-none">SEC_MARK_ALPHA</div>

        {localDesks.map(desk => (
          <div
            key={desk._id}
            onMouseDown={(e) => handleMouseDown(e, desk._id)}
            style={{ 
              left: desk.x, 
              top: desk.y,
              cursor: draggingId === desk._id ? 'grabbing' : 'grab'
            }}
            className={`
              absolute w-20 h-16 rounded-lg border flex items-center justify-center select-none transition-colors
              ${draggingId === desk._id ? 'z-50 border-teal-400 bg-teal-900/40 shadow-[0_0_30px_rgba(45,212,191,0.3)]' : 'z-10 border-teal-800/60 bg-teal-950/40 hover:border-teal-600/80'}
            `}
          >
             <div className="flex flex-col items-center">
                <span className="text-xs text-teal-500/80 uppercase tracking-tighter">Unit</span>
                <span className="font-bold text-teal-200">{desk.label}</span>
             </div>
             
             {/* Delete Button (visible on hover) */}
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 if(confirm('Delete desk?')) removeDesk({ id: desk._id });
               }}
               className="absolute -top-2 -right-2 w-5 h-5 bg-red-900/50 border border-red-500/50 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-800 text-red-300"
             >
               ×
             </button>
          </div>
        ))}
      </div>
      
      <div className="h-40 border-t border-teal-900/30 p-4 bg-teal-950/10 backdrop-blur-sm">
        <h3 className="text-xs uppercase text-teal-700 mb-2">System Log</h3>
        <div className="text-xs text-teal-500/50 font-mono space-y-1">
            <p>> System initialized...</p>
            <p>> Desks loaded: {desks.length} units</p>
            {draggingId && <p className="text-teal-400">> MOVING: {draggingId}...</p>}
        </div>
      </div>
    </div>
  );
}
