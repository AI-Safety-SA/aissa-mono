import type { ReactElement } from "react";
import { ResearchTable } from "@/components/cards";
import { SectionSurface } from "@/components/section-surface";
import { getResearch } from "@/lib/api";

export default async function ResearchPage(): Promise<ReactElement> {
  const research = await getResearch();
  return (
    <>
      <SectionSurface spacing="compact">
        <div>
          <h1 className="text-3xl font-bold">Research</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            These are some notable research outputs that our team and community
            members have produced. In our in-house team, we have a focus on
            technical AI governance methods, mainly evaluations. You can see the
            research outputs of the Cooperative AI Research Fellowship{" "}
            <a
              href="https://www.cai-research-fellowship.com/posters/"
              target="_blank"
              rel="noreferrer"
              className="text-primary leading-8 underline-offset-4 transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              on their posters page
            </a>
            .
          </p>
        </div>
      </SectionSurface>

      <SectionSurface surface="alternate">
        {research.length === 0 ? (
          <p className="text-muted-foreground">No research to display yet.</p>
        ) : (
          <ResearchTable research={research} />
        )}
      </SectionSurface>
    </>
  );
}
