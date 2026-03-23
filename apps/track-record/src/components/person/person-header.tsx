import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import type { Person } from '@/payload-types'
import { impactStageLabels } from '@/lib/types'
import { getMediaPublicUrl } from '@/utilities/media-url'
import { User, Activity, Star, Sparkles } from 'lucide-react'

interface PersonHeaderProps {
  person: Person
}

export function PersonHeader({ person }: PersonHeaderProps) {
  const displayName = person.preferredName || person.fullName
  const personTag = person.personTag?.trim() || 'Community Member'
  const headshot = person.headshot && typeof person.headshot === 'object' ? person.headshot : null
  const headshotUrl = getMediaPublicUrl(headshot)
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const impactStage = person.current_impact_stage
    ? impactStageLabels[person.current_impact_stage]
    : null

  return (
    <header className="border-b border-primary/10 bg-linear-to-br from-secondary/70 via-accent/25 to-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-6">
            <Avatar size="lg" className="h-24 w-24 ring-4 ring-primary/20 shadow-md md:h-32 md:w-32">
              {headshotUrl ? (
                <AvatarImage
                  src={headshotUrl}
                  alt={headshot?.alt || displayName}
                  sizes="(max-width: 768px) 96px, 128px"
                  priority
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-3xl font-semibold text-primary/60 md:text-4xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider text-primary/80">
                  {personTag}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {displayName}
              </h1>
              {impactStage && (
                <Badge variant="default" className="text-sm">
                  {impactStage} Stage
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-8 rounded-xl border border-primary/10 p-6 bg-card/80 backdrop-blur-sm shadow-md">
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Engagements</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {person.totalEngagements || 0}
              </div>
            </div>
            <div className="border-r border-border/60" />
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Impacts</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {person.totalImpacts || 0}
              </div>
            </div>
            <div className="border-r border-border/60" />
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contributions</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {person.totalContributions || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
