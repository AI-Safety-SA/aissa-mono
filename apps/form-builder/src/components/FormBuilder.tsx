"use client";

import { useState, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { SurveySchema, SurveyElement } from "@/lib/survey-schema";
import { createEmptySchema, createQuestion, schemaFromJson } from "@/lib/survey-schema";
import QuestionPalette from "./QuestionPalette";
import QuestionList from "./QuestionList";
import PropertyEditor from "./PropertyEditor";
import FormPreview from "./FormPreview";
import JsonEditor from "./JsonEditor";

type RightPanel = "preview" | "json";

interface FormBuilderProps {
  initialSchema?: Record<string, unknown>;
  onSchemaChange?: (schema: SurveySchema) => void;
}

export default function FormBuilder({ initialSchema, onSchemaChange }: FormBuilderProps) {
  const [schema, setSchema] = useState<SurveySchema>(() =>
    initialSchema ? schemaFromJson(initialSchema) : createEmptySchema()
  );
  const [activePage, setActivePage] = useState(0);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>("preview");

  const currentPage = schema.pages[activePage];
  const elements = currentPage?.elements ?? [];
  const selectedElement = selectedName
    ? elements.find((e) => e.name === selectedName) ?? null
    : null;

  const updateSchema = useCallback(
    (next: SurveySchema) => {
      setSchema(next);
      onSchemaChange?.(next);
    },
    [onSchemaChange]
  );

  function updateElements(newElements: SurveyElement[]) {
    const pages = [...schema.pages];
    pages[activePage] = { ...pages[activePage], elements: newElements };
    updateSchema({ ...schema, pages });
  }

  function handleAddQuestion(type: string) {
    const q = createQuestion(type);
    updateElements([...elements, q]);
    setSelectedName(q.name);
  }

  function handleDeleteQuestion(name: string) {
    updateElements(elements.filter((e) => e.name !== name));
    if (selectedName === name) setSelectedName(null);
  }

  function handleReorder(oldIndex: number, newIndex: number) {
    updateElements(arrayMove(elements, oldIndex, newIndex));
  }

  function handleQuestionChange(updated: SurveyElement) {
    const newElements = elements.map((e) => (e.name === selectedName ? updated : e));
    // If name changed, update selectedName
    if (updated.name !== selectedName) {
      setSelectedName(updated.name);
    }
    updateElements(newElements);
  }

  function handleAddPage() {
    const pages = [
      ...schema.pages,
      { name: `page${schema.pages.length + 1}`, elements: [] },
    ];
    updateSchema({ ...schema, pages });
    setActivePage(pages.length - 1);
    setSelectedName(null);
  }

  function handleDeletePage(pageIdx: number) {
    if (schema.pages.length <= 1) return;
    const pages = schema.pages.filter((_, i) => i !== pageIdx);
    updateSchema({ ...schema, pages });
    const newPage = Math.min(activePage, pages.length - 1);
    setActivePage(newPage);
    setSelectedName(null);
  }

  function handleJsonApply(newSchema: SurveySchema) {
    const normalized = schemaFromJson(newSchema as unknown as Record<string, unknown>);
    updateSchema(normalized);
    setActivePage(0);
    setSelectedName(null);
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left sidebar — palette + properties */}
      <div
        style={{
          width: 260,
          borderRight: "1px solid #e0e0e0",
          backgroundColor: "#fafafa",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div style={{ overflow: "auto", flex: 1 }}>
          <QuestionPalette onAdd={handleAddQuestion} />
        </div>
      </div>

      {/* Center — question list + property editor */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Question list */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              minWidth: 0,
            }}
          >
            <QuestionList
              elements={elements}
              selectedName={selectedName}
              onSelect={setSelectedName}
              onDelete={handleDeleteQuestion}
              onReorder={handleReorder}
              activePage={activePage}
              pageCount={schema.pages.length}
              onPageChange={(p) => {
                setActivePage(p);
                setSelectedName(null);
              }}
              onAddPage={handleAddPage}
              onDeletePage={handleDeletePage}
              pageTitle={currentPage?.title}
            />
          </div>

          {/* Property editor (shown when question selected) */}
          {selectedElement && (
            <div
              style={{
                width: 280,
                borderLeft: "1px solid #e0e0e0",
                backgroundColor: "#fafafa",
                overflow: "auto",
                flexShrink: 0,
              }}
            >
              <PropertyEditor
                key={selectedName}
                element={selectedElement}
                onChange={handleQuestionChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right panel — preview or JSON */}
      <div
        style={{
          width: 420,
          borderLeft: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          {(["preview", "json"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRightPanel(tab)}
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderBottom: rightPanel === tab ? "2px solid #16213e" : "2px solid transparent",
                background: rightPanel === tab ? "white" : "#f5f5f5",
                fontWeight: rightPanel === tab ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                color: rightPanel === tab ? "#16213e" : "#888",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {tab === "preview" ? "Preview" : "JSON"}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {rightPanel === "preview" ? (
            <FormPreview schema={schema} />
          ) : (
            <JsonEditor schema={schema} onApply={handleJsonApply} />
          )}
        </div>
      </div>
    </div>
  );
}
