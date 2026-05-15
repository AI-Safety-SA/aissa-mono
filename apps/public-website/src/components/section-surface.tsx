import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const sectionSpacingClassNames = {
  compact: "py-12",
  default: "py-16",
  loose: "py-20",
} as const;

const sectionSurfaceClassNames = {
  default: "border-b border-border/70",
  alternate: "border-b border-border/70 bg-card-raised/42",
  raised: "border-y border-border/70 bg-card-raised/60",
  cta: "",
} as const;

const sectionContainerClassNames = {
  full: "w-full",
  narrow: "container mx-auto max-w-4xl px-4",
  site: "container mx-auto px-4",
  wide: "container mx-auto max-w-7xl px-4",
} as const;

export type SectionSpacing = keyof typeof sectionSpacingClassNames;
export type SectionSurfaceVariant = keyof typeof sectionSurfaceClassNames;
export type SectionWidth = keyof typeof sectionContainerClassNames;

export function SectionSurface({
  children,
  className,
  containerClassName,
  spacing = "default",
  surface = "default",
  width = "site",
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  spacing?: SectionSpacing;
  surface?: SectionSurfaceVariant;
  width?: SectionWidth;
}) {
  return (
    <section
      className={cn(
        sectionSurfaceClassNames[surface],
        sectionSpacingClassNames[spacing],
        className,
      )}
    >
      <div
        className={cn(sectionContainerClassNames[width], containerClassName)}
      >
        {children}
      </div>
    </section>
  );
}
