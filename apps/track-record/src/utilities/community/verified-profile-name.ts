import { decodeStagedProfileValue } from './staged-profile-value'
import {
  hasResolvedCommunityProfileFullName,
  isPendingCommunityProfileFullName,
} from './person-ownership'

export function sanitizeCommunityProfileFullName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0 || isPendingCommunityProfileFullName(trimmed)) {
    return null
  }
  return trimmed
}

export function resolveSubmittedCommunityProfileName(args: {
  currentFullName: unknown
  stagedFullNameValue?: unknown
}): string | null {
  const stagedFullName = sanitizeCommunityProfileFullName(
    args.stagedFullNameValue !== undefined
      ? decodeStagedProfileValue(args.stagedFullNameValue)
      : undefined,
  )
  if (stagedFullName) return stagedFullName

  if (hasResolvedCommunityProfileFullName(args.currentFullName)) {
    return String(args.currentFullName).trim()
  }

  return null
}
