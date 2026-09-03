import type { ReactElement } from "react";
import { ProgramCard } from "@/components/cards";
import { ContentGridPage } from "@/components/content-grid-page";
import { getPrograms } from "@/lib/api";

export default async function ProgramsPage(): Promise<ReactElement> {
  const programs = await getPrograms();
  return (
    <ContentGridPage
      title="Programs"
      description={
        <>
          We have run a broad array of programs that have developed talent in
          South Africa to respond to AI risk. We have seeded AI safety student
          groups at top South African universities, run AI safety fundamentals
          courses, upskilling retreats and full research fellowships.
          Participants of these programs have made significant career
          transitions as a result, joining world-class upskilling programs such
          as{" "}
          <a
            href="https://www.matsprogram.org/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            MATS
          </a>
          {
            ", publishing AI safety research at top AI conferences, or getting jobs at "
          }
          globally relevant AI safety organisations. Through these programs, we
          have developed a community of exceptional talent and established key
          partnerships with top local universities and globally relevant AI
          safety organisations.
        </>
      }
    >
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </ContentGridPage>
  );
}
