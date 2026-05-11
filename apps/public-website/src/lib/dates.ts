import { format, parseISO } from "date-fns";

export function formatPublicDate(
  value: string | null | undefined,
  pattern: string,
) {
  if (!value) return null;
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : parseISO(value);

  return format(date, pattern);
}
