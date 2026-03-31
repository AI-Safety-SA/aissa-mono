"use client";

import { useState, useEffect } from "react";
import type { SurveySchema } from "@/lib/survey-schema";

interface JsonEditorProps {
  schema: SurveySchema;
  onApply: (schema: SurveySchema) => void;
}

export default function JsonEditor({ schema, onApply }: JsonEditorProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setText(JSON.stringify(schema, null, 2));
    }
  }, [schema, dirty]);

  function handleApply() {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      setDirty(false);
      onApply(parsed as SurveySchema);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleReset() {
    setText(JSON.stringify(schema, null, 2));
    setError(null);
    setDirty(false);
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "8px 16px",
          background: "#f0f4ff",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
        }}
      >
        <span style={{ color: "#666", fontWeight: 500 }}>JSON EDITOR</span>
        <div style={{ display: "flex", gap: 6 }}>
          {dirty && (
            <button
              onClick={handleReset}
              style={{
                padding: "3px 10px",
                border: "1px solid #ccc",
                borderRadius: 4,
                background: "white",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Reset
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={!dirty}
            style={{
              padding: "3px 10px",
              border: "none",
              borderRadius: 4,
              background: dirty ? "#16213e" : "#ccc",
              color: "white",
              cursor: dirty ? "pointer" : "default",
              fontSize: 11,
            }}
          >
            Apply
          </button>
        </div>
      </div>
      {error && (
        <div style={{ padding: "6px 16px", background: "#ffeef0", color: "#dc3545", fontSize: 12 }}>
          {error}
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setDirty(true);
          setError(null);
        }}
        spellCheck={false}
        style={{
          flex: 1,
          fontFamily: "monospace",
          fontSize: 12,
          padding: 16,
          border: "none",
          outline: "none",
          resize: "none",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}
