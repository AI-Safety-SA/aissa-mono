import { ResearchCard } from "@/components/cards";
import { getResearch } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const research = await getResearch();
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Research</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {research.map((item) => (
          <ResearchCard key={item.id} research={item} />
        ))}
      </div>
    </section>
  );
}
