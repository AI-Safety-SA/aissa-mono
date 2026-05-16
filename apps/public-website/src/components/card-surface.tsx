import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const cardSurfaceClassNames = {
  action:
    "flex min-h-[170px] flex-col bg-card/92 shadow-card transition group-hover:-translate-y-0.5 group-hover:border-primary/35 group-hover:bg-card group-hover:shadow-card-hover",
  cta: "overflow-hidden border-brand-coral/25 bg-home-cta p-8 text-white shadow-cta md:p-10",
  detailGrid:
    "grid grid-cols-2 gap-3 rounded-lg border bg-background/80 p-4 shadow-card",
  detailPanel: "rounded-lg border bg-card/88 p-6 shadow-card",
  detailRow:
    "grid gap-4 rounded-lg border bg-card/88 p-5 shadow-card md:grid-cols-[minmax(0,1fr)_auto]",
  detailTile: "rounded-lg border bg-card/88 p-5 shadow-card",
  mediaInteractive:
    "group flex h-full flex-col overflow-hidden bg-card/88 shadow-card transition-all hover:-translate-y-1 hover:border-brand-coral/45 hover:shadow-card-hover",
  stat: "bg-card/90 p-6 shadow-stat backdrop-blur",
  staticPanel: "bg-card/92 p-5 shadow-card md:p-6",
  staticPanelFlex: "flex flex-col bg-card/92 p-5 shadow-card md:p-6",
  team: "flex h-full flex-col gap-5 bg-card/88 p-6 shadow-card sm:flex-row sm:p-7",
  testimonial: "flex h-full flex-col gap-4 bg-testimonial-card p-5 shadow-card",
  textInteractive:
    "flex h-full flex-col gap-3 bg-card/88 shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover",
} as const;

export const tableSurfaceClassNames = {
  bodyRow: "border-b last:border-0 hover:bg-card-raised/42",
  headRow: "border-b bg-card-raised/60 text-left text-muted-foreground",
  shell: "overflow-x-auto rounded-lg border bg-card/88 shadow-card",
} as const;

export const linkSurfaceClassNames = {
  blockCard:
    "group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  listResource:
    "group grid grid-cols-[1.75rem_minmax(0,1fr)_1rem] items-center gap-3 py-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:gap-4",
  trackRecordRow:
    "group flex min-h-16 w-full items-center justify-center gap-2 rounded-md border border-border/80 bg-card-raised/75 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/45 hover:bg-card-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-24 sm:flex-col",
} as const;

export type CardSurfaceVariant = keyof typeof cardSurfaceClassNames;

export function CardSurface({
  className,
  variant,
  ...props
}: ComponentProps<typeof Card> & { variant: CardSurfaceVariant }) {
  return (
    <Card
      className={cn(cardSurfaceClassNames[variant], className)}
      {...props}
    />
  );
}

export function MetricGridSurface({
  className,
  ...props
}: ComponentProps<"dl">) {
  return (
    <dl
      className={cn(cardSurfaceClassNames.detailGrid, className)}
      {...props}
    />
  );
}
