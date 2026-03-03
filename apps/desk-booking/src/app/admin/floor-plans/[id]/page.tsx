"use client";

import { use } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { FloorPlanEditor } from "@/components/floor-plan/FloorPlanEditor";

export default function FloorPlanEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="h-[calc(100vh-3rem)] -m-6">
      <FloorPlanEditor floorPlanId={id as Id<"floorPlans">} />
    </div>
  );
}
