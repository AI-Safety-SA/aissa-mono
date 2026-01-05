/**
 * CSV parsing utilities for event data imports
 */

import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

// =============================================================================
// AISF June 2025 CSV Types and Parsers
// =============================================================================

export interface AISFCohortRow {
  name: string
  slug: string
  program: string
  applicationCount: string
  acceptedCount: string
  completionCount: string
  completionRate: string
  averageRating: string
  dropoutRate: string
  startDate: string
  endDate: string
  isPublished: string
  metadata: string
}

export interface AISFParticipantRow {
  cohort: string
  name: string
  email: string
  whatsapp: string
  organisation: string
  position: string
  notes: string
  totalSessionsAttended: string
  submittedProject: string
  eligibleForFullCertificate: string
  eligibleForLearningCertificate: string
}

export interface AISFPreSurveyRow {
  submissionId: string
  respondentId: string
  submittedAt: string
  name: string
  email: string
  confirmParticipation: string
  age: string
  gender: string
  primaryOccupation: string
  fieldOfWork: string
  yearsExperience: string
  location: string
  priorActionsRaw: string
  priorActionsReadBooks: string
  priorActionsConferences: string
  priorActionsForums: string
  priorActionsCareerChange: string
  priorActionsDonated: string
  priorActionsNone: string
  priorActionsOther: string
  aiSafetyContacts: string
  motivationRaw: string
  motivationProfessional: string
  motivationAcademic: string
  motivationCareerTransition: string
  motivationPersonalConcern: string
  motivationRecommendation: string
  motivationOther: string
  currentUnderstandingRating: string
  equippedToContributeRating: string
  openToAISCareer: string
  intendToApplyRaw: string
  intendToApplyCurrentJob: string
  intendToApplyFutureCareer: string
  intendToApplyPersonalProjects: string
  intendToApplyCommunityInitiatives: string
  intendToApplyResearch: string
  intendToApplyOther: string
  pathInterest: string
  anticipatedBarriers: string
  hopedAchievements: string
  futureCoursesInterest: string
  otherComments: string
}

export interface AISFPostFeedbackRow {
  submissionId: string
  respondentId: string
  submittedAt: string
  name: string
  email: string
  tracksEnrolled: string
  finishedGovernanceTrack: string
  finishedGovernanceTrackLearningOnly: string
  finishedGovernanceTrackFewSessions: string
  finishedGovernanceTrackFull: string
  finishedAlignmentTrack: string
  finishedAlignmentTrackLearningOnly: string
  finishedAlignmentTrackFewSessions: string
  finishedAlignmentTrackFull: string
  finishedEconomicsTrack: string
  finishedEconomicsTrackLearningOnly: string
  finishedEconomicsTrackFewSessions: string
  finishedEconomicsTrackFull: string
  whyNotFinish: string
  overallSatisfaction: string
  didntMeetExpectationsExplain: string
  ratingPreReading: string
  ratingGroupDiscussions: string
  ratingExercises: string
  ratingProjectPhase: string
  ratingParticipantInteraction: string
  ratingFacilitatorGuidance: string
  mostValuable: string
  couldBeImproved: string
  topicToAdd: string
  wouldRecommend: string
  aiSafetyContactsNow: string
  equippedToContributeNow: string
  intendToPursueCareer: string
  pathInterestNow: string
  plansAsResultRaw: string
  plansReadBooks: string
  plansCareerChange: string
  plansFurtherStudy: string
  plansEngageCommunity: string
  plansApplyCourses: string
  plansDonate: string
  plansTalkToOthers: string
  plansApplyShortTerm: string
  plansApplyFullTime: string
  plansApplyGrant: string
  plansAcceptShortTerm: string
  plansAcceptFullTime: string
  plansReceiveGrant: string
  plansFoundOrg: string
  plansHireShortTerm: string
  plansHireFullTime: string
  plansIdentifyGrantee: string
  plansFindCollaborator: string
  plansPublishResearch: string
  plansNone: string
  plansOther: string
  applyKnowledgeToRaw: string
  applyKnowledgeCurrentJob: string
  applyKnowledgeFutureCareer: string
  applyKnowledgePersonalProjects: string
  applyKnowledgeCommunity: string
  applyKnowledgeResearch: string
  applyKnowledgeOther: string
  elaborateApplication: string
  specificActions3Months: string
  anticipatedObstacles: string
  headshotUrl: string
  bio: string
  willingToTestimonial: string
  testimonial: string
  anythingElse: string
}

