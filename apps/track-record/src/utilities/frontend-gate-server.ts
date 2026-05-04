import 'server-only'

import { cookies } from 'next/headers'
import {
  FRONTEND_GATE_COOKIE_NAME,
  getFrontendAudienceCapabilities,
  getFrontendGateConfig,
  getFrontendGateCookieAudience,
  type FrontendAudience,
  type FrontendCapabilities,
} from '@/utilities/frontend-gate'

type UnlockedFrontendViewer = FrontendCapabilities & {
  audience: FrontendAudience | 'public'
  isGateEnabled: boolean
  isUnlocked: true
}

type LockedFrontendViewer = {
  audience: null
  canViewCommunityHighlights: false
  canViewFundingDetails: false
  isGateEnabled: true
  isUnlocked: false
}

export type FrontendViewer = UnlockedFrontendViewer | LockedFrontendViewer

/**
 * Pages under the gated frontend layout should only receive an unlocked viewer,
 * because the parent layout intercepts locked requests and renders the password form.
 * This helper still models the locked state explicitly so unauthenticated visitors are
 * not misclassified as a real audience.
 */
export async function getCurrentFrontendViewer(): Promise<FrontendViewer> {
  const config = getFrontendGateConfig()

  if (config.status !== 'enabled') {
    return {
      audience: 'public',
      canViewCommunityHighlights: false,
      canViewFundingDetails: false,
      isGateEnabled: false,
      isUnlocked: true,
    }
  }

  const cookieStore = await cookies()
  const gateCookie = cookieStore.get(FRONTEND_GATE_COOKIE_NAME)?.value
  const cookieAudience = getFrontendGateCookieAudience(gateCookie)
  if (!cookieAudience) {
    return {
      audience: null,
      canViewCommunityHighlights: false,
      canViewFundingDetails: false,
      isGateEnabled: true,
      isUnlocked: false,
    }
  }

  return {
    audience: cookieAudience,
    isGateEnabled: true,
    isUnlocked: true,
    ...getFrontendAudienceCapabilities(cookieAudience),
  }
}
