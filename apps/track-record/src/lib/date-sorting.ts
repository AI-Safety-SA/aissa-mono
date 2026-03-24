function getSortableDateTimestamp(value: string | null | undefined): number | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (trimmed.length === 0) return null

  const timestamp = new Date(trimmed).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

export function sortByDateDescUnknownLast<T>(
  items: readonly T[],
  getDate: (item: T) => string | null | undefined,
): T[] {
  return items
    .map((item, index) => ({
      item,
      index,
      timestamp: getSortableDateTimestamp(getDate(item)),
    }))
    .sort((a, b) => {
      if (a.timestamp === null && b.timestamp === null) return a.index - b.index
      if (a.timestamp === null) return 1
      if (b.timestamp === null) return -1
      if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp
      return a.index - b.index
    })
    .map(({ item }) => item)
}

export function applyLimit<T>(items: readonly T[], limit: number): T[] {
  if (limit > 0) return items.slice(0, limit)
  return [...items]
}
