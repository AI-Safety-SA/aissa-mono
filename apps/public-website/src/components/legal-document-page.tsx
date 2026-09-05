import { ExternalLink } from "lucide-react";
import { SectionSurface } from "@/components/section-surface";
import { Button } from "@/components/ui/button";

type LegalDocumentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  documentTitle: string;
  documentUrl: string;
  // Some hosts (e.g. Notion) send X-Frame-Options/CSP headers that block
  // being iframed, so their pages must be linked out to instead of embedded.
  display?: "embed" | "link";
};

export function LegalDocumentPage({
  description,
  display = "embed",
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
        {display === "link" ? (
          <Button asChild size="lg" className="mt-7 font-bold">
            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
              Read {documentTitle}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </SectionSurface>
      {display === "embed" ? (
        <section>
          <iframe
            src={documentUrl}
            title={documentTitle}
            sandbox="allow-same-origin allow-scripts"
            className="h-[78vh] min-h-[640px] w-full border-0 bg-background"
          />
        </section>
      ) : null}
    </div>
  );
}
