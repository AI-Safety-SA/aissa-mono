import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Person } from '@/payload-types'
import Link from 'next/link'
import Image from 'next/image'
import { extractPlainText } from '@/lib/utils'
import { impactStageLabels } from '@/lib/types'
import { Activity, Sparkles, Star } from 'lucide-react'

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
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full gap-4">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            {headshot?.url ? (
              <Image
                src={headshot.url}
                alt={headshot.alt || displayName}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/people/${person.id}`} className="hover:text-primary transition-colors">
              <h3 className="text-lg font-semibold leading-tight truncate">{displayName}</h3>
            </Link>
            {impactStage && (
              <Badge variant="secondary" className="mt-1.5">
                <Sparkles className="h-3 w-3 mr-1" />
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

        <div className="mt-auto flex flex-wrap gap-4 text-sm text-muted-foreground">
          {person.totalEngagements !== null && person.totalEngagements !== undefined && (
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary" />
              <span>{person.totalEngagements} engagements</span>
            </div>
          )}
          {person.totalImpacts !== null && person.totalImpacts !== undefined && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary" />
              <span>{person.totalImpacts} impacts</span>
            </div>
          )}
          {person.totalContributions !== null && person.totalContributions !== undefined && (
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{person.totalContributions} contributions</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
