import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Person, Media } from '@/payload-types'
import Link from 'next/link'
import Image from 'next/image'
import { extractPlainText } from '@/lib/utils'
import { impactStageLabels } from '@/lib/types'

interface PersonCardProps {
  person: Person
}

export function PersonCard({ person }: PersonCardProps) {
  const headshot = person.headshot && typeof person.headshot === 'object' ? person.headshot : null
  const displayName = person.preferredName || person.fullName
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const storyExcerpt = extractPlainText(person.featuredStory, 120)
  const impactStage = person.current_impact_stage
    ? impactStageLabels[person.current_impact_stage]
    : null

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardContent className="p-6 flex flex-col h-full gap-4">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
            {headshot?.url ? (
              <Image
                src={headshot.url}
                alt={headshot.alt || displayName}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/people/${person.id}`}
              className="hover:underline underline-offset-4"
            >
              <h3 className="text-lg font-semibold leading-tight truncate">{displayName}</h3>
            </Link>
            {impactStage && (
              <Badge variant="secondary" className="mt-1.5">
                {impactStage}
              </Badge>
            )}
          </div>
        </div>

        {storyExcerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {storyExcerpt}
          </p>
        )}

        <div className="mt-auto flex gap-4 text-sm text-muted-foreground">
          {person.totalEngagements !== null && person.totalEngagements !== undefined && (
            <span>{person.totalEngagements} engagements</span>
          )}
          {person.totalImpacts !== null && person.totalImpacts !== undefined && (
            <span>{person.totalImpacts} impacts</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
