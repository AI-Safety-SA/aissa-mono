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
import { CardSurface, MetricGridSurface } from "@/components/card-surface";
import { SectionSurface } from "@/components/section-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProgram, isPublicTrackRecordNotFound } from "@/lib/api";
import { formatPublicDate } from "@/lib/dates";
import type { PublicCohortSummary, PublicImage } from "@/lib/types";
import { extractPlainText, titleCase } from "@/lib/text";
import { getSafeExternalUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const programDetailHeaderSurfaceClassName = "bg-card/40 lg:py-16";
const programDetailHeaderContainerClassName =
  "grid gap-8 md:grid-cols-[minmax(0,1fr)_360px] md:items-end";
const programDetailContentContainerClassName =
  "grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]";
const programHeroImageFrameClassName =
  "relative aspect-[16/7] overflow-hidden rounded-lg border bg-muted shadow-card";
const programGalleryImageFrameClassName =
  "relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgram(slug).catch((error: unknown) => {
    if (isPublicTrackRecordNotFound(error)) return null;
    throw error;
  });
  if (!program?.image?.url) notFound();

  const body = extractPlainText(program.description, 2600);
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
          label: "Participants",
          value: program.totalParticipants.toLocaleString(),
        }
      : null,
    cohorts.length
      ? { icon: Layers3, label: "Cohorts", value: cohorts.length.toString() }
      : null,
    projects.length
      ? { icon: FileText, label: "Projects", value: projects.length.toString() }
      : null,
  ].filter((stat): stat is NonNullable<typeof stat> => Boolean(stat));

  return (
    <article className="overflow-hidden">
      <SectionSurface
        className={programDetailHeaderSurfaceClassName}
        containerClassName={programDetailHeaderContainerClassName}
        spacing="compact"
      >
        <header>
          <div className="max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge variant="signal">{titleCase(program.type)}</Badge>
              {dateRange ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {dateRange}
                </span>
              ) : null}
            </div>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <GraduationCap className="h-5 w-5" />
              Program
            </p>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-balance text-foreground md:text-6xl">
              {program.name}
            </h1>
            {websiteUrl ? (
              <Button asChild size="lg" className="mt-8 w-fit">
                <a href={websiteUrl} target="_blank" rel="noreferrer">
                  Visit website
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </header>
        {stats.length ? (
          <MetricGridSurface>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-md bg-muted/60 p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    {stat.label}
                  </dt>
                  <dd className="mt-3 text-3xl font-bold text-foreground">
                    {stat.value}
                  </dd>
                </div>
              );
            })}
          </MetricGridSurface>
        ) : null}
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
