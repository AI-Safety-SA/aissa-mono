# Large Program Page — Posters Mosaic Section

**Branch:** `large-program-posters`
**Date:** 2026-04-29

## What was done

Implemented the research output posters section for the large program page variant, based on a design exported from Claude Design (mosaic option from `cairf-program-display/project/Posters Options.html`).

### New files

- `src/components/ui/dialog.tsx` — standard shadcn/Radix Dialog component (required for the lightbox)
- `src/components/program/posters-mosaic-section.tsx` — `PostersMosaicSection` client component

### Modified files

- `src/app/(frontend)/programs/[slug]/page.tsx` — imports and conditionally renders `PostersMosaicSection` inside the `isLargeProgram` block, between Mentors and Cohorts sections

### New dependency

- `@radix-ui/react-dialog` added to `apps/track-record`

## Design decisions

**Equal-area mosaic layout**: Each poster tile has the same pixel area (width × height), matching the physical parity of A3 prints. Landscape posters are wider+shorter; portrait are narrower+taller. The target area is solved from the first row to fill the container width exactly, then reused for all rows.

**Mixed-orientation rows**: Default 4 posters per row. All rows share the same target area, creating a masonry-like rhythm where portrait tiles extend below landscape neighbours.

**ResizeObserver**: Container width is measured via `ResizeObserver` so the layout recomputes on viewport resize. The mosaic renders only once `containerWidth > 0`.

**Hover states**:
- Author name pill (top-left) fades out on hover
- Expand icon (top-right) fades in on hover
- Title/author gradient overlay fades in from bottom on hover
- Tile lifts slightly with enhanced border+shadow

**Lightbox** (Dialog): Author name (uppercase eyebrow), poster title + subtitle, Download PDF button (shown only if `pdfUrl` is set), full-size poster thumbnail with correct aspect ratio.

**Placeholder**: Shows when no `thumbnailUrl` is provided — abstract poster anatomy with header strip and two-column body using muted theme colors.

## Data wiring

The section renders nothing (`return null`) when `posters` is an empty array. The page currently passes `[]` with a TODO comment. To activate:

```tsx
// In programs/[slug]/page.tsx, fetch poster items and pass:
<PostersMosaicSection posters={posterItems} />
```

Each `PosterItem` needs:
```typescript
{
  id: string
  author: string       // display name
  title: string        // poster title
  subtitle?: string    // optional abstract teaser
  ratio: number        // width / height of the original PDF page
  thumbnailUrl?: string // pre-generated PNG of the first PDF page
  pdfUrl?: string       // URL to original PDF for download
}
```
