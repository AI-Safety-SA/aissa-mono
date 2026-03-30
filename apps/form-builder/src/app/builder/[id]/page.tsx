"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getForm, saveForm } from "@/lib/storage";

import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";

import type { SurveyCreator } from "survey-creator-react";

export default function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const creatorRef = useRef<SurveyCreator | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [formName, setFormName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    if (!creatorRef.current) return;
    const json = creatorRef.current.JSON;
    const name = formName || json.title || "Untitled Form";
    saveForm(name, json, id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [formName, id]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { SurveyCreator, SurveyCreatorComponent } = await import("survey-creator-react");
      const { createElement } = await import("react");
      const { createRoot } = await import("react-dom/client");

      if (!mounted || !containerRef.current) return;

      const existing = getForm(id);

      const creator = new SurveyCreator({
        showLogicTab: true,
        showTranslationTab: false,
        isAutoSave: false,
      });

      if (existing) {
        creator.JSON = existing.json;
        if (mounted) setFormName(existing.name);
      }

      creatorRef.current = creator;

      const root = createRoot(containerRef.current);
      root.render(createElement(SurveyCreatorComponent, { creator }));

      if (mounted) setLoaded(true);

      return () => {
        root.unmount();
      };
    }

    const cleanup = init();
    return () => {
      mounted = false;
      cleanup.then((fn) => fn?.());
    };
  }, [id]);

  return (
    <div style={{ height: "calc(100vh - 52px)", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "12px 24px",
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 12,
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
          disabled={!loaded}
          style={{
            backgroundColor: saved ? "#28a745" : "#16213e",
            color: "white",
            border: "none",
            padding: "8px 20px",
            borderRadius: 5,
            fontSize: 14,
            fontWeight: 600,
            cursor: loaded ? "pointer" : "default",
            opacity: loaded ? 1 : 0.5,
            transition: "background-color 0.2s",
          }}
        >
          {saved ? "Saved!" : "Save Form"}
        </button>
      </div>
      <div ref={containerRef} style={{ flex: 1, overflow: "hidden" }} />
    </div>
  );
}
