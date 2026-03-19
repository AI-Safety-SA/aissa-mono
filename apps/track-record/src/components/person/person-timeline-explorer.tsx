'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import type { FullTimelineRow } from '@/lib/types'

interface PersonTimelineExplorerProps {
  rows: FullTimelineRow[]
}

export function PersonTimelineExplorer({ rows }: PersonTimelineExplorerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (rows.length === 0) {
    return (
      <div className="space-y-4 lg:col-span-3">
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-8 text-center text-sm text-muted-foreground">
          No timeline entries yet.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:col-span-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-linear-to-r from-secondary/50 to-accent/20 p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h3 className="m-0 text-lg font-semibold">Full Timeline</h3>
          <p className="m-0 text-sm text-muted-foreground">
            Expand for the complete chronological record across engagements, impacts, projects, and
            hosted or organised events.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-primary/20 hover:bg-primary/5 hover:border-primary/30"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? 'Hide full timeline' : `View full timeline (${rows.length})`}
        </Button>
      </div>

      {isExpanded ? (
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-primary/6 text-left text-xs uppercase tracking-[0.18em] text-primary/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  <th className="px-4 py-3 font-medium">Entry</th>
                  <th className="px-4 py-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top transition-colors hover:bg-secondary/30">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {format(new Date(row.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.kind}</td>
                    <td className="px-4 py-3">
                      {row.href ? (
                        <a
                          href={row.href}
                          className="font-medium text-primary hover:underline underline-offset-4"
                        >
                          {row.title}
                        </a>
                      ) : (
                        <span className="font-medium text-foreground">{row.title}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.detail || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
