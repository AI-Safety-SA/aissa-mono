"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const CONTENT_CLASS_NAME = 'text-sm leading-relaxed italic text-card-foreground'

interface TestimonialItemProps {
  quote: string
}

export function TestimonialItem({ quote }: TestimonialItemProps) {
  const [open, setOpen] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const measurementRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const measurement = measurementRef.current

    if (!container || !measurement) {
      return
    }

    const measureOverflow = () => {
      const nextIsOverflowing = measurement.scrollHeight > measurement.clientHeight + 1
      setIsOverflowing((current) =>
        current === nextIsOverflowing ? current : nextIsOverflowing,
      )

      if (!nextIsOverflowing) {
        setOpen(false)
      }
    }

    const frame = window.requestAnimationFrame(measureOverflow)

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureOverflow)

      return () => {
        window.cancelAnimationFrame(frame)
        window.removeEventListener('resize', measureOverflow)
      }
    }

    const resizeObserver = new ResizeObserver(measureOverflow)
    resizeObserver.observe(container)
    resizeObserver.observe(measurement)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [quote])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div ref={containerRef} className="relative">
        <p
          ref={measurementRef}
          aria-hidden="true"
          className={cn(
            CONTENT_CLASS_NAME,
            'pointer-events-none absolute left-0 top-0 w-full line-clamp-3 opacity-0',
          )}
        >
          {quote}
        </p>
        <p className={cn(CONTENT_CLASS_NAME, !open && 'line-clamp-3')}>
          {quote}
        </p>
      </div>
      {isOverflowing ? (
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-auto justify-start px-0 text-primary hover:bg-transparent hover:text-primary"
          >
            {open ? 'Collapse' : 'Read more'}
          </Button>
        </CollapsibleTrigger>
      ) : null}
    </Collapsible>
  )
}
