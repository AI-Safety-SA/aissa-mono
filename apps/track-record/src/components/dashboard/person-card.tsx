import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Person } from '@/payload-types'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  FEATURED_TIER_CONTENT,
  resolveFeaturedTier,
  type FeaturedTier,
} from '@/lib/featured-people'
import { extractPlainText } from '@/lib/utils'
import { impactStageLabels } from '@/lib/types'
import { Activity, Sparkles, Star } from 'lucide-react'

const TIER_ACCENT_CLASS_NAMES: Record<FeaturedTier, string> = {
  top: 'border-primary/30 bg-secondary/40 shadow-lg',
  team: 'border-primary/20 bg-secondary/25 shadow-md',
  other: 'border-border bg-accent/20 shadow-md',
}

interface PersonCardProps {
  person: Person
}

export function PersonCard({ person }: PersonCardProps) {
  const headshot = person.headshot && typeof person.headshot === 'object' ? person.headshot : null
  const displayName = person.preferredName || person.fullName
  const featuredTier = resolveFeaturedTier(person)
  const featuredContent = featuredTier ? FEATURED_TIER_CONTENT[featuredTier] : null
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
  const cardAccentClassName = featuredTier ? TIER_ACCENT_CLASS_NAMES[featuredTier] : ''

  return (
    <Card
      className={cn(
        'group flex h-full flex-col overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        cardAccentClassName,
      )}
    >
      <CardContent className="p-6 flex flex-col h-full gap-4">
        <div className="flex items-start gap-4">
          <Avatar size="lg" className="ring-2 ring-primary/10 transition-all group-hover:ring-primary/30">
            {headshot?.url ? (
              <AvatarImage
                src={headshot.url}
                alt={headshot.alt || displayName}
                sizes="56px"
              />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link href={`/people/${person.id}`} className="hover:text-primary transition-colors">
              <h3 className="text-lg font-semibold leading-tight truncate">{displayName}</h3>
            </Link>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {featuredContent ? (
                <Badge variant="outline" className="border-current/20 bg-background/70">
                  {featuredContent.badge}
                </Badge>
              ) : null}
              {impactStage && (
                <Badge variant="secondary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {impactStage}
                </Badge>
              )}
            </div>
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
