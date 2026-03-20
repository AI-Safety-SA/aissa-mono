import { getPublishedGrants } from '@/lib/data'
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
import { format } from 'date-fns'

export const metadata = {
  title: 'Grants | AISSA Track Record',
  description: 'Grant funding received by AI Safety South Africa.',
}

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  applied: 'Applied',
  awarded: 'Awarded',
  active: 'Active',
  completed: 'Completed',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  applied: 'outline',
  awarded: 'default',
  active: 'default',
  completed: 'secondary',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatGrantPeriod(start?: string | null, end?: string | null): string {
  if (!start && !end) return '-'
  const fmt = (d: string) => format(new Date(d), 'MMM yyyy')
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `From ${fmt(start)}`
  return `Until ${fmt(end!)}`
}

export default async function GrantsPage() {
  const grants = await getPublishedGrants()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Grants"
        description="Funding supporting AI safety research and capacity building in South Africa."
        size="compact"
        leftClassName="max-w-3xl"
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {grants.length === 0 ? (
            <p className="text-muted-foreground">No grants to display yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Funder</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant) => (
                    <TableRow key={grant.id}>
                      <TableCell className="font-medium">{grant.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {grant.funder || '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(grant.dollarAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatGrantPeriod(grant.grantPeriodStart, grant.grantPeriodEnd)}
                      </TableCell>
                      <TableCell>
                        {grant.status && (
                          <Badge variant={statusVariants[grant.status] || 'secondary'}>
                            {statusLabels[grant.status] || grant.status}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
