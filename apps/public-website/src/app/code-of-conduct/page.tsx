import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code of Conduct | AI Safety South Africa",
  description: "AI Safety South Africa community code of conduct.",
};

const CODE_OF_CONDUCT_URL =
  "https://aisafetysa.getoutline.com/s/aa885466-1262-41f1-8f3d-e3b02d701539";

export default function CodeOfConductPage() {
  return (
    <main className="min-h-[calc(100vh-5rem)]">
      <section className="pt-16 pb-8">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Legal
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            AISSA Code of Conduct
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Our code of conduct exists to make our spaces and programming safe
            and equitable for all. Visitors to AISSA spaces are expected to
            abide by this code of conduct. To lodge a report or make a
            suggestion, please follow the steps outlined in the code of conduct,
            or reach out to admin@aisafetysa.com.
          </p>
        </div>
      </section>
      <section className="pb-8">
        <iframe
          src={CODE_OF_CONDUCT_URL}
          title="AISSA Code of Conduct"
          sandbox="allow-same-origin allow-scripts"
          className="h-[78vh] min-h-[640px] w-full border-0 bg-background"
        />
      </section>
    </main>
  );
}
