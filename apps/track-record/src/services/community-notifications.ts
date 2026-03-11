import { sendEmail } from '@/services/email'

function sanitizeBaseUrl(value: string | undefined): string | undefined {
  if (!value) return undefined

  try {
    const url = new URL(value)
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (url.protocol !== 'https:' && !isLocalhost) {
      return undefined
    }
    return url.origin.replace(/\/$/, '')
  } catch {
    return undefined
  }
}

function getBaseUrl(): string {
  const configuredUrl =
    sanitizeBaseUrl(process.env.COMMUNITY_EDIT_BASE_URL) ||
    sanitizeBaseUrl(process.env.APP_BASE_URL)
  const fallbackUrl = sanitizeBaseUrl(process.env.NEXT_PUBLIC_SERVER_URL) || 'http://localhost:3000'

  return configuredUrl || fallbackUrl
}

function getReviewerEmails(): string[] {
  const csv = process.env.COMMUNITY_EDIT_ADMIN_EMAILS || ''
  return csv
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

export async function sendCommunityEditVerificationEmail(args: {
  email: string
  token: string
}): Promise<void> {
  const verifyUrl = `${getBaseUrl()}/community-edit/verify?token=${encodeURIComponent(args.token)}`

  await sendEmail({
    to: args.email,
    subject: 'Verify your email to update your AISSA profile',
    html: `
      <h1>Verify your email</h1>
      <p>Click the link below to verify your email and continue editing your AISSA profile.</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not request this, you can ignore this message.</p>
    `,
  })
}

export async function notifyReviewersOfCommunitySubmission(args: {
  submissionEmail: string
  submissionId: number | string
}): Promise<void> {
  const recipients = getReviewerEmails()
  if (recipients.length === 0) return

  const reviewUrl = `${getBaseUrl()}/admin/community-review/${args.submissionId}`

  await sendEmail({
    to: recipients,
    subject: `New community submission from ${args.submissionEmail}`,
    html: `
      <h1>New Community Submission</h1>
      <p><strong>From:</strong> ${args.submissionEmail}</p>
      <p><strong>Submission ID:</strong> ${args.submissionId}</p>
      <p><a href="${reviewUrl}">Open review</a></p>
    `,
  })
}

export async function sendCommunityEditSubmissionReceivedEmail(args: {
  email: string
}): Promise<void> {
  const reviewStatusUrl = `${getBaseUrl()}/community-edit/submitted`

  await sendEmail({
    to: args.email,
    subject: 'We received your AISSA profile update submission',
    html: `
      <h1>Submission received</h1>
      <p>Thanks for submitting updates to your AISSA record.</p>
      <p>Your submission is now pending staff review.</p>
      <p><a href="${reviewStatusUrl}">View submission confirmation</a></p>
    `,
  })
}

export async function sendCommunityEditOutcomeEmail(args: {
  email: string
  fullName: string
  notes?: string | null
  outcome: 'approved' | 'partial' | 'rejected'
}): Promise<void> {
  const outcomeTitle =
    args.outcome === 'approved'
      ? 'Your changes were approved'
      : args.outcome === 'partial'
        ? 'Your submission was partially approved'
        : 'Your submission review is complete'

  await sendEmail({
    to: args.email,
    subject: 'Update on your AISSA community edit submission',
    html: `
      <h1>${outcomeTitle}</h1>
      <p>Hi ${args.fullName},</p>
      <p>Your community edit submission has been reviewed.</p>
      ${args.notes ? `<p><strong>Reviewer notes:</strong> ${args.notes}</p>` : ''}
      <p>Thank you for helping keep AISSA records up to date.</p>
    `,
  })
}
