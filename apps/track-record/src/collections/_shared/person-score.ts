export const COMMUNITY_SCORE_WEIGHTS = {
  engagements: 1,
  contributions: 3,
  impacts: 5,
} as const

export function calculateCommunityScore(args: {
  totalEngagements: number
  totalImpacts: number
  totalContributions: number
}): number {
  const { totalEngagements, totalImpacts, totalContributions } = args

  return (
    totalEngagements * COMMUNITY_SCORE_WEIGHTS.engagements +
    totalContributions * COMMUNITY_SCORE_WEIGHTS.contributions +
    totalImpacts * COMMUNITY_SCORE_WEIGHTS.impacts
  )
}
