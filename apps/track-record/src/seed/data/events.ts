/**
 * Event seed data extracted from AISSA Track Record
 * All events default to Leo Hyams as organiser
 */

import { generateSlug } from '../utils'

export const events = [
  // 2025 Events
  {
    slug: 'cooperative-ai-talk-2025',
    name: 'Cooperative AI Talk and Discussion',
    type: 'talk',
    organiserName: 'Leo Hyams',
    eventDate: '2025-01-15T18:00:00',
    attendanceCount: 20,
    location: 'innovation_city',
    metadata: {
      speaker: 'Claude Formanek',
      speakerTitle: 'Cooperative AI Foundation Fellow',
    },
  },
  {
    slug: 'ai-governance-faculty-meetup-2025',
    name: 'AI Governance Faculty Meetup Early 2025',
    type: 'meetup',
    organiserName: 'Leo Hyams',
    eventDate: '2025-01-20T18:00:00',
    attendanceCount: 6,
    location: 'cape_town',
    metadata: {
      description: 'Dinner with top AI governance faculty in Cape Town',
    },
  },
  {
    slug: 'ai-safety-wits-first-meetup-2025',
    name: 'AI Safety WITS - First Meetup',
    type: 'meetup',
    organiserName: 'Leo Hyams',
    eventDate: '2025-02-01T18:00:00',
    attendanceCount: 23,
    location: 'wits_university',
    metadata: {
      averageRating: 10,
      feedbackCount: 1,
    },
  },
  {
    slug: 'stellies-ai-safety-first-meetup-2025',
    name: 'Stellies AI Safety - First Meetup',
    type: 'meetup',
    organiserName: 'Leo Hyams',
    eventDate: '2025-02-05T18:00:00',
    attendanceCount: 12,
    location: 'stellenbosch_university',
    metadata: {},
  },
  // 2024 Events
  {
    slug: 'indabax-agi-horizons-panel-2024',
    name: 'Deep Learning IndabaX (July 2024): AGI Horizons: Utopia, Dystopia, and Everything in-Between',
    type: 'panel',
    organiserName: 'Leo Hyams',
    eventDate: '2024-07-15T14:00:00',
    attendanceCount: 125, // 100-150 average
    location: 'indabax_venue',
    metadata: {
      panelists: [
        'Leo Hyams',
        'Benjamin Sturgeon',
        'Benjamin Rosman',
        'Lydia De Lange',
        'Joshua Maumela',
      ],
      averageRating: 4,
      feedbackCount: 23,
      duration: '1.5 hours',
    },
  },
  {
    slug: 'indabax-ai-risk-workshop-2024',
    name: 'Deep Learning IndabaX (July 2024): An Introduction to AI-Risk, Key Concepts in AI Safety',
    type: 'workshop',
    organiserName: 'Leo Hyams',
    eventDate: '2024-07-15T16:00:00',
    attendanceCount: 50,
    location: 'indabax_venue',
    metadata: {
      speakers: ['Benjamin Sturgeon', 'Leo Hyams', 'Ahmed Ghoor'],
      averageRating: 8.2,
      feedbackCount: 5,
      duration: '2 hours',
      paperRead: 'Feature Visualization by Chris Olah',
    },
  },
  {
    slug: 'ea-sa-ai-safety-workshop-pilot-2024',
    name: 'EA South Africa x AI Safety Cape Town (May 2024): AI Safety Virtual Workshop (Pilot)',
    type: 'workshop',
    organiserName: 'Leo Hyams',
    eventDate: '2024-05-15T18:00:00',
    attendanceCount: 10,
    location: 'online',
    metadata: {
      duration: '1.5 hours',
      isPilot: true,
    },
  },
  {
    slug: 'indabaxs-ai-safety-roundtable-2024',
    name: 'IndabaXS (March 2024): AI Safety Roundtable',
    type: 'workshop',
    organiserName: 'Leo Hyams',
    eventDate: '2024-03-20T14:00:00',
    attendanceCount: 15,
    location: 'indabaxs_venue',
    metadata: {
      duration: '3 hours',
      testimonial: 'Thank you for hosting this event. It was incredible to be in a space that nurture conversions and knowledge sharing around AI Safety - Simone Renga',
    },
  },
  {
    slug: 'condor-camp-retreat-2024',
    name: 'Condor Camp Retreat',
    type: 'retreat',
    organiserName: 'Leo Hyams',
    eventDate: '2024-06-01T09:00:00',
    attendanceCount: 24,
    location: 'retreat_venue',
    metadata: {
      duration: '9 days',
      description: 'Intensive networking and upskilling event bringing together top South African AI safety talent',
      partners: ['Condor Initiative'],
    },
  },
  {
    slug: 'reading-group-regular-2024',
    name: 'Weekly Reading Group',
    type: 'reading_group',
    organiserName: 'Leo Hyams',
    eventDate: '2024-10-02T17:00:00',
    attendanceCount: 8,
    location: 'innovation_city',
    metadata: {
      frequency: 'weekly',
      dayOfWeek: 'wednesday',
    },
  },
  // 2023 Events
  {
    slug: 'sacair-ai-safety-tutorial-2023',
    name: 'SACAIR (November 2023): AI Safety Tutorial',
    type: 'workshop',
    organiserName: 'Leo Hyams',
    eventDate: '2023-11-15T14:00:00',
    attendanceCount: 30,
    location: 'sacair_venue',
    metadata: {
      duration: '2 hours',
      presenters: ['Benjamin Sturgeon', 'Leo Hyams'],
      format: 'Interactive red teaming exercises',
    },
  },
  {
    slug: 'indabaxs-ai-risk-opportunity-2023',
    name: 'IndabaXS: AI Risk and Opportunity in Africa',
    type: 'workshop',
    organiserName: 'Leo Hyams',
    eventDate: '2023-08-10T14:00:00',
    attendanceCount: 15,
    location: 'indabaxs_venue',
    metadata: {
      format: 'Breakout groups into AI risk, AI for Good, and AI in Africa',
    },
  },
  {
    slug: 'indabax-ai-safety-governance-workshop-2023',
    name: 'Deep Learning IndabaX (July 2023): AI Safety and Governance Workshop',
    type: 'workshop',
    organiserName: 'Leo Hyams',
    eventDate: '2023-07-20T14:00:00',
    attendanceCount: 40,
    location: 'indabax_venue',
    metadata: {
      duration: '2.5 hours',
      speakers: ['Jonas Kgomo', 'Zainab Chirwa', 'Benjamin Sturgeon'],
      topics: [
        'African safety landscape',
        'AI governance in Africa',
        'Introduction to AI safety',
      ],
    },
  },
]

