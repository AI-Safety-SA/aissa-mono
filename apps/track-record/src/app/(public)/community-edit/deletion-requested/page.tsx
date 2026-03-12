import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  COMMUNITY_SUPPORT_EMAIL,
  getCommunitySupportMailtoLink,
} from '@/utilities/community/support-contact'
import { CommunityEditShell } from '../_components/community-edit-shell'

export default function CommunityEditDeletionRequestedPage() {
  return (
    <CommunityEditShell
      step={8}
      title="Deletion Request Submitted"
      description="Your anonymisation request is now pending identity confirmation."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Thank You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="m-0 text-muted-foreground">
            We received your full anonymisation request. A reviewer will confirm your verified
            identity details and process irreversible anonymisation.
          </p>
          <p className="m-0 text-muted-foreground">
            If you have concerns about this process, contact{' '}
            <a className="underline hover:text-foreground" href={getCommunitySupportMailtoLink()}>
              {COMMUNITY_SUPPORT_EMAIL}
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </CommunityEditShell>
  )
}