export interface AISFDropoutFeedbackRow {
  submissionId: string
  respondentId: string
  submittedAt: string
  name: string
  email: string
  coursesStartedRaw: string
  coursesStartedGovernance: string
  coursesStartedAlignment: string
  coursesStartedEconomics: string
  howFarGot: string
  mainReasonRaw: string
  reasonTimeBusy: string
  reasonTooDifficult: string
  reasonNotExpected: string
  reasonSchedule: string
  reasonPersonalCircumstances: string
  reasonLostInterest: string
  reasonHealth: string
  reasonTooSlow: string
  reasonTooQuick: string
  reasonGroupDynamics: string
  reasonTechnicalIssues: string
  feedback: string
  interestedToRetry: string
  wouldRecommend: string
}

/**
 * Map CSV column names to interface property names for AISF cohorts
 */
function mapAISFCohortColumns(record: Record<string, string>): AISFCohortRow {
  return {
    name: record['name'] || '',
    slug: record['slug'] || '',
    program: record['program'] || '',
    applicationCount: record['applicationCount'] || '',
    acceptedCount: record['acceptedCount'] || '',
    completionCount: record['completionCount'] || '',
    completionRate: record['completionRate'] || '',
    averageRating: record['averageRating'] || '',
    dropoutRate: record['dropoutRate'] || '',
    startDate: record['startDate'] || '',
    endDate: record['endDate'] || '',
    isPublished: record['isPublished'] || '',
    metadata: record['metadata'] || '',
  }
}

/**
 * Parse AISF cohorts CSV file
 */
export function parseAISFCohortCSV(filePath: string): AISFCohortRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  }) as Record<string, string>[]

  return records.map(mapAISFCohortColumns)
}

/**
 * Map CSV column names to interface property names for AISF participants
 */
function mapAISFParticipantColumns(record: Record<string, string>): AISFParticipantRow {
  return {
    cohort: record['cohort'] || '',
    name: record['name'] || '',
    email: record['email'] || '',
    whatsapp: record['whatsapp'] || '',
    organisation: record['organisation'] || '',
    position: record['position'] || '',
    notes: record['notes'] || '',
    totalSessionsAttended: record['total_sessions_attended'] || '',
    submittedProject: record['submitted_project'] || '',
    eligibleForFullCertificate: record['eligible_for_full_certificate'] || '',
    eligibleForLearningCertificate: record['eligible_for_learning_certificate'] || '',
  }
}

/**
 * Parse AISF participants CSV file
 */
export function parseAISFParticipantCSV(filePath: string): AISFParticipantRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  }) as Record<string, string>[]

  return records.map(mapAISFParticipantColumns)
}

/**
 * Map CSV column names to interface property names for AISF pre-survey
 */
