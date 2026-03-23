import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Person } from '@/payload-types'
import { getMediaPublicUrl } from '@/utilities/media-url'
import Link from 'next/link'
import { Building2, ExternalLink, User } from 'lucide-react'

interface CommunityPersonCardProps {
  person: Person
}

function getWebsiteHref(websiteUrl?: string | null): string | null {
  if (!websiteUrl) return null
  return /^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`
}

function getOrganisation(person: Person): string | null {
  if (person.organisation && person.organisation.trim()) {
    return person.organisation.trim()
  }

  if (!person.metadata || typeof person.metadata !== 'object' || Array.isArray(person.metadata)) {
    return null
  }

  const metadata = person.metadata as Record<string, unknown>
  const candidateKeys = ['organisation', 'organization', 'org', 'company', 'employer', 'affiliation', 'institution']

  for (const key of candidateKeys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

export function CommunityPersonCard({ person }: CommunityPersonCardProps) {
  const headshot = person.headshot && typeof person.headshot === 'object' ? person.headshot : null
  const headshotUrl = getMediaPublicUrl(headshot)
  const displayName = person.fullName
  const personTag = person.personTag?.trim() || 'Community Member'
  const websiteHref = getWebsiteHref(person.websiteUrl)
  const organisation = getOrganisation(person)
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card
      className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300"
      data-testid="community-person-card"
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar size="lg" className="ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            {headshotUrl ? (
              <AvatarImage
                src={headshotUrl}
                alt={headshot?.alt || displayName}
                sizes="56px"
              />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/people/${person.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-semibold leading-tight truncate">{displayName}</h3>
            </Link>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              <User className="h-3 w-3 text-primary" />
              <span>{personTag}</span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {organisation && (
                <div className="inline-flex items-center gap-1 min-w-0">
                  <Building2 className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{organisation}</span>
                </div>
              )}
              {websiteHref && (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
