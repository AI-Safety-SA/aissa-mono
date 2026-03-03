"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FloorPlanFormProps {
  floorPlan?: Doc<"floorPlans">;
  onDone: () => void;
}

export function FloorPlanForm({ floorPlan, onDone }: FloorPlanFormProps) {
  const createFloorPlan = useMutation(api.floorPlans.create);
  const updateFloorPlan = useMutation(api.floorPlans.update);
  const generateUploadUrl = useMutation(api.floorPlans.generateUploadUrl);

  const [name, setName] = useState(floorPlan?.name ?? "");
  const [width, setWidth] = useState(floorPlan?.width ?? 800);
  const [height, setHeight] = useState(floorPlan?.height ?? 600);
  const [isDefault, setIsDefault] = useState(floorPlan?.isDefault ?? false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Name is required");
      return;
    }

    try {
      if (floorPlan) {
        await updateFloorPlan({
          id: floorPlan._id,
          name,
          width,
          height,
          isDefault,
        });
        toast.success("Floor plan updated");
      } else {
        await createFloorPlan({ name, width, height, isDefault });
        toast.success("Floor plan created");
      }
      onDone();
    } catch (error) {
      toast.error("Failed to save floor plan");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !floorPlan) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await updateFloorPlan({
        id: floorPlan._id,
        backgroundImageId: storageId,
      });
      toast.success("Background image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label className="text-teal-500 text-xs font-mono uppercase">
          Name
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-teal-900/30 border-teal-700 text-teal-100"
          placeholder="e.g., Ground Floor"
        />
      </div>

      <div className="flex gap-4">
        <div className="space-y-2 flex-1">
          <Label className="text-teal-500 text-xs font-mono uppercase">
            Width (px)
          </Label>
          <Input
            type="number"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value) || 800)}
            className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
          />
        </div>
        <div className="space-y-2 flex-1">
          <Label className="text-teal-500 text-xs font-mono uppercase">
            Height (px)
          </Label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
            className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="accent-teal-500"
        />
        <Label
          htmlFor="isDefault"
          className="text-teal-500 text-xs font-mono uppercase"
        >
          Default floor plan
        </Label>
      </div>

      {/* Background image upload (only for existing floor plans) */}
      {floorPlan && (
        <div className="space-y-2">
          <Label className="text-teal-500 text-xs font-mono uppercase">
            Background Image
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border-teal-800 text-teal-400 hover:bg-teal-900/30 text-xs"
          >
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onDone}
          className="border-teal-800 text-teal-400 hover:bg-teal-900/30"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold font-mono"
        >
          {floorPlan ? "UPDATE" : "CREATE"}
        </Button>
      </div>
    </div>
  );
}
