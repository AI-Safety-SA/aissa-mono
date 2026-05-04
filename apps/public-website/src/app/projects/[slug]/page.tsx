import { notFound } from "next/navigation";
import { getProject } from "@/lib/api";
import { extractPlainText, titleCase } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug).catch(() => null);
  if (!project) notFound();
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">
        {titleCase(project.type)}
      </p>
      <h1 className="text-4xl font-bold">{project.title}</h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        {extractPlainText(project.description, 2000)}
      </p>
    </article>
  );
}
