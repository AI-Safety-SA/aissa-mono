"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getForm, saveResponse } from "@/lib/storage";

import "survey-core/survey-core.css";

export default function FillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [formName, setFormName] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const form = getForm(id);
      if (!form) {
        if (mounted) setNotFound(true);
        return;
      }

      if (mounted) setFormName(form.name || "Untitled Form");

      const { Model } = await import("survey-core");
      const { Survey } = await import("survey-react-ui");
      const { createElement } = await import("react");
      const { createRoot } = await import("react-dom/client");

      if (!mounted || !containerRef.current) return;

      const survey = new Model(form.json);
      survey.onComplete.add((_sender) => {
        saveResponse(id, survey.data);
        if (mounted) setCompleted(true);
      });

      const root = createRoot(containerRef.current);
      root.render(createElement(Survey, { model: survey }));

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

  if (notFound) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
        <h2>Form not found</h2>
        <p>This form may have been deleted.</p>
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

  if (completed) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
        <h2>Thank you!</h2>
        <p>Your response has been saved.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
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
          <button
            onClick={() => router.push(`/responses/${id}`)}
            style={{
              backgroundColor: "#533483",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            View Responses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <h2 style={{ marginBottom: 16 }}>{formName}</h2>
      <div ref={containerRef} />
    </div>
  );
}
