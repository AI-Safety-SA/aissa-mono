import { Card, CardContent } from '@/components/ui/card'
import type { Person } from '@/payload-types'
import Link from 'next/link'
import Image from 'next/image'
import { Target, Sparkles } from 'lucide-react'

interface CommunityPersonCardProps {
  person: Person
}

export function CommunityPersonCard({ person }: CommunityPersonCardProps) {
  const headshot = person.headshot && typeof person.headshot === 'object' ? person.headshot : null
  const displayName = person.preferredName || person.fullName
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            {headshot?.url ? (
              <Image
                src={headshot.url}
                alt={headshot.alt || displayName}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/people/${person.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-semibold leading-tight truncate">{displayName}</h3>
            </Link>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
              {person.totalEngagements !== null && person.totalEngagements !== undefined && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-primary" />
                  <span>{person.totalEngagements} engagements</span>
                </div>
              )}
              {person.totalImpacts !== null &&
                person.totalImpacts !== undefined &&
                person.totalImpacts > 0 && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>{person.totalImpacts} impacts</span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
