import { ResearchCard } from "@/components/cards";
import { ContentGridPage } from "@/components/content-grid-page";
import { getResearch } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const research = await getResearch();
  return (
    <ContentGridPage title="Research">
      {research.map((item) => (
        <ResearchCard key={item.id} research={item} />
      ))}
    </ContentGridPage>
  );
}
