"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { Box, Monitor, LayoutGrid, Trash2, Plus, GripVertical } from "lucide-react";

const EMPTY_DESKS: any[] = [];

export default function AdminFloorPlanEditor() {
  const desks = useQuery(api.desks.list) || EMPTY_DESKS;
  const createDesk = useMutation(api.desks.create);
  const updateDesk = useMutation(api.desks.update);
  const removeDesk = useMutation(api.desks.remove);

  const [draggingId, setDraggingId] = useState<Id<"desks"> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Desk types we can add
  const DESK_TYPES = [
    { type: "standard", icon: <Monitor size={16} />, label: "Standard Workstation" },
    { type: "standing", icon: <LayoutGrid size={16} />, label: "Standing Desk" },
    { type: "lounge", icon: <Box size={16} />, label: "Lounge Seat" },
  ];

  const handleCreateDesk = async (type: string) => {
    const label = `D-${desks.length + 1}`;
    await createDesk({
      label,
      x: 100 + (desks.length * 10) % 200, // Stagger slightly
      y: 100 + (desks.length * 10) % 200,
      type: type,
      status: "active",
    });
  };

  const handleMouseDown = (e: React.MouseEvent, id: Id<"desks">) => {
    e.stopPropagation();
    setDraggingId(id);
  };

  const [localDesks, setLocalDesks] = useState(desks);
  
  useEffect(() => {
    if (!draggingId) {
        setLocalDesks(desks);
    }
  }, [desks, draggingId]);

  const snapToGrid = (value: number) => Math.round(value / 20) * 20;

  const handleDragOver = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left - 48; // Centered on mouse (w=96/2)
    const rawY = e.clientY - rect.top - 32; // Centered on mouse (h=80/2)
    
    // Grid Snapping
    const x = Math.max(0, snapToGrid(rawX));
    const y = Math.max(0, snapToGrid(rawY));
    
    setLocalDesks(desks.map(d => d._id === draggingId ? { ...d, x, y } : d));
  };

  const handleMouseUp = async (e: React.MouseEvent) => {
    if (!draggingId) return;
    
    const desk = localDesks.find(d => d._id === draggingId);
    if (desk) {
        await updateDesk({ id: desk._id, x: desk.x, y: desk.y });
    }
    setDraggingId(null);
  };

  return (
    <div className="flex w-full h-screen text-teal-100 font-sans overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-950 border-r border-teal-900/50 flex flex-col z-20 shadow-xl">
             <div className="p-6 border-b border-teal-900/50">
                 <h1 className="text-xl font-bold tracking-tight text-teal-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    Admin Panel
                 </h1>
                 <p className="text-xs text-teal-600 font-mono mt-2">FLOORPLAN CONFIGURATION</p>
             </div>
             
             <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-xs uppercase text-teal-500 font-semibold tracking-wider">Add Resources</h3>
                    <div className="grid gap-3">
                        {DESK_TYPES.map(dt => (
                            <button
                                key={dt.type}
                                onClick={() => handleCreateDesk(dt.type)}
                                className="flex items-center gap-3 p-3 rounded-lg border border-teal-800/40 bg-teal-950/40 hover:bg-teal-900/60 hover:border-teal-600 transition-all text-sm group"
                            >
                                <div className="p-2 rounded bg-teal-900/50 text-teal-400 group-hover:text-teal-200">{dt.icon}</div>
                                <span className="text-teal-300 group-hover:text-teal-100">{dt.label}</span>
                                <Plus size={14} className="ml-auto opacity-0 group-hover:opacity-100"/>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 rounded-lg bg-teal-900/10 border border-teal-900/20 text-xs text-teal-600 font-mono">
                    <p className="mb-2 uppercase font-bold text-teal-500">Editor Controls</p>
                    <ul className="space-y-1">
                        <li>• Drag to move items</li>
                        <li>• Grid checks: 20px</li>
                        <li>• Auto-save active</li>
                    </ul>
                </div>
             </div>
             
             <div className="mt-auto p-4 border-t border-teal-900/50 bg-teal-950/20 text-center">
                 <div className="text-[10px] text-teal-700 font-mono uppercase">System Log</div>
                 <div className="text-xs text-teal-500 mt-1 min-h-[1.5em]">
                     {draggingId ? `UPDATING COORDINATES...` : 'READY'}
                 </div>
             </div>
        </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-zinc-950 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"
        onMouseMove={handleDragOver}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="absolute top-6 left-6 text-sm font-mono text-teal-800 pointer-events-none select-none">
             CANVAS_VIEW: [EDIT_MODE]
        </div>

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
              absolute w-24 h-20 rounded-lg border flex flex-col items-center justify-center select-none transition-all group backdrop-blur-md
              ${draggingId === desk._id 
                ? 'z-50 border-amber-500 bg-amber-900/20 shadow-[0_0_30px_rgba(245,158,11,0.2)] scale-110' 
                : 'z-10 border-teal-700/50 bg-teal-950/60 hover:border-teal-500 hover:bg-teal-900/80'}
            `}
          >
             {/* Drag Handle */}
             <div className="absolute top-1 left-1/2 -translate-x-1/2 text-teal-700 group-hover:text-teal-500">
                 <GripVertical size={12} />
             </div>

             <div className="flex flex-col items-center mt-2">
                <div className="text-teal-500/80 mb-1">
                    {desk.type === 'standard' ? <Monitor size={14} /> : desk.type === 'standing' ? <LayoutGrid size={14} /> : <Box size={14} />}
                </div>
                <span className={`font-bold font-mono text-xs ${draggingId === desk._id ? 'text-amber-300' : 'text-teal-200'}`}>
                    {desk.label}
                </span>
             </div>
             
             {/* Positioning Guide tooltip */}
             {draggingId === desk._id && (
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-black text-amber-500 px-1 font-mono rounded">
                     {desk.x}, {desk.y}
                 </div>
             )}
             
             {/* Delete Button (visible on hover) */}
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 if(confirm(`Remove ${desk.label}?`)) removeDesk({ id: desk._id });
               }}
               className="absolute -top-2 -right-2 w-6 h-6 bg-red-950 border border-red-500 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-900 hover:text-white transition-all shadow-lg"
             >
               <Trash2 size={12} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}
