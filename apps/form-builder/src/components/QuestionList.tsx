"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SurveyElement } from "@/lib/survey-schema";
import SortableQuestion from "./SortableQuestion";

interface QuestionListProps {
  elements: SurveyElement[];
  selectedName: string | null;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  activePage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onAddPage: () => void;
  onDeletePage: (page: number) => void;
  pageTitle?: string;
}

export default function QuestionList({
  elements,
  selectedName,
  onSelect,
  onDelete,
  onReorder,
  activePage,
  pageCount,
  onPageChange,
  onAddPage,
  onDeletePage,
  pageTitle,
}: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = elements.findIndex((e) => e.name === active.id);
    const newIndex = elements.findIndex((e) => e.name === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }

  return (
    <div style={{ padding: 16, flex: 1, overflow: "auto" }}>
      {/* Page tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        {Array.from({ length: pageCount }, (_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => onPageChange(i)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px 6px 0 0",
                border: activePage === i ? "1px solid #16213e" : "1px solid #ddd",
                borderBottom: activePage === i ? "2px solid white" : "1px solid #ddd",
                background: activePage === i ? "white" : "#f5f5f5",
                fontWeight: activePage === i ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                color: activePage === i ? "#16213e" : "#666",
              }}
            >
              Page {i + 1}
            </button>
            {pageCount > 1 && activePage === i && (
              <button
                onClick={() => onDeletePage(i)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: "2px 4px",
                  marginLeft: 2,
                }}
                title="Delete page"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          onClick={onAddPage}
          style={{
            padding: "6px 10px",
            border: "1px dashed #ccc",
            borderRadius: "6px 6px 0 0",
            background: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#888",
          }}
          title="Add page"
        >
          +
        </button>
      </div>

      {pageTitle !== undefined && (
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
          {pageTitle || `Page ${activePage + 1}`}
        </div>
      )}

      {elements.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#999",
            border: "2px dashed #ddd",
            borderRadius: 8,
          }}
        >
          <p style={{ margin: 0, fontSize: 14 }}>No questions yet</p>
          <p style={{ margin: "8px 0 0", fontSize: 12 }}>
            Click a question type in the left panel to add one
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={elements.map((e) => e.name)} strategy={verticalListSortingStrategy}>
            {elements.map((el) => (
              <SortableQuestion
                key={el.name}
                element={el}
                isSelected={selectedName === el.name}
                onSelect={() => onSelect(el.name)}
                onDelete={() => onDelete(el.name)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