function mapAISFPreSurveyColumns(record: Record<string, string>): AISFPreSurveyRow {
  return {
    submissionId: record['Submission ID'] || '',
    respondentId: record['Respondent ID'] || '',
    submittedAt: record['Submitted at'] || '',
    name: record['Your Name'] || '',
    email: record['Email Address'] || '',
    confirmParticipation: record['Do you confirm participation in the AIS course?'] || '',
    age: record['Age'] || '',
    gender: record['Gender'] || '',
    primaryOccupation: record['Primary Occupation'] || '',
    fieldOfWork: record['Field of work/study'] || '',
    yearsExperience: record['Years of professional experience'] || '',
    location: record['Province/City'] || '',
    priorActionsRaw:
      record['Have you taken any actions related to AI safety before this course? (Select all that apply)'] || '',
    priorActionsReadBooks:
      record[
        'Have you taken any actions related to AI safety before this course? (Select all that apply) (Read books/articles on the topic)'
      ] || '',
    priorActionsConferences:
      record[
        'Have you taken any actions related to AI safety before this course? (Select all that apply) (Attended talks/conferences)'
      ] || '',
    priorActionsForums:
      record[
        'Have you taken any actions related to AI safety before this course? (Select all that apply) (Participated in discussions/forums)'
      ] || '',
    priorActionsCareerChange:
      record[
        'Have you taken any actions related to AI safety before this course? (Select all that apply) (Changed career plans to focus on AI safety)'
      ] || '',
    priorActionsDonated:
      record[
        'Have you taken any actions related to AI safety before this course? (Select all that apply) (Donated to relevant organizations)'
      ] || '',
    priorActionsNone:
      record[
        'Have you taken any actions related to AI safety before this course? (Select all that apply) (None of the above)'
      ] || '',
    priorActionsOther:
      record[
        'Have you taken any actions related to AI safety before this course? (Select all that apply) (Other)'
      ] || '',
    aiSafetyContacts:
      record['How many people do you know that work on AIS that you could reach out to for a favour?'] || '',
    motivationRaw: record['What motivated you to apply to this course'] || '',
    motivationProfessional:
      record['What motivated you to apply to this course (Professional development)'] || '',
    motivationAcademic: record['What motivated you to apply to this course (Academic interest)'] || '',
    motivationCareerTransition:
      record['What motivated you to apply to this course (Career transition into AI safety)'] || '',
    motivationPersonalConcern:
      record['What motivated you to apply to this course (Personal concern about AI risks)'] || '',
    motivationRecommendation:
      record['What motivated you to apply to this course (Recommendation from a colleague/friend)'] || '',
    motivationOther: record['What motivated you to apply to this course (Other)'] || '',
    currentUnderstandingRating: record['How would you rate your current understanding of AI risks?'] || '',
    equippedToContributeRating: record['How equipped do you feel to contribute to AI Safety?'] || '',
    openToAISCareer: record['Are you open to pursue a career related to AI Safety after this course?'] || '',
    intendToApplyRaw:
      record['Do you intend to apply the knowledge from this course to your: (Select all that apply)'] || '',
    intendToApplyCurrentJob:
      record[
        'Do you intend to apply the knowledge from this course to your: (Select all that apply) (Current job/studies)'
      ] || '',
    intendToApplyFutureCareer:
      record[
        'Do you intend to apply the knowledge from this course to your: (Select all that apply) (Future career plans)'
      ] || '',
    intendToApplyPersonalProjects:
      record[
        'Do you intend to apply the knowledge from this course to your: (Select all that apply) (Personal projects)'
      ] || '',
    intendToApplyCommunityInitiatives:
      record[
        'Do you intend to apply the knowledge from this course to your: (Select all that apply) (Community initiatives)'
      ] || '',
    intendToApplyResearch:
      record['Do you intend to apply the knowledge from this course to your: (Select all that apply) (Research)'] ||
      '',
    intendToApplyOther:
      record['Do you intend to apply the knowledge from this course to your: (Select all that apply) (Other)'] || '',
    pathInterest:
      record['Which of the following paths within AI safety interests you most? (Select one)'] || '',
    anticipatedBarriers: record['What barriers, if any, do you anticipate in contributing to AI safety?'] || '',
    hopedAchievements:
      record['Imagine this course goes really well for you — what would you like to have achieved by the end?\u00a0'] ||
      '',
    futureCoursesInterest:
      record['Would you be interested in joining additional courses related to AI Safety in the future?'] || '',
    otherComments: record['Any other comments or questions about the course?'] || '',
  }
}

/**
 * Parse AISF pre-survey CSV file
 */
export function parseAISFPreSurveyCSV(filePath: string): AISFPreSurveyRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  }) as Record<string, string>[]

  return records.map(mapAISFPreSurveyColumns)
}

/**
 * Map CSV column names to interface property names for AISF post-feedback
 */
