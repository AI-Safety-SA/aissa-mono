"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef, useCallback, useMemo } from "react";
import { DESK_WIDTH, DESK_HEIGHT } from "./DeskNode";

interface FloorPlanEditorProps {
  floorPlanId: Id<"floorPlans">;
}

export function FloorPlanEditor({ floorPlanId }: FloorPlanEditorProps) {
  const floorPlan = useQuery(api.floorPlans.getById, { id: floorPlanId });
  const desksQuery = useQuery(api.desks.list, { floorPlanId });
  const desks = useMemo(() => desksQuery ?? [], [desksQuery]);
  const deskTypesQuery = useQuery(api.deskTypes.list);
  const deskTypes = useMemo(() => deskTypesQuery ?? [], [deskTypesQuery]);
  const backgroundUrl = useQuery(api.floorPlans.getBackgroundUrl, {
    floorPlanId,
  });

  const createDesk = useMutation(api.desks.create);
  const updateDesk = useMutation(api.desks.update);
  const removeDesk = useMutation(api.desks.remove);

  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<Id<"desks"> | null>(null);
  const [localPositions, setLocalPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [userSelectedDeskTypeId, setUserSelectedDeskTypeId] = useState<Id<"deskTypes"> | null>(null);

  const selectedDeskTypeId = useMemo(() => {
    if (userSelectedDeskTypeId) return userSelectedDeskTypeId;
    const active = deskTypes.find((t) => t.isActive);
    return active?._id ?? null;
  }, [userSelectedDeskTypeId, deskTypes]);

  const getSvgPoint = useCallback(
    (e: React.MouseEvent) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        svgRef.current.getScreenCTM()!.inverse(),
      );
      return { x: svgP.x, y: svgP.y };
    },
    [],
  );

  const handleMouseDown = (e: React.MouseEvent, deskId: Id<"desks">) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(deskId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const point = getSvgPoint(e);
    setLocalPositions((prev) => ({
      ...prev,
      [draggingId]: {
        x: Math.max(0, point.x - DESK_WIDTH / 2),
        y: Math.max(0, point.y - DESK_HEIGHT / 2),
      },
    }));
  };

  const handleMouseUp = async () => {
    if (!draggingId) return;
    const pos = localPositions[draggingId];
    if (pos) {
      await updateDesk({
        id: draggingId,
        x: Math.round(pos.x),
        y: Math.round(pos.y),
      });
    }
    setDraggingId(null);
    setLocalPositions((prev) => {
      const next = { ...prev };
      delete next[draggingId];
      return next;
    });
  };

  const handleAddDesk = async () => {
    if (!selectedDeskTypeId) return;
    const label = `D-${desks.length + 1}`;
    await createDesk({
      label,
      deskTypeId: selectedDeskTypeId,
      floorPlanId,
      x: 100 + (desks.length % 5) * 100,
      y: 100 + Math.floor(desks.length / 5) * 80,
    });
  };

  const handleDeleteDesk = async (deskId: Id<"desks">) => {
    await removeDesk({ id: deskId });
  };

  const activeDesks = desks.filter((d) => d.status !== "removed");

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-3 border-b border-teal-900/50 flex justify-between items-center bg-teal-950/20 backdrop-blur-md gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-teal-400 uppercase tracking-widest font-mono">
            {floorPlan?.name ?? "Floor Plan"} {"//"} EDITOR
          </h2>
          <span className="text-[10px] text-teal-700 font-mono">
            {activeDesks.length} desks
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Desk type selector */}
          <select
            value={selectedDeskTypeId ?? ""}
            onChange={(e) =>
              setUserSelectedDeskTypeId(e.target.value as Id<"deskTypes">)
            }
            className="bg-zinc-900 border border-teal-800/50 text-teal-300 text-xs font-mono rounded px-2 py-1.5"
          >
            {deskTypes
              .filter((t) => t.isActive)
              .map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
          </select>

          <button
            onClick={handleAddDesk}
            disabled={!selectedDeskTypeId}
            className="px-3 py-1.5 bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/50 rounded-sm text-teal-300 text-xs font-mono transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] disabled:opacity-50"
          >
            + ADD DESK
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950 bg-[linear-gradient(rgba(20,184,166,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.05)_1px,transparent_1px)] bg-[size:40px_40px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${floorPlan?.width ?? 800} ${floorPlan?.height ?? 600}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <filter id="editorGlow">
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
              id="editorGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(20,184,166,0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#editorGrid)" />

          {/* Desks */}
          {activeDesks.map((desk) => {
            const pos = localPositions[desk._id] ?? {
              x: desk.x,
              y: desk.y,
            };
            const deskType = deskTypes.find((t) => t._id === desk.deskTypeId);
            const color = deskType?.color ?? "#14b8a6";
            const isDragging = draggingId === desk._id;

            return (
              <g
                key={desk._id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseDown={(e) => handleMouseDown(e, desk._id)}
                className="select-none"
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
              >
                {/* Glow */}
                <rect
                  x={-4}
                  y={-4}
                  width={DESK_WIDTH + 8}
                  height={DESK_HEIGHT + 8}
                  rx={12}
                  fill={color}
                  opacity={isDragging ? 0.3 : 0.1}
                />

                {/* Desk shape */}
                <rect
                  x={0}
                  y={0}
                  width={DESK_WIDTH}
                  height={DESK_HEIGHT}
                  rx={8}
                  fill={color}
                  fillOpacity={isDragging ? 0.4 : 0.2}
                  stroke={isDragging ? "#5eead4" : `${color}99`}
                  strokeWidth={isDragging ? 2 : 1.5}
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
                  fill="#e2e8f0"
                >
                  {desk.label}
                </text>

                {/* Delete button */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDesk(desk._id);
                  }}
                  className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                >
                  <circle
                    cx={DESK_WIDTH - 2}
                    cy={-2}
                    r={8}
                    fill="#7f1d1d"
                    stroke="#ef4444"
                    strokeWidth={1}
                    opacity={0.8}
                  />
                  <text
                    x={DESK_WIDTH - 2}
                    y={2}
                    textAnchor="middle"
                    fill="#ef4444"
                    className="text-xs"
                  >
                    x
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Corner labels */}
        <div className="absolute top-2 left-2 text-xs text-teal-900 select-none font-mono">
          GRID_EDITOR
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-teal-900 select-none font-mono">
          {floorPlan?.width ?? 800}x{floorPlan?.height ?? 600}
        </div>
      </div>
    </div>
  );
}
