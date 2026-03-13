import {
  PROFILE_FIELDS,
  PROFILE_TEXT_FIELDS,
  type CurrentProfile,
  type ProfileField,
  type ProfileFormState,
  type ProfileHeadshot,
} from './profile-types'

export type ProfileUpdate = {
  field: ProfileField
  proposedValue: number | string | null
}

export const EMPTY_PROFILE_STATE: ProfileFormState = {
  bio: '',
  fullName: '',
  headshot: null,
  organisation: '',
  personTag: '',
  preferredName: '',
  websiteUrl: '',
}

function normalize(value: string | null | undefined): string {
  return (value ?? '').trim()
}

function normalizeHeadshotId(value: ProfileHeadshot | null | undefined): number | null {
  return value?.id ?? null
}

export function profileStateFromCurrent(current: CurrentProfile | null): ProfileFormState {
  if (!current) return { ...EMPTY_PROFILE_STATE }

  return {
    bio: current.bio ?? '',
    fullName: current.fullName ?? '',
    headshot: current.headshot ?? null,
    organisation: current.organisation ?? '',
    personTag: current.personTag ?? '',
    preferredName: current.preferredName ?? '',
    websiteUrl: current.websiteUrl ?? '',
  }
}

function mergeDraftIntoBase(
  base: ProfileFormState,
  draft?: Partial<ProfileFormState>,
): ProfileFormState {
  const merged: ProfileFormState = { ...base }
  if (!draft) return merged

  for (const field of PROFILE_TEXT_FIELDS) {
    const draftValue = draft[field]
    if (typeof draftValue !== 'string') continue

    if (
      field === 'fullName' &&
      normalize(draftValue).length === 0 &&
      normalize(base.fullName).length > 0
    ) {
      continue
    }

    merged[field] = draftValue
  }

  if (Object.prototype.hasOwnProperty.call(draft, 'headshot')) {
    merged.headshot = draft.headshot ?? null
  }

  return merged
}

export function mergeProfileDrafts(args: {
  canonical: ProfileFormState
  localDraft?: Partial<ProfileFormState>
  submissionDraft?: Partial<ProfileFormState>
}): ProfileFormState {
  const withSubmissionDraft = mergeDraftIntoBase(args.canonical, args.submissionDraft)
  return mergeDraftIntoBase(withSubmissionDraft, args.localDraft)
}

export function validateProfileForm(form: ProfileFormState): string | null {
  if (normalize(form.fullName).length === 0) {
    return 'Full name is required.'
  }

  return null
}

function getComparableValue(
  field: ProfileField,
  profile: CurrentProfile | ProfileFormState | null,
): number | string | null {
  if (!profile) return null

  if (field === 'headshot') {
    return normalizeHeadshotId(profile.headshot)
  }

  return normalize(profile[field] as string | null | undefined)
}

export function isProfileFieldChanged(
  field: ProfileField,
  form: ProfileFormState,
  current: CurrentProfile | null,
): boolean {
  const proposed = getComparableValue(field, form)
  if (!current) {
    return field === 'headshot' ? proposed !== null : String(proposed ?? '').length > 0
  }

  const canonical = getComparableValue(field, current)
  return proposed !== canonical
}

export function buildProfileUpdates(
  form: ProfileFormState,
  current: CurrentProfile | null,
): ProfileUpdate[] {
  const updates: ProfileUpdate[] = []
  for (const field of PROFILE_FIELDS) {
    const proposed =
      field === 'headshot' ? normalizeHeadshotId(form.headshot) : normalize(form[field] as string)
    const canonical = current
      ? field === 'headshot'
        ? normalizeHeadshotId(current.headshot)
        : normalize(current[field] as string | null)
      : null

    if (!current) {
      if (field === 'headshot') {
        if (proposed !== null) {
          updates.push({
            field,
            proposedValue: proposed,
          })
        }
        continue
      }

      if (typeof proposed === 'string' && proposed.length > 0) {
        updates.push({
          field,
          proposedValue: proposed,
        })
      }
      continue
    }

    if (proposed === canonical) continue

    updates.push({
      field,
      proposedValue:
        field === 'headshot'
          ? proposed
          : typeof proposed === 'string' && proposed.length > 0
            ? proposed
            : null,
    })
  }

  return updates
}

export type {
  CurrentProfile,
  ProfileField,
  ProfileFormState,
  ProfileHeadshot,
} from './profile-types'
