"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { FloorPlanForm } from "@/components/admin/FloorPlanForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function FloorPlansPage() {
  const floorPlans = useQuery(api.floorPlans.list) ?? [];
  const removeFloorPlan = useMutation(api.floorPlans.remove);
  const [editingPlan, setEditingPlan] = useState<Doc<"floorPlans"> | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = async (id: Doc<"floorPlans">["_id"]) => {
    try {
      await removeFloorPlan({ id });
      toast.success("Floor plan deleted");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to delete";
      toast.error(msg);
    }
  };

  if (isCreating || editingPlan) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
          {editingPlan ? "Edit Floor Plan" : "New Floor Plan"}
        </h1>
        <FloorPlanForm
          floorPlan={editingPlan ?? undefined}
          onDone={() => {
            setIsCreating(false);
            setEditingPlan(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
          Floor Plans
        </h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/50 text-teal-300 text-xs font-mono"
        >
          + NEW FLOOR PLAN
        </Button>
      </div>

      {floorPlans.length === 0 ? (
        <div className="text-center text-teal-800 text-sm py-10 font-mono">
          No floor plans yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {floorPlans.map((plan) => (
            <div
              key={plan._id}
              className="flex justify-between items-center p-4 bg-teal-950/20 border border-teal-900/30 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-bold text-teal-300 font-mono">
                    {plan.name}
                  </div>
                  <div className="text-[10px] text-teal-700 font-mono">
                    {plan.width}x{plan.height}
                    {plan.isDefault && " // DEFAULT"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/floor-plans/${plan._id}`}
                  className="px-3 py-1 bg-teal-900/30 border border-teal-800/50 rounded text-[10px] text-teal-400 font-mono hover:bg-teal-900/50"
                >
                  EDIT DESKS
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPlan(plan)}
                  className="border-teal-800 text-teal-400 hover:bg-teal-900/30 text-[10px] h-7"
                >
                  EDIT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(plan._id)}
                  className="border-red-900/50 text-red-400 hover:bg-red-900/20 text-[10px] h-7"
                >
                  DELETE
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
