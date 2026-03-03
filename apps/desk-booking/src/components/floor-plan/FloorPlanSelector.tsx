"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface FloorPlanSelectorProps {
  selectedId: Id<"floorPlans"> | null;
  onSelect: (id: Id<"floorPlans">) => void;
}

export function FloorPlanSelector({
  selectedId,
  onSelect,
}: FloorPlanSelectorProps) {
  const floorPlans = useQuery(api.floorPlans.list) ?? [];

  if (floorPlans.length <= 1) return null;

  return (
    <div className="flex gap-1">
      {floorPlans.map((plan) => (
        <button
          key={plan._id}
          onClick={() => onSelect(plan._id)}
          className={`
            px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border transition-all
            ${
              selectedId === plan._id
                ? "bg-teal-600/20 border-teal-500/50 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                : "bg-zinc-900/50 border-teal-900/30 text-teal-700 hover:text-teal-500 hover:border-teal-700"
            }
          `}
        >
          {plan.name}
        </button>
      ))}
    </div>
  );
}
