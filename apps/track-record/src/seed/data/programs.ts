/**
 * Program seed data extracted from AISSA Track Record
 * Each course run is a separate program
 */

import { generateSlug } from '../utils'

export const programs = [
  {
    slug: 'aisf-governance-2024-mar',
    name: 'AISF Governance - March 2024',
    type: 'course',
    partnershipName: 'BlueDot Impact',
    startDate: '2024-03-01',
    endDate: '2024-05-15',
    description: '12-week AI Safety Fundamentals Course - Governance track',
    metadata: {
      curriculumLink: 'https://docs.google.com/document/d/1PK-531ONYFIFFPY_lCDr0WkwFacobaiXsbGtDngHz8w/edit?usp=sharing',
      acceptedCount: 92,
      completedCount: 54,
      cohortCount: 12,
    },
  },
  {
    slug: 'aisf-technical-2024-mar',
    name: 'AISF Technical - March 2024',
    type: 'course',
    partnershipName: 'BlueDot Impact',
    startDate: '2024-03-01',
    endDate: '2024-05-15',
    description: '12-week AI Safety Fundamentals Course - Technical Alignment track',
    metadata: {
      curriculumLink: 'https://docs.google.com/document/d/1ZwR2rhlQClLwxyzVTnWv_ntwQXFzc057IXePUX2SLKc/edit#heading=h.s5znjvp3l4zi',
      acceptedCount: 39,
      completedCount: 20,
      cohortCount: 6,
    },
  },
  {
    slug: 'aisf-governance-2025-jun',
    name: 'AISF Governance - June 2025',
    type: 'course',
    partnershipName: 'BlueDot Impact',
    startDate: '2025-06-01',
    endDate: null,
    description: '12-week AI Safety Fundamentals Course - Governance stream (on-going)',
    metadata: {
      isEstimated: true,
      expectedCohortCount: 4,
    },
  },
  {
    slug: 'aisf-alignment-2025-jun',
    name: 'AISF Alignment - June 2025',
    type: 'course',
    partnershipName: 'BlueDot Impact',
    startDate: '2025-06-01',
    endDate: null,
    description: '12-week AI Safety Fundamentals Course - Alignment stream (on-going)',
    metadata: {
      isEstimated: true,
      expectedCohortCount: 4,
    },
  },
  {
    slug: 'aisf-economics-2025-jun',
    name: 'AISF Economics - June 2025',
    type: 'course',
    partnershipName: 'BlueDot Impact',
    startDate: '2025-06-01',
    endDate: null,
    description: '12-week AI Safety Fundamentals Course - Economics stream (on-going)',
    metadata: {
      isEstimated: true,
      expectedCohortCount: 4,
    },
  },
  {
    slug: 'intro-tai-2025-feb',
    name: 'Intro to Transformative AI - February 2025',
    type: 'course',
    partnershipName: 'BlueDot Impact',
    startDate: '2025-02-01',
    endDate: '2025-02-05',
    description: 'BlueDot\'s Intro to Transformative AI Course (first official in-person cohort ever)',
    metadata: {
      acceptedCount: 36,
      completedCount: 24,
      averageRating: 9.5,
      dropoutRate: 33,
    },
  },
  {
    slug: 'intro-tai-2025-may',
    name: 'Intro to Transformative AI - May 2025',
    type: 'course',
    partnershipName: 'BlueDot Impact',
    startDate: '2025-05-01',
    endDate: '2025-05-07',
    description: 'Intro to Transformative AI Course',
    metadata: {
      acceptedCount: 36,
      completedCount: 24,
      averageRating: 9.5,
      dropoutRate: 33,
    },
  },
  {
    slug: 'intro-coop-ai-2025-q2',
    name: 'Intro to Cooperative AI - Q2 2025',
    type: 'course',
    partnershipName: 'Cooperative AI Foundation',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    description: 'Intro to Cooperative AI Course by the Cooperative AI Foundation (first official in-person cohort ever)',
    metadata: {
      curriculumLink: 'https://docs.google.com/document/d/1aS0ub27xRzMCdt25InzHwYey2PzU96tYuIOKaEQ42mg/edit?usp=sharing',
    },
  },
  {
    slug: 'coworking-innovation-city',
    name: 'AISSA Coworking',
    type: 'coworking',
    partnershipName: 'Innovation City',
    startDate: '2024-10-01',
    endDate: null,
    description: 'Co-working space at Innovation City',
    metadata: {
      capacity: 6,
    },
  },
  {
    slug: 'ai-safety-wits',
    name: 'AI Safety WITS',
    type: 'volunteer_program',
    partnershipName: 'University of Witwatersrand',
    startDate: '2025-01-01',
    endDate: null,
    description: 'Seeded AI Safety University of Witwatersrand (AI Safety WITS)',
    metadata: {},
  },
  {
    slug: 'stellies-ai-safety',
    name: 'Stellies AI Safety',
    type: 'volunteer_program',
    partnershipName: 'Stellenbosch University',
    startDate: '2025-01-01',
    endDate: null,
    description: 'Seeded Stellenbosch AI Safety (Stellies AI Safety)',
    metadata: {},
  },
]

