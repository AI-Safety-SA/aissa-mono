'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {format(new Date(row.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{row.kind}</TableCell>
                  <TableCell>
                    {row.href ? (
                      <a
                        href={row.href}
                        className="font-medium text-primary hover:underline underline-offset-4"
                      >
                        {row.title}
                      </a>
                    ) : (
                      <span className="font-medium">{row.title}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.detail || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}
