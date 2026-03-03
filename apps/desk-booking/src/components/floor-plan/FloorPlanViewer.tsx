"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { useState, useMemo } from "react";
import { DeskNode } from "./DeskNode";
import { DeskTooltip } from "./DeskTooltip";
import { FloorPlanSelector } from "./FloorPlanSelector";

type DeskWithBookings = Doc<"desks"> & {
  deskType: Doc<"deskTypes"> | null;
  morningBooked: boolean;
  afternoonBooked: boolean;
  bookings: Doc<"bookings">[];
};

interface FloorPlanViewerProps {
  date: string;
  onDeskSelect?: (desk: DeskWithBookings) => void;
  selectedDeskId?: Id<"desks"> | null;
}

export function FloorPlanViewer({
  date,
  onDeskSelect,
  selectedDeskId,
}: FloorPlanViewerProps) {
  const floorPlansQuery = useQuery(api.floorPlans.list);
  const floorPlans = useMemo(() => floorPlansQuery ?? [], [floorPlansQuery]);
  const [userSelectedId, setUserSelectedId] =
    useState<Id<"floorPlans"> | null>(null);

  const selectedFloorPlanId = useMemo(() => {
    if (userSelectedId) return userSelectedId;
    if (floorPlans.length === 0) return null;
    const defaultPlan = floorPlans.find((p) => p.isDefault) ?? floorPlans[0];
    return defaultPlan._id;
  }, [userSelectedId, floorPlans]);

  const floorPlan = floorPlans.find((p) => p._id === selectedFloorPlanId);
  const backgroundUrl = useQuery(
    api.floorPlans.getBackgroundUrl,
    selectedFloorPlanId ? { floorPlanId: selectedFloorPlanId } : "skip",
  );

  const desks = useQuery(
    api.bookings.getByFloorPlanAndDate,
    selectedFloorPlanId ? { floorPlanId: selectedFloorPlanId, date } : "skip",
  ) as DeskWithBookings[] | undefined;

  const [hoveredDeskId, setHoveredDeskId] = useState<Id<"desks"> | null>(null);

  const hoveredDesk = desks?.find((d) => d._id === hoveredDeskId);

  if (floorPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-teal-700 font-mono text-sm gap-4">
        <div className="text-4xl opacity-30">[]</div>
        <p>No floor plans configured.</p>
        <p className="text-xs text-teal-800">
          An admin needs to create a floor plan first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between px-2">
        <FloorPlanSelector
          selectedId={selectedFloorPlanId}
          onSelect={setUserSelectedId}
        />
        <div className="flex items-center gap-4 text-[10px] font-mono text-teal-700">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Available
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            Partial
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Booked
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden rounded-xl border border-teal-900/30 bg-zinc-950/80">
        {/* Ambient Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.08),transparent_70%)] pointer-events-none" />

        <svg
          viewBox={`0 0 ${floorPlan?.width ?? 800} ${floorPlan?.height ?? 600}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="deskGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background image */}
          {backgroundUrl && (
            <image
              href={backgroundUrl}
              x={0}
              y={0}
              width={floorPlan?.width ?? 800}
              height={floorPlan?.height ?? 600}
              opacity={0.3}
            />
          )}

          {/* Grid pattern */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(20,184,166,0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Desks */}
          {desks?.map((desk) => (
            <g
              key={desk._id}
              onMouseEnter={() => setHoveredDeskId(desk._id)}
              onMouseLeave={() => setHoveredDeskId(null)}
            >
              <DeskNode
                desk={desk}
                isSelected={selectedDeskId === desk._id}
                onClick={() => onDeskSelect?.(desk)}
              />
            </g>
          ))}

          {/* Tooltip */}
          {hoveredDesk && hoveredDeskId !== selectedDeskId && (
            <DeskTooltip
              desk={hoveredDesk}
              x={hoveredDesk.x}
              y={hoveredDesk.y}
            />
          )}
        </svg>

        {/* Loading state */}
        {desks === undefined && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

export type { DeskWithBookings };
