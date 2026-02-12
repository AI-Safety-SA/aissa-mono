import { describe, expect, it } from 'vitest'
import { calculateCommunityScore, COMMUNITY_SCORE_WEIGHTS } from '@/collections/_shared/person-score'

describe('calculateCommunityScore', () => {
  it('weights impacts highest', () => {
    const oneImpact = calculateCommunityScore({
      totalEngagements: 0,
      totalContributions: 0,
      totalImpacts: 1,
    })
    const oneContribution = calculateCommunityScore({
      totalEngagements: 0,
      totalContributions: 1,
      totalImpacts: 0,
    })
    const oneEngagement = calculateCommunityScore({
      totalEngagements: 1,
      totalContributions: 0,
      totalImpacts: 0,
    })

    expect(COMMUNITY_SCORE_WEIGHTS.impacts).toBeGreaterThan(COMMUNITY_SCORE_WEIGHTS.contributions)
    expect(COMMUNITY_SCORE_WEIGHTS.contributions).toBeGreaterThan(
      COMMUNITY_SCORE_WEIGHTS.engagements,
    )
    expect(oneImpact).toBeGreaterThan(oneContribution)
    expect(oneContribution).toBeGreaterThan(oneEngagement)
  })

  it('computes deterministic weighted total', () => {
    const score = calculateCommunityScore({
      totalEngagements: 10,
      totalContributions: 2,
      totalImpacts: 3,
    })

    expect(score).toBe(31)
  })
})