function mapAISFPostFeedbackColumns(record: Record<string, string>): AISFPostFeedbackRow {
  return {
    submissionId: record['Submission ID'] || '',
    respondentId: record['Respondent ID'] || '',
    submittedAt: record['Submitted at'] || '',
    name: record['Name'] || '',
    email: record['Email Address'] || '',
    tracksEnrolled: record['What tracks did you enroll in?'] || '',
    finishedGovernanceTrack: record['Did you finish the AI Governance track?'] || '',
    finishedGovernanceTrackLearningOnly:
      record['Did you finish the AI Governance track? (No, I only finished the learning phase of the track?)'] || '',
    finishedGovernanceTrackFewSessions:
      record['Did you finish the AI Governance track? (No, I only attended a few sessions)'] || '',
    finishedGovernanceTrackFull:
      record['Did you finish the AI Governance track? (Yes, I finished  both the learning and project phase)'] || '',
    finishedAlignmentTrack: record['Did you finish the AI Alignment track?'] || '',
    finishedAlignmentTrackLearningOnly:
      record['Did you finish the AI Alignment track? (No, I only finished the learning phase of the track?)'] || '',
    finishedAlignmentTrackFewSessions:
      record['Did you finish the AI Alignment track? (No, I only attended a few sessions)'] || '',
    finishedAlignmentTrackFull:
      record['Did you finish the AI Alignment track? (Yes, I finished  both the learning and project phase)'] || '',
    finishedEconomicsTrack: record['Did you finish the Economics Impact of AI track?'] || '',
    finishedEconomicsTrackLearningOnly:
      record[
        'Did you finish the Economics Impact of AI track? (No, I only finished the learning phase of the track?)'
      ] || '',
    finishedEconomicsTrackFewSessions:
      record['Did you finish the Economics Impact of AI track? (No, I only attended a few sessions)'] || '',
    finishedEconomicsTrackFull:
      record[
        'Did you finish the Economics Impact of AI track? (Yes, I finished  both the learning and project phase)'
      ] || '',
    whyNotFinish: record['Why did you not finish this track?'] || '',
    overallSatisfaction: record['How satisfied were you with the course overall?\n'] || '',
    didntMeetExpectationsExplain: record["If it didn't meet your expectations, please explain why:"] || '',
    ratingPreReading: record['Pre-reading materials'] || '',
    ratingGroupDiscussions: record['Group discussions'] || '',
    ratingExercises: record['Exercises and activities'] || '',
    ratingProjectPhase: record['Project phase'] || '',
    ratingParticipantInteraction: record['Interaction with other participants'] || '',
    ratingFacilitatorGuidance: record['Facilitator guidance'] || '',
    mostValuable: record['What aspects of the course did you find most valuable?'] || '',
    couldBeImproved: record['What aspects of the course could be improved?'] || '',
    topicToAdd:
      record[
        "If you could add one topic to this course that wasn't covered (or wasn't covered enough), what would it be?"
      ] || '',
    wouldRecommend: record['Would you recommend this course to others?\n'] || '',
    aiSafetyContactsNow:
      record['How many people do you know that work on AIS that you could reach out to for a favour?'] || '',
    equippedToContributeNow: record['How equipped do you feel to contribute to AI Safety?'] || '',
    intendToPursueCareer: record['Do you intend to pursue a career related to AI Safety after this course?'] || '',
    pathInterestNow:
      record['Which of the following paths within AI safety interests you most? (Select one)'] || '',
    plansAsResultRaw: record['As a result of this course, do you plan to: (Select all that apply)\n'] || '',
    plansReadBooks:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Read books/articles on the topic)'] || '',
    plansCareerChange:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Change your career plans to focus more on AI safety)'
      ] || '',
    plansFurtherStudy:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Learn more about AI safety through further study)'
      ] || '',
    plansEngageCommunity:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Engage with the AI safety community)'] || '',
    plansApplyCourses:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Apply for further courses on AI safety)'] || '',
    plansDonate:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Donate to AI safety organizations)'] || '',
    plansTalkToOthers:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Talk to others about AI safety)'] || '',
    plansApplyShortTerm:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Apply for a short-term (<1 year) opportunity (e.g. fellowship, course, summer programme or internship))'
      ] || '',
    plansApplyFullTime:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Apply for a full-time role)'] || '',
    plansApplyGrant:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Apply for a grant, funding, or a scholarship)'
      ] || '',
    plansAcceptShortTerm:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Accept an offer or start a short-term opportunity)'
      ] || '',
    plansAcceptFullTime:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Accept an offer or start a full-time role)'
      ] || '',
    plansReceiveGrant:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Receive a grant, funding, or a scholarship)'
      ] || '',
    plansFoundOrg:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Found a new organisation)'] || '',
    plansHireShortTerm:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Hire someone for a short-term opportunity)'
      ] || '',
    plansHireFullTime:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Hire someone for a full-time role)'] || '',
    plansIdentifyGrantee:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Identify someone you want to give a grant, funding, or a scholarship)'
      ] || '',
    plansFindCollaborator:
      record[
        'As a result of this course, do you plan to: (Select all that apply)\n (Find a new collaborator, client, or partner on a project)'
      ] || '',
    plansPublishResearch:
      record['As a result of this course, do you plan to: (Select all that apply)\n (Publish research or writing)'] || '',
    plansNone:
      record['As a result of this course, do you plan to: (Select all that apply)\n (None of the above)'] || '',
    plansOther: record['As a result of this course, do you plan to: (Select all that apply)\n (Other)'] || '',
    applyKnowledgeToRaw:
      record['Do you intend to apply the knowledge from this course to your: (Select all that apply)'] || '',
    applyKnowledgeCurrentJob:
      record[
        'Do you intend to apply the knowledge from this course to your: (Select all that apply) (Current job/studies)'
      ] || '',
    applyKnowledgeFutureCareer:
      record[
        'Do you intend to apply the knowledge from this course to your: (Select all that apply) (Future career plans)'
      ] || '',
    applyKnowledgePersonalProjects:
      record[
        'Do you intend to apply the knowledge from this course to your: (Select all that apply) (Personal projects)'
      ] || '',
    applyKnowledgeCommunity:
      record[
        'Do you intend to apply the knowledge from this course to your: (Select all that apply) (Community initiatives)'
      ] || '',
    applyKnowledgeResearch:
      record['Do you intend to apply the knowledge from this course to your: (Select all that apply) (Research)'] ||
      '',
    applyKnowledgeOther:
      record['Do you intend to apply the knowledge from this course to your: (Select all that apply) (Other)'] || '',
    elaborateApplication:
      record["Please elaborate on how do you intend to apply the knowledge of the course the aspects you've mentioned"] ||
      '',
    specificActions3Months:
      record['What specific actions, if any, do you plan to take within the next 3 months as a result of this course?'] ||
      '',
    anticipatedObstacles:
      record['What obstacles, if any, do you anticipate in contributing to AI safety?'] || '',
    headshotUrl:
      record['Optional: Could you please share a headshot for us to showcase our participants?'] || '',
    bio: record['Optional: Please share a short bio of yourself'] || '',
    willingToTestimonial:
      record['Optional: Would you be willing to provide a testimonial about your experience in this course?\n'] || '',
    testimonial:
      record['If you said yes to question the question above, please provide your testimonial here:'] || '',
    anythingElse: record["Is there anything else you'd like to share about your experience?"] || '',
  }
}

