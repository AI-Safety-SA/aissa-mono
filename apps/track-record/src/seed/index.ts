/**
 * Main seed script for AISSA Track Record data
 * Uses Payload's Local API to seed the database
 */

import { getPayload } from 'payload'
import config from '../payload.config'
import { organisations } from './data/organisations'
import { persons } from './data/persons'
import { partnerships } from './data/partnerships'
import { programs } from './data/programs'
import { cohorts } from './data/cohorts'
import { events } from './data/events'
import { projects } from './data/projects'

interface SeedResult {
  collection: string
  created: number
  skipped: number
  errors: string[]
}

async function seed() {
  console.log('🌱 Starting AISSA Track Record seed...\n')

  const payload = await getPayload({ config })
  const results: SeedResult[] = []

  try {
    // Phase 1: Foundation - Organisations and Persons
    console.log('📦 Phase 1: Seeding foundation data...')
    
    const orgMap = new Map<string, number>()
    const personMap = new Map<string, number>()
    const partnershipMap = new Map<string, number>()
    const programMap = new Map<string, number>()

    // Seed Organisations
    console.log('  → Seeding organisations...')
    let orgCreated = 0
    let orgSkipped = 0
    const orgErrors: string[] = []
    
    for (const org of organisations) {
      try {
        const existing = await payload.find({
          collection: 'organisations',
          where: { name: { equals: org.name } },
          limit: 1,
        })
        
        if (existing.totalDocs > 0) {
          orgMap.set(org.name, existing.docs[0].id)
          orgSkipped++
        } else {
          const created = await payload.create({
            collection: 'organisations',
            data: org as any,
          })
          orgMap.set(org.name, created.id)
          orgCreated++
        }
      } catch (error) {
        orgErrors.push(`${org.name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'organisations', created: orgCreated, skipped: orgSkipped, errors: orgErrors })
    console.log(`    ✓ Created: ${orgCreated}, Skipped: ${orgSkipped}`)

    // Seed Persons
    console.log('  → Seeding persons...')
    let personCreated = 0
    let personSkipped = 0
    const personErrors: string[] = []
    
    for (const person of persons) {
      try {
        const existing = await payload.find({
          collection: 'persons',
          where: { email: { equals: person.email } },
          limit: 1,
        })
        
        if (existing.totalDocs > 0) {
          personMap.set(person.email, existing.docs[0].id)
          personSkipped++
        } else {
          const created = await payload.create({
            collection: 'persons',
            data: person,
          })
          personMap.set(person.email, created.id)
          personCreated++
        }
      } catch (error) {
        personErrors.push(`${person.email}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'persons', created: personCreated, skipped: personSkipped, errors: personErrors })
    console.log(`    ✓ Created: ${personCreated}, Skipped: ${personSkipped}`)

    // Create name-to-ID map for easier lookup
    const personNameMap = new Map<string, number>()
    for (const person of persons) {
      const personId = personMap.get(person.email)
      if (personId) {
        personNameMap.set(person.fullName, personId)
      }
    }

    // Phase 2: Relationships - Partnerships and Programs
    console.log('\n🔗 Phase 2: Seeding relationships...')

    // Seed Partnerships
    console.log('  → Seeding partnerships...')
    let partnershipCreated = 0
    let partnershipSkipped = 0
    const partnershipErrors: string[] = []
    
    for (const partnership of partnerships) {
      try {
        const orgId = orgMap.get(partnership.organisationName)
        if (!orgId) {
          partnershipErrors.push(`${partnership.organisationName}: Organisation not found`)
          continue
        }

        const existing = await payload.find({
          collection: 'partnerships',
          where: {
            and: [
              { organisation: { equals: orgId } },
              { type: { equals: partnership.type } },
            ],
          },
          limit: 1,
        })
        
        if (existing.totalDocs > 0) {
          partnershipMap.set(`${partnership.organisationName}-${partnership.type}`, existing.docs[0].id)
          partnershipSkipped++
        } else {
          const created = await payload.create({
            collection: 'partnerships',
            data: {
              organisation: orgId,
              type: partnership.type as 'venue' | 'funding' | 'collaboration' | 'media',
              description: partnership.description,
              startDate: partnership.startDate,
              endDate: 'endDate' in partnership ? (partnership.endDate as string | undefined) : undefined,
              isActive: partnership.isActive,
            },
          })
          partnershipMap.set(`${partnership.organisationName}-${partnership.type}`, created.id)
          partnershipCreated++
        }
      } catch (error) {
        partnershipErrors.push(`${partnership.organisationName}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'partnerships', created: partnershipCreated, skipped: partnershipSkipped, errors: partnershipErrors })
    console.log(`    ✓ Created: ${partnershipCreated}, Skipped: ${partnershipSkipped}`)

    // Seed Programs
    console.log('  → Seeding programs...')
    let programCreated = 0
    let programSkipped = 0
    const programErrors: string[] = []
    
    for (const program of programs) {
      try {
        const existing = await payload.find({
          collection: 'programs',
          where: { slug: { equals: program.slug } },
          limit: 1,
        })
        
        if (existing.totalDocs > 0) {
          programMap.set(program.slug, existing.docs[0].id)
          programSkipped++
        } else {
          // Find partnership if specified
          let partnershipId: number | undefined
          if (program.partnershipName) {
            // Try to find a partnership for this organisation
            const orgId = orgMap.get(program.partnershipName)
            if (orgId) {
              const partnership = await payload.find({
                collection: 'partnerships',
                where: { organisation: { equals: orgId } },
                limit: 1,
              })
              if (partnership.totalDocs > 0) {
                partnershipId = partnership.docs[0].id
              }
            }
          }

          const created = await payload.create({
            collection: 'programs',
            data: {
              slug: program.slug,
              name: program.name,
              type: program.type as 'fellowship' | 'course' | 'coworking' | 'volunteer_program',
              partnership: partnershipId || undefined,
              startDate: program.startDate,
              endDate: program.endDate || undefined,
              description: program.description as any, // richText - seed data has plain strings
              metadata: program.metadata,
            },
          })
          programMap.set(program.slug, created.id)
          programCreated++
        }
      } catch (error) {
        programErrors.push(`${program.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'programs', created: programCreated, skipped: programSkipped, errors: programErrors })
    console.log(`    ✓ Created: ${programCreated}, Skipped: ${programSkipped}`)

    // Phase 3: Instances - Cohorts, Events, Projects
    console.log('\n📊 Phase 3: Seeding instances...')

    // Seed Cohorts
    console.log('  → Seeding cohorts...')
    let cohortCreated = 0
    let cohortSkipped = 0
    const cohortErrors: string[] = []
    
    for (const cohort of cohorts) {
      try {
        const programId = programMap.get(cohort.programSlug)
        if (!programId) {
          cohortErrors.push(`${cohort.slug}: Program ${cohort.programSlug} not found`)
          continue
        }

        const existing = await payload.find({
          collection: 'cohorts',
          where: { slug: { equals: cohort.slug } },
          limit: 1,
        })
        
        if (existing.totalDocs > 0) {
          cohortSkipped++
        } else {
          await payload.create({
            collection: 'cohorts',
            data: {
              program: programId,
              slug: cohort.slug,
              name: cohort.name,
              startDate: cohort.startDate,
              endDate: cohort.endDate || undefined,
              applicationCount: 'applicationCount' in cohort ? (cohort.applicationCount as number | undefined) : undefined,
              acceptedCount: 'acceptedCount' in cohort ? (cohort.acceptedCount as number | undefined) : undefined,
              completionCount: 'completionCount' in cohort ? (cohort.completionCount as number | undefined) : undefined,
              completionRate: 'completionRate' in cohort ? (cohort.completionRate as number | undefined) : undefined,
              averageRating: 'averageRating' in cohort ? (cohort.averageRating as number | undefined) : undefined,
              dropoutRate: 'dropoutRate' in cohort ? (cohort.dropoutRate as number | undefined) : undefined,
              metadata: cohort.metadata,
            },
          })
          cohortCreated++
        }
      } catch (error) {
        cohortErrors.push(`${cohort.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'cohorts', created: cohortCreated, skipped: cohortSkipped, errors: cohortErrors })
    console.log(`    ✓ Created: ${cohortCreated}, Skipped: ${cohortSkipped}`)

    // Seed Events
    console.log('  → Seeding events...')
    let eventCreated = 0
    let eventSkipped = 0
    const eventErrors: string[] = []
    const eventMap = new Map<string, number>()
    
    for (const event of events) {
      try {
        const organiserId = personNameMap.get(event.organiserName)
        if (!organiserId) {
          eventErrors.push(`${event.slug}: Organiser ${event.organiserName} not found`)
          continue
        }

        const existing = await payload.find({
          collection: 'events',
          where: { slug: { equals: event.slug } },
          limit: 1,
        })
        
        if (existing.totalDocs > 0) {
          eventMap.set(event.slug, existing.docs[0].id)
          eventSkipped++
        } else {
          const created = await payload.create({
            collection: 'events',
            data: {
              slug: event.slug,
              name: event.name,
              type: event.type as 'workshop' | 'talk' | 'meetup' | 'reading_group' | 'retreat' | 'panel',
              organiser: organiserId,
              eventDate: event.eventDate,
              attendanceCount: event.attendanceCount,
              location: event.location,
              metadata: event.metadata,
            },
          })
          eventMap.set(event.slug, created.id)
          eventCreated++
        }
      } catch (error) {
        eventErrors.push(`${event.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'events', created: eventCreated, skipped: eventSkipped, errors: eventErrors })
    console.log(`    ✓ Created: ${eventCreated}, Skipped: ${eventSkipped}`)

    // Seed Projects
    console.log('  → Seeding projects...')
    let projectCreated = 0
    let projectSkipped = 0
    const projectErrors: string[] = []
    const projectMap = new Map<string, number>()
    
    for (const project of projects) {
      try {
        const existing = await payload.find({
          collection: 'projects',
          where: { slug: { equals: project.slug } },
          limit: 1,
        })
        
        if (existing.totalDocs > 0) {
          projectMap.set(project.slug, existing.docs[0].id)
          projectSkipped++
        } else {
          // Find program if specified
          let programId: number | undefined
          if (project.programSlug) {
            programId = programMap.get(project.programSlug)
          }

          const created = await payload.create({
            collection: 'projects',
            data: {
              slug: project.slug,
              title: project.title,
              type: project.type as 'research_paper' | 'bounty_submission' | 'grant_award' | 'software_tool',
              project_status: project.project_status as 'in_progress' | 'submitted' | 'accepted' | 'published' | undefined,
              program: programId || undefined,
              linkUrl: project.linkUrl,
              repositoryUrl: 'repositoryUrl' in project ? (project.repositoryUrl as string | undefined) : undefined,
              metadata: project.metadata,
            },
          })
          projectMap.set(project.slug, created.id)
          projectCreated++
        }
      } catch (error) {
        projectErrors.push(`${project.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'projects', created: projectCreated, skipped: projectSkipped, errors: projectErrors })
    console.log(`    ✓ Created: ${projectCreated}, Skipped: ${projectSkipped}`)

    // Phase 4: Junction Tables - EventHosts, ProjectContributors
    console.log('\n🔗 Phase 4: Seeding junction tables...')

    // Seed EventHosts (for events with multiple hosts in metadata)
    console.log('  → Seeding event hosts...')
    let eventHostCreated = 0
    let eventHostSkipped = 0
    const eventHostErrors: string[] = []
    
    for (const event of events) {
      try {
        const eventId = eventMap.get(event.slug)
        if (!eventId) continue

        // Check if event has panelists/speakers
        const hosts = event.metadata?.panelists || event.metadata?.speakers || []
        if (Array.isArray(hosts)) {
          for (const hostName of hosts) {
            const hostId = personNameMap.get(hostName)
            if (hostId) {
              try {
                await payload.create({
                  collection: 'event-hosts',
                  data: {
                    event: eventId,
                    person: hostId,
                  },
                })
                eventHostCreated++
              } catch (error) {
                // Skip if already exists (handled by hook)
                eventHostSkipped++
              }
            }
          }
        }
      } catch (error) {
        eventHostErrors.push(`${event.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'event-hosts', created: eventHostCreated, skipped: eventHostSkipped, errors: eventHostErrors })
    console.log(`    ✓ Created: ${eventHostCreated}, Skipped: ${eventHostSkipped}`)

    // Seed ProjectContributors
    console.log('  → Seeding project contributors...')
    let projectContributorCreated = 0
    let projectContributorSkipped = 0
    const projectContributorErrors: string[] = []
    
    for (const project of projects) {
      try {
        const projectId = projectMap.get(project.slug)
        if (!projectId) continue

        const authors = project.metadata?.authors || []
        if (Array.isArray(authors)) {
          for (let i = 0; i < authors.length; i++) {
            const authorName = authors[i]
            const authorId = personNameMap.get(authorName)
            if (authorId) {
              try {
                await payload.create({
                  collection: 'project-contributors',
                  data: {
                    project: projectId,
                    person: authorId,
                    role: i === 0 ? 'lead_author' : 'co_author',
                  },
                })
                projectContributorCreated++
              } catch (error) {
                // Skip if already exists (handled by hook)
                projectContributorSkipped++
              }
            }
          }
        }
      } catch (error) {
        projectContributorErrors.push(`${project.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    results.push({ collection: 'project-contributors', created: projectContributorCreated, skipped: projectContributorSkipped, errors: projectContributorErrors })
    console.log(`    ✓ Created: ${projectContributorCreated}, Skipped: ${projectContributorSkipped}`)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Seed Summary')
    console.log('='.repeat(60))
    
    let totalCreated = 0
    let totalSkipped = 0
    let totalErrors = 0

    for (const result of results) {
      totalCreated += result.created
      totalSkipped += result.skipped
      totalErrors += result.errors.length
      
      console.log(`\n${result.collection}:`)
      console.log(`  Created: ${result.created}`)
      console.log(`  Skipped: ${result.skipped}`)
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.length}`)
        result.errors.forEach(err => console.log(`    - ${err}`))
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`Total Created: ${totalCreated}`)
    console.log(`Total Skipped: ${totalSkipped}`)
    console.log(`Total Errors: ${totalErrors}`)
    console.log('='.repeat(60))

    if (totalErrors > 0) {
      console.log('\n⚠️  Some errors occurred during seeding. Please review the output above.')
      process.exit(1)
    } else {
      console.log('\n✅ Seed completed successfully!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error)
    process.exit(1)
  }
}

// Run seed if called directly
seed().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})

export default seed

