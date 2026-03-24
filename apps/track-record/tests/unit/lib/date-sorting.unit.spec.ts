import { describe, expect, it } from 'vitest'
import { applyLimit, sortByDateDescUnknownLast } from '@/lib/date-sorting'

describe('date sorting helpers', () => {
  it('sorts known dates descending and pushes unknown dates to the end', () => {
    const items = [
      { id: 1, date: null },
      { id: 2, date: '2024-01-01T00:00:00.000Z' },
      { id: 3, date: undefined },
      { id: 4, date: '2025-06-01T00:00:00.000Z' },
      { id: 5, date: 'not-a-date' },
    ]

    expect(sortByDateDescUnknownLast(items, (item) => item.date).map((item) => item.id)).toEqual([
      4, 2, 1, 3, 5,
    ])
  })

  it('preserves original order for items with equal or unknown dates', () => {
    const items = [
      { id: 1, date: '2025-01-01T00:00:00.000Z' },
      { id: 2, date: '2025-01-01T00:00:00.000Z' },
      { id: 3, date: null },
      { id: 4, date: null },
    ]

    expect(sortByDateDescUnknownLast(items, (item) => item.date).map((item) => item.id)).toEqual([
      1, 2, 3, 4,
    ])
  })

  it('applies limits after sorting', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]

    expect(applyLimit(items, 2).map((item) => item.id)).toEqual([1, 2])
    expect(applyLimit(items, 0).map((item) => item.id)).toEqual([1, 2, 3])
  })
})
