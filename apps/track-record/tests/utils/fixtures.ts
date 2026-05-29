import type { Payload } from 'payload'

/**
 * Test data factories for creating test records
 * Each factory accepts a Payload instance and optional overrides
 */

export interface CreatePersonOverrides {
  email?: string
  fullName?: string
  preferredName?: string
  bio?: string
  isPublished?: boolean
  highlight?: boolean
  [key: string]: unknown
}

export async function createTestPerson(
  payload: Payload,
  overrides: CreatePersonOverrides = {},
): Promise<{ id: number; email: string }> {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)

  const person = await payload.create({
    collection: 'persons',
    data: {
      email: overrides.email || `test-person-${timestamp}-${random}@example.com`,
      fullName: overrides.fullName || `Test Person ${timestamp}`,
      preferredName: overrides.preferredName,
      bio: overrides.bio || 'Test bio',
      isPublished: overrides.isPublished ?? false,
      highlight: overrides.highlight ?? false,
      ...overrides,
    },
  })

  return { id: person.id, email: person.email }
}

export interface CreateEventOverrides {
  slug?: string
  name?: string
  type?: 'workshop' | 'talk' | 'meetup' | 'reading_group' | 'retreat' | 'panel'
  organiser?: number
  eventDate?: string
  location?: string
  isPublished?: boolean
  [key: string]: unknown
}

export async function createTestEvent(
  payload: Payload,
  overrides: CreateEventOverrides = {},
): Promise<{ id: number; slug: string }> {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)

  // Create a test person for organiser if not provided
  let organiserId = overrides.organiser
  if (!organiserId) {
    const person = await createTestPerson(payload)
    organiserId = person.id
  }

  const event = await payload.create({
    collection: 'events',
    data: {
      slug: overrides.slug || `test-event-${timestamp}-${random}`,
      name: overrides.name || `Test Event ${timestamp}`,
      type: overrides.type || 'workshop',
      organiser: organiserId,
      eventDate: overrides.eventDate || new Date().toISOString(),
      location: overrides.location || 'online',
      isPublished: overrides.isPublished ?? false,
      ...overrides,
    },
  })

  return { id: event.id, slug: event.slug }
}

export interface CreateProgramOverrides {
  slug?: string
  name?: string
  type?: 'fellowship' | 'course' | 'hackathon' | 'coworking' | 'volunteer_program' | 'retreat'
  startDate?: string
  endDate?: string
  isPublished?: boolean
  [key: string]: unknown
}

export async function createTestProgram(
  payload: Payload,
  overrides: CreateProgramOverrides = {},
): Promise<{ id: number; slug: string }> {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)

  const program = await payload.create({
    collection: 'programs',
    data: {
      slug: overrides.slug || `test-program-${timestamp}-${random}`,
      name: overrides.name || `Test Program ${timestamp}`,
      type: overrides.type || 'fellowship',
      startDate: overrides.startDate || new Date().toISOString().split('T')[0],
      endDate: overrides.endDate,
      isPublished: overrides.isPublished ?? false,
      ...overrides,
    },
  })

  return { id: program.id, slug: program.slug }
}

export interface CreateProjectOverrides {
  slug?: string
  title?: string
  type?: 'research_paper' | 'bounty_submission' | 'grant_award' | 'software_tool'
  project_status?: 'in_progress' | 'submitted' | 'accepted' | 'published'
  program?: number | null
  isPublished?: boolean
  [key: string]: unknown
}

export async function createTestProject(
  payload: Payload,
  overrides: CreateProjectOverrides = {},
): Promise<{ id: number; slug: string }> {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)

  const project = await payload.create({
    collection: 'projects',
    data: {
      slug: overrides.slug || `test-project-${timestamp}-${random}`,
      title: overrides.title || `Test Project ${timestamp}`,
      type: overrides.type || 'research_paper',
      project_status: overrides.project_status || 'in_progress',
      program: overrides.program ?? null,
      isPublished: overrides.isPublished ?? false,
      ...overrides,
    },
  })

  return { id: project.id, slug: project.slug }
}

export interface CreateOrganisationOverrides {
  name?: string
  type?: 'university' | 'corporate' | 'nonprofit' | 'government'
  website?: string
  isPartnershipActive?: boolean
  [key: string]: unknown
}

export async function createTestOrganisation(
  payload: Payload,
  overrides: CreateOrganisationOverrides = {},
): Promise<{ id: number; name: string }> {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)

  const organisation = await payload.create({
    collection: 'organisations',
    data: {
      name: overrides.name || `Test Organisation ${timestamp}`,
      type: overrides.type || 'nonprofit',
      website: overrides.website || `https://example-${random}.com`,
      isPartnershipActive: overrides.isPartnershipActive ?? false,
      ...overrides,
    },
  })

  return { id: organisation.id, name: organisation.name }
}

