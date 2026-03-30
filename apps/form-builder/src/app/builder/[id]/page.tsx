"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getForm, saveForm } from "@/lib/storage";
import type { SurveySchema } from "@/lib/survey-schema";
import FormBuilder from "@/components/FormBuilder";

export default function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [formName, setFormName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialSchema, setInitialSchema] = useState<Record<string, unknown> | undefined>(undefined);
  const schemaRef = useRef<SurveySchema | null>(null);

  useEffect(() => {
    const existing = getForm(id);
    if (existing) {
      setFormName(existing.name);
      setInitialSchema(existing.json);
    }
    setLoaded(true);
  }, [id]);

  const handleSchemaChange = useCallback((schema: SurveySchema) => {
    schemaRef.current = schema;
  }, []);

  const handleSave = useCallback(() => {
    if (!schemaRef.current) return;
    const name = formName || "Untitled Form";
    saveForm(name, schemaRef.current as unknown as Record<string, unknown>, id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [formName, id]);

  if (!loaded) return null;

  return (
    <div style={{ height: "calc(100vh - 52px)", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "10px 24px",
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            background: "none",
            border: "1px solid #ccc",
            padding: "6px 12px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Back
        </button>
        <input
          type="text"
          placeholder="Form name..."
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 400,
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
            fontSize: 14,
          }}
        />
        <button
          onClick={handleSave}
          style={{
            backgroundColor: saved ? "#28a745" : "#16213e",
            color: "white",
            border: "none",
            padding: "8px 20px",
            borderRadius: 5,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          {saved ? "Saved!" : "Save Form"}
        </button>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <FormBuilder
          key={id}
          initialSchema={initialSchema}
          onSchemaChange={handleSchemaChange}
        />
      </div>
    </div>
  );
}