/**
 * Parse AISF post-feedback CSV file
 */
export function parseAISFPostFeedbackCSV(filePath: string): AISFPostFeedbackRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  }) as Record<string, string>[]

  return records.map(mapAISFPostFeedbackColumns)
}

/**
 * Map CSV column names to interface property names for AISF dropout feedback
 */
function mapAISFDropoutFeedbackColumns(record: Record<string, string>): AISFDropoutFeedbackRow {
  return {
    submissionId: record['Submission ID'] || '',
    respondentId: record['Respondent ID'] || '',
    submittedAt: record['Submitted at'] || '',
    name: record['Your name'] || '',
    email: record['Your email address'] || '',
    coursesStartedRaw: record['Which course did you start with us? (Select all that apply)'] || '',
    coursesStartedGovernance:
      record['Which course did you start with us? (Select all that apply) (AI Governance)'] || '',
    coursesStartedAlignment:
      record['Which course did you start with us? (Select all that apply) (AI Alignment)'] || '',
    coursesStartedEconomics:
      record['Which course did you start with us? (Select all that apply) (Economics Impact of AI)'] || '',
    howFarGot: record[' How far did you get in the course?'] || '',
    mainReasonRaw: record['What was the main reason you stopped participating? (Select all that apply)'] || '',
    reasonTimeBusy:
      record[
        'What was the main reason you stopped participating? (Select all that apply) (Time commitments/too busy with work or studies)'
      ] || '',
    reasonTooDifficult:
      record[
        'What was the main reason you stopped participating? (Select all that apply) (Course content was too difficult/technical)'
      ] || '',
    reasonNotExpected:
      record[
        "What was the main reason you stopped participating? (Select all that apply) (Course content wasn't what I expected)"
      ] || '',
    reasonSchedule:
      record[
        "What was the main reason you stopped participating? (Select all that apply) (Discussion group time didn't work with my schedule)"
      ] || '',
    reasonPersonalCircumstances:
      record[
        'What was the main reason you stopped participating? (Select all that apply) (Personal/family circumstances changed)'
      ] || '',
    reasonLostInterest:
      record['What was the main reason you stopped participating? (Select all that apply) (Lost interest in the topic)'] ||
      '',
    reasonHealth:
      record['What was the main reason you stopped participating? (Select all that apply) (Health reasons)'] || '',
    reasonTooSlow:
      record[
        'What was the main reason you stopped participating? (Select all that apply) (Course was moving too slowly)'
      ] || '',
    reasonTooQuick:
      record[
        'What was the main reason you stopped participating? (Select all that apply) (Course was moving too quickly)'
      ] || '',
    reasonGroupDynamics:
      record[
        "What was the main reason you stopped participating? (Select all that apply) (Group dynamics didn't work well for me)"
      ] || '',
    reasonTechnicalIssues:
      record[
        'What was the main reason you stopped participating? (Select all that apply) (Technical issues (internet, platform, etc.))'
      ] || '',
    feedback: record['Please leave any feedback you have for us here'] || '',
    interestedToRetry:
      record['Would you be interested in trying again if we addressed some of the concerns you mentioned?'] || '',
    wouldRecommend:
      record['How likely would you be to recommend our courses to someone else, despite not completing it yourself?'] ||
      '',
  }
}

