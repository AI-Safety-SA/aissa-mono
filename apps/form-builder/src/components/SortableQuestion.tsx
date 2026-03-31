"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SurveyElement } from "@/lib/survey-schema";
import { getQuestionTypeInfo } from "@/lib/question-types";

interface SortableQuestionProps {
  element: SurveyElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function SortableQuestion({
  element,
  isSelected,
  onSelect,
  onDelete,
}: SortableQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: element.name });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: "12px 16px",
    marginBottom: 8,
    backgroundColor: isSelected ? "#f0f4ff" : "white",
    border: isSelected ? "2px solid #16213e" : "1px solid #e0e0e0",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
  };

  const info = getQuestionTypeInfo(element.type);

  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}>
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          padding: "4px 6px",
          color: "#999",
          fontSize: 16,
          lineHeight: 1,
          flexShrink: 0,
          touchAction: "none",
        }}
        title="Drag to reorder"
      >
        &#x2630;
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {element.title || element.name}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
          {info?.label ?? element.type}
          {element.isRequired && (
            <span style={{ color: "#dc3545", marginLeft: 6 }}>* Required</span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          background: "none",
          border: "none",
          color: "#999",
          cursor: "pointer",
          fontSize: 18,
          padding: "2px 6px",
          borderRadius: 4,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#dc3545")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
        title="Delete question"
      >
        &times;
      </button>
    </div>
  );
}
