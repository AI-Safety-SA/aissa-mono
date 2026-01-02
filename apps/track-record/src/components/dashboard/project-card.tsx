import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/payload-types'
import { ExternalLink } from 'lucide-react'

interface ProjectCardProps {
  project: Project
}

const projectTypeLabels: Record<string, string> = {
  research_paper: 'Research Paper',
  bounty_submission: 'Bounty Submission',
  grant_award: 'Grant Award',
  software_tool: 'Software Tool',
}

const statusLabels: Record<string, string> = {
  in_progress: 'In Progress',
  submitted: 'Submitted',
  accepted: 'Accepted',
  published: 'Published',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const typeLabel = projectTypeLabels[project.type || ''] || project.type
  const statusLabel = statusLabels[project.project_status || ''] || project.project_status

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <CardDescription>{typeLabel}</CardDescription>
          </div>
          <Badge variant={project.project_status === 'published' ? 'default' : 'secondary'}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        {project.linkUrl && (
          <a
            href={project.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            View Project <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        )}
        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            Repository <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}

