import type { ReactElement } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PartnerLogoCard } from "@repo/ui/partner-logo-card";
import {
  Calendar,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers3,
  Users,
} from "lucide-react";
import { CardSurface } from "@/components/card-surface";
import { IconText } from "@/components/icon-text";
import { SectionSurface } from "@/components/section-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProgram, getPrograms } from "@/lib/api";
import { formatPublicDate } from "@/lib/dates";
import type { PublicCohortSummary, PublicImage } from "@/lib/types";
import { extractPlainText, titleCase } from "@/lib/text";
import { getSafeExternalUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

const programDetailHeaderSurfaceClassName = "bg-card/40 lg:py-16";
const programDetailHeaderContainerClassName =
  "grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch";
const programDetailContentContainerClassName =
  "grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]";
const programHeroImageFrameClassName =
  "relative aspect-[16/7] overflow-hidden rounded-lg border bg-muted shadow-card";
const programGalleryImageFrameClassName =
  "relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted";

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((program) => ({ slug: program.slug }));
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program?.image?.url) notFound();

  const body = extractPlainText(program.description, 2600);
  const heroDescription = extractPlainText(program.description, 460);
  const cohorts = program.cohorts ?? [];
  const projects = program.projects ?? [];
  const partners = program.partners ?? [];
  const gallery = (program.gallery ?? []).filter((image) => image.url);
  const dateRange = formatDateRange(program.startDate, program.endDate);
  const websiteUrl = getSafeExternalUrl(program.websiteUrl);
  const stats = [
    program.totalParticipants
      ? {
          icon: Users,
          text: `${program.totalParticipants.toLocaleString()} ${pluralize("participant", program.totalParticipants)}`,
        }
      : null,
    cohorts.length
      ? {
          icon: Layers3,
          text: `${cohorts.length.toLocaleString()} ${pluralize("cohort", cohorts.length)}`,
        }
      : null,
    projects.length
      ? {
          icon: FileText,
          text: `${projects.length.toLocaleString()} ${pluralize("project", projects.length)}`,
        }
      : null,
  ].filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));

  return (
    <article className="overflow-hidden">
      <SectionSurface
        className={programDetailHeaderSurfaceClassName}
        containerClassName={programDetailHeaderContainerClassName}
        spacing="compact"
      >
        <header className="max-w-4xl lg:py-5">
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-balance text-foreground md:text-6xl">
            {program.name}
          </h1>
          {heroDescription ? (
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl md:leading-9">
              {heroDescription}
            </p>
          ) : null}
        </header>
        <aside className="flex flex-col gap-8 border-border/70 pt-1 lg:border-l lg:pl-8 lg:pt-5">
          <div className="space-y-5">
            <Badge variant="signal">{titleCase(program.type)}</Badge>
            <div className="space-y-4">
              {dateRange ? (
                <IconText icon={Calendar} iconClassName="text-muted-foreground">
                  {dateRange}
                </IconText>
              ) : null}
              <IconText
                icon={GraduationCap}
                iconClassName="text-muted-foreground"
              >
                Program
              </IconText>
              {stats.map((stat) => (
                <IconText
                  key={stat.text}
                  icon={stat.icon}
                  iconClassName="text-muted-foreground"
                >
                  {stat.text}
                </IconText>
              ))}
            </div>
          </div>

          {websiteUrl ? (
            <Button asChild size="lg" className="w-full sm:w-fit lg:w-full">
              <a href={websiteUrl} target="_blank" rel="noreferrer">
                Visit website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
        </aside>
      </SectionSurface>

      <SectionSurface
        containerClassName={programDetailContentContainerClassName}
        spacing="compact"
        surface="cta"
      >
        <div className="space-y-12">
          {body ? (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold">About the Program</h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {body}
              </p>
              <ProgramImage image={program.image} title={program.name} />
            </section>
          ) : program.image?.url ? (
            <ProgramImage
              image={program.image}
              title={program.name}
              withTopMargin
            />
          ) : null}
          {cohorts.length ? <CohortsSection cohorts={cohorts} /> : null}
          {projects.length ? (
            <section>
              <h2 className="text-2xl font-bold">Outputs</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {projects.slice(0, 6).map((project) => (
                  <CardSurface key={project.id} variant="detailTile">
                    <Badge variant="secondary">{titleCase(project.type)}</Badge>
                    <h3 className="mt-3 text-lg font-semibold leading-7">
                      {project.title}
                    </h3>
                  </CardSurface>
                ))}
              </div>
            </section>
          ) : null}
          {gallery.length ? (
            <Gallery images={gallery} title={program.name} />
          ) : null}
        </div>

        <aside className="space-y-6 lg:pt-1">
          {partners.length ? (
            <CardSurface variant="detailPanel">
              <h2 className="text-lg font-bold">Partners</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[...partners]
                  .sort((a, b) => a.id - b.id)
                  .map((partner) => (
                    <PartnerLogoCard
                      key={partner.id}
                      href={partner.website}
                      imageAlt={partner.logo?.alt || `${partner.name} logo`}
                      imageSrc={partner.logo?.url}
                      name={partner.name}
                    />
                  ))}
              </div>
            </CardSurface>
          ) : null}
        </aside>
      </SectionSurface>
    </article>
  );
}

function ProgramImage({
  image,
  title,
  withTopMargin = false,
}: {
  image?: PublicImage | null;
  title: string;
  withTopMargin?: boolean;
}) {
  if (!image?.url) return null;

  return (
    <figure>
      <div
        className={cn(programHeroImageFrameClassName, withTopMargin && "mt-4")}
      >
        <Image
          src={image.url}
          alt={image.alt || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover"
        />
      </div>
    </figure>
  );
}

function CohortsSection({ cohorts }: { cohorts: PublicCohortSummary[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">Cohorts</h2>
      <div className="mt-5 space-y-3">
        {cohorts.map((cohort) => (
          <CardSurface key={cohort.id} variant="detailRow">
            <div>
              <h3 className="text-lg font-semibold">{cohort.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateRange(cohort.startDate, cohort.endDate)}
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <Metric label="Participants" value={cohort.acceptedCount} />
              <Metric
                label="Rating"
                value={
                  cohort.averageRating != null
                    ? `${cohort.averageRating}/10`
                    : null
                }
              />
            </div>
          </CardSurface>
        ))}
      </div>
    </section>
  );
}

function Gallery({ images, title }: { images: PublicImage[]; title: string }) {
  return (
    <section>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.slice(0, 6).map((image, index) => (
          <figure key={`${image.url}-${index}`}>
            <div className={programGalleryImageFrameClassName}>
              <Image
                src={image.url!}
                alt={image.alt || image.caption || `Photo from ${title}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            {image.caption ? (
              <figcaption className="mt-2 text-xs leading-5 text-muted-foreground">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value?: number | string | null;
}) {
  if (value == null) return null;
  return (
    <div className="min-w-20">
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start) return null;
  const startLabel = formatPublicDate(start, "MMM yyyy");
  const endLabel = formatPublicDate(end, "MMM yyyy");

  return endLabel ? `${startLabel} - ${endLabel}` : startLabel;
}

function pluralize(label: string, count: number) {
  return count === 1 ? label : `${label}s`;
}
