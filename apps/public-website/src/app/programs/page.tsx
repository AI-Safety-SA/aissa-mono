import { ProgramCard } from "@/components/cards";
import { getPrograms } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return (
    <ListPage title="Programs">
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </ListPage>
  );
}

function ListPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
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
