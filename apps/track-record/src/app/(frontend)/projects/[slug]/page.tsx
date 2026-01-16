import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/ui/back-button'
import { FolderKanban, ExternalLink as ExternalLinkIcon, Github, GraduationCap } from 'lucide-react'
import type { Project, Program } from '@/payload-types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'projects',
    where: {
      slug: { equals: slug },
      isPublished: { equals: true },
    },
    limit: 1,
    depth: 1,
  })

  if (!result.docs.length) {
    notFound()
  }

  const project = result.docs[0] as Project
  const program = project.program as Program | null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <BackButton className="mb-6" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Project Showcase
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{project.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <Badge variant="secondary" className="text-sm">
                  {project.type.replace('_', ' ')}
                </Badge>
                <Badge variant={project.project_status === 'published' ? 'default' : 'outline'} className="text-sm">
                  {project.project_status?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {project.linkUrl && (
                <a
                  href={project.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  View Project <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </a>
              )}
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Repository
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">About the Project</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  This work represents a contribution to the global AI safety research field, 
                  developed within the South African context. The project explores technical 
                  alignment, governance, or interpretability challenges as identified in the 
                  community research agenda.
                </p>
              </div>
            </section>

            {program && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Origins</h2>
                <Link href={`/programs/${program.slug}`} className="block group">
                  <div className="border rounded-xl p-6 bg-card group-hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <GraduationCap className="h-10 w-10 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Developed during</div>
                        <h3 className="font-bold text-lg group-hover:underline underline-offset-4">{program.name}</h3>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}
          </div>
          
          <aside className="space-y-8">
            <div className="border rounded-2xl p-8 bg-muted/20 space-y-6">
              <h3 className="font-bold text-lg">Project Highlights</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-muted-foreground line-clamp-2">Technical contribution to AI safety research</span>
                </li>
                <li className="flex gap-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-muted-foreground line-clamp-2">Collaborative effort from AISSA community members</span>
                </li>
                <li className="flex gap-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="text-muted-foreground line-clamp-2">Addresses key alignment challenges</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
