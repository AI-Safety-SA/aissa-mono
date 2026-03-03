"use client";

import { Doc } from "../../../convex/_generated/dataModel";

interface DeskNodeProps {
  desk: Doc<"desks"> & {
    deskType: Doc<"deskTypes"> | null;
    morningBooked: boolean;
    afternoonBooked: boolean;
  };
  isSelected: boolean;
  onClick: () => void;
}

const DESK_WIDTH = 80;
const DESK_HEIGHT = 56;

export function DeskNode({ desk, isSelected, onClick }: DeskNodeProps) {
  const color = desk.deskType?.color ?? "#14b8a6";
  const isFullyBooked = desk.morningBooked && desk.afternoonBooked;
  const isPartiallyBooked = desk.morningBooked || desk.afternoonBooked;

  const statusColor = isFullyBooked
    ? "#ef4444"
    : isPartiallyBooked
      ? "#f59e0b"
      : "#22c55e";

  const borderColor = isSelected ? "#fbbf24" : color;
  const bgOpacity = isSelected ? 0.4 : 0.2;

  return (
    <g
      transform={`translate(${desk.x}, ${desk.y})${desk.rotation ? ` rotate(${desk.rotation}, ${DESK_WIDTH / 2}, ${DESK_HEIGHT / 2})` : ""}`}
      onClick={onClick}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`Desk ${desk.label}${isFullyBooked ? ", fully booked" : isPartiallyBooked ? ", partially available" : ", available"}`}
    >
      {/* Glow effect */}
      <rect
        x={-4}
        y={-4}
        width={DESK_WIDTH + 8}
        height={DESK_HEIGHT + 8}
        rx={12}
        fill={borderColor}
        opacity={0.15}
        filter="url(#deskGlow)"
      />

      {/* Desk shape */}
      <rect
        x={0}
        y={0}
        width={DESK_WIDTH}
        height={DESK_HEIGHT}
        rx={8}
        fill={color}
        fillOpacity={bgOpacity}
        stroke={borderColor}
        strokeWidth={isSelected ? 2 : 1.5}
        strokeOpacity={isSelected ? 1 : 0.6}
      />

      {/* Label */}
      <text
        x={DESK_WIDTH / 2}
        y={DESK_HEIGHT / 2 - 4}
        textAnchor="middle"
        className="text-[9px] uppercase tracking-widest"
        fill={`${color}88`}
      >
        Unit
      </text>
      <text
        x={DESK_WIDTH / 2}
        y={DESK_HEIGHT / 2 + 12}
        textAnchor="middle"
        className="text-sm font-bold font-mono"
        fill={isSelected ? "#fbbf24" : "#e2e8f0"}
      >
        {desk.label}
      </text>

      {/* Slot availability indicators (morning = left dot, afternoon = right dot) */}
      <circle
        cx={DESK_WIDTH / 2 - 8}
        cy={DESK_HEIGHT - 6}
        r={3}
        fill={desk.morningBooked ? "#ef4444" : "#22c55e"}
        opacity={0.8}
      />
      <circle
        cx={DESK_WIDTH / 2 + 8}
        cy={DESK_HEIGHT - 6}
        r={3}
        fill={desk.afternoonBooked ? "#ef4444" : "#22c55e"}
        opacity={0.8}
      />

      {/* Status beacon */}
      <circle
        cx={DESK_WIDTH - 2}
        cy={2}
        r={4}
        fill={statusColor}
        opacity={0.9}
      />
      <circle
        cx={DESK_WIDTH - 2}
        cy={2}
        r={4}
        fill={statusColor}
        opacity={0.4}
      >
        <animate
          attributeName="r"
          values="4;8;4"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.4;0;0.4"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

export { DESK_WIDTH, DESK_HEIGHT };
