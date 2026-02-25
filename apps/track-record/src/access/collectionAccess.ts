import type { Access, CollectionConfig } from 'payload'

export const requireAuthenticatedUser: Access = ({ req: { user } }) => Boolean(user)

export function applyGlobalCollectionAccessPolicy(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    access: {
      create: requireAuthenticatedUser,
      delete: requireAuthenticatedUser,
      read: requireAuthenticatedUser,
      unlock: requireAuthenticatedUser,
      update: requireAuthenticatedUser,
      ...collection.access,
    },
  }
}
