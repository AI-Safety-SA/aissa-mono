/**
 * Utility functions for seed script
 */

export function generatePlaceholderEmail(fullName: string): string {
  const normalized = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  return `${normalized}@placeholder.aissa.org`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

