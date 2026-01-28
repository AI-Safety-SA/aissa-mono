import { format } from 'date-fns'
import { Calendar, ExternalLink, Activity } from 'lucide-react'
import { getPersonById } from '@/lib/data'

interface PersonSidebarProps {
  personId: number
}

export async function PersonSidebar({ personId }: PersonSidebarProps) {
  const person = await getPersonById(personId)

  if (!person) {
    return null
  }

  return (
    <aside className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Quick Info</h3>
        <div className="space-y-4">
          {person.joinedAt && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Joined</div>
                <div className="font-medium">{format(new Date(person.joinedAt), 'MMMM yyyy')}</div>
              </div>
            </div>
          )}
          {person.firstEngagementDate && (
            <div className="flex items-center gap-3 text-sm">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">First Engagement</div>
                <div className="font-medium">
                  {format(new Date(person.firstEngagementDate), 'MMMM yyyy')}
                </div>
              </div>
            </div>
          )}
          {person.websiteUrl && (
            <div className="flex items-center gap-3 text-sm">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Website</div>
                <a
                  href={person.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  Visit website
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
