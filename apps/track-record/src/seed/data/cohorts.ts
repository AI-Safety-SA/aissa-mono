/**
 * Cohort seed data extracted from AISSA Track Record
 * Each cohort represents a study group of 5-8 participants within a program
 */

export const cohorts = [
  // AISF Governance 2024 March - 12 cohorts
  ...Array.from({ length: 12 }, (_, i) => ({
    programSlug: 'aisf-governance-2024-mar',
    slug: `aisf-gov-2024-mar-c${String(i + 1).padStart(2, '0')}`,
    name: `AISF Governance March 2024 - Cohort ${i + 1}`,
    startDate: '2024-03-01',
    endDate: '2024-05-15',
    acceptedCount: Math.floor(92 / 12), // ~8 per cohort
    completionCount: Math.floor(54 / 12), // ~5 per cohort
    completionRate: Math.round((54 / 92) * 100),
    metadata: {
      isEstimated: false,
    },
  })),
  // AISF Technical 2024 March - 6 cohorts
  ...Array.from({ length: 6 }, (_, i) => ({
    programSlug: 'aisf-technical-2024-mar',
    slug: `aisf-tech-2024-mar-c${String(i + 1).padStart(2, '0')}`,
    name: `AISF Technical March 2024 - Cohort ${i + 1}`,
    startDate: '2024-03-01',
    endDate: '2024-05-15',
    acceptedCount: Math.floor(39 / 6), // ~7 per cohort
    completionCount: Math.floor(20 / 6), // ~3 per cohort
    completionRate: Math.round((20 / 39) * 100),
    metadata: {
      isEstimated: false,
    },
  })),
  // AISF Governance 2025 June - ~4 cohorts (estimated)
  ...Array.from({ length: 4 }, (_, i) => ({
    programSlug: 'aisf-governance-2025-jun',
    slug: `aisf-gov-2025-jun-c${String(i + 1).padStart(2, '0')}`,
    name: `AISF Governance June 2025 - Cohort ${i + 1}`,
    startDate: '2025-06-01',
    endDate: null,
    metadata: {
      isEstimated: true,
    },
  })),
  // AISF Alignment 2025 June - ~4 cohorts (estimated)
  ...Array.from({ length: 4 }, (_, i) => ({
    programSlug: 'aisf-alignment-2025-jun',
    slug: `aisf-align-2025-jun-c${String(i + 1).padStart(2, '0')}`,
    name: `AISF Alignment June 2025 - Cohort ${i + 1}`,
    startDate: '2025-06-01',
    endDate: null,
    metadata: {
      isEstimated: true,
    },
  })),
  // AISF Economics 2025 June - ~4 cohorts (estimated)
  ...Array.from({ length: 4 }, (_, i) => ({
    programSlug: 'aisf-economics-2025-jun',
    slug: `aisf-econ-2025-jun-c${String(i + 1).padStart(2, '0')}`,
    name: `AISF Economics June 2025 - Cohort ${i + 1}`,
    startDate: '2025-06-01',
    endDate: null,
    metadata: {
      isEstimated: true,
    },
  })),
  // Intro to TAI February 2025 - 1 cohort
  {
    programSlug: 'intro-tai-2025-feb',
    slug: 'intro-tai-2025-feb-c01',
    name: 'Intro to TAI February 2025 - Cohort 1',
    startDate: '2025-02-01',
    endDate: '2025-02-05',
    acceptedCount: 36,
    completionCount: 24,
    completionRate: Math.round((24 / 36) * 100),
    dropoutRate: 33,
    averageRating: 9.5,
    metadata: {
      isEstimated: false,
    },
  },
  // Intro to TAI May 2025 - 1 cohort
  {
    programSlug: 'intro-tai-2025-may',
    slug: 'intro-tai-2025-may-c01',
    name: 'Intro to TAI May 2025 - Cohort 1',
    startDate: '2025-05-01',
    endDate: '2025-05-07',
    acceptedCount: 36,
    completionCount: 24,
    completionRate: Math.round((24 / 36) * 100),
    dropoutRate: 33,
    averageRating: 9.5,
    metadata: {
      isEstimated: false,
    },
  },
  // Intro to Cooperative AI Q2 2025 - 1 cohort
  {
    programSlug: 'intro-coop-ai-2025-q2',
    slug: 'intro-coop-ai-2025-q2-c01',
    name: 'Intro to Cooperative AI Q2 2025 - Cohort 1',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    metadata: {
      isEstimated: false,
    },
  },
]

