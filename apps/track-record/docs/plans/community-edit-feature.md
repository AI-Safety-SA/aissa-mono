# Community Edit Feature: Implementation Plan

**Created:** 2026-02-25  
**Status:** Draft  
**Branch:** TBD

## Overview

Allow community members to verify their identity via email and submit updates to their own records, including profile changes, engagements, testimonials, and engagement impacts. All changes go through an admin review process before being applied to live data.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STAGED DATA MODEL                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CommunitySubmission (parent)                                               │
│       │                                                                     │
│       ├── StagedPersonUpdate[]         (profile field changes)              │
│       ├── StagedEngagement[]           (new/updated engagements)            │
│       ├── StagedEngagementRemoval[]    (engagement removals)                │
│       ├── StagedTestimonial[]          (new testimonials per context)       │
│       └── StagedEngagementImpact[]     (new impacts per context)            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Target Collections (Live Data)

| Staged Collection            | Target Collection    | Purpose                                 |
| ---------------------------- | -------------------- | --------------------------------------- |
| `staged-person-updates`      | `persons`            | Profile field updates                   |
| `staged-engagements`         | `engagements`        | New/updated event/program participation |
| `staged-engagement-removals` | `engagements`        | Remove incorrect engagements            |
| `staged-testimonials`        | `testimonials`       | New testimonials per context            |
| `staged-engagement-impacts`  | `engagement-impacts` | Career impact stories                   |

---

## Phase 1: Staged Collections

### 1.1 CommunitySubmission (Parent Collection)

**File:** `src/collections/CommunitySubmissions.ts`

```typescript
{
  slug: 'community-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['person', 'email', 'status', 'submittedAt', 'reviewedAt'],
    group: 'Community Edits',
  },
  fields: [
    // Identity
    { name: 'person', type: 'relationship', relationTo: 'persons', required: true, index: true },
    { name: 'email', type: 'email', required: true },
    { name: 'verifiedEmail', type: 'checkbox', defaultValue: false },
    { name: 'verificationToken', type: 'text', index: true },
    { name: 'verificationExpires', type: 'date' },

    // Status
    { name: 'status', type: 'select',
      options: ['draft', 'pending_verification', 'pending_review', 'approved', 'rejected', 'partial'],
      defaultValue: 'draft',
      index: true,
    },

    // Review
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users' },
    { name: 'reviewedAt', type: 'date' },
    { name: 'reviewNotes', type: 'textarea' },

    // Timestamps
    { name: 'submittedAt', type: 'date' },

    // General testimonial (optional, at end of form)
    { name: 'generalTestimonial', type: 'textarea',
      admin: { description: 'Optional general testimonial about AISSA' }
    },
    { name: 'generalTestimonialConsent', type: 'checkbox', defaultValue: false,
      admin: { description: 'Consent to publish this testimonial' }
    },
  ]
}
```

### 1.2 StagedPersonUpdate

**File:** `src/collections/StagedPersonUpdates.ts`

```typescript
{
  slug: 'staged-person-updates',
  admin: {
    useAsTitle: 'field',
    group: 'Community Edits',
  },
  fields: [
    { name: 'submission', type: 'relationship', relationTo: 'community-submissions', required: true, index: true },
    { name: 'field', type: 'select', required: true,
      options: [
        { label: 'Full Name', value: 'fullName' },
        { label: 'Preferred Name', value: 'preferredName' },
        { label: 'Person Tag', value: 'personTag' },
        { label: 'Bio', value: 'bio' },
        { label: 'Website URL', value: 'websiteUrl' },
        { label: 'Organisation', value: 'organisation' },
        { label: 'Headshot', value: 'headshot' },
      ],
    },
    { name: 'currentValue', type: 'json', admin: { readOnly: true } },
    { name: 'proposedValue', type: 'json' },
    { name: 'reviewStatus', type: 'select',
      options: ['pending', 'approved', 'rejected'],
      defaultValue: 'pending',
    },
    { name: 'reviewNotes', type: 'text' },
  ]
}
```

### 1.3 StagedEngagement

**File:** `src/collections/StagedEngagements.ts`

