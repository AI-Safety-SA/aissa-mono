import type { ReactElement } from "react";
import { ProgramCard } from "@/components/cards";
import { ContentGridPage } from "@/components/content-grid-page";
import { getPrograms } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProgramsPage(): Promise<ReactElement> {
  const programs = await getPrograms();
  return (
    <ContentGridPage
      title="Programs"
      description="We run workshops, BlueDot courses, retreats and fellowships where participants are educated about the risks from advanced AI and make contributions to research shaping the field."
    >
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </ContentGridPage>
  );
}
