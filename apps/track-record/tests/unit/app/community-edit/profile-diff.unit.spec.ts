import { describe, expect, it } from 'vitest'
import {
  EMPTY_PROFILE_STATE,
  buildProfileUpdates,
  isProfileFieldChanged,
  mergeProfileDraftWithCanonical,
  profileStateFromCurrent,
  type CurrentProfile,
  type ProfileFormState,
} from '@/app/(public)/community-edit/_lib/profile-diff'

describe('community-edit profile diff helpers', () => {
  it('builds empty profile form from null canonical profile', () => {
    expect(profileStateFromCurrent(null)).toEqual(EMPTY_PROFILE_STATE)
  })

  it('builds profile form from canonical profile values', () => {
    const canonical: CurrentProfile = {
      bio: 'Bio',
      fullName: 'Alice Example',
      organisation: null,
      personTag: 'AISSA',
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    }

    expect(profileStateFromCurrent(canonical)).toEqual({
      bio: 'Bio',
      fullName: 'Alice Example',
      organisation: '',
      personTag: 'AISSA',
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    })
  })

  it('returns only non-empty values when canonical profile is unavailable', () => {
    const form: ProfileFormState = {
      bio: '  ',
      fullName: '  Alice Example  ',
      organisation: '',
      personTag: ' member ',
      preferredName: '',
      websiteUrl: '',
    }

    expect(buildProfileUpdates(form, null)).toEqual([
      { field: 'fullName', proposedValue: 'Alice Example' },
      { field: 'personTag', proposedValue: 'member' },
    ])
  })

  it('returns changed values only and supports explicit clearing', () => {
    const canonical: CurrentProfile = {
      bio: 'Bio',
      fullName: 'Alice Example',
      organisation: 'AISSA',
      personTag: null,
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    }

    const form: ProfileFormState = {
      bio: 'Bio',
      fullName: ' Alice A. Example ',
      organisation: '   ',
      personTag: '',
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    }

    expect(buildProfileUpdates(form, canonical)).toEqual([
      { field: 'fullName', proposedValue: 'Alice A. Example' },
      { field: 'organisation', proposedValue: null },
    ])
  })

  it('detects changed and unchanged fields against canonical values', () => {
    const canonical: CurrentProfile = {
      bio: 'Bio',
      fullName: 'Alice Example',
      organisation: null,
      personTag: null,
      preferredName: null,
      websiteUrl: null,
    }

    const form: ProfileFormState = {
      bio: '  Bio  ',
      fullName: 'Alice E.',
      organisation: '',
      personTag: '',
      preferredName: '',
      websiteUrl: '',
    }

    expect(isProfileFieldChanged('bio', form, canonical)).toBe(false)
    expect(isProfileFieldChanged('fullName', form, canonical)).toBe(true)
    expect(isProfileFieldChanged('organisation', form, canonical)).toBe(false)
  })

  it('preserves canonical full name when stale draft full name is empty', () => {
    const canonical: ProfileFormState = {
      bio: 'Bio',
      fullName: 'Alice Example',
      organisation: 'AISSA',
      personTag: 'member',
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    }

    const merged = mergeProfileDraftWithCanonical({
      canonical,
      draft: {
        fullName: '   ',
        organisation: 'Updated Org',
      },
    })

    expect(merged.fullName).toBe('Alice Example')
    expect(merged.organisation).toBe('Updated Org')
  })

  it('uses draft full name when it contains a value', () => {
    const canonical: ProfileFormState = {
      bio: '',
      fullName: 'Alice Example',
      organisation: '',
      personTag: '',
      preferredName: '',
      websiteUrl: '',
    }

    const merged = mergeProfileDraftWithCanonical({
      canonical,
      draft: {
        fullName: 'Alice Updated',
      },
    })

    expect(merged.fullName).toBe('Alice Updated')
  })
})
