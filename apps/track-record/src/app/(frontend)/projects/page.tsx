import { getPayload } from 'payload'
import config from '@/payload.config'
import { ProjectCard } from '@/components/dashboard/project-card'
import { PageHeader } from '@/components/ui/page-header'
import type { Project } from '@/payload-types'

export const metadata = {
  title: 'Projects | AISSA Track Record',
  description: "AISSA's projects: research, tools, and submissions.",
}

// Force dynamic rendering to prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const payload = await getPayload({ config })

  const projects = await payload.find({
    collection: 'projects',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    sort: '-createdAt',
    depth: 1,
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader
        title="Projects"
        description="Research, tools, and submissions produced by the AISSA community."
        size="compact"
        leftClassName="max-w-3xl"
      />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {projects.totalDocs === 0 ? (
            <p className="text-muted-foreground">No projects to display yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.docs.map((project) => (
                <ProjectCard key={(project as Project).id} project={project as Project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

