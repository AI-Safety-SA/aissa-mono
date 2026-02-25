import type { CollectionConfig, Endpoint } from 'payload'

const disableFirstRegisterEndpoint: Endpoint = {
  path: '/first-register',
  method: 'post',
  handler: async () => {
    return Response.json({ error: 'Not found' }, { status: 404 })
  },
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  endpoints: [disableFirstRegisterEndpoint],
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
