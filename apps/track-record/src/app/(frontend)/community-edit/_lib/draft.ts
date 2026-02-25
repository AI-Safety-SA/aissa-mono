export type DraftContext = {
  relationTo: 'events' | 'programs'
  value: number | string
}

export type DraftEngagement = {
  context?: DraftContext
  engagement_status?: 'completed' | 'dropped_out' | 'in_progress' | 'withdrawn' | 'attended'
  operation: 'create' | 'update'
  existingEngagement?: number | string
  rating?: number
  type: 'participant' | 'facilitator' | 'speaker' | 'volunteer' | 'organizer' | 'mentor' | 'other'
  typeOther?: string
  wouldRecommend?: number
}

export type DraftTestimonial = {
  consentToPublish?: boolean
  context?: DraftContext
  quote: string
  rating?: number
}

export type DraftImpact = {
  actionCategory?:
    | 'career_role'
    | 'grant'
    | 'internship'
    | 'academic_pivot'
    | 'upskilling'
    | 'community_building'
    | 'research'
  aissaInfluenceScore?: number
  context: DraftContext
  evidenceUrl?: string
  summary: string
  type:
    | 'career_transition'
    | 'research_contribution'
    | 'community_building'
    | 'grant_awarded'
    | 'publication'
    | 'educational'
    | 'community'
    | 'other'
  typeOther?: string
}

export type CommunityEditDraft = {
  engagements?: DraftEngagement[]
  impacts?: DraftImpact[]
  profile?: {
    bio?: string
    fullName?: string
    organisation?: string
    personTag?: string
    preferredName?: string
    websiteUrl?: string
  }
  testimonials?: DraftTestimonial[]
}

const DRAFT_KEY = 'community_edit_draft_v1'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getCommunityEditDraft(): CommunityEditDraft {
  if (!isBrowser()) return {}
  const raw = window.localStorage.getItem(DRAFT_KEY)
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw) as CommunityEditDraft
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveCommunityEditDraft(value: CommunityEditDraft): void {
  if (!isBrowser()) return
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value))
}

export function patchCommunityEditDraft(patch: Partial<CommunityEditDraft>): CommunityEditDraft {
  const next = {
    ...getCommunityEditDraft(),
    ...patch,
  }
  saveCommunityEditDraft(next)
  return next
}

export function clearCommunityEditDraft(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(DRAFT_KEY)
}

