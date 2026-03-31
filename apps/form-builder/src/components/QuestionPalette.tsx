"use client";

import { QUESTION_TYPES } from "@/lib/question-types";

interface QuestionPaletteProps {
  onAdd: (type: string) => void;
}

export default function QuestionPalette({ onAdd }: QuestionPaletteProps) {
  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>
        Add Question
      </h3>
      <div style={{ display: "grid", gap: 6 }}>
        {QUESTION_TYPES.map((qt) => (
          <button
            key={qt.type}
            onClick={() => onAdd(qt.type)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              background: "white",
              border: "1px solid #e0e0e0",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              textAlign: "left",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#16213e";
              e.currentTarget.style.background = "#f0f4ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.background = "white";
            }}
          >
            <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>
              {qt.icon}
            </span>
            <span>{qt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
