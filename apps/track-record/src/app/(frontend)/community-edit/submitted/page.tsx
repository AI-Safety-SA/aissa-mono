import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CommunityEditShell } from '../_components/community-edit-shell'

export default function CommunityEditSubmittedPage() {
  return (
    <CommunityEditShell
      step={8}
      title="Submission Sent"
      description="Your updates are now pending admin review."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thank You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="m-0 text-muted-foreground">
            We received your community edit submission. A reviewer will validate changes before they
            appear in the live track record.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/community-edit">Start a New Submission</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </CommunityEditShell>
  )
}

