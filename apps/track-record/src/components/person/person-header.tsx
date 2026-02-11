import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { getPersonById } from '@/lib/data'
import { impactStageLabels } from '@/lib/types'
import { User, Activity, Star } from 'lucide-react'

interface PersonHeaderProps {
  personId: number
}

export async function PersonHeader({ personId }: PersonHeaderProps) {
  const person = await getPersonById(personId)

  if (!person || !person.isPublished) {
    notFound()
  }

  const displayName = person.preferredName || person.fullName
  const headshot = person.headshot && typeof person.headshot === 'object' ? person.headshot : null
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
    <header className="border-b bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted md:h-32 md:w-32">
              {headshot?.url ? (
                <Image
                  src={headshot.url}
                  alt={headshot.alt || displayName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 128px"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground md:text-4xl">
                  {initials}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Community Member
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {displayName}
              </h1>
              {impactStage && (
                <Badge variant="secondary" className="text-sm">
                  {impactStage} Stage
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-8 border rounded-lg p-6 bg-background shadow-sm">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Engagements</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {person.totalEngagements || 0}
              </div>
            </div>
            <div className="border-r" />
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Impacts</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {person.totalImpacts || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