```typescript
{
  slug: 'staged-engagements',
  admin: {
    useAsTitle: 'id',
    group: 'Community Edits',
  },
  fields: [
    { name: 'submission', type: 'relationship', relationTo: 'community-submissions', required: true, index: true },

    // Context (polymorphic)
    { name: 'context', type: 'relationship', relationTo: ['events', 'programs'], required: true, index: true },
    { name: 'contextKind', type: 'select', options: ['event', 'program'], admin: { readOnly: true } },
    { name: 'contextDate', type: 'date', admin: { readOnly: true } },

    // Engagement details
    { name: 'type', type: 'select', required: true,
      options: ['participant', 'facilitator', 'speaker', 'volunteer', 'organizer', 'mentor', 'other'],
    },
    { name: 'typeOther', type: 'text',
      admin: { condition: (data) => data.type === 'other' },
      required: true,
    },
    { name: 'engagementStatus', type: 'select',
      options: ['completed', 'dropped_out', 'in_progress', 'withdrawn', 'attended'],
    },
    { name: 'rating', type: 'number', min: 1, max: 10 },
    { name: 'wouldRecommend', type: 'number', min: 1, max: 10 },

    // Link to existing engagement (if updating)
    { name: 'existingEngagement', type: 'relationship', relationTo: 'engagements',
      admin: { description: 'If updating an existing engagement, link it here' }
    },
    { name: 'operation', type: 'select', required: true, defaultValue: 'create',
      options: ['create', 'update'],
    },

    // Review
    { name: 'reviewStatus', type: 'select', options: ['pending', 'approved', 'rejected'], defaultValue: 'pending' },
    { name: 'reviewNotes', type: 'text' },
  ],
  hooks: {
    beforeValidate: [/* derive contextKind and contextDate like Engagements.ts */],
  },
}
```

### 1.4 StagedEngagementRemoval

**File:** `src/collections/StagedEngagementRemovals.ts`

```typescript
{
  slug: 'staged-engagement-removals',
  admin: { group: 'Community Edits' },
  fields: [
    { name: 'submission', type: 'relationship', relationTo: 'community-submissions', required: true, index: true },
    { name: 'engagement', type: 'relationship', relationTo: 'engagements', required: true },
    { name: 'reason', type: 'textarea',
      admin: { description: 'Why should this engagement be removed?' }
    },
    { name: 'reviewStatus', type: 'select', options: ['pending', 'approved', 'rejected'], defaultValue: 'pending' },
    { name: 'reviewNotes', type: 'text' },
  ]
}
```

### 1.5 StagedTestimonial

**File:** `src/collections/StagedTestimonials.ts`

```typescript
{
  slug: 'staged-testimonials',
  admin: { group: 'Community Edits' },
  fields: [
    { name: 'submission', type: 'relationship', relationTo: 'community-submissions', required: true, index: true },

    // Context (optional - can be per event/program or general)
    { name: 'context', type: 'relationship', relationTo: ['events', 'programs'],
      admin: { description: 'Optional: link to specific event/program' }
    },
    { name: 'contextKind', type: 'select', options: ['event', 'program'], admin: { readOnly: true } },
    { name: 'contextDate', type: 'date', admin: { readOnly: true } },

    // Testimonial content
    { name: 'quote', type: 'textarea', required: true },
    { name: 'rating', type: 'number', min: 1, max: 10 },
    { name: 'consentToPublish', type: 'checkbox', defaultValue: false,
      admin: { description: 'Consent to publish this testimonial publicly' }
    },

    // Review
    { name: 'reviewStatus', type: 'select', options: ['pending', 'approved', 'rejected'], defaultValue: 'pending' },
    { name: 'reviewNotes', type: 'text' },
  ],
  hooks: {
    beforeValidate: [/* derive contextKind and contextDate if context provided */],
  },
}
```

### 1.6 StagedEngagementImpact

**File:** `src/collections/StagedEngagementImpacts.ts`