export interface CreatePartnershipOverrides {
  program?: number
  organisation?: number
  type?: 'venue' | 'funding' | 'collaboration' | 'media'
  startDate?: string
  endDate?: string
  isActive?: boolean
  [key: string]: unknown
}

export async function createTestPartnership(
  payload: Payload,
  overrides: CreatePartnershipOverrides = {},
): Promise<{ id: number }> {
  // Create a test program if not provided
  let programId = overrides.program
  if (!programId) {
    const program = await createTestProgram(payload)
    programId = program.id
  }

  // Create a test organisation if not provided
  let organisationId = overrides.organisation
  if (!organisationId) {
    const org = await createTestOrganisation(payload)
    organisationId = org.id
  }

  const partnership = await payload.create({
    collection: 'partnerships',
    data: {
      program: programId,
      organisation: organisationId,
      type: overrides.type || 'collaboration',
      startDate: overrides.startDate || new Date().toISOString().split('T')[0],
      endDate: overrides.endDate,
      isActive: overrides.isActive ?? true,
      ...overrides,
    } as any,
  })

  return { id: partnership.id }
}

export interface CreateCohortOverrides {
  program?: number
  name?: string
  startDate?: string
  endDate?: string
  [key: string]: unknown
}

export async function createTestCohort(
  payload: Payload,
  overrides: CreateCohortOverrides = {},
): Promise<{ id: number }> {
  // Create a test program if not provided
  let programId = overrides.program
  if (!programId) {
    const program = await createTestProgram(payload)
    programId = program.id
  }

  const timestamp = Date.now()

  const cohort = await payload.create({
    collection: 'cohorts',
    data: {
      program: programId,
      name: overrides.name || `Test Cohort ${timestamp}`,
      startDate: overrides.startDate || new Date().toISOString().split('T')[0],
      endDate: overrides.endDate,
      ...overrides,
    } as any,
  })

  return { id: cohort.id }
}

export interface CreateEngagementOverrides {
  person?: number
  context?: number | { relationTo: 'events' | 'programs' | 'cohorts'; value: number }
  contextKind?: 'event' | 'program' | 'cohort'
  engagementDate?: string
  [key: string]: unknown
}

export async function createTestEngagement(
  payload: Payload,
  overrides: CreateEngagementOverrides = {},
): Promise<{ id: number }> {
  // Create a test person if not provided
  let personId = overrides.person
  if (!personId) {
    const person = await createTestPerson(payload)
    personId = person.id
  }

  // Create context based on contextKind if not provided
  let contextValue:
    | number
    | { relationTo: 'events' | 'programs' | 'cohorts'; value: number }
    | undefined = overrides.context as
    | number
    | { relationTo: 'events' | 'programs' | 'cohorts'; value: number }
    | undefined
  if (!contextValue) {
    if (overrides.contextKind === 'event') {
      const event = await createTestEvent(payload)
      contextValue = event.id
    } else if (overrides.contextKind === 'program') {
      const program = await createTestProgram(payload)
      contextValue = program.id
    } else if (overrides.contextKind === 'cohort') {
      const cohort = await createTestCohort(payload)
      contextValue = cohort.id
    } else {
      // Default to event
      const event = await createTestEvent(payload)
      contextValue = event.id
    }
  }

  // Format context properly for polymorphic relationship
  const context: { relationTo: 'events' | 'programs' | 'cohorts'; value: number } =
    typeof contextValue === 'number'
      ? {
          relationTo: (overrides.contextKind || 'event') as 'events' | 'programs' | 'cohorts',
          value: contextValue,
        }
      : contextValue

  const engagement = await payload.create({
    collection: 'engagements',
    data: {
      person: personId,
      context,
      contextKind: overrides.contextKind || 'event',
      engagementDate: overrides.engagementDate || new Date().toISOString(),
      ...overrides,
    } as any,
  })

  return { id: engagement.id }
}

export interface CreateUserOverrides {
  email?: string
  password?: string
  roles?: ('admin' | 'user')[]
  [key: string]: unknown
}

export async function createTestUser(
  payload: Payload,
  overrides: CreateUserOverrides = {},
): Promise<{ id: number; email: string }> {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)

  const user = await payload.create({
    collection: 'users',
    data: {
      email: overrides.email || `test-user-${timestamp}-${random}@example.com`,
      password: overrides.password || 'test-password-123',
      roles: overrides.roles || ['user'],
      ...overrides,
    },
  })

  return { id: user.id, email: user.email }
}
