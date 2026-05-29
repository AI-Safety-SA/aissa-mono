import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { PartnerLogoCard } from '@repo/ui/partner-logo-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RichTextRenderer } from '@/components/person/rich-text-renderer'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  Calendar,
  Users,
  LayoutGrid,
  FileText,
  ClipboardList,
  CheckCircle,
  UserCheck,
  Percent,
  ExternalLink,
  Handshake,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { getDefaultImages, getHighlightedImage, getProgramDefaultImage } from '@/lib/default-images'
import type {
  Cohort,
  Engagement,
  Media,
  Organisation,
  Partnership,
  Person,
  Program,
} from '@/payload-types'
import Link from 'next/link'
import { Suspense } from 'react'
import { sortByDateDescUnknownLast } from '@/lib/date-sorting'
import { getMediaPublicUrl } from '@/utilities/media-url'
import { getMetadataBoolean, getMetadataString, getNestedMetadataString } from '@/lib/content-flags'

export const dynamic = 'force-dynamic'

type StatItem = {
  label: string
  value: number
  icon: LucideIcon
  iconClassName: string
}

type OrganisationWithLogo = Organisation & {
  logo?: (number | null) | Media
}

interface ProgramPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'programs',
    where: {
      slug: { equals: slug },
      isPublished: { equals: true },
    },
    limit: 1,
    depth: 1,
  })

  if (!result.docs.length) {
    notFound()
  }

  const program = result.docs[0] as Program
  const defaultImages = await getDefaultImages(payload)
  const heroImage =
    getHighlightedImage(program.images) ?? getProgramDefaultImage(defaultImages, program.type)
  const heroImageUrl = getMediaPublicUrl(heroImage)
  const heroImageAlt = heroImage?.alt || program.name
  const isLargeProgram = getMetadataBoolean(program.metadata, 'large') === true
  const websiteUrl = program.websiteUrl?.trim() || getMetadataString(program.metadata, 'website')

  // Parallelize cohorts and projects queries
  const [cohortsResult, projectsResult] = await Promise.all([
    payload.find({
      collection: 'cohorts',
      where: {
        program: { equals: program.id },
        isPublished: { equals: true },
      },
      limit: 0,
      sort: '-startDate',
      depth: 1, // Populate images
    }),
    payload.find({
      collection: 'projects',
      where: {
        program: { equals: program.id },
        isPublished: { equals: true },
      },
      limit: 0, // Just count
    }),
  ])

  const cohorts = sortByDateDescUnknownLast(
    cohortsResult.docs as Cohort[],
    (cohort) => cohort.startDate,
  )
  const totalParticipants =
    program.participantCount ?? cohorts.reduce((sum, c) => sum + (c.acceptedCount || 0), 0)
  const totalCompletions = cohorts.reduce((sum, c) => sum + (c.completionCount || 0), 0)
  const projectCount = projectsResult.totalDocs
  const isCourseProgram = program.type === 'course'

  const statItems: StatItem[] = [
    ...(isCourseProgram
      ? [
          {
            label: 'Registered',
            value: totalParticipants,
            icon: Users,
            iconClassName: 'text-primary',
          },
          {
            label: 'Completed',
            value: totalCompletions,
            icon: CheckCircle,
            iconClassName: 'text-green-600',
          },
          {
            label: 'Cohorts',
            value: cohorts.length,
            icon: LayoutGrid,
            iconClassName: 'text-primary',
          },
        ]
      : []),
    ...(projectCount > 0
      ? [
          {
            label: 'Projects',
            value: projectCount,
            icon: FileText,
            iconClassName: 'text-primary',
          },
        ]
      : []),
    ...(program.applicationCount
      ? [
          {
            label: 'Applications',
            value: program.applicationCount,
            icon: ClipboardList,
            iconClassName: 'text-primary',
          },
        ]
      : []),
  ]

  const [partnershipsResult, participantEngagementsResult, mentorEngagementsResult] = isLargeProgram
    ? await Promise.all([
        payload.find({
          collection: 'partnerships',
          where: {
            program: { equals: program.id },
            isActive: { equals: true },
          },
          limit: 0,
          depth: 2,
        }),
        payload.find({
          collection: 'engagements',
          where: {
            and: [
              { contextKind: { equals: 'program' } },
              { type: { equals: 'participant' } },
              { 'context.value': { equals: program.id } },
            ],
          },
          limit: 0,
          sort: '-contextDate',
          depth: 2,
        }),
        payload.find({
          collection: 'engagements',
          where: {
            and: [
              { contextKind: { equals: 'program' } },
              { type: { equals: 'mentor' } },
              { 'context.value': { equals: program.id } },
            ],
          },
          limit: 0,
          sort: '-contextDate',
          depth: 2,
        }),
      ])
    : [null, null, null]

  const partnerships = (partnershipsResult?.docs ?? []) as Partnership[]
  const fellows = getProgramPeople(
    (participantEngagementsResult?.docs ?? []) as Engagement[],
    program.id,
  )
  const mentors = getProgramPeople(
    (mentorEngagementsResult?.docs ?? []) as Engagement[],
    program.id,
  )

  // Collect all images from program and cohorts
  const allImages: { image: Media; caption?: string | null; source: string }[] = []

  // Add program images
  if (program.images?.length) {
    program.images.forEach((img) => {
      const imageUrl =
        img.image && typeof img.image === 'object' ? getMediaPublicUrl(img.image) : null
      if (img.image && typeof img.image === 'object' && imageUrl) {
        allImages.push({
          image: {
            ...img.image,
            url: imageUrl,
          },
          caption: img.caption,
          source: program.name,
        })
      }
    })
  }

  // Add cohort images
  cohorts.forEach((cohort) => {
    if (cohort.images?.length) {
      cohort.images.forEach((img) => {
        const imageUrl =
          img.image && typeof img.image === 'object' ? getMediaPublicUrl(img.image) : null
        if (img.image && typeof img.image === 'object' && imageUrl) {
          allImages.push({
            image: {
              ...img.image,
              url: imageUrl,
            },
            caption: img.caption,
            source: cohort.name,
          })
        }
      })
    }
  })

  const headerActions = isLargeProgram ? (
    statItems.length > 0 || websiteUrl ? (
      <div className="flex flex-col items-start gap-4">
        {statItems.length > 0 && <ProgramStats statItems={statItems} />}
        {websiteUrl && <WebsiteButton websiteUrl={websiteUrl} />}
      </div>
    ) : null
  ) : statItems.length > 0 ? (
    <div className="flex flex-wrap gap-6 border rounded-lg p-6 bg-background shadow-sm">
      {statItems.map((item, index) => (
        <div key={item.label} className="contents">
          {index > 0 && <div className="border-r hidden sm:block" />}
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="text-2xl font-bold flex items-center gap-2">
              <item.icon className={`h-5 w-5 ${item.iconClassName}`} />
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-background">
      {isLargeProgram && heroImageUrl ? (
        <LargeProgramHero
          alt={heroImageAlt}
          endDate={program.endDate}
          imageUrl={heroImageUrl}
          programName={program.name}
          programType={program.type}
          startDate={program.startDate}
          statItems={statItems}
          websiteUrl={websiteUrl}
        />
      ) : (
        <PageHeader
          as="header"
          size="default"
          muted
          title={program.name}
          eyebrow={
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Program Details
              </span>
            </div>
          }
          meta={
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <Badge variant="secondary" className="text-sm">
                {program.type}
              </Badge>
              {program.startDate && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(program.startDate), 'MMM yyyy')}
                    {program.endDate ? ` - ${format(new Date(program.endDate), 'MMM yyyy')}` : ''}
                  </span>
                </div>
              )}
            </div>
          }
          actions={headerActions}
        />
      )}
      {!isLargeProgram && heroImageUrl && (
        <section className="border-b bg-muted/20">
          <div className="container mx-auto px-4 py-6">
            <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border bg-muted">
              <Image
                src={heroImageUrl}
                alt={heroImageAlt}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </section>
      )}

      <main className="container mx-auto px-4 py-12">
        <div className={isLargeProgram ? 'space-y-14' : 'grid grid-cols-1 lg:grid-cols-3 gap-12'}>
          <div className={isLargeProgram ? 'space-y-14' : 'lg:col-span-2 space-y-12'}>
            {program.description && (
              <section>
                <h2 className="text-2xl font-bold mb-6">About the Program</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <RichTextRenderer
                    content={program.description}
                    className="text-lg leading-relaxed text-muted-foreground"
                  />
                </div>
              </section>
            )}

            {isLargeProgram && partnerships.length > 0 && (
              <LargeProgramPartnersSection partnerships={partnerships} />
            )}

            {isLargeProgram && fellows.length > 0 && (
              <ProgramPeopleSection
                eyebrow="Fellows"
                icon={UserRound}
                people={fellows}
                title="Fellows"
              />
            )}

            {isLargeProgram && mentors.length > 0 && (
              <ProgramPeopleSection
                eyebrow="Mentors"
                icon={GraduationCap}
                people={mentors}
                title="Mentors"
              />
            )}

            {cohorts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Cohorts</h2>
                <div className="space-y-4">
                  {cohorts.map((cohort) => (
                    <div
                      key={cohort.id}
                      className="border rounded-lg p-6 bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">
                            <Link
                              href={`/programs/${program.slug}/cohorts/${cohort.slug}`}
                              className="hover:text-primary hover:underline underline-offset-4 transition-colors"
                            >
                              {cohort.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(cohort.startDate), 'MMM d, yyyy')}
                            {cohort.endDate
                              ? ` - ${format(new Date(cohort.endDate), 'MMM d, yyyy')}`
                              : ''}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 sm:gap-6">
                          {cohort.acceptedCount != null && (
                            <div className="text-center min-w-17.5">
                              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Users className="h-3 w-3" />
                                Registered
                              </div>
                              <div className="font-bold text-lg">{cohort.acceptedCount}</div>
                            </div>
                          )}
                          {cohort.completionCount != null && (
                            <div className="text-center min-w-17.5">
                              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                Completed
                              </div>
                              <div className="font-bold text-lg text-green-600">
                                {cohort.completionCount}
                              </div>
                            </div>
                          )}
                          {cohort.completionRate != null && (
                            <div className="text-center min-w-17.5">
                              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                <Percent className="h-3 w-3" />
                                Rate
                              </div>
                              <div className="font-bold text-lg">{cohort.completionRate}%</div>
                            </div>
                          )}
                          {cohort.averageRating != null && (
                            <div className="text-center min-w-17.5">
                              <div className="text-xs text-muted-foreground">Rating</div>
                              <div className="font-bold text-lg">{cohort.averageRating}/10</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Suspense fallback={<CohortSectionLoading label="testimonials" />}>
                          <CohortTestimonialsSection cohortId={cohort.id} />
                        </Suspense>
                        <Suspense fallback={<CohortSectionLoading label="projects" />}>
                          <CohortProjectsSection cohortId={cohort.id} />
                        </Suspense>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {allImages.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allImages.map((item, index) => (
                    <div key={`${item.image.id}-${index}`} className="group relative">
                      <div className="aspect-4/3 relative overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.image.url!}
                          alt={item.image.alt || item.caption || `Photo from ${item.source}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      {item.caption && (
                        <p className="mt-2 text-sm text-muted-foreground">{item.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function LargeProgramHero({
  alt,
  endDate,
  imageUrl,
  programName,
  programType,
  startDate,
  statItems,
  websiteUrl,
}: {
  alt: string
  endDate?: string | null
  imageUrl: string
  programName: string
  programType: Program['type']
  startDate?: string | null
  statItems: StatItem[]
  websiteUrl?: string
}) {
  return (
    <header className="relative isolate overflow-hidden border-b bg-black">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="absolute inset-0 -z-20 object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.46)_52%,rgba(0,0,0,0.22))]" />
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3 text-white/85">
            <Badge variant="secondary" className="border-white/20 bg-white/90 text-black">
              {programType}
            </Badge>
            {startDate && (
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(startDate), 'MMM yyyy')}
                  {endDate ? ` - ${format(new Date(endDate), 'MMM yyyy')}` : ''}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/75">
              <GraduationCap className="h-5 w-5 text-white/90" />
              Flagship Program
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance text-white md:text-6xl">
              {programName}
            </h1>
          </div>

          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
            {statItems.length > 0 && <ProgramStats statItems={statItems} inverted />}
            {websiteUrl && <WebsiteButton websiteUrl={websiteUrl} />}
          </div>
        </div>
      </div>
    </header>
  )
}

function ProgramStats({
  inverted = false,
  statItems,
}: {
  inverted?: boolean
  statItems: StatItem[]
}) {
  return (
    <div
      className={
        inverted
          ? 'flex flex-wrap gap-5 rounded-lg border border-white/20 bg-white/10 p-5 shadow-sm backdrop-blur-md'
          : 'flex flex-wrap gap-6 rounded-lg border bg-background p-6 shadow-sm'
      }
    >
      {statItems.map((item, index) => (
        <div key={item.label} className="contents">
          {index > 0 && (
            <div
              className={
                inverted ? 'hidden border-r border-white/25 sm:block' : 'hidden border-r sm:block'
              }
            />
          )}
          <div className="space-y-1">
            <span className={inverted ? 'text-sm text-white/70' : 'text-sm text-muted-foreground'}>
              {item.label}
            </span>
            <div
              className={
                inverted
                  ? 'flex items-center gap-2 text-2xl font-bold text-white'
                  : 'flex items-center gap-2 text-2xl font-bold'
              }
            >
              <item.icon
                className={cn('h-5 w-5', inverted ? 'text-white/80' : item.iconClassName)}
              />
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function WebsiteButton({ websiteUrl }: { websiteUrl: string }) {
  return (
    <Button asChild size="lg" className="gap-2">
      <a href={websiteUrl} target="_blank" rel="noreferrer">
        Visit website
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  )
}

function LargeProgramPartnersSection({ partnerships }: { partnerships: Partnership[] }) {
  const organisations = partnerships
    .map((partnership) =>
      typeof partnership.organisation === 'object'
        ? (partnership.organisation as OrganisationWithLogo)
        : null,
    )
    .filter((organisation): organisation is OrganisationWithLogo => Boolean(organisation))

  if (organisations.length === 0) return null

  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Handshake className="h-4 w-4" />
            Partners
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {organisations.map((organisation) => (
          <OrganisationCard key={organisation.id} organisation={organisation} />
        ))}
      </div>
    </section>
  )
}

function OrganisationCard({ organisation }: { organisation: OrganisationWithLogo }) {
  const logo = organisation.logo && typeof organisation.logo === 'object' ? organisation.logo : null
  const logoUrl = getMediaPublicUrl(logo)

  return (
    <PartnerLogoCard
      href={organisation.website}
      imageAlt={logo?.alt || `${organisation.name} logo`}
      imageSrc={logoUrl}
      name={organisation.name}
    />
  )
}

function ProgramPeopleSection({
  eyebrow,
  icon: Icon,
  people,
  title,
}: {
  eyebrow: string
  icon: LucideIcon
  people: Person[]
  title: string
}) {
  return (
    <section>
      <div className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => (
          <ProgramPersonCard key={person.id} person={person} />
        ))}
      </div>
    </section>
  )
}

function ProgramPersonCard({ person }: { person: Person }) {
  const headshot = person.headshot && typeof person.headshot === 'object' ? person.headshot : null
  const headshotUrl = getMediaPublicUrl(headshot)
  const displayName = person.preferredName || person.fullName
  const initials = displayName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const personTag = person.personTag?.trim() || 'Community Member'
  const mentors = getNestedMetadataString(person.metadata, ['cairfFellow', 'mentors'])
  const bio = getBioSnippet(person.bio)

  return (
    <Link
      // The public people route is currently /people/[id]; persons do not have slugs yet.
      href={`/people/${person.id}`}
      className="group flex h-full flex-col rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted/30 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <Avatar
          size="lg"
          className="ring-2 ring-primary/10 transition-all group-hover:ring-primary/30"
        >
          {headshotUrl ? (
            <AvatarImage src={headshotUrl} alt={headshot?.alt || displayName} sizes="56px" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold leading-tight group-hover:text-primary">
            {displayName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{personTag}</p>
          {mentors && <p className="mt-2 text-xs text-muted-foreground">Mentors: {mentors}</p>}
        </div>
      </div>
      {bio && (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{bio}</p>
      )}
    </Link>
  )
}

function getBioSnippet(bio: string | null | undefined): string | null {
  const trimmed = bio?.trim()
  if (!trimmed) return null
  return trimmed.length > 150 ? `${trimmed.slice(0, 147).trimEnd()}...` : trimmed
}

function getProgramPeople(engagements: Engagement[], programId: number): Person[] {
  const peopleById = new Map<number, Person>()

  engagements.forEach((engagement) => {
    if (!isProgramEngagement(engagement, programId)) return
    const person = typeof engagement.person === 'object' ? engagement.person : null
    if (!person) return
    peopleById.set(person.id, person)
  })

  return Array.from(peopleById.values()).sort((a, b) =>
    (a.preferredName || a.fullName).localeCompare(b.preferredName || b.fullName),
  )
}

function isProgramEngagement(engagement: Engagement, programId: number): boolean {
  if (engagement.context.relationTo !== 'programs') return false

  const contextValue =
    typeof engagement.context.value === 'object'
      ? engagement.context.value.id
      : engagement.context.value

  return contextValue === programId
}

function CohortSectionLoading({ label }: { label: string }) {
  return (
    <div className="rounded-md border bg-background p-4">
      <p className="text-sm text-muted-foreground">Loading {label}...</p>
    </div>
  )
}

async function CohortTestimonialsSection({ cohortId }: { cohortId: number }) {
  const payload = await getPayload({ config })
  const testimonialsResult = await payload.find({
    collection: 'testimonials',
    where: {
      and: [{ contextKind: { equals: 'cohort' } }, { isPublished: { equals: true } }],
    },
    limit: 0,
    sort: '-contextDate',
    depth: 1,
  })

  const cohortTestimonials = sortByDateDescUnknownLast(
    testimonialsResult.docs,
    (testimonial) => testimonial.contextDate,
  )
    .filter((testimonial) => {
      if (!testimonial.context || testimonial.context.relationTo !== 'cohorts') {
        return false
      }
      const contextValue =
        typeof testimonial.context.value === 'object'
          ? testimonial.context.value.id
          : testimonial.context.value
      return contextValue === cohortId
    })
    .slice(0, 3)

  return (
    <div className="rounded-md border bg-background p-4 space-y-3">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
        Testimonials
      </h4>
      {cohortTestimonials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No testimonials yet.</p>
      ) : (
        <div className="space-y-3">
          {cohortTestimonials.map((testimonial) => (
            <blockquote key={testimonial.id} className="border-l-2 pl-3 text-sm">
              <p className="italic">&ldquo;{testimonial.quote}&rdquo;</p>
              {(testimonial.attributionName || testimonial.attributionTitle) && (
                <footer className="mt-1 text-xs text-muted-foreground">
                  {testimonial.attributionName || 'Anonymous'}
                  {testimonial.attributionTitle ? `, ${testimonial.attributionTitle}` : ''}
                </footer>
              )}
            </blockquote>
          ))}
        </div>
      )}
    </div>
  )
}

async function CohortProjectsSection({ cohortId }: { cohortId: number }) {
  const payload = await getPayload({ config })
  const engagementsResult = await payload.find({
    collection: 'engagements',
    where: {
      contextKind: { equals: 'cohort' },
    },
    limit: 0,
    depth: 0,
  })

  const participantIds = Array.from(
    new Set(
      engagementsResult.docs
        .filter((engagement) => {
          if (engagement.context.relationTo !== 'cohorts') return false
          const contextValue =
            typeof engagement.context.value === 'object'
              ? engagement.context.value.id
              : engagement.context.value
          return contextValue === cohortId
        })
        .map((engagement) =>
          typeof engagement.person === 'object' ? engagement.person.id : engagement.person,
        ),
    ),
  )

  if (participantIds.length === 0) {
    return (
      <div className="rounded-md border bg-background p-4">
        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
          Projects
        </h4>
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      </div>
    )
  }

  const contributorsResult = await payload.find({
    collection: 'project-contributors',
    where: {
      person: { in: participantIds },
    },
    limit: 0,
    depth: 1,
  })

  const projectsById = new Map<number, { id: number; slug: string; title: string }>()
  contributorsResult.docs.forEach((contributor) => {
    const project = typeof contributor.project === 'object' ? contributor.project : null
    if (!project?.isPublished) return
    projectsById.set(project.id, { id: project.id, slug: project.slug, title: project.title })
  })

  const projects = Array.from(projectsById.values()).slice(0, 5)

  return (
    <div className="rounded-md border bg-background p-4">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
        Projects
      </h4>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm text-primary hover:underline"
              >
                {project.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
