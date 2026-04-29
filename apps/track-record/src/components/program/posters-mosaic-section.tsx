'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Maximize2, Download, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export type PosterItem = {
  id: string
  /** Researcher / author display name */
  author: string
  /** Poster title */
  title: string
  /** Optional subtitle or abstract teaser */
  subtitle?: string | null
  /** width / height of the original poster. Used for equal-area sizing. */
  ratio: number
  /** URL of a pre-generated thumbnail image (e.g. first page PNG) */
  thumbnailUrl?: string | null
  /** URL of the original PDF for download */
  pdfUrl?: string | null
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const GAP = 12
/** Default number of posters per row. */
const DEFAULT_ROW_SIZE = 4

// ─── Equal-area layout math ───────────────────────────────────────────────────

/**
 * For a row of posters and a container width, compute the single TARGET_AREA
 * such that all tiles in that row have equal pixel area and the row exactly
 * fills the container (gaps included).
 *
 * For a given poster with aspect ratio r:
 *   w = √(A · r)   h = √(A / r)
 *
 * The constraint: Σ w_i + (n-1)·gap = containerWidth
 *   → Σ √(A · r_i) = containerWidth - (n-1)·gap
 *   → √A · Σ √r_i  = containerWidth - gaps
 *   → A = ((containerWidth - gaps) / Σ √r_i)²
 */
function solveTargetArea(row: PosterItem[], containerWidth: number): number {
  const gaps = GAP * (row.length - 1)
  const sumSqrtR = row.reduce((s, p) => s + Math.sqrt(p.ratio), 0)
  if (sumSqrtR === 0) return 0
  return Math.pow((containerWidth - gaps) / sumSqrtR, 2)
}

function sizePoster(poster: PosterItem, targetArea: number): { w: number; h: number } {
  return {
    w: Math.sqrt(targetArea * poster.ratio),
    h: Math.sqrt(targetArea / poster.ratio),
  }
}

