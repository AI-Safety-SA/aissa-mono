"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getForm, getResponses, type FormResponse } from "@/lib/storage";

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [formName, setFormName] = useState("");
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const form = getForm(id);
    if (!form) {
      setNotFound(true);
      return;
    }
    setFormName(form.name || "Untitled Form");
    setResponses(getResponses(id));
  }, [id]);

  if (notFound) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
        <h2>Form not found</h2>
        <button
          onClick={() => router.push("/")}
          style={{
            backgroundColor: "#16213e",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
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
        <div>
          <h1 style={{ margin: "0 0 4px 0" }}>Responses</h1>
          <p style={{ margin: 0, color: "#666" }}>{formName}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/fill/${id}`}
            style={{
              padding: "8px 16px",
              backgroundColor: "#0f3460",
              color: "white",
              borderRadius: 5,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Fill Out Form
          </Link>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "1px solid #ccc",
              padding: "8px 16px",
              borderRadius: 5,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Back
          </button>
        </div>
      </div>

      {responses.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "white",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
          }}
        >
          <p style={{ fontSize: 16, color: "#666" }}>No responses yet.</p>
          <Link
            href={`/fill/${id}`}
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "10px 20px",
              backgroundColor: "#0f3460",
              color: "white",
              borderRadius: 5,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Fill out this form
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ color: "#666", fontSize: 14 }}>
            {responses.length} response{responses.length !== 1 ? "s" : ""}
          </p>
          {responses.map((resp, idx) => (
            <div
              key={resp.id}
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                border: "1px solid #e0e0e0",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === resp.id ? null : resp.id)
                }
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  Response #{responses.length - idx}
                </span>
                <span style={{ color: "#888", fontSize: 13 }}>
                  {new Date(resp.completedAt).toLocaleString()}
                  {" "}
                  {expandedId === resp.id ? "\u25B2" : "\u25BC"}
                </span>
              </button>
              {expandedId === resp.id && (
                <div
                  style={{
                    padding: "0 20px 16px",
                    borderTop: "1px solid #eee",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: 12,
                      fontSize: 14,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "8px 12px",
                            borderBottom: "2px solid #eee",
                            color: "#555",
                          }}
                        >
                          Field
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "8px 12px",
                            borderBottom: "2px solid #eee",
                            color: "#555",
                          }}
                        >
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(resp.data).map(([key, value]) => (
                        <tr key={key}>
                          <td
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid #f0f0f0",
                              fontWeight: 500,
                            }}
                          >
                            {key}
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {typeof value === "object"
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
