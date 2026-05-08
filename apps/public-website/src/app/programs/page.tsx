import { ProgramCard } from "@/components/cards";
import { ContentGridPage } from "@/components/content-grid-page";
import { getPrograms } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return (
    <ContentGridPage title="Programs">
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </ContentGridPage>
  );
}
