export type SendEmailParams = {
  html: string
  subject: string
  text?: string
  to: string | string[]
}

type MailgunResponse = {
  id?: string
  message?: string
}

function getMailgunConfig() {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  const baseUrl = (process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net').replace(/\/$/, '')
  const from =
    process.env.MAILGUN_FROM || process.env.EMAIL_FROM || `AISSA <postmaster@${domain || ''}>`

  if (!apiKey) throw new Error('MAILGUN_API_KEY is not set.')
  if (!domain) throw new Error('MAILGUN_DOMAIN is not set.')

  return { apiKey, baseUrl, domain, from }
}

function normalizeRecipients(to: string | string[]): string[] {
  const recipients = Array.isArray(to) ? to : [to]
  return recipients.map((entry) => entry.trim()).filter((entry) => entry.length > 0)
}

export async function sendMailgunEmail(params: SendEmailParams): Promise<MailgunResponse> {
  const recipients = normalizeRecipients(params.to)
  if (recipients.length === 0) {
    throw new Error('At least one email recipient is required.')
  }

  const { apiKey, baseUrl, domain, from } = getMailgunConfig()
  const url = `${baseUrl}/v3/${domain}/messages`
  const form = new URLSearchParams()
  form.set('from', from)
  for (const recipient of recipients) {
    form.append('to', recipient)
  }
  form.set('subject', params.subject)
  form.set('html', params.html)
  if (params.text?.trim()) {
    form.set('text', params.text.trim())
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })

  const rawBody = await response.text()
  let parsed: MailgunResponse | undefined
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as MailgunResponse) : undefined
  } catch {
    parsed = undefined
  }

  if (!response.ok) {
    throw new Error(`Mailgun send failed (${response.status}): ${rawBody || 'Unknown error'}`)
  }

  return parsed ?? {}
}
