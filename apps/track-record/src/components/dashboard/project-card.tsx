import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Project } from '@/payload-types'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'

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

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  in_progress: 'secondary',
  submitted: 'outline',
  accepted: 'default',
  published: 'default',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const typeLabel = projectTypeLabels[project.type || ''] || project.type
  const statusLabel = statusLabels[project.project_status || ''] || project.project_status
  const statusVariant = statusVariants[project.project_status || ''] || 'secondary'

  return (
    <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <Link
              href={`/projects/${project.slug}`}
              className="hover:text-primary transition-colors"
            >
              <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
            </Link>
            <CardDescription>{typeLabel}</CardDescription>
          </div>
          <Badge variant={statusVariant} className="shrink-0">
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2 pt-0 mt-auto">
        {project.linkUrl && (
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={project.linkUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-3 w-3" />
              View
            </a>
          </Button>
        )}
        {project.repositoryUrl && (
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-3 w-3" />
              Code
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
