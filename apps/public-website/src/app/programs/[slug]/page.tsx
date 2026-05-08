import { notFound } from "next/navigation";
import { getProgram, isPublicTrackRecordNotFound } from "@/lib/api";
import { extractPlainText, titleCase } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgram(slug).catch((error: unknown) => {
    if (isPublicTrackRecordNotFound(error)) {
      return null;
    }

    throw error;
  });
  if (!program) notFound();
  return (
    <Detail
      title={program.name}
      eyebrow={titleCase(program.type)}
      body={extractPlainText(program.description, 2000)}
    />
  );
}

function Detail({
  title,
  eyebrow,
  body,
}: {
  title: string;
  eyebrow: string;
  body: string;
}) {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">
        {eyebrow}
      </p>
      <h1 className="text-4xl font-bold">{title}</h1>
      {body ? (
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{body}</p>
      ) : null}
    </article>
  );
}