```typescript
{
  slug: 'staged-engagement-impacts',
  admin: { group: 'Community Edits' },
  fields: [
    { name: 'submission', type: 'relationship', relationTo: 'community-submissions', required: true, index: true },

    // Context (the program/event that caused the impact)
    { name: 'context', type: 'relationship', relationTo: ['events', 'programs'], required: true, index: true,
      admin: { description: 'The event/program that influenced this career impact' }
    },
    { name: 'contextKind', type: 'select', options: ['event', 'program'], admin: { readOnly: true } },

    // Impact details
    { name: 'type', type: 'select', required: true,
      options: [
        { label: 'Career Transition', value: 'career_transition' },
        { label: 'Research Contribution', value: 'research_contribution' },
        { label: 'Community Building', value: 'community_building' },
        { label: 'Educational', value: 'educational' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'typeOther', type: 'text',
      admin: { condition: (data) => data.type === 'other' },
      required: true,
    },
    { name: 'summary', type: 'textarea', required: true,
      admin: { description: 'Tell us the story of how this engagement impacted you' }
    },
    { name: 'evidenceUrl', type: 'text',
      admin: { description: 'Optional link to evidence' }
    },
    { name: 'aissaInfluenceScore', type: 'number', min: 1, max: 5,
      admin: { description: 'How influential was AISSA in this impact? (1-5)' }
    },
    { name: 'actionCategory', type: 'select',
      options: ['career_role', 'grant', 'internship', 'academic_pivot', 'upskilling', 'community_building', 'research'],
    },

    // Review
    { name: 'reviewStatus', type: 'select', options: ['pending', 'approved', 'rejected'], defaultValue: 'pending' },
    { name: 'reviewNotes', type: 'text' },
  ],
  hooks: {
    beforeValidate: [/* derive contextKind */],
  },
}
```

---

## Phase 2: Email Verification Flow

### 2.1 Verification Token Generation

**File:** `src/utilities/verification-token.ts`

```typescript
import crypto from 'crypto'

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

export function getTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 24) // 24 hour expiry
  return expiry
}
```

### 2.2 Verification API Endpoint

**File:** `src/app/api/community-edit/verify/route.ts`

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const { token } = await request.json()

  const submission = await payload.find({
    collection: 'community-submissions',
    where: {
      verificationToken: { equals: token },
      verificationExpires: { greater_than: new Date() },
    },
    limit: 1,
  })

  if (!submission.docs[0]) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  await payload.update({
    collection: 'community-submissions',
    id: submission.docs[0].id,
    data: {
      verifiedEmail: true,
      verificationToken: null,
      verificationExpires: null,
      status: 'pending_review',
    },
  })

  // Notify admins of new submission
  await notifyAdminsOfSubmission(payload, submission.docs[0])

  return NextResponse.json({ success: true, submissionId: submission.docs[0].id })
}
```

### 2.3 Email Service Integration

**File:** `src/services/email.ts`

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'AISSA <noreply@aissa.org>',
    to,
    subject,
    html,
  })
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  submissionId: string,
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/community-edit/verify?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Verify your email to update your AISSA profile',
    html: `
      <h1>Verify your email</h1>
      <p>Click the link below to verify your email and continue editing your profile:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  })
}
```

---

## Phase 3: Community Member Frontend Flow

### 3.1 Page Structure

```
/community-edit
├── page.tsx                    (Landing / Step 1: Enter email)
├── verify/
│   └── page.tsx               (Step 2: Handle magic link)
├── profile/
│   └── page.tsx               (Step 3: Update profile fields)
├── engagements/
│   └── page.tsx               (Step 4: Select events/programs)
├── testimonials/
│   └── page.tsx               (Step 5: Add testimonials per context)
├── impacts/
│   └── page.tsx               (Step 6: Report career impacts)
├── review/
│   └── page.tsx               (Step 7: Review all changes)
└── submitted/
    └── page.tsx               (Step 8: Confirmation)
```

### 3.2 Identity Matching Logic

**File:** `src/utilities/person-matching.ts`

```typescript
import type { Payload } from 'payload'

interface PersonMatchResult {
  exactMatch: any | null
  fuzzyMatches: any[]
  placeholder: boolean
}

