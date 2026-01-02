import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Program, Event, Project, Testimonial, Cohort } from '@/payload-types'

export interface ImpactStats {
  totalParticipants: number
  totalEvents: number
  totalPrograms: number
  totalProjects: number
}

export async function getImpactStats(): Promise<ImpactStats> {
  const payload = await getPayload({ config })

  // Get all published cohorts to count participants
  const cohorts = await payload.find({
    collection: 'cohorts',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  // Get all published events
  const events = await payload.find({
    collection: 'events',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  // Get all published programs
  const programs = await payload.find({
    collection: 'programs',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  // Get all published projects
  const projects = await payload.find({
    collection: 'projects',
    where: {
      isPublished: { equals: true },
    },
    limit: 0,
    depth: 0,
  })

  // Calculate total participants from cohorts
  const totalParticipants = cohorts.docs.reduce((sum, cohort) => {
    return sum + (cohort.completionCount || 0)
  }, 0)

  return {
    totalParticipants,
    totalEvents: events.totalDocs,
    totalPrograms: programs.totalDocs,
    totalProjects: projects.totalDocs,
  }
}

export async function getFeaturedPrograms(limit: number = 6): Promise<Program[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'programs',
    where: {
      isPublished: { equals: true },
    },
    limit,
    sort: '-startDate',
    depth: 1,
  })

  return result.docs
}

export async function getRecentEvents(limit: number = 6): Promise<Event[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'events',
    where: {
      isPublished: { equals: true },
    },
    limit,
    sort: '-eventDate',
    depth: 1,
  })

  return result.docs
}

export async function getFeaturedProjects(limit: number = 6): Promise<Project[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'projects',
    where: {
      isPublished: { equals: true },
    },
    limit,
    sort: '-createdAt',
    depth: 1,
  })

  return result.docs
}

export async function getTestimonials(limit: number = 10): Promise<Testimonial[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'testimonials',
    where: {
      isPublished: { equals: true },
    },
    limit,
    sort: '-createdAt',
    depth: 1,
  })

  return result.docs
}

