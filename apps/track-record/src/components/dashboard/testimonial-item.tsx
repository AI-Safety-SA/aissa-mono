"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const EXPAND_THRESHOLD = 200

interface TestimonialItemProps {
  quote: string
}

export function TestimonialItem({ quote }: TestimonialItemProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = quote.length > EXPAND_THRESHOLD

  if (!isLong) {
    return <p className="text-sm leading-relaxed italic text-card-foreground">{quote}</p>
  }

  return (
    <>
      <p
        className={
          expanded
            ? 'text-sm leading-relaxed italic text-card-foreground'
            : 'line-clamp-3 text-sm leading-relaxed italic text-card-foreground'
        }
      >
        {quote}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 h-auto justify-start px-0 text-primary hover:bg-transparent hover:text-primary"
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? 'Collapse' : 'Read more'}
      </Button>
    </>
  )
}
