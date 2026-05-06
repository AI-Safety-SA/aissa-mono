import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Code of Conduct | AI Safety South Africa",
  description: "AI Safety South Africa community code of conduct.",
};

const CODE_OF_CONDUCT_URL =
  "https://aisafetysa.getoutline.com/s/aa885466-1262-41f1-8f3d-e3b02d701539";

export default function CodeOfConductPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)]">
      <section className="border-b py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Legal
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            AISSA Code of Conduct
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            The public community code of conduct for AI Safety South Africa is
            published as a public document and remains available without Track
            Record access.
          </p>
          <a
            href={CODE_OF_CONDUCT_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Open code of conduct
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