/**
 * Parse AISF dropout feedback CSV file
 */
export function parseAISFDropoutFeedbackCSV(filePath: string): AISFDropoutFeedbackRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  }) as Record<string, string>[]

  return records.map(mapAISFDropoutFeedbackColumns)
}

// =============================================================================
// Event Feedback CSV Types and Parsers
// =============================================================================

export interface FacilitatorImpactRow {
  submissionId: string
  respondentId: string
  submittedAt: string
  email: string
  fullName: string
  eventName: string
  eventType: string
  eventDate: string
  attendanceCount: string
  photos: string
  description: string
}

export interface ParticipantFeedbackRow {
  submissionId: string
  respondentId: string
  submittedAt: string
  fullName: string
  eventType: string
  eventDate: string
  facilitators: string
  rating: string
  beneficialAspects: string
  improvements: string
  futureEvents: string
  communicationChannels: string
  whatsapp: string
  slack: string
  mailingList: string
  email: string
  phone: string
  wouldRecommend: string
  referrals: string
  anythingElse: string
}

/**
 * Map CSV column names to interface property names for facilitator impact
 */
function mapFacilitatorImpactColumns(record: Record<string, string>): FacilitatorImpactRow {
  return {
    submissionId: record['Submission ID'] || '',
    respondentId: record['Respondent ID'] || '',
    submittedAt: record['Submitted at'] || '',
    email: record['Your email'] || '',
    fullName: record['Full name'] || '',
    eventName: record['What event did you host?'] || '',
    eventType: record['Event type'] || '',
    eventDate: record['What date was the event?'] || '',
    attendanceCount: record['How many people attended the event?'] || '',
    photos: record['Please upload some photos from the event'] || '',
    description: record['Briefly, what happened at the event and how did it go?'] || '',
  }
}

/**
 * Parse facilitator impact CSV file
 */
export function parseFacilitatorImpactCSV(filePath: string): FacilitatorImpactRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Handle inconsistent column counts
    relax_quotes: true, // Handle unescaped quotes
  }) as Record<string, string>[]

  return records.map(mapFacilitatorImpactColumns)
}

/**
 * Map CSV column names to interface property names for participant feedback
 */
function mapParticipantFeedbackColumns(record: Record<string, string>): ParticipantFeedbackRow {
  return {
    submissionId: record['Submission ID'] || '',
    respondentId: record['Respondent ID'] || '',
    submittedAt: record['Submitted at'] || '',
    fullName: record['Full name'] || '',
    eventType: record['Which event did you attend?'] || '',
    eventDate: record['What date was the event?'] || '',
    facilitators: record['Who facilitated the event?'] || '',
    rating: record['Overall, how would you rate the event on a scale from 1-10?'] || '',
    beneficialAspects: record['What aspects of the event were most beneficial?'] || '',
    improvements: record['What aspects of the event could we improve?'] || '',
    futureEvents: record['What kind of events do you hope to see us host in the future?'] || '',
    communicationChannels: record['Do you want to be added to our communication channels?'] || '',
    whatsapp: record['Do you want to be added to our communication channels? (WhatsApp Community)'] || '',
    slack: record['Do you want to be added to our communication channels? (Slack)'] || '',
    mailingList: record['Do you want to be added to our communication channels? (Mailing List)'] || '',
    email: record['Email'] || '',
    phone: record['Phone number'] || '',
    wouldRecommend: record['How likely would you be to recommend this event to a friend?'] || '',
    referrals: record["Is there anyone you'd like us to invite to future events?"] || '',
    anythingElse: record["Anything else you'd like to add?"] || '',
  }
}

