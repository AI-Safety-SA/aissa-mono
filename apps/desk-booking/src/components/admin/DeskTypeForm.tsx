"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DeskTypeFormProps {
  deskType?: Doc<"deskTypes">;
  onDone: () => void;
}

type Attribute = {
  key: string;
  label: string;
  valueType: "boolean" | "string" | "number";
};

export function DeskTypeForm({ deskType, onDone }: DeskTypeFormProps) {
  const createDeskType = useMutation(api.deskTypes.create);
  const updateDeskType = useMutation(api.deskTypes.update);

  const [name, setName] = useState(deskType?.name ?? "");
  const [color, setColor] = useState(deskType?.color ?? "#14b8a6");
  const [icon, setIcon] = useState(deskType?.icon ?? "");
  const [attributes, setAttributes] = useState<Attribute[]>(
    deskType?.attributes ?? [],
  );

  const handleAddAttribute = () => {
    setAttributes([
      ...attributes,
      { key: "", label: "", valueType: "boolean" },
    ]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (
    index: number,
    field: keyof Attribute,
    value: string,
  ) => {
    setAttributes(
      attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Name is required");
      return;
    }

    // Auto-generate keys from labels if not set
    const processedAttrs = attributes.map((attr) => ({
      ...attr,
      key: attr.key || attr.label.toLowerCase().replace(/\s+/g, "_"),
    }));

    try {
      if (deskType) {
        await updateDeskType({
          id: deskType._id,
          name,
          color,
          icon: icon || undefined,
          attributes: processedAttrs,
        });
        toast.success("Desk type updated");
      } else {
        await createDeskType({
          name,
          color,
          icon: icon || undefined,
          attributes: processedAttrs,
        });
        toast.success("Desk type created");
      }
      onDone();
    } catch (error) {
      toast.error("Failed to save desk type");
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
          placeholder="e.g., Standing Desk"
        />
      </div>

      <div className="flex gap-4">
        <div className="space-y-2 flex-1">
          <Label className="text-teal-500 text-xs font-mono uppercase">
            Color
          </Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded border border-teal-800 cursor-pointer bg-transparent"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="bg-teal-900/30 border-teal-700 text-teal-100 font-mono"
            />
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <Label className="text-teal-500 text-xs font-mono uppercase">
            Icon (optional)
          </Label>
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="bg-teal-900/30 border-teal-700 text-teal-100"
            placeholder="monitor, standing..."
          />
        </div>
      </div>

      {/* Attributes */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-teal-500 text-xs font-mono uppercase">
            Attributes
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddAttribute}
            className="border-teal-800 text-teal-400 hover:bg-teal-900/30 text-[10px] h-6"
          >
            + ADD
          </Button>
        </div>

        {attributes.map((attr, i) => (
          <div
            key={i}
            className="flex gap-2 items-center bg-teal-950/20 p-2 rounded border border-teal-900/30"
          >
            <Input
              value={attr.label}
              onChange={(e) => handleAttributeChange(i, "label", e.target.value)}
              className="bg-teal-900/30 border-teal-800 text-teal-100 text-xs flex-1"
              placeholder="Label"
            />
            <select
              value={attr.valueType}
              onChange={(e) =>
                handleAttributeChange(i, "valueType", e.target.value)
              }
              className="bg-zinc-900 border border-teal-800/50 text-teal-300 text-xs rounded px-2 py-1.5"
            >
              <option value="boolean">Boolean</option>
              <option value="string">String</option>
              <option value="number">Number</option>
            </select>
            <button
              onClick={() => handleRemoveAttribute(i)}
              className="text-red-500 hover:text-red-400 text-xs px-1"
            >
              x
            </button>
          </div>
        ))}
      </div>

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
          {deskType ? "UPDATE" : "CREATE"}
        </Button>
      </div>
    </div>
  );
}
