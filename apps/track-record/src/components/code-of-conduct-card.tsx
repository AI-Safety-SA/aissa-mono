'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink, ShieldCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const CODE_OF_CONDUCT_URL =
  'https://aisafetysa.getoutline.com/s/aa885466-1262-41f1-8f3d-e3b02d701539'

export function CodeOfConductCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <section className="rounded-[1.75rem] border border-primary/10 bg-background/85 p-5 shadow-[0_24px_80px_-48px_rgba(11,31,70,0.65)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Community Standards
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              AISSA Code of Conduct
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Linked from Outline so updates stay current without duplicating policy text inside the
              app.
            </p>
          </div>
        </div>

        <Link
          href={CODE_OF_CONDUCT_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-full')}
        >
          Open full document
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        {isOpen ? 'Hide live preview' : 'Preview code of conduct'}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen ? (
        <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-border bg-background">
          <iframe
            src={CODE_OF_CONDUCT_URL}
            title="AISSA Code of Conduct"
            className="h-80 w-full bg-white md:h-[28rem]"
            loading="lazy"
          />
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        If your browser blocks the embedded preview, use the full-document link above.
      </p>
    </section>
  )
}