/**
 * Parse participant feedback CSV file
 */
export function parseParticipantFeedbackCSV(filePath: string): ParticipantFeedbackRow[] {
  const content = readFileSync(filePath, 'utf-8')
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Handle inconsistent column counts
    relax_quotes: true, // Handle unescaped quotes
  }) as Record<string, string>[]

  return records.map(mapParticipantFeedbackColumns)
}

/**
 * Filter out hackathon rows and write skipped rows to a file
 */
export function filterHackathonRows<T extends { eventName?: string; eventType?: string }>(
  rows: T[],
  outputPath: string,
): { filtered: T[]; skipped: T[] } {
  const filtered: T[] = []
  const skipped: T[] = []

  for (const row of rows) {
    // Skip undefined/null rows
    if (!row) {
      continue
    }

    // Safely get event name/type, ensuring we have a string
    const eventNameStr = row.eventName || row.eventType || ''
    const eventName = typeof eventNameStr === 'string' ? eventNameStr.toLowerCase() : ''
    if (eventName.includes('hackathon')) {
      skipped.push(row)
    } else {
      filtered.push(row)
    }
  }

  // Write skipped rows to CSV
  if (skipped.length > 0) {
    const csv = stringify(skipped, { header: true })
    writeFileSync(outputPath, csv, 'utf-8')
    console.log(`  → Skipped ${skipped.length} hackathon row(s), written to ${outputPath}`)
  }

  return { filtered, skipped }
}

/**
 * Generate event slug from type and date
 */
export function generateEventSlug(eventType: string, eventDate: string): string {
  // Ensure we have valid strings
  const typeStr = eventType || 'event'
  const dateStr = eventDate || new Date().toISOString().split('T')[0]

  const typeSlug = typeStr
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  // Parse date and format as YYYY-MM-DD
  const date = new Date(dateStr)
  const formattedDate = isNaN(date.getTime())
    ? new Date().toISOString().split('T')[0]
    : date.toISOString().split('T')[0]

  return `${typeSlug}-${formattedDate}`
}

/**
 * Map event type string to Payload enum value
 */
export function mapEventType(
  eventName: string,
): 'workshop' | 'talk' | 'meetup' | 'reading_group' | 'retreat' | 'panel' | null {
  // Ensure we have a valid string
  if (!eventName || typeof eventName !== 'string') {
    return null
  }

  const lower = eventName.toLowerCase()

  if (lower.includes('reading group') || lower === 'paper reading group') {
    return 'reading_group'
  }
  if (lower.includes('hackathon')) {
    return null // Skip - handled by program import
  }
  if (lower.includes('workshop')) {
    return 'workshop'
  }
  if (lower.includes('talk')) {
    return 'talk'
  }
  if (lower.includes('meetup')) {
    return 'meetup'
  }
  if (lower.includes('retreat')) {
    return 'retreat'
  }
  if (lower.includes('panel')) {
    return 'panel'
  }

  // Default for "Other" or unknown
  return 'meetup'
}

/**
 * Facilitator name aliases mapping
 */
const FACILITATOR_ALIASES: Record<string, string> = {
  Caleb: 'Caleb Rudnick',
}

/**
 * Normalize facilitator name (expand aliases)
 */
export function normalizeFacilitatorName(name: string): string {
  return FACILITATOR_ALIASES[name] || name
}

/**
 * Parse comma-separated facilitator names
 */
export function parseFacilitatorNames(facilitatorsStr: string): string[] {
  if (!facilitatorsStr || !facilitatorsStr.trim()) {
    return []
  }

  return facilitatorsStr
    .split(',')
    .map((name) => normalizeFacilitatorName(name.trim()))
    .filter((name) => name.length > 0)
}
