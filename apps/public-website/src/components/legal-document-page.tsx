import { SectionSurface } from "@/components/section-surface";

type LegalDocumentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  documentTitle: string;
  documentUrl: string;
};

export function LegalDocumentPage({
  description,
  documentTitle,
  documentUrl,
  eyebrow,
  title,
}: LegalDocumentPageProps) {
  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <SectionSurface
        spacing="intro"
        surface="cta"
        width="narrow"
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-8 text-muted-foreground">
          {description}
        </p>
      </SectionSurface>
      <section>
        <iframe
          src={documentUrl}
          title={documentTitle}
          sandbox="allow-same-origin allow-scripts"
          className="h-[78vh] min-h-[640px] w-full border-0 bg-background"
        />
      </section>
    </div>
  );
}
