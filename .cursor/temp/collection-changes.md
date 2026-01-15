## Relevant Object Schemas

### Person needs some updates: 

Enhance `Persons` collection with computed/self-reported metrics:

```typescript
// Additions to Persons collection:
{
  // ... existing fields ...
  
  // Computed metrics (via hooks or queries)
  totalEngagements: number // Computed count
  totalImpacts: number // Computed count
  firstEngagementDate: date // Computed
  lastEngagementDate: date // Computed
  
  // Self-reported baseline (from first assessment)
  baselineCapability: number // First recorded selfReportedCapability
  baselineNetworkSize: number // First recorded networkSize
  baselineUnderstanding: number // First recorded understandingOfRisks
}
```

Add a summary field for "Current Status" so you don't have to scan every event to know where they are.

```typescript
// Add to Persons Collection
{
  current_impact_stage: select ['awareness', 'learning', 'application', 'contribution'],
  total_engagement_hours: number
}
```

### Engagement needs some updates:

Add these fields to the Engagements collection. This turns the engagement record into the container for the "Delta" (change over time).

```typescript
// Add to Engagements Collection
{
  // Impact Deltas (Post-survey value minus Pre-survey value)
  delta_capability: number, // e.g., +2
  delta_network_size: number, // e.g., +5
  
  // Outcome Flags (Populated from Post-survey or Follow-up)
  outcome_career_intent: select ['no_change', 'considering', 'applying', 'hired'],
  outcome_project_status: select ['none', 'started', 'completed'],
  
  // Links to specific surveys for audit trails
  pre_survey_submission: relationship('feedback-submissions'),
  post_survey_submission: relationship('feedback-submissions')
}
```

could be nice to try track career impact of a given engagement? 

```typescript
  // Career impact
  careerImpact: select [
    'no_change',
    'considering_transition',
    'actively_transitioning',
    'transitioned',
    'enhanced_current_role'
  ]
```

### EngagementImpact needs some updates:

Need to slightly tweak `EngagementImpacts` to capture the specific "Attribution/Influence" data from the surveys.

```typescript
// Add to EngagementImpacts Collection
{
  // 1. The Influence Score (Crucial for "Counterfactual Impact")
  aissa_influence_score: number, // 1-5 from your survey
  
  // 2. Link back to the survey for evidence
  source_submission: relationship('feedback-submissions'),
  
  // 3. (Optional) Tagging specific actions
  action_category: select [
    'career_role', 
    'grant', 
    'internship', 
    'academic_pivot', 
    'upskilling', 
    'community_building', 
    'research'
  ]
}
```

### FeedbackSubmissions needs some updates:

You need to add specific columns to FeedbackSubmissions so you don't have to parse JSON to find out if someone is new or what their capability score is.

```typescript
// Update your FeedbackSubmissions collection
{
  // 1. Classify the Form Type
  formType: select ['event_feedback', 'program_pre', 'program_post', 'program_longitudinal', 'annual'],
  
  // 2. The "Event" Core Metrics (Top-level for easy stats)
  isFirstTimeAttendee: boolean, // Crucial for your "New vs Recurring" metric
  marketingSource: select ['newsletter', 'linkedin', 'friend', 'university', 'other'],

  // 3. The "Program" Longitudinal Metrics (Top-level for delta tracking)
  selfReportedCapability: number, // 1-10
  networkSize: number, // Raw number
  understandingOfRisks: number (1-5 scale) // "How would you rate your understanding of AI risks?"
  // 4. Linkage
  engagement: relationship('engagements'), // Link this specific feedback to the Course/Event
  
  // ... existing fields (rating, answers JSON, etc.)
}
```
