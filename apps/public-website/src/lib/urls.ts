export function getSafeExternalUrl(url?: string | null): string | null {
  const href = url?.trim();
  if (!href) return null;

  try {
    const parsed = new URL(href);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? href
      : null;
  } catch {
    return null;
  }
}
