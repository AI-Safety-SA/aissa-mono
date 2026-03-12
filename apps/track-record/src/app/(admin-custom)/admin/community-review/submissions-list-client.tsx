'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CommunitySubmission, Person } from '@/payload-types'

type Props = {
  submissions: CommunitySubmission[]
}

const statusVariant: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  approved: 'default',
  draft: 'outline',
  partial: 'secondary',
  pending_review: 'secondary',
  pending_verification: 'outline',
  rejected: 'destructive',
}

const statusLabel: Record<string, string> = {
  approved: 'Approved',
  draft: 'Draft',
  partial: 'Partial',
  pending_review: 'Pending Review',
  pending_verification: 'Pending Verification',
  rejected: 'Rejected',
}

function getPersonName(person: CommunitySubmission['person']): string {
  if (!person) return 'Unknown'
  if (typeof person === 'number') return `Person #${person}`
  return (person as Person).fullName || `Person #${person.id}`
}

function hasPendingCriticalDeletion(submission: CommunitySubmission): boolean {
  return submission.deletionRequested === true && submission.deletionReviewStatus === 'pending'
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SubmissionsListClient({ submissions }: Props) {
  const pending = submissions.filter((s) => s.status === 'pending_review')
  const rest = submissions.filter((s) => s.status !== 'pending_review')

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community Submissions</h1>
        <Link
          href="/admin"
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Back to Admin
        </Link>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Review ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionTable submissions={pending} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {pending.length > 0 ? 'Other Submissions' : 'All Submissions'} ({rest.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rest.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions found.</p>
          ) : (
            <SubmissionTable submissions={rest} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SubmissionTable({ submissions }: { submissions: CommunitySubmission[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">ID</th>
            <th className="pb-2 pr-4 font-medium">Person</th>
            <th className="pb-2 pr-4 font-medium">Email</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Submitted</th>
            <th className="pb-2 pr-4 font-medium">Reviewed</th>
            <th className="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono text-xs">#{sub.id}</td>
              <td className="py-3 pr-4">{getPersonName(sub.person)}</td>
              <td className="py-3 pr-4 text-muted-foreground">{sub.email}</td>
              <td className="py-3 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[sub.status] || 'outline'}>
                    {statusLabel[sub.status] || sub.status}
                  </Badge>
                  {hasPendingCriticalDeletion(sub) ? (
                    <Badge variant="destructive">Delete Pending</Badge>
                  ) : null}
                </div>
              </td>
              <td className="py-3 pr-4 text-muted-foreground text-xs">
                {formatDate(sub.submittedAt)}
              </td>
              <td className="py-3 pr-4 text-muted-foreground text-xs">
                {formatDate(sub.reviewedAt)}
              </td>
              <td className="py-3">
                <Link
                  href={`/admin/community-review/${sub.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
