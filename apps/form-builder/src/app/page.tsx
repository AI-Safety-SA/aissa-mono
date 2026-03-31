"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  getForms,
  deleteForm,
  getResponses,
  type FormDefinition,
} from "@/lib/storage";

export default function Dashboard() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const router = useRouter();

  useEffect(() => {
    setForms(getForms());
  }, []);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete form "${name}" and all its responses?`)) return;
    deleteForm(id);
    setForms(getForms());
  }

  function handleCreate() {
    const id = uuidv4();
    router.push(`/builder/${id}`);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>My Forms</h1>
        <button
          onClick={handleCreate}
          style={{
            backgroundColor: "#16213e",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "white",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
          }}
        >
          <p style={{ fontSize: 18, color: "#666" }}>No forms yet.</p>
          <button
            onClick={handleCreate}
            style={{
              backgroundColor: "#16213e",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 12,
            }}
          >
            Create your first form
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {forms.map((form) => {
            const responseCount = getResponses(form.id).length;
            return (
              <div
                key={form.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 8,
                  border: "1px solid #e0e0e0",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 4px 0" }}>
                    {form.name || "Untitled Form"}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#888",
                    }}
                  >
                    Updated {new Date(form.updatedAt).toLocaleDateString()} |{" "}
                    {responseCount} response{responseCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/builder/${form.id}`}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#16213e",
                      color: "white",
                      borderRadius: 5,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/fill/${form.id}`}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#0f3460",
                      color: "white",
                      borderRadius: 5,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Fill Out
                  </Link>
                  <Link
                    href={`/responses/${form.id}`}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#533483",
                      color: "white",
                      borderRadius: 5,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Responses
                  </Link>
                  <button
                    onClick={() => handleDelete(form.id, form.name)}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 5,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
