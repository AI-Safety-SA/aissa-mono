export function formatContextLabel(name: string, date: string | null | undefined): string {
  if (!date) return name
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return name
  return `${name} (${d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })})`
}
