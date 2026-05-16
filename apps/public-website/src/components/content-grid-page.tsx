import type { ReactNode } from "react";
import { SectionSurface } from "@/components/section-surface";

export function ContentGridPage({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <>
      <SectionSurface spacing="compact">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description ? (
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </SectionSurface>
      <SectionSurface surface="alternate">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </SectionSurface>
    </>
  );
}