export async function findPersonMatch(
  payload: Payload,
  email: string,
  fullName?: string,
): Promise<PersonMatchResult> {
  // 1. Exact email match
  const emailMatch = await payload.find({
    collection: 'persons',
    where: { email: { equals: email.toLowerCase() } },
    limit: 1,
  })

  if (emailMatch.docs[0]) {
    return {
      exactMatch: emailMatch.docs[0],
      fuzzyMatches: [],
      placeholder: isPlaceholderEmail(emailMatch.docs[0].email),
    }
  }

  // 2. Exact name match
  if (fullName) {
    const nameMatch = await payload.find({
      collection: 'persons',
      where: { fullName: { equals: fullName } },
      limit: 10,
    })

    if (nameMatch.docs.length === 1) {
      return { exactMatch: nameMatch.docs[0], fuzzyMatches: [], placeholder: true }
    }

    if (nameMatch.docs.length > 1) {
      return { exactMatch: null, fuzzyMatches: nameMatch.docs, placeholder: true }
    }
  }

  // 3. Fuzzy name match (first name)
  if (fullName) {
    const firstName = fullName.split(' ')[0]
    const fuzzyMatches = await payload.find({
      collection: 'persons',
      where: { fullName: { like: firstName } },
      limit: 5,
    })

    return { exactMatch: null, fuzzyMatches: fuzzyMatches.docs, placeholder: true }
  }

  return { exactMatch: null, fuzzyMatches: [], placeholder: true }
}

function isPlaceholderEmail(email: string): boolean {
  const placeholderPatterns = [
    /placeholder/i,
    /example\.com$/i,
    /noemail/i,
    /TBD/i,
    /xxx@xxx\.com$/i,
  ]
  return placeholderPatterns.some((p) => p.test(email))
}
```

### 3.3 Session Management

**File:** `src/utilities/community-session.ts`

Store submission ID in encrypted cookie to maintain state across steps.

```typescript
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.PAYLOAD_SECRET)

