import { withAuth } from '@workos-inc/authkit-nextjs'
import { getPayload } from 'payload'
import config from '@payload-config'
import { resolveOrCreatePersonForWorkOSUser } from '@/utilities/workos-person'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await withAuth({ ensureSignedIn: true })
  const payload = await getPayload({ config })
  const person = await resolveOrCreatePersonForWorkOSUser(payload, auth.user)

  return Response.json({
    person: {
      email: person.email,
      fullName: person.fullName,
      id: person.id,
      workosUserId: person.workosUserId ?? auth.user.id,
    },
    sessionId: auth.sessionId,
    user: {
      email: auth.user.email,
      id: auth.user.id,
    },
  })
}
