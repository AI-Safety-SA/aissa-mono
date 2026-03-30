"use client";

import { useState } from "react";
import type { SurveyElement } from "@/lib/survey-schema";
import { getQuestionTypeInfo } from "@/lib/question-types";

interface PropertyEditorProps {
  element: SurveyElement;
  onChange: (updated: SurveyElement) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  border: "1px solid #ddd",
  borderRadius: 4,
  fontSize: 13,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#555",
  marginBottom: 4,
};

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function ChoicesEditor({
  choices,
  onChange,
}: {
  choices: (string | { value: string; text?: string; imageLink?: string })[];
  onChange: (choices: (string | { value: string; text?: string; imageLink?: string })[]) => void;
}) {
  const [newChoice, setNewChoice] = useState("");

  function getDisplayText(c: string | { value: string; text?: string }) {
    return typeof c === "string" ? c : c.text || c.value;
  }

  function handleAdd() {
    const val = newChoice.trim();
    if (!val) return;
    onChange([...choices, val]);
    setNewChoice("");
  }

  function handleRemove(idx: number) {
    onChange(choices.filter((_, i) => i !== idx));
  }

  function handleEdit(idx: number, text: string) {
    const updated = [...choices];
    const existing = updated[idx];
    if (typeof existing === "object") {
      updated[idx] = { ...existing, text, value: text };
    } else {
      updated[idx] = text;
    }
    onChange(updated);
  }

  return (
    <div>
      {choices.map((c, i) => (
        <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={getDisplayText(c)}
            onChange={(e) => handleEdit(i, e.target.value)}
          />
          <button
            onClick={() => handleRemove(i)}
            style={{
              background: "none",
              border: "1px solid #ddd",
              borderRadius: 4,
              cursor: "pointer",
              color: "#999",
              padding: "0 8px",
              fontSize: 16,
            }}
          >
            &times;
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="New option..."
          value={newChoice}
          onChange={(e) => setNewChoice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "4px 12px",
            border: "1px solid #16213e",
            borderRadius: 4,
            background: "#16213e",
            color: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

const TYPES_WITH_CHOICES = ["radiogroup", "checkbox", "dropdown", "ranking", "imagepicker"];
const TYPES_WITH_PLACEHOLDER = ["text", "comment"];

export default function PropertyEditor({ element, onChange }: PropertyEditorProps) {
  const info = getQuestionTypeInfo(element.type);

  function update(patch: Partial<SurveyElement>) {
    onChange({ ...element, ...patch });
  }

  return (
    <div style={{ padding: 16, overflow: "auto", flex: 1 }}>
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: 13,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Properties
      </h3>

      <div
        style={{
          padding: "8px 12px",
          background: "#f0f4ff",
          borderRadius: 6,
          fontSize: 12,
          color: "#16213e",
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        {info?.icon} {info?.label ?? element.type}
      </div>

      <FieldGroup label="Name (identifier)">
        <input
          style={inputStyle}
          value={element.name}
          onChange={(e) => update({ name: e.target.value.replace(/\s/g, "_") })}
        />
      </FieldGroup>

      <FieldGroup label="Title (question text)">
        <input
          style={inputStyle}
          value={element.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
        />
      </FieldGroup>

      {element.type !== "html" && (
        <FieldGroup label="Required">
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!element.isRequired}
              onChange={(e) => update({ isRequired: e.target.checked })}
            />
            Respondents must answer this question
          </label>
        </FieldGroup>
      )}

      {TYPES_WITH_PLACEHOLDER.includes(element.type) && (
        <FieldGroup label="Placeholder">
          <input
            style={inputStyle}
            value={(element.placeholder as string) ?? ""}
            onChange={(e) => update({ placeholder: e.target.value })}
          />
        </FieldGroup>
      )}

      {element.type === "text" && (
        <FieldGroup label="Input Type">
          <select
            style={inputStyle}
            value={(element.inputType as string) ?? "text"}
            onChange={(e) => update({ inputType: e.target.value })}
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="email">Email</option>
            <option value="url">URL</option>
            <option value="tel">Phone</option>
            <option value="date">Date</option>
            <option value="datetime-local">Date & Time</option>
            <option value="password">Password</option>
            <option value="color">Color</option>
          </select>
        </FieldGroup>
      )}

      {element.type === "comment" && (
        <FieldGroup label="Rows">
          <input
            type="number"
            style={inputStyle}
            value={(element.rows as number) ?? 4}
            min={1}
            max={20}
            onChange={(e) => update({ rows: parseInt(e.target.value) || 4 })}
          />
        </FieldGroup>
      )}

      {TYPES_WITH_CHOICES.includes(element.type) && (
        <FieldGroup label="Choices">
          <ChoicesEditor
            choices={(element.choices as (string | { value: string; text?: string })[]) ?? []}
            onChange={(choices) => update({ choices })}
          />
        </FieldGroup>
      )}

      {element.type === "rating" && (
        <>
          <FieldGroup label="Min Rating">
            <input
              type="number"
              style={inputStyle}
              value={(element.rateMin as number) ?? 1}
              min={0}
              onChange={(e) => update({ rateMin: parseInt(e.target.value) || 0 })}
            />
          </FieldGroup>
          <FieldGroup label="Max Rating">
            <input
              type="number"
              style={inputStyle}
              value={(element.rateMax as number) ?? 5}
              min={1}
              onChange={(e) => update({ rateMax: parseInt(e.target.value) || 5 })}
            />
          </FieldGroup>
        </>
      )}

      {element.type === "boolean" && (
        <>
          <FieldGroup label="True Label">
            <input
              style={inputStyle}
              value={(element.labelTrue as string) ?? "Yes"}
              onChange={(e) => update({ labelTrue: e.target.value })}
            />
          </FieldGroup>
          <FieldGroup label="False Label">
            <input
              style={inputStyle}
              value={(element.labelFalse as string) ?? "No"}
              onChange={(e) => update({ labelFalse: e.target.value })}
            />
          </FieldGroup>
        </>
      )}

      {element.type === "matrix" && (
        <>
          <FieldGroup label="Columns">
            <ChoicesEditor
              choices={(element.columns as string[]) ?? []}
              onChange={(columns) => update({ columns })}
            />
          </FieldGroup>
          <FieldGroup label="Rows">
            <ChoicesEditor
              choices={(element.rows as string[]) ?? []}
              onChange={(rows) => update({ rows })}
            />
          </FieldGroup>
        </>
      )}

      {element.type === "html" && (
        <FieldGroup label="HTML Content">
          <textarea
            style={{ ...inputStyle, minHeight: 120, fontFamily: "monospace", fontSize: 12 }}
            value={(element.html as string) ?? ""}
            onChange={(e) => update({ html: e.target.value })}
          />
        </FieldGroup>
      )}

      {element.type === "multipletext" && (
        <FieldGroup label="Fields">
          <MultipleTextEditor
            items={(element.items as { name: string; title: string }[]) ?? []}
            onChange={(items) => update({ items })}
          />
        </FieldGroup>
      )}

      <FieldGroup label="Description (optional help text)">
        <input
          style={inputStyle}
          value={(element.description as string) ?? ""}
          onChange={(e) => update({ description: e.target.value || undefined })}
        />
      </FieldGroup>
    </div>
  );
}

function MultipleTextEditor({
  items,
  onChange,
}: {
  items: { name: string; title: string }[];
  onChange: (items: { name: string; title: string }[]) => void;
}) {
  function handleAdd() {
    const n = items.length + 1;
    onChange([...items, { name: `field${n}`, title: `Field ${n}` }]);
  }

  function handleRemove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function handleEdit(idx: number, field: "name" | "title", value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Name"
            value={item.name}
            onChange={(e) => handleEdit(i, "name", e.target.value)}
          />
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Title"
            value={item.title}
            onChange={(e) => handleEdit(i, "title", e.target.value)}
          />
          <button
            onClick={() => handleRemove(i)}
            style={{
              background: "none",
              border: "1px solid #ddd",
              borderRadius: 4,
              cursor: "pointer",
              color: "#999",
              padding: "0 8px",
              fontSize: 16,
            }}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        style={{
          padding: "4px 12px",
          border: "1px solid #16213e",
          borderRadius: 4,
          background: "#16213e",
          color: "white",
          cursor: "pointer",
          fontSize: 12,
          marginTop: 4,
        }}
      >
        Add Field
      </button>
    </div>
  );
}
