"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface DeskFilterBarProps {
  selectedTypeId: Id<"deskTypes"> | null;
  onTypeChange: (typeId: Id<"deskTypes"> | null) => void;
  showAvailableOnly: boolean;
  onAvailableOnlyChange: (value: boolean) => void;
}

export function DeskFilterBar({
  selectedTypeId,
  onTypeChange,
  showAvailableOnly,
  onAvailableOnlyChange,
}: DeskFilterBarProps) {
  const deskTypes = useQuery(api.deskTypes.list) ?? [];
  const activeTypes = deskTypes.filter((t) => t.isActive);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Desk type filter */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onTypeChange(null)}
          className={`
            px-2 py-1 text-[10px] font-mono uppercase rounded-sm border transition-all
            ${!selectedTypeId ? "bg-teal-600/20 border-teal-500/50 text-teal-300" : "bg-zinc-900/50 border-teal-900/30 text-teal-700 hover:text-teal-500"}
          `}
        >
          All
        </button>
        {activeTypes.map((type) => (
          <button
            key={type._id}
            onClick={() => onTypeChange(type._id)}
            className={`
              px-2 py-1 text-[10px] font-mono uppercase rounded-sm border transition-all flex items-center gap-1
              ${selectedTypeId === type._id ? "bg-teal-600/20 border-teal-500/50 text-teal-300" : "bg-zinc-900/50 border-teal-900/30 text-teal-700 hover:text-teal-500"}
            `}
          >
            <div
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: type.color }}
            />
            {type.name}
          </button>
        ))}
      </div>

      {/* Available only toggle */}
      <label className="flex items-center gap-1.5 text-[10px] font-mono text-teal-600 cursor-pointer">
        <input
          type="checkbox"
          checked={showAvailableOnly}
          onChange={(e) => onAvailableOnlyChange(e.target.checked)}
          className="accent-teal-500"
        />
        AVAILABLE ONLY
      </label>
    </div>
  );
}
