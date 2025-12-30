/**
 * CSV parsing utilities for event data imports
 */

import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

export interface FacilitatorImpactRow {
  submissionId: string
  respondentId: string
  submittedAt: string
  email: string
  fullName: string
  eventName: string
  eventType: string
  eventDate: string
  attendanceCount: string
  photos: string
  description: string
}

export interface ParticipantFeedbackRow {
  submissionId: string
  respondentId: string
  submittedAt: string
  fullName: string
  eventType: string
  eventDate: string
  facilitators: string
  rating: string
  beneficialAspects: string
  improvements: string
  futureEvents: string
  communicationChannels: string
  whatsapp: string
  slack: string
  mailingList: string
  email: string
  phone: string
  wouldRecommend: string
  referrals: string
  anythingElse: string
}

/**
 * Map CSV column names to interface property names for facilitator impact
 */
function mapFacilitatorImpactColumns(record: Record<string, string>): FacilitatorImpactRow {
  return {
    submissionId: record['Submission ID'] || '',
    respondentId: record['Respondent ID'] || '',
    submittedAt: record['Submitted at'] || '',
    email: record['Your email'] || '',
    fullName: record['Full name'] || '',
    eventName: record['What event did you host?'] || '',
    eventType: record['Event type'] || '',
    eventDate: record['What date was the event?'] || '',
    attendanceCount: record['How many people attended the event?'] || '',
    photos: record['Please upload some photos from the event'] || '',
    description: record['Briefly, what happened at the event and how did it go?'] || '',
  }
}

/**
 * Parse facilitator impact CSV file
 */
export function parseFacilitatorImpactCSV(filePath: string): FacilitatorImpactRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Handle inconsistent column counts
    relax_quotes: true, // Handle unescaped quotes
  }) as Record<string, string>[]

  return records.map(mapFacilitatorImpactColumns)
}

/**
 * Map CSV column names to interface property names for participant feedback
 */
function mapParticipantFeedbackColumns(record: Record<string, string>): ParticipantFeedbackRow {
  return {
    submissionId: record['Submission ID'] || '',
    respondentId: record['Respondent ID'] || '',
    submittedAt: record['Submitted at'] || '',
    fullName: record['Full name'] || '',
    eventType: record['Which event did you attend?'] || '',
    eventDate: record['What date was the event?'] || '',
    facilitators: record['Who facilitated the event?'] || '',
    rating: record['Overall, how would you rate the event on a scale from 1-10?'] || '',
    beneficialAspects: record['What aspects of the event were most beneficial?'] || '',
    improvements: record['What aspects of the event could we improve?'] || '',
    futureEvents: record['What kind of events do you hope to see us host in the future?'] || '',
    communicationChannels: record['Do you want to be added to our communication channels?'] || '',
    whatsapp: record['Do you want to be added to our communication channels? (WhatsApp Community)'] || '',
    slack: record['Do you want to be added to our communication channels? (Slack)'] || '',
    mailingList: record['Do you want to be added to our communication channels? (Mailing List)'] || '',
    email: record['Email'] || '',
    phone: record['Phone number'] || '',
    wouldRecommend: record['How likely would you be to recommend this event to a friend?'] || '',
    referrals: record["Is there anyone you'd like us to invite to future events?"] || '',
    anythingElse: record["Anything else you'd like to add?"] || '',
  }
}

/**
 * Parse participant feedback CSV file
 */
export function parseParticipantFeedbackCSV(filePath: string): ParticipantFeedbackRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Handle inconsistent column counts
    relax_quotes: true, // Handle unescaped quotes
  }) as Record<string, string>[]

  return records.map(mapParticipantFeedbackColumns)
}

/**
 * Filter out hackathon rows and write skipped rows to a file
 */
export function filterHackathonRows<T extends { eventName?: string; eventType?: string }>(
  rows: T[],
  outputPath: string,
): { filtered: T[]; skipped: T[] } {
  const filtered: T[] = []
  const skipped: T[] = []

  for (const row of rows) {
    // Skip undefined/null rows
    if (!row) {
      continue
    }

    // Safely get event name/type, ensuring we have a string
    const eventNameStr = row.eventName || row.eventType || ''
    const eventName = typeof eventNameStr === 'string' ? eventNameStr.toLowerCase() : ''
    if (eventName.includes('hackathon')) {
      skipped.push(row)
    } else {
      filtered.push(row)
    }
  }

  // Write skipped rows to CSV
  if (skipped.length > 0) {
    const csv = stringify(skipped, { header: true })
    writeFileSync(outputPath, csv, 'utf-8')
    console.log(`  → Skipped ${skipped.length} hackathon row(s), written to ${outputPath}`)
  }

  return { filtered, skipped }
}

/**
 * Generate event slug from type and date
 */
export function generateEventSlug(eventType: string, eventDate: string): string {
  // Ensure we have valid strings
  const typeStr = eventType || 'event'
  const dateStr = eventDate || new Date().toISOString().split('T')[0]

  const typeSlug = typeStr
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  // Parse date and format as YYYY-MM-DD
  const date = new Date(dateStr)
  const formattedDate = isNaN(date.getTime())
    ? new Date().toISOString().split('T')[0]
    : date.toISOString().split('T')[0]

  return `${typeSlug}-${formattedDate}`
}

/**
 * Map event type string to Payload enum value
 */
export function mapEventType(
  eventName: string,
): 'workshop' | 'talk' | 'meetup' | 'reading_group' | 'retreat' | 'panel' | null {
  // Ensure we have a valid string
  if (!eventName || typeof eventName !== 'string') {
    return null
  }

  const lower = eventName.toLowerCase()

  if (lower.includes('reading group') || lower === 'paper reading group') {
    return 'reading_group'
  }
  if (lower.includes('hackathon')) {
    return null // Skip - handled by program import
  }
  if (lower.includes('workshop')) {
    return 'workshop'
  }
  if (lower.includes('talk')) {
    return 'talk'
  }
  if (lower.includes('meetup')) {
    return 'meetup'
  }
  if (lower.includes('retreat')) {
    return 'retreat'
  }
  if (lower.includes('panel')) {
    return 'panel'
  }

  // Default for "Other" or unknown
  return 'meetup'
}

/**
 * Facilitator name aliases mapping
 */
const FACILITATOR_ALIASES: Record<string, string> = {
  Caleb: 'Caleb Rudnick',
}

/**
 * Normalize facilitator name (expand aliases)
 */
export function normalizeFacilitatorName(name: string): string {
  return FACILITATOR_ALIASES[name] || name
}

/**
 * Parse comma-separated facilitator names
 */
export function parseFacilitatorNames(facilitatorsStr: string): string[] {
  if (!facilitatorsStr || !facilitatorsStr.trim()) {
    return []
  }

  return facilitatorsStr
    .split(',')
    .map((name) => normalizeFacilitatorName(name.trim()))
    .filter((name) => name.length > 0)
}
