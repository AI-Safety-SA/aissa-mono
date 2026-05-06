export function extractPlainText(value: unknown, maxLength = 220): string {
  const parts: string[] = [];

  function visit(node: unknown) {
    if (!node || parts.join(" ").length >= maxLength) return;
    if (typeof node === "string") {
      parts.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node === "object") {
      const record = node as Record<string, unknown>;
      if (typeof record.text === "string") parts.push(record.text);
      visit(record.children);
      visit(record.root);
    }
  }

  visit(value);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trim()}...`
    : text;
}

export function titleCase(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
