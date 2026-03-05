import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Research, Person } from '@/payload-types'
import { ExternalLink, Calendar, BookOpen } from 'lucide-react'
import { format } from 'date-fns'

interface ResearchCardProps {
  research: Research
}

const venueTypeLabels: Record<string, string> = {
  journal: 'Journal',
  conference: 'Conference',
  workshop: 'Workshop',
  preprint: 'Preprint',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  accepted: 'Accepted',
  published: 'Published',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  submitted: 'outline',
  accepted: 'default',
  published: 'default',
}

function getAuthorNames(authors: Research['authors']): string {
  if (!authors || authors.length === 0) return ''
  return authors
    .map((a) => {
      if (typeof a.person === 'object' && a.person) {
        return (a.person as Person).fullName
      }
      return a.name || ''
    })
    .filter(Boolean)
    .join(', ')
}

export function ResearchCard({ research }: ResearchCardProps) {
  const statusLabel = statusLabels[research.status || ''] || research.status
  const statusVariant = statusVariants[research.status || ''] || 'secondary'
  const venueLabel = venueTypeLabels[research.venueType || ''] || research.venueType
  const authorNames = getAuthorNames(research.authors)
  const pubDate = research.publicationDate
    ? format(new Date(research.publicationDate), 'MMM yyyy')
    : null

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
          {research.acceptedVenue && (
            <span className="line-clamp-1">{research.acceptedVenue}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {pubDate && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {pubDate}
            </div>
          )}
          {research.arxivLink && (
            <Button variant="outline" size="sm" asChild>
              <a href={research.arxivLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3 w-3" />
                arXiv
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
