export type ProfileField =
  | 'bio'
  | 'fullName'
  | 'organisation'
  | 'personTag'
  | 'preferredName'
  | 'websiteUrl'

export type ProfileFormState = Record<ProfileField, string>

export type CurrentProfile = Record<ProfileField, string | null>

export type ProfileUpdate = {
  field: ProfileField
  proposedValue: string | null
}

const PROFILE_FIELDS: ProfileField[] = [
  'bio',
  'fullName',
  'organisation',
  'personTag',
  'preferredName',
  'websiteUrl',
]

export const EMPTY_PROFILE_STATE: ProfileFormState = {
  bio: '',
  fullName: '',
  organisation: '',
  personTag: '',
  preferredName: '',
  websiteUrl: '',
}

function normalize(value: string | null | undefined): string {
  return (value ?? '').trim()
}

export function profileStateFromCurrent(current: CurrentProfile | null): ProfileFormState {
  if (!current) return { ...EMPTY_PROFILE_STATE }

  return {
    bio: current.bio ?? '',
    fullName: current.fullName ?? '',
    organisation: current.organisation ?? '',
    personTag: current.personTag ?? '',
    preferredName: current.preferredName ?? '',
    websiteUrl: current.websiteUrl ?? '',
  }
}

export function isProfileFieldChanged(
  field: ProfileField,
  form: ProfileFormState,
  current: CurrentProfile | null,
): boolean {
  const proposed = normalize(form[field])
  if (!current) return proposed.length > 0
  const canonical = normalize(current[field])
  return proposed !== canonical
}

export function buildProfileUpdates(
  form: ProfileFormState,
  current: CurrentProfile | null,
): ProfileUpdate[] {
  if (!current) {
    return PROFILE_FIELDS
      .map((field) => ({ field, proposedValue: normalize(form[field]) }))
      .filter((item) => item.proposedValue.length > 0)
      .map((item) => ({
        field: item.field,
        proposedValue: item.proposedValue,
      }))
  }

  const updates: ProfileUpdate[] = []
  for (const field of PROFILE_FIELDS) {
    const proposed = normalize(form[field])
    const canonical = normalize(current[field])
    if (proposed === canonical) continue

    updates.push({
      field,
      proposedValue: proposed.length > 0 ? proposed : null,
    })
  }

  return updates
}
