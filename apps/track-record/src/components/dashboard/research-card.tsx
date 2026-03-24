import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Research } from '@/payload-types'
import {
  getAuthorNames,
  getPublicationYearMonth,
  getResearchExternalUrl,
  getResearchStatusLabel,
  getResearchStatusVariant,
  getResearchVenueLabel,
} from '@/lib/research-display'
import { ExternalLink, Calendar, BookOpen } from 'lucide-react'

interface ResearchCardProps {
  research: Research
}

export function ResearchCard({ research }: ResearchCardProps) {
  const statusLabel = getResearchStatusLabel(research.status)
  const statusVariant = getResearchStatusVariant(research.status)
  const venueLabel = getResearchVenueLabel(research.venueType)
  const authorNames = getAuthorNames(research.authors)
  const pubDate = getPublicationYearMonth(research.publicationDate)
  const externalUrl = getResearchExternalUrl(research)

  return (
    <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{research.title}</CardTitle>
            {authorNames && (
              <CardDescription className="line-clamp-1">{authorNames}</CardDescription>
            )}
          </div>
          {research.status && (
            <Badge variant={statusVariant} className="shrink-0">
              {statusLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 mt-auto space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {research.venueType && (
            <Badge variant="outline" className="text-xs">
              <BookOpen className="mr-1 h-3 w-3" />
              {venueLabel}
            </Badge>
          )}
          {research.acceptedVenue && <span className="line-clamp-1">{research.acceptedVenue}</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          {pubDate && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {pubDate}
            </div>
          )}
          {externalUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3 w-3" />
                Open paper
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
