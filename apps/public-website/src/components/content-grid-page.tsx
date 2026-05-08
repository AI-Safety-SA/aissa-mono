import type { ReactNode } from "react";

export function ContentGridPage({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">{title}</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
