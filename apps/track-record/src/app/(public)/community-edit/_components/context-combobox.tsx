'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { ContextOptions } from '../_lib/api'

function formatContextLabel(name: string, date: string | null | undefined): string {
  if (!date) return name
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return name
  return `${name} (${d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short' })})`
}

type ContextComboboxProps = {
  value: string
  onChange: (value: string) => void
  options: ContextOptions
  placeholder?: string
  emptyLabel?: string | null
}

export function ContextCombobox({
  value,
  onChange,
  options,
  placeholder = 'Select an event or program...',
  emptyLabel = null,
}: ContextComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const eventOptions = options.events.map((e) => ({
    value: `events:${e.id}`,
    label: formatContextLabel(e.name, e.eventDate),
  }))
  const programOptions = options.programs.map((p) => ({
    value: `programs:${p.id}`,
    label: formatContextLabel(p.name, p.startDate),
  }))
  const allOptions = [...eventOptions, ...programOptions]

  const selectedOption = allOptions.find((opt) => opt.value === value)

  const q = search.toLowerCase()
  const filteredEvents = q
    ? eventOptions.filter((opt) => opt.label.toLowerCase().includes(q))
    : eventOptions
  const filteredPrograms = q
    ? programOptions.filter((opt) => opt.label.toLowerCase().includes(q))
    : programOptions
  const hasResults = filteredEvents.length > 0 || filteredPrograms.length > 0

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSelect(optValue: string) {
    onChange(optValue)
    setOpen(false)
    setSearch('')
  }

  function handleClear() {
    onChange('')
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <span className={cn(!selectedOption && !(!value && emptyLabel === null) && 'text-muted-foreground')}>
          {selectedOption
            ? selectedOption.label
            : emptyLabel !== null && !value
              ? emptyLabel
              : placeholder}
        </span>
        <svg
          className="ml-2 h-4 w-4 shrink-0 opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          <div className="border-b p-2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-sm bg-transparent px-2 py-1 text-sm focus:outline-none"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {emptyLabel !== null && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                  !value && 'bg-accent font-medium',
                )}
              >
                {emptyLabel || 'None'}
              </button>
            )}
            {filteredEvents.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Events</div>
                {filteredEvents.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                      value === opt.value && 'bg-accent font-medium',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </>
            )}
            {filteredPrograms.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Programs</div>
                {filteredPrograms.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                      value === opt.value && 'bg-accent font-medium',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </>
            )}
            {!hasResults && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