export async function createSession(submissionId: string): Promise<void> {
  const token = await new SignJWT({ submissionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(SECRET)

  cookies().set('community_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export async function getSession(): Promise<{ submissionId: string } | null> {
  const token = cookies().get('community_session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { submissionId: string }
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  cookies().delete('community_session')
}
```

---

## Phase 4: Admin Review Interface

### 4.1 Custom Admin View

**File:** `src/app/(payload)/admin/community-review/[id]/page.tsx`

Custom admin view for reviewing submissions with diff display.

### 4.2 Diff Display Component

**File:** `src/components/admin/CommunityReview/DiffField.tsx`

```typescript
interface DiffFieldProps {
  field: string
  currentValue: any
  proposedValue: any
  reviewStatus: 'pending' | 'approved' | 'rejected'
  onApprove: () => void
  onReject: () => void
}

export function DiffField({ field, currentValue, proposedValue, reviewStatus, onApprove, onReject }: DiffFieldProps) {
  return (
    <div className="diff-field">
      <div className="field-name">{field}</div>
      <div className="values">
        <div className="current">
          <label>Current:</label>
          <span>{formatValue(currentValue)}</span>
        </div>
        <div className="proposed">
          <label>Proposed:</label>
          <span>{formatValue(proposedValue)}</span>
        </div>
      </div>
      <div className="actions">
        <Checkbox
          checked={reviewStatus === 'approved'}
          onCheckedChange={(checked) => checked ? onApprove() : null}
        >
          Approve
        </Checkbox>
        <Checkbox
          checked={reviewStatus === 'rejected'}
          onCheckedChange={(checked) => checked ? onReject() : null}
        >
          Reject
        </Checkbox>
      </div>
    </div>
  )
}
```

### 4.3 Apply Changes Function

**File:** `src/utilities/apply-submission.ts`

```typescript
import type { Payload, PayloadRequest } from 'payload'

export async function applySubmissionChanges(
  payload: Payload,
  submissionId: string,
  req: PayloadRequest,
): Promise<void> {
  const submission = await payload.findByID({
    collection: 'community-submissions',
    id: submissionId,
    depth: 0,
  })

  // 1. Apply approved person updates
  const personUpdates = await payload.find({
    collection: 'staged-person-updates',
    where: {
      submission: { equals: submissionId },
      reviewStatus: { equals: 'approved' },
    },
  })

  for (const update of personUpdates.docs) {
    await payload.update({
      collection: 'persons',
      id: submission.person,
      data: { [update.field]: update.proposedValue },
      req,
    })
  }

  // 2. Apply approved engagements
  const engagements = await payload.find({
    collection: 'staged-engagements',
    where: {
      submission: { equals: submissionId },
      reviewStatus: { equals: 'approved' },
    },
  })

  for (const engagement of engagements.docs) {
    if (engagement.operation === 'create') {
      await payload.create({
        collection: 'engagements',
        data: {
          person: submission.person,
          context: engagement.context,
          contextKind: engagement.contextKind,
          type: engagement.type,
          engagementStatus: engagement.engagementStatus,
          rating: engagement.rating,
          wouldRecommend: engagement.wouldRecommend,
        },
        req,
      })
    } else if (engagement.operation === 'update' && engagement.existingEngagement) {
      await payload.update({
        collection: 'engagements',
        id: engagement.existingEngagement,
        data: {
          type: engagement.type,
          engagementStatus: engagement.engagementStatus,
          rating: engagement.rating,
          wouldRecommend: engagement.wouldRecommend,
        },
        req,
      })
    }
  }

  // 3. Apply approved removals
  const removals = await payload.find({
    collection: 'staged-engagement-removals',
    where: {
      submission: { equals: submissionId },
      reviewStatus: { equals: 'approved' },
    },
  })

  for (const removal of removals.docs) {
    await payload.delete({
      collection: 'engagements',
      id: removal.engagement,
      req,
    })
  }

  // 4. Apply approved testimonials
  const testimonials = await payload.find({
    collection: 'staged-testimonials',
    where: {
      submission: { equals: submissionId },
      reviewStatus: { equals: 'approved' },
    },
  })

  for (const testimonial of testimonials.docs) {
    await payload.create({
      collection: 'testimonials',
      data: {
        person: submission.person,
        context: testimonial.context,
        contextKind: testimonial.contextKind,
        quote: testimonial.quote,
        rating: testimonial.rating,
        isPublished: testimonial.consentToPublish,
      },
      req,
    })
  }

  // 5. Apply approved impacts
  const impacts = await payload.find({
    collection: 'staged-engagement-impacts',
    where: {
      submission: { equals: submissionId },
      reviewStatus: { equals: 'approved' },
    },
  })

  for (const impact of impacts.docs) {
    await payload.create({
      collection: 'engagement-impacts',
      data: {
        person: submission.person,
        type: impact.type,
        typeOther: impact.typeOther,
        summary: impact.summary,
        evidenceUrl: impact.evidenceUrl,
        aissa_influence_score: impact.aissaInfluenceScore,
        action_category: impact.actionCategory,
        isVerified: true,
      },
      req,
    })
  }

  // 6. Create general testimonial if provided
  if (submission.generalTestimonial && submission.generalTestimonialConsent) {
    await payload.create({
      collection: 'testimonials',
      data: {
        person: submission.person,
        quote: submission.generalTestimonial,
        isPublished: true,
      },
      req,
    })
  }

  // 7. Update submission status
  await payload.update({
    collection: 'community-submissions',
    id: submissionId,
    data: {
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: req.user?.id,
    },
    req,
  })

  // 8. Notify community member
  await sendApprovalNotification(payload, submission)
}
```

---

## Phase 5: Notifications

### 5.1 Admin Notification

**File:** `src/services/notifications.ts`

```typescript
import type { Payload } from 'payload'
import { sendEmail } from './email'

export async function notifyAdminsOfSubmission(payload: Payload, submission: any): Promise<void> {
  const admins = await payload.find({
    collection: 'users',
    where: { roles: { contains: 'admin' } },
  })

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  for (const admin of admins.docs) {
    await sendEmail({
      to: admin.email,
      subject: `New community submission from ${submission.email}`,
      html: `
        <h1>New Community Submission</h1>
        <p><strong>From:</strong> ${submission.email}</p>
        <p><strong>Person ID:</strong> ${submission.person}</p>
        <p><strong>Submitted:</strong> ${submission.submittedAt}</p>
        <p><a href="${baseUrl}/admin/community-review/${submission.id}">Review Submission</a></p>
      `,
    })
  }
}
```

### 5.2 Community Member Notification

```typescript
export async function sendApprovalNotification(payload: Payload, submission: any): Promise<void> {
  const person = await payload.findByID({
    collection: 'persons',
    id: submission.person,
  })

  await sendEmail({
    to: submission.email,
    subject: 'Your AISSA profile has been updated',
    html: `
      <h1>Your changes have been approved</h1>
      <p>Hi ${person.preferredName || person.fullName},</p>
      <p>Your submitted changes to your AISSA profile have been reviewed and approved.</p>
      <p>Thank you for keeping your information up to date!</p>
    `,
  })
}

export async function sendRejectionNotification(payload: Payload, submission: any): Promise<void> {
  const person = await payload.findByID({
    collection: 'persons',
    id: submission.person,
  })

  await sendEmail({
    to: submission.email,
    subject: 'Update on your AISSA profile submission',
    html: `
      <h1>Submission Review Complete</h1>
      <p>Hi ${person.preferredName || person.fullName},</p>
      <p>Thank you for your submission. Some of your proposed changes were not approved.</p>
      ${submission.reviewNotes ? `<p><strong>Notes:</strong> ${submission.reviewNotes}</p>` : ''}
      <p>If you have questions, please contact us.</p>
    `,
  })
}
```

---

## Phase 6: Collection Registration

Update `src/collections/index.ts`:

```typescript
export const collections: CollectionConfig[] = [
  // ... existing collections
  CommunitySubmissions,
  StagedPersonUpdates,
  StagedEngagements,
  StagedEngagementRemovals,
  StagedTestimonials,
  StagedEngagementImpacts,
]
```

---

## Implementation Order

| Phase | Task                                         | Effort   | Dependencies  |
| ----- | -------------------------------------------- | -------- | ------------- |
| 1.1   | Create `CommunitySubmissions` collection     | 2h       | None          |
| 1.2   | Create `StagedPersonUpdates` collection      | 1h       | 1.1           |
| 1.3   | Create `StagedEngagements` collection        | 2h       | 1.1           |
| 1.4   | Create `StagedEngagementRemovals` collection | 1h       | 1.1           |
| 1.5   | Create `StagedTestimonials` collection       | 1.5h     | 1.1           |
| 1.6   | Create `StagedEngagementImpacts` collection  | 1.5h     | 1.1           |
| 1.7   | Run migrations                               | 0.5h     | 1.1-1.6       |
| 2.1   | Verification token utilities                 | 1h       | None          |
| 2.2   | Verification API endpoint                    | 2h       | 2.1, 1.1      |
| 2.3   | Email service (Resend) integration           | 2h       | None          |
| 3.1   | Person matching utility                      | 1.5h     | None          |
| 3.2   | Session management                           | 1.5h     | None          |
| 3.3   | Frontend: Identify page                      | 2h       | 3.1, 2.3      |
| 3.4   | Frontend: Verify page                        | 1h       | 2.2           |
| 3.5   | Frontend: Profile page                       | 2h       | 3.2, 1.2      |
| 3.6   | Frontend: Engagements page                   | 3h       | 3.2, 1.3, 1.4 |
| 3.7   | Frontend: Testimonials page                  | 2h       | 3.2, 1.5      |
| 3.8   | Frontend: Impacts page                       | 2h       | 3.2, 1.6      |
| 3.9   | Frontend: Review page                        | 2h       | 3.2           |
| 3.10  | Frontend: Submitted page                     | 1h       | None          |
| 4.1   | Admin review view structure                  | 2h       | 1.1-1.6       |
| 4.2   | Diff display components                      | 3h       | 4.1           |
| 4.3   | Apply changes function                       | 2h       | 4.2           |
| 5.1   | Admin notifications                          | 1.5h     | 2.3           |
| 5.2   | Community member notifications               | 1.5h     | 2.3           |
| 6     | Collection registration + testing            | 1h       | All           |
|       | **Total**                                    | **~40h** |               |

---

## Environment Variables Required

```env
# Email service
RESEND_API_KEY=re_xxx
EMAIL_FROM=AISSA <noreply@aissa.org>

# App URL
NEXT_PUBLIC_SERVER_URL=https://track-record.aissa.org
```

---

## Decisions Made

1. **Email verification**: Magic link approach (email ownership = identity proof)
2. **Placeholder emails**: Users must provide real email and verify before proceeding
3. **Testimonial UX**: Rating per engagement + optional general testimonial at end
4. **Admin review**: Per-field granular approval with bulk actions
5. **Conflict resolution**: Community edits show live diff (current vs proposed) at review time
6. **Notifications**: Both admins and community members receive notifications

---

## Future Improvements (Out of Scope)

- Rate limiting on submissions
- Expiration of pending submissions
- Conflict detection if admin edits same record
- Bulk submission review dashboard
- Webhook notifications to Slack/Discord
