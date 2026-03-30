import type { GlobalConfig } from 'payload'

import { requireAuthenticatedUser } from '@/access/collectionAccess'
import {
  eventTypeDefaultImageFields,
  programTypeDefaultImageFields,
} from '@/lib/default-images'

function createUploadField({
  name,
  label,
}: {
  name: string
  label: string
}): GlobalConfig['fields'][number] {
  return {
    name,
    label,
    type: 'upload',
    relationTo: 'media',
  }
}

export const DefaultImages: GlobalConfig = {
  slug: 'default-images',
  admin: {
    group: 'Site Settings',
  },
  access: {
    read: () => true,
    update: requireAuthenticatedUser,
  },
  fields: [
    {
      name: 'eventTypeDefaults',
      label: 'Event Type Defaults',
      type: 'group',
      fields: eventTypeDefaultImageFields.map(createUploadField),
    },
    {
      name: 'programTypeDefaults',
      label: 'Program Type Defaults',
      type: 'group',
      fields: programTypeDefaultImageFields.map(createUploadField),
    },
  ],
}
