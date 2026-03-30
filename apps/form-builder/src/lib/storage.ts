import { v4 as uuidv4 } from "uuid";

export interface FormDefinition {
  id: string;
  name: string;
  json: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  completedAt: string;
}

const FORMS_KEY = "formbuilder_forms";
const RESPONSES_KEY = "formbuilder_responses";

function readFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Forms

export function getForms(): FormDefinition[] {
  return readFromStorage<FormDefinition>(FORMS_KEY).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getForm(id: string): FormDefinition | undefined {
  return readFromStorage<FormDefinition>(FORMS_KEY).find((f) => f.id === id);
}

export function saveForm(
  name: string,
  json: Record<string, unknown>,
  existingId?: string
): FormDefinition {
  const forms = readFromStorage<FormDefinition>(FORMS_KEY);
  const now = new Date().toISOString();

  if (existingId) {
    const idx = forms.findIndex((f) => f.id === existingId);
    if (idx !== -1) {
      forms[idx] = { ...forms[idx], name, json, updatedAt: now };
      writeToStorage(FORMS_KEY, forms);
      return forms[idx];
    }
  }

  const form: FormDefinition = {
    id: existingId ?? uuidv4(),
    name,
    json,
    createdAt: now,
    updatedAt: now,
  };
  forms.push(form);
  writeToStorage(FORMS_KEY, forms);
  return form;
}

export function deleteForm(id: string): void {
  const forms = readFromStorage<FormDefinition>(FORMS_KEY).filter(
    (f) => f.id !== id
  );
  writeToStorage(FORMS_KEY, forms);
  // Also delete responses for this form
  const responses = readFromStorage<FormResponse>(RESPONSES_KEY).filter(
    (r) => r.formId !== id
  );
  writeToStorage(RESPONSES_KEY, responses);
}

// Responses

export function getResponses(formId: string): FormResponse[] {
  return readFromStorage<FormResponse>(RESPONSES_KEY)
    .filter((r) => r.formId === formId)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
}

export function saveResponse(
  formId: string,
  data: Record<string, unknown>
): FormResponse {
  const responses = readFromStorage<FormResponse>(RESPONSES_KEY);
  const response: FormResponse = {
    id: uuidv4(),
    formId,
    data,
    completedAt: new Date().toISOString(),
  };
  responses.push(response);
  writeToStorage(RESPONSES_KEY, responses);
  return response;
}
