import { describe, expect, it } from 'vitest'
import {
  EMPTY_PROFILE_STATE,
  buildProfileUpdates,
  isProfileFieldChanged,
  mergeProfileDrafts,
  profileStateFromCurrent,
  validateProfileForm,
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
      headshot: null,
      organisation: null,
      personTag: 'AISSA',
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    }

    expect(profileStateFromCurrent(canonical)).toEqual({
      bio: 'Bio',
      fullName: 'Alice Example',
      headshot: null,
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
      headshot: null,
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
      headshot: { alt: 'Alice', filename: 'alice.jpg', id: 22, url: '/alice.jpg' },
      organisation: 'AISSA',
      personTag: null,
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    }

    const form: ProfileFormState = {
      bio: 'Bio',
      fullName: ' Alice A. Example ',
      headshot: null,
      organisation: '   ',
      personTag: '',
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    }

    expect(buildProfileUpdates(form, canonical)).toEqual(
      expect.arrayContaining([
        { field: 'fullName', proposedValue: 'Alice A. Example' },
        { field: 'headshot', proposedValue: null },
        { field: 'organisation', proposedValue: null },
      ]),
    )
  })

  it('detects changed and unchanged fields against canonical values', () => {
    const canonical: CurrentProfile = {
      bio: 'Bio',
      fullName: 'Alice Example',
      headshot: null,
      organisation: null,
      personTag: null,
      preferredName: null,
      websiteUrl: null,
    }

    const form: ProfileFormState = {
      bio: '  Bio  ',
      fullName: 'Alice E.',
      headshot: null,
      organisation: '',
      personTag: '',
      preferredName: '',
      websiteUrl: '',
    }

    expect(isProfileFieldChanged('bio', form, canonical)).toBe(false)
    expect(isProfileFieldChanged('fullName', form, canonical)).toBe(true)
    expect(isProfileFieldChanged('headshot', form, canonical)).toBe(false)
    expect(isProfileFieldChanged('organisation', form, canonical)).toBe(false)
  })

  it('preserves canonical full name when stale draft full name is empty', () => {
    const canonical: ProfileFormState = {
      bio: 'Bio',
      fullName: 'Alice Example',
      headshot: null,
      organisation: 'AISSA',
      personTag: 'member',
      preferredName: 'Alice',
      websiteUrl: 'https://example.com',
    }

    const merged = mergeProfileDrafts({
      canonical,
      localDraft: {
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
      headshot: null,
      organisation: '',
      personTag: '',
      preferredName: '',
      websiteUrl: '',
    }

    const merged = mergeProfileDrafts({
      canonical,
      localDraft: {
        fullName: 'Alice Updated',
      },
    })

    expect(merged.fullName).toBe('Alice Updated')
  })

  it('prefers local draft over submission draft while retaining staged headshot data', () => {
    const canonical: ProfileFormState = {
      bio: 'Canonical bio',
      fullName: 'Alice Example',
      headshot: null,
      organisation: 'AISSA',
      personTag: 'member',
      preferredName: 'Alice',
      websiteUrl: '',
    }

    const merged = mergeProfileDrafts({
      canonical,
      localDraft: {
        bio: 'Local bio',
      },
      submissionDraft: {
        bio: 'Server bio',
        headshot: {
          alt: 'Alice headshot',
          filename: 'alice.webp',
          id: 91,
          url: '/alice.webp',
        },
      },
    })

    expect(merged.bio).toBe('Local bio')
    expect(merged.headshot?.id).toBe(91)
  })

  it('stages uploaded headshot IDs when they differ from canonical', () => {
    const form: ProfileFormState = {
      bio: 'Bio',
      fullName: 'Alice Example',
      headshot: { alt: 'Alice headshot', filename: 'alice.jpg', id: 44, url: '/alice.jpg' },
      organisation: '',
      personTag: '',
      preferredName: '',
      websiteUrl: '',
    }

    expect(buildProfileUpdates(form, null)).toContainEqual({
      field: 'headshot',
      proposedValue: 44,
    })
  })

  it('rejects empty full name submissions', () => {
    expect(
      validateProfileForm({
        ...EMPTY_PROFILE_STATE,
        fullName: '   ',
      }),
    ).toBe('Full name is required.')
  })
})
