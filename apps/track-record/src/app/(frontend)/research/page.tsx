import { getPublishedResearch } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getAuthorNames,
  getPublicationYear,
  getResearchExternalUrl,
  getResearchStatusLabel,
  getResearchStatusVariant,
  getResearchVenueLabel,
} from '@/lib/research-display'

export const metadata = {
  title: 'Research | AISSA Track Record',
  description: 'Research publications from the AI Safety South Africa community.',
}

export const dynamic = 'force-dynamic'

export default async function ResearchPage() {
  const research = await getPublishedResearch()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Research"
        description="Publications and papers from the AI safety research community in South Africa."
        size="compact"
        leftClassName="max-w-3xl"
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {research.length === 0 ? (
            <p className="text-muted-foreground">No research publications to display yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Authors</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {research.map((item) => {
                    const externalUrl = getResearchExternalUrl(item)
                    const authors = getAuthorNames(item.authors)
                    const publicationYear = getPublicationYear(item.publicationDate)
                    const statusLabel = getResearchStatusLabel(item.status)
                    const venueLabel = getResearchVenueLabel(item.venueType)

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="min-w-80 font-medium">
                          {externalUrl ? (
                            <a
                              href={externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline underline-offset-4 text-primary"
                            >
                              {item.title}
                            </a>
                          ) : (
                            item.title
                          )}
                        </TableCell>
                        <TableCell className="min-w-64 text-muted-foreground">
                          {authors || '-'}
                        </TableCell>
                        <TableCell className="min-w-56">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.acceptedVenue ? (
                              <span className="font-medium">{item.acceptedVenue}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                            {venueLabel && <Badge variant="outline">{venueLabel}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {publicationYear || '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {statusLabel ? (
                            <Badge variant={getResearchStatusVariant(item.status)}>
                              {statusLabel}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
