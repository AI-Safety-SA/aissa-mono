export type ProfileHeadshot = {
  alt: string | null
  filename: string | null
  id: number
  url: string | null
}

export type ProfileTextField =
  | 'bio'
  | 'fullName'
  | 'organisation'
  | 'personTag'
  | 'preferredName'
  | 'websiteUrl'

export type ProfileField = ProfileTextField | 'headshot'

export type ProfileFormState = {
  bio: string
  fullName: string
  headshot: ProfileHeadshot | null
  organisation: string
  personTag: string
  preferredName: string
  websiteUrl: string
}

export type CurrentProfile = {
  bio: string | null
  fullName: string | null
  headshot: ProfileHeadshot | null
  organisation: string | null
  personTag: string | null
  preferredName: string | null
  websiteUrl: string | null
}

export const PROFILE_TEXT_FIELDS: ProfileTextField[] = [
  'bio',
  'fullName',
  'organisation',
  'personTag',
  'preferredName',
  'websiteUrl',
]

export const PROFILE_FIELDS: ProfileField[] = [...PROFILE_TEXT_FIELDS, 'headshot']
