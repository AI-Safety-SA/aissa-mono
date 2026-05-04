import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type LexicalNode = {
  type: string;
  text?: string;
  children?: LexicalNode[];
  [key: string]: unknown;
};

type LexicalRoot = {
  root: LexicalNode;
  [key: string]: unknown;
};

function extractTextFromNode(node: LexicalNode): string {
  if (node.text) {
    return node.text;
  }
  if (node.children) {
    return node.children.map(extractTextFromNode).join(" ");
  }
  return "";
}

export function extractPlainText(
  richText: LexicalRoot | null | undefined,
  maxLength?: number,
): string {
  if (!richText?.root) return "";

  const text = extractTextFromNode(richText.root).trim().replace(/\s+/g, " ");

  if (maxLength && text.length > maxLength) {
    return text.slice(0, maxLength).trimEnd() + "...";
  }

  return text;
}
