import { v4 as uuidv4 } from "uuid";
import { getQuestionTypeInfo } from "./question-types";

export interface SurveyElement {
  type: string;
  name: string;
  title?: string;
  isRequired?: boolean;
  [key: string]: unknown;
}

export interface SurveyPage {
  name: string;
  title?: string;
  elements: SurveyElement[];
}

export interface SurveySchema {
  title?: string;
  description?: string;
  pages: SurveyPage[];
  [key: string]: unknown;
}

export function createEmptySchema(): SurveySchema {
  return {
    pages: [{ name: "page1", elements: [] }],
  };
}

export function createQuestion(type: string): SurveyElement {
  const info = getQuestionTypeInfo(type);
  const shortId = uuidv4().slice(0, 8);
  return {
    type,
    name: `question_${shortId}`,
    title: `${info?.label ?? type} question`,
    isRequired: false,
    ...(info?.defaultProps ?? {}),
  };
}

export function schemaFromJson(json: Record<string, unknown>): SurveySchema {
  const schema = json as unknown as SurveySchema;
  if (!schema.pages || !Array.isArray(schema.pages)) {
    // If it has elements at the top level, wrap in a page
    if (Array.isArray((json as { elements?: unknown }).elements)) {
      return {
        ...json,
        pages: [
          {
            name: "page1",
            elements: (json as { elements: SurveyElement[] }).elements,
          },
        ],
      };
    }
    return createEmptySchema();
  }
  return schema;
}
