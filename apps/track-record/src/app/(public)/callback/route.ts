import { handleAuth } from '@workos-inc/authkit-nextjs'
import { getPayload } from 'payload'
import config from '@payload-config'
import { resolveOrCreatePersonForWorkOSUser } from '@/utilities/workos-person'

export const GET = handleAuth({
  returnPathname: '/member',
  onSuccess: async ({ user }) => {
    const payload = await getPayload({ config })
    await resolveOrCreatePersonForWorkOSUser(payload, user)
  },
})
