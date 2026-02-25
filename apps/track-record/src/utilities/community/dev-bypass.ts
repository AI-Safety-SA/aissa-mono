function parseBooleanFlag(value: string | undefined): boolean {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on'
}

export function isCommunityEditDevBypassEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return false
  return parseBooleanFlag(process.env.COMMUNITY_EDIT_DEV_BYPASS_VERIFICATION)
}

