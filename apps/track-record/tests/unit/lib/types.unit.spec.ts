import { describe, it, expect } from 'vitest'
import {
  engagementTypeLabels,
  impactTypeLabels,
  projectRoleLabels,
  impactStageLabels,
  eventTypeLabels,
  contextKindLabels,
} from '@/lib/types'

describe('Type label mappings', () => {
  describe('engagementTypeLabels', () => {
    it('has labels for all engagement types', () => {
      expect(engagementTypeLabels.participant).toBe('Participant')
      expect(engagementTypeLabels.facilitator).toBe('Facilitator')
      expect(engagementTypeLabels.speaker).toBe('Speaker')
      expect(engagementTypeLabels.volunteer).toBe('Volunteer')
      expect(engagementTypeLabels.organizer).toBe('Organizer')
      expect(engagementTypeLabels.mentor).toBe('Mentor')
      expect(engagementTypeLabels.contribution).toBe('Contribution')
      expect(engagementTypeLabels.other).toBe('Other')
    })

    it('has correct number of labels', () => {
      expect(Object.keys(engagementTypeLabels)).toHaveLength(8)
    })
  })

  describe('impactTypeLabels', () => {
    it('has labels for all impact types', () => {
      expect(impactTypeLabels.career_transition).toBe('Career Transition')
      expect(impactTypeLabels.research_contribution).toBe('Research Contribution')
      expect(impactTypeLabels.community_building).toBe('Community Building')
      expect(impactTypeLabels.grant_awarded).toBe('Grant Awarded')
      expect(impactTypeLabels.publication).toBe('Publication')
      expect(impactTypeLabels.educational).toBe('Educational')
      expect(impactTypeLabels.community).toBe('Community')
      expect(impactTypeLabels.other).toBe('Other')
    })

    it('has correct number of labels', () => {
      expect(Object.keys(impactTypeLabels)).toHaveLength(8)
    })
  })

  describe('projectRoleLabels', () => {
    it('has labels for all project roles', () => {
      expect(projectRoleLabels.lead_author).toBe('Lead Author')
      expect(projectRoleLabels.co_author).toBe('Co-Author')
      expect(projectRoleLabels.contributor).toBe('Contributor')
      expect(projectRoleLabels.advisor).toBe('Advisor')
      expect(projectRoleLabels.other).toBe('Other')
    })

    it('has correct number of labels', () => {
      expect(Object.keys(projectRoleLabels)).toHaveLength(5)
    })
  })

  describe('impactStageLabels', () => {
    it('has labels for all impact stages', () => {
      expect(impactStageLabels.awareness).toBe('Awareness')
      expect(impactStageLabels.learning).toBe('Learning')
      expect(impactStageLabels.application).toBe('Application')
      expect(impactStageLabels.contribution).toBe('Contribution')
    })

    it('has correct number of labels', () => {
      expect(Object.keys(impactStageLabels)).toHaveLength(4)
    })
  })

  describe('eventTypeLabels', () => {
    it('has labels for all event types', () => {
      expect(eventTypeLabels.workshop).toBe('Workshop')
      expect(eventTypeLabels.talk).toBe('Talk')
      expect(eventTypeLabels.meetup).toBe('Meetup')
      expect(eventTypeLabels.reading_group).toBe('Reading Group')
      expect(eventTypeLabels.retreat).toBe('Retreat')
      expect(eventTypeLabels.panel).toBe('Panel')
      expect(eventTypeLabels.other).toBe('Other')
    })

    it('has correct number of labels', () => {
      expect(Object.keys(eventTypeLabels)).toHaveLength(7)
    })
  })

  describe('contextKindLabels', () => {
    it('has labels for all context kinds', () => {
      expect(contextKindLabels.event).toBe('Event')
      expect(contextKindLabels.program).toBe('Program')
      expect(contextKindLabels.cohort).toBe('Cohort')
    })

    it('has correct number of labels', () => {
      expect(Object.keys(contextKindLabels)).toHaveLength(3)
    })
  })
})
