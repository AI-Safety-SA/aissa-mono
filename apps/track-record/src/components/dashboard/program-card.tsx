import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Media, Program } from '@/payload-types'
import { getHighlightedImage } from '@/lib/default-images'
import { isProgramLargeCard } from '@/lib/content-flags'
import { cn, extractPlainText } from '@/lib/utils'
import { getMediaPublicUrl } from '@/utilities/media-url'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, LayoutGrid, Users } from 'lucide-react'
import Image from 'next/image'

interface ProgramCardProps {
  program: Program
  defaultImage?: Media | null
  cohortCount?: number
  totalParticipants?: number
  totalCompletions?: number
}

const programTypeLabels: Record<string, string> = {
  fellowship: 'Fellowship',
  course: 'Course',
  hackathon: 'Hackathon',
  coworking: 'Coworking',
  volunteer_program: 'Volunteer Program',
  retreat: 'Retreat',
  other: 'Other',
}

function resolveProgramImages(program: Program): Media[] {
  if (!program.images?.length) return []

  return program.images.flatMap((item) =>
    item.image && typeof item.image === 'object' ? [item.image] : [],
  )
}

function StatPill({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
    </div>
  )
}

export function ProgramCard({
  program,
  defaultImage = null,
  cohortCount,
  totalParticipants,
  totalCompletions,
}: ProgramCardProps) {
  const typeLabel = programTypeLabels[program.type || ''] || program.type
  const isLargeVariant = isProgramLargeCard(program)
  const collageImages = resolveProgramImages(program).slice(0, 3)
  const descriptionText = extractPlainText(program.description, 180)

  const cardImage = getHighlightedImage(program.images) ?? defaultImage
  const imageUrl = getMediaPublicUrl(cardImage)
  const imageAlt = cardImage?.alt || program.name
  const href = `/programs/${program.slug}`

  if (isLargeVariant && collageImages.length >= 3) {
    return (
      <Card className="group h-full overflow-hidden border-primary/15 bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
        <div className="grid h-full lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
          <div className="relative overflow-hidden border-b border-border/70 bg-muted/40 lg:border-b-0 lg:border-r">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_50%),linear-gradient(135deg,rgba(15,23,42,0.05),transparent_60%)]"
            />
            <div className="relative grid min-h-[19rem] grid-cols-[1.45fr_0.95fr] gap-2 p-2 sm:min-h-[22rem]">
              {collageImages.map((image, index) => {
                const collageImageUrl = getMediaPublicUrl(image)
                if (!collageImageUrl) return null

                return (
                  <div
                    key={image.id}
                    className={cn(
                      'relative overflow-hidden rounded-xl bg-muted',
                      index === 0 ? 'row-span-2 min-h-[19rem] sm:min-h-[22rem]' : 'min-h-[9rem]',
                    )}
                  >
                    <Image
                      src={collageImageUrl}
                      alt={image.alt || `${program.name} image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes={
                        index === 0
                          ? '(max-width: 1024px) 100vw, 60vw'
                          : '(max-width: 1024px) 50vw, 20vw'
                      }
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
                  </div>
                )
              })}

              <div className="absolute left-5 top-5">
                <Badge variant="secondary" className="shadow-sm">
                  {typeLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-between bg-background/95">
            <CardHeader className="space-y-4 pb-5">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
                  Featured Program
                </div>
                <Link href={href} className="transition-colors hover:text-primary">
                  <CardTitle className="text-2xl leading-tight">{program.name}</CardTitle>
                </Link>
              </div>
              {descriptionText && (
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  {descriptionText}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {program.type === 'course' && cohortCount !== undefined && (
                  <StatPill
                    icon={LayoutGrid}
                    label={`${cohortCount} ${cohortCount === 1 ? 'cohort' : 'cohorts'}`}
                  />
                )}
                {totalParticipants !== undefined && (
                  <StatPill
                    icon={Users}
                    label={`${totalParticipants.toLocaleString()} participants`}
                  />
                )}
                {totalCompletions !== undefined && totalCompletions > 0 && (
                  <StatPill
                    icon={CheckCircle2}
                    label={`${totalCompletions.toLocaleString()} completions`}
                  />
                )}
              </div>

              <Button asChild className="w-full justify-between sm:w-auto">
                <Link href={href}>
                  Explore program
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-muted via-muted/80 to-muted-foreground/10" />
          )}
          {/* Badge overlay */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="shadow-sm">
              {typeLabel}
            </Badge>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <Link href={href} className="hover:text-primary transition-colors mb-3">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">{program.name}</h3>
          </Link>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-auto">
            {program.type === 'course' && cohortCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span>
                  {cohortCount} {cohortCount === 1 ? 'cohort' : 'cohorts'}
                </span>
              </div>
            )}
            {totalParticipants !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>{totalParticipants} participants</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