function chunkIntoRows(posters: PosterItem[], rowSize: number): PosterItem[][] {
  const rows: PosterItem[][] = []
  for (let i = 0; i < posters.length; i += rowSize) {
    rows.push(posters.slice(i, i + rowSize))
  }
  return rows
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface PostersMosaicSectionProps {
  posters: PosterItem[]
  /** How many posters to pack per row. Defaults to 4. */
  rowSize?: number
}

export function PostersMosaicSection({ posters, rowSize = DEFAULT_ROW_SIZE }: PostersMosaicSectionProps) {
  const [activePoster, setActivePoster] = useState<PosterItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Measure immediately then watch for resizes
    setContainerWidth(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const rows = chunkIntoRows(posters, rowSize)

  // Solve target area once from the first row so every tile across all rows
  // shares the same pixel area (equal visual weight, like equal A3 prints).
  const targetArea =
    containerWidth > 0 && rows.length > 0 ? solveTargetArea(rows[0], containerWidth) : 0

  if (posters.length === 0) return null

  return (
    <section>
      {/* Section header */}
      <div className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
          <BookOpen className="h-4 w-4" />
          Research Output
        </p>
        <h2 className="text-2xl font-bold">Posters</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {posters.length} final research poster{posters.length !== 1 ? 's' : ''} &middot; click
          any poster to view full size
        </p>
      </div>

      {/* Mosaic */}
      <div
        ref={containerRef}
        className="flex flex-col"
        style={{ gap: `${GAP}px` }}
      >
        {containerWidth > 0 &&
          rows.map((row, rowIdx) => (
            <MosaicRow
              key={rowIdx}
              row={row}
              targetArea={targetArea}
              gap={GAP}
              onOpen={setActivePoster}
            />
          ))}
      </div>

      {/* Lightbox */}
      <PosterLightbox
        poster={activePoster}
        onClose={() => setActivePoster(null)}
      />
    </section>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function MosaicRow({
  row,
  targetArea,
  gap,
  onOpen,
}: {
  row: PosterItem[]
  targetArea: number
  gap: number
  onOpen: (poster: PosterItem) => void
}) {
  return (
    <div className="flex items-start" style={{ gap: `${gap}px` }}>
      {row.map((poster) => {
        const { w, h } = sizePoster(poster, targetArea)
        return (
          <PosterTile
            key={poster.id}
            poster={poster}
            width={w}
            height={h}
            onOpen={onOpen}
          />
        )
      })}
    </div>
  )
}

// ─── Tile ─────────────────────────────────────────────────────────────────────

function PosterTile({
  poster,
  width,
  height,
  onOpen,
}: {
  poster: PosterItem
  width: number
  height: number
  onOpen: (poster: PosterItem) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={() => onOpen(poster)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative shrink-0 cursor-pointer overflow-hidden rounded-md border bg-card p-0 text-left transition-all duration-200',
        hovered
          ? '-translate-y-0.5 border-primary/40 shadow-xl'
          : 'border-border shadow-sm',
      )}
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-label={`View poster: ${poster.title} by ${poster.author}`}
    >
      {/* Poster thumbnail */}
      <div className="absolute inset-0 bg-white">
        {poster.thumbnailUrl ? (
          <Image
            src={poster.thumbnailUrl}
            alt={`${poster.title} — poster thumbnail`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <PosterPlaceholder ratio={poster.ratio} />
        )}
      </div>

      {/* Author pill — visible at rest, fades out on hover */}
      <div
        className={cn(
          'absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-medium transition-opacity duration-150',
          'border border-white/10 bg-background/80 text-foreground backdrop-blur-sm',
          hovered ? 'opacity-0' : 'opacity-100',
        )}
      >
        {poster.author}
      </div>

      {/* Expand icon — fades in on hover */}
      <div
        className={cn(
          'absolute right-2 top-2 flex h-[22px] w-[22px] items-center justify-center rounded transition-opacity duration-150',
          'border border-white/10 bg-background/80 backdrop-blur-sm',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden
      >
        <Maximize2 className="h-3 w-3 text-foreground" />
      </div>

      {/* Hover caption — slides up from bottom */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-8 text-left transition-opacity duration-150',
          'bg-gradient-to-t from-background/95 via-background/70 to-transparent',
          hovered ? 'opacity-100' : 'opacity-0',
        )}
      >
        <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground">
          {poster.title}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{poster.author}</p>
      </div>
    </button>
  )
}

// ─── Placeholder (shown when no thumbnail URL is provided) ────────────────────

function PosterPlaceholder({ ratio }: { ratio: number }) {
  const isPortrait = ratio < 1
  return (
    <div className="flex h-full w-full flex-col bg-muted/30">
      {/* Header strip */}
      <div className="h-[14%] shrink-0 bg-primary/20" />
      {/* Body */}
      <div
        className={cn(
          'flex flex-1 gap-[4%] p-[6%]',
          isPortrait ? 'flex-col' : 'flex-row',
        )}
      >
        {/* Left column / top block */}
        <div className="flex flex-1 flex-col gap-[8%]">
          <div className="h-[12%] rounded-sm bg-muted/60" />
          <div className="h-[8%] rounded-sm bg-muted/40" />
          <div className="flex-1 rounded-sm bg-muted/25" />
        </div>
        {/* Right column / bottom block */}
        <div className="flex flex-1 flex-col gap-[8%]">
          <div className="flex-1 rounded-sm bg-muted/20" />
          <div className="h-[10%] rounded-sm bg-muted/40" />
          <div className="h-[30%] rounded-sm bg-muted/25" />
        </div>
      </div>
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function PosterLightbox({
  poster,
  onClose,
}: {
  poster: PosterItem | null
  onClose: () => void
}) {
  const handleDownload = useCallback(() => {
    if (poster?.pdfUrl) {
      window.open(poster.pdfUrl, '_blank', 'noopener,noreferrer')
    }
  }, [poster])

  return (
    <Dialog open={!!poster} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'flex max-h-[92vh] w-full max-w-5xl flex-col gap-4 border-border bg-background p-6',
          // Override shadcn default close button position to not overlap our header
          '[&>button:last-child]:hidden',
        )}
      >
        {poster && (
          <>
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {poster.author}
                  </p>
                  <DialogTitle className="text-xl font-semibold leading-snug">
                    {poster.title}
                  </DialogTitle>
                  {poster.subtitle && (
                    <DialogDescription className="mt-1 text-sm">
                      {poster.subtitle}
                    </DialogDescription>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {poster.pdfUrl && (
                    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={onClose} className="gap-1.5">
                    Close
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Poster preview */}
            <div
              className="relative min-h-0 flex-1 overflow-hidden rounded-lg border bg-white"
              style={{ aspectRatio: poster.ratio > 1 ? '4/3' : '3/4' }}
            >
              {poster.thumbnailUrl ? (
                <Image
                  src={poster.thumbnailUrl}
                  alt={`${poster.title} — full poster`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 90vw, 900px"
                  priority
                />
              ) : (
                <PosterPlaceholder ratio={poster.ratio} />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
