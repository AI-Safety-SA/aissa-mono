"use client";

import { useEffect, useRef, useCallback } from "react";
import "survey-core/survey-core.css";
import type { SurveySchema } from "@/lib/survey-schema";

interface FormPreviewProps {
  schema: SurveySchema;
}

export default function FormPreview({ schema }: FormPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<ReturnType<typeof import("react-dom/client").createRoot> | null>(null);
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const render = useCallback(async () => {
    if (!containerRef.current) return;
    const { Model } = await import("survey-core");
    const { Survey } = await import("survey-react-ui");
    const { createElement } = await import("react");
    const { createRoot } = await import("react-dom/client");

    const survey = new Model(schemaRef.current);
    survey.mode = "display";
    survey.showNavigationButtons = "none";

    if (!rootRef.current) {
      rootRef.current = createRoot(containerRef.current);
    }
    rootRef.current.render(createElement(Survey, { model: survey }));
  }, []);

  useEffect(() => {
    render();
  }, [schema, render]);

  useEffect(() => {
    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, []);

  return (
    <div style={{ height: "100%", overflow: "auto", backgroundColor: "#fafafa" }}>
      <div
        style={{
          padding: "8px 16px",
          background: "#f0f4ff",
          borderBottom: "1px solid #e0e0e0",
          fontSize: 12,
          color: "#666",
          fontWeight: 500,
        }}
      >
        PREVIEW (read-only)
      </div>
      <div ref={containerRef} style={{ padding: 16 }} />
    </div>
  );
}
