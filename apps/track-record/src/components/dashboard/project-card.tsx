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

// Fallback for legacy rows without persisted tier values.
const projectTierFallback: Record<string, 'gold' | 'silver' | 'bronze' | null> = {
  bounty_submission: 'gold',
  grant_award: 'gold',
  research_paper: 'silver',
  software_tool: 'silver',
  program_project: 'bronze',
  other: null,
}

const tierBorderClasses: Record<'gold' | 'silver' | 'bronze', string> = {
  gold: 'border-l-4 border-l-amber-400',
  silver: 'border-l-4 border-l-slate-400',
  bronze: 'border-l-4 border-l-amber-700/70',
}

const tierLabel: Record<'gold' | 'silver' | 'bronze', string> = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
}

export function ProjectCard({ project }: ProjectCardProps) {
  const typeLabel = projectTypeLabels[project.type || ''] || project.type
  const statusLabel = statusLabels[project.project_status || ''] || project.project_status
  const statusVariant = statusVariants[project.project_status || ''] || 'secondary'
  const tier = project.tier ?? projectTierFallback[project.type || ''] ?? null
  const borderClass = tier ? tierBorderClasses[tier] : ''

  return (
    <Card className={`h-full flex flex-col group hover:shadow-lg transition-all duration-300 ${borderClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <Link
              href={`/projects/${project.slug}`}
              className="hover:text-primary transition-colors"
            >
              <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
            </Link>
            <CardDescription className="flex items-center gap-1.5">
              {typeLabel}
              {tier && (
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide px-1 rounded ${
                    tier === 'gold'
                      ? 'text-amber-600 dark:text-amber-400'
                      : tier === 'silver'
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-amber-800/80 dark:text-amber-600'
                  }`}
                  title={`${tierLabel[tier]} tier project`}
                >
                  {tier === 'gold' ? '★' : tier === 'silver' ? '◆' : '●'} {tierLabel[tier]}
                </span>
              )}
            </CardDescription>
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
