'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import type { ContextOptions } from '../_lib/api'
import { formatContextLabel } from '../_lib/context-label'

type ContextComboboxProps = {
  value: string
  onChange: (value: string) => void
  options: ContextOptions
  placeholder?: string
  emptyLabel?: string | null
}

type ComboboxOption = {
  label: string
  value: string
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
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const eventOptions = useMemo(
    () =>
      options.events.map((e) => ({
        value: `events:${e.id}`,
        label: formatContextLabel(e.name, e.eventDate),
      })),
    [options.events],
  )
  const programOptions = useMemo(
    () =>
      options.programs.map((p) => ({
        value: `programs:${p.id}`,
        label: formatContextLabel(p.name, p.startDate),
      })),
    [options.programs],
  )
  const allOptions = useMemo(() => [...eventOptions, ...programOptions], [eventOptions, programOptions])

  const selectedOption = allOptions.find((opt) => opt.value === value)

  const q = search.toLowerCase()
  const filteredEvents = q
    ? eventOptions.filter((opt) => opt.label.toLowerCase().includes(q))
    : eventOptions
  const filteredPrograms = q
    ? programOptions.filter((opt) => opt.label.toLowerCase().includes(q))
    : programOptions

  const navigableOptions = useMemo<ComboboxOption[]>(() => {
    const items: ComboboxOption[] = []
    if (emptyLabel !== null) {
      items.push({ label: emptyLabel || 'None', value: '' })
    }
    items.push(...filteredEvents)
    items.push(...filteredPrograms)
    return items
  }, [emptyLabel, filteredEvents, filteredPrograms])

  const hasResults = filteredEvents.length > 0 || filteredPrograms.length > 0 || emptyLabel !== null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleClose() {
    setOpen(false)
    setSearch('')
    setActiveIndex(-1)
  }

  function handleSelect(optValue: string) {
    onChange(optValue)
    handleClose()
  }

  function handleClear() {
    onChange('')
    handleClose()
  }

  function focusOption(index: number) {
    optionRefs.current[index]?.focus()
  }

  function moveActive(step: 1 | -1) {
    if (navigableOptions.length === 0) return

    const nextIndex =
      activeIndex < 0
        ? step === 1
          ? 0
          : navigableOptions.length - 1
        : (activeIndex + step + navigableOptions.length) % navigableOptions.length

    setActiveIndex(nextIndex)
    focusOption(nextIndex)
  }

  function selectActive() {
    if (activeIndex < 0 || activeIndex >= navigableOptions.length) return
    const option = navigableOptions[activeIndex]
    if (!option) return

    if (option.value === '') {
      handleClear()
      return
    }

    handleSelect(option.value)
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        handleOpen()
        setTimeout(() => {
          setActiveIndex(event.key === 'ArrowDown' ? 0 : Math.max(navigableOptions.length - 1, 0))
          focusOption(event.key === 'ArrowDown' ? 0 : Math.max(navigableOptions.length - 1, 0))
        }, 0)
      } else {
        moveActive(event.key === 'ArrowDown' ? 1 : -1)
      }
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) {
        handleClose()
      } else {
        handleOpen()
      }
      return
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault()
      handleClose()
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      handleClose()
      triggerRef.current?.focus()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      selectActive()
    }
  }

  const emptyOptionIndex = emptyLabel !== null ? 0 : -1
  const eventsStartIndex = emptyLabel !== null ? 1 : 0
  const programsStartIndex = eventsStartIndex + filteredEvents.length

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? handleClose() : handleOpen())}
        onKeyDown={handleTriggerKeyDown}
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
        <div
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md"
          onKeyDown={handleListKeyDown}
        >
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
          <div role="listbox" className="max-h-60 overflow-y-auto p-1">
            {emptyLabel !== null && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                ref={(node) => {
                  optionRefs.current[emptyOptionIndex] = node
                }}
                onMouseEnter={() => setActiveIndex(emptyOptionIndex)}
                onClick={handleClear}
                className={cn(
                  'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                  (!value || activeIndex === emptyOptionIndex) && 'bg-accent',
                  !value && 'font-medium',
                )}
              >
                {emptyLabel || 'None'}
              </button>
            )}

            {filteredEvents.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Events</div>
                {filteredEvents.map((opt, index) => {
                  const optionIndex = eventsStartIndex + index
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={value === opt.value}
                      ref={(node) => {
                        optionRefs.current[optionIndex] = node
                      }}
                      onMouseEnter={() => setActiveIndex(optionIndex)}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                        (value === opt.value || activeIndex === optionIndex) && 'bg-accent',
                        value === opt.value && 'font-medium',
                      )}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </>
            )}

            {filteredPrograms.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Programs</div>
                {filteredPrograms.map((opt, index) => {
                  const optionIndex = programsStartIndex + index
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={value === opt.value}
                      ref={(node) => {
                        optionRefs.current[optionIndex] = node
                      }}
                      onMouseEnter={() => setActiveIndex(optionIndex)}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                        (value === opt.value || activeIndex === optionIndex) && 'bg-accent',
                        value === opt.value && 'font-medium',
                      )}
                    >
                      {opt.label}
                    </button>
                  )
                })}
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
