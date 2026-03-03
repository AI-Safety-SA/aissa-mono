"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { DeskTypeForm } from "@/components/admin/DeskTypeForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DeskTypesPage() {
  const deskTypes = useQuery(api.deskTypes.list) ?? [];
  const removeDeskType = useMutation(api.deskTypes.remove);
  const [editingType, setEditingType] = useState<Doc<"deskTypes"> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating || editingType) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
          {editingType ? "Edit Desk Type" : "New Desk Type"}
        </h1>
        <DeskTypeForm
          deskType={editingType ?? undefined}
          onDone={() => {
            setIsCreating(false);
            setEditingType(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-teal-400 uppercase tracking-widest font-mono">
          Desk Types
        </h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/50 text-teal-300 text-xs font-mono"
        >
          + NEW TYPE
        </Button>
      </div>

      {deskTypes.length === 0 ? (
        <div className="text-center text-teal-800 text-sm py-10 font-mono">
          No desk types yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {deskTypes.map((type) => (
            <div
              key={type._id}
              className={`flex justify-between items-center p-4 bg-teal-950/20 border border-teal-900/30 rounded-lg ${!type.isActive ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: type.color }}
                />
                <div>
                  <div className="text-sm font-bold text-teal-300 font-mono">
                    {type.name}
                  </div>
                  <div className="text-[10px] text-teal-700 font-mono">
                    {type.attributes.length} attributes
                    {!type.isActive && " // INACTIVE"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingType(type)}
                  className="border-teal-800 text-teal-400 hover:bg-teal-900/30 text-[10px] h-7"
                >
                  EDIT
                </Button>
                {type.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await removeDeskType({ id: type._id });
                      toast.success("Desk type deactivated");
                    }}
                    className="border-red-900/50 text-red-400 hover:bg-red-900/20 text-[10px] h-7"
                  >
                    DEACTIVATE
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
