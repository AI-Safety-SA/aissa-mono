---
name: Add Gallery Images
overview: Add an images gallery field to Programs, Events, and Cohorts collections, where each image can be marked as "highlighted" for frontend card display.
todos:
  - id: add-programs-images
    content: Add images array field to Programs collection
    status: pending
  - id: add-events-images
    content: Add images array field to Events collection
    status: pending
  - id: add-cohorts-images
    content: Add images array field to Cohorts collection
    status: pending
  - id: generate-types
    content: Run pnpm generate:types to update TypeScript types
    status: pending
---

# Add Gallery Images with Highlighted Selection

## Approach

Use an **array field** containing image objects, where each object has:

- An `image` upload relationship to the `media` collection
- An `isHighlighted` checkbox to mark the featured image

This approach ensures the highlighted image is always part of the gallery and provides clean data structure for the frontend.

## Implementation

### Field Structure (same for all three collections)

The array field is **optional** - programs/events/cohorts can exist without any images.

```typescript
{
  name: 'images',
  type: 'array',
  label: 'Gallery Images',
  admin: {
    description: 'Upload images and mark one as highlighted for card display',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isHighlighted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Use this image for card thumbnails',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption for this image',
      },
    },
  ],
}
```

### Files to Modify

- [src/collections/Programs.ts](src/collections/Programs.ts) - Add images array field
- [src/collections/Events.ts](src/collections/Events.ts) - Add images array field
- [src/collections/Cohorts.ts](src/collections/Cohorts.ts) - Add images array field

### Frontend Usage

The frontend can query and access the highlighted image like this:

```typescript
const highlightedImage = doc.images?.find(img => img.isHighlighted)?.image
// Fallback to first image if none highlighted
const cardImage = highlightedImage || doc.images?.[0]?.image
```

### Post-Implementation Steps

1. Run `pnpm generate:types` to regenerate TypeScript types
2. Run `pnpm generate:importmap` if any custom components are added
3. Create a database migration if needed for existing data