import type { ReactNode } from "react";

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
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description ? (
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
