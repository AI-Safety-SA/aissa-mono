import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'project_status', 'isPublished', 'createdAt'],
    group: 'Projects',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Research Paper', value: 'research_paper' },
        { label: 'Bounty Submission', value: 'bounty_submission' },
        { label: 'Grant Award', value: 'grant_award' },
        { label: 'Software Tool', value: 'software_tool' },
      ],
    },
    {
      name: 'project_status',
      type: 'select',
      defaultValue: 'in_progress',
      options: [
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'program',
      type: 'relationship',
      relationTo: 'programs',
      admin: {
        description: 'Optional: link to a program (hackathon, fellowship, course)',
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      admin: {
        description: 'Link to the project (paper, demo, etc.)',
      },
    },
    {
      name: 'repositoryUrl',
      type: 'text',
      admin: {
        description: 'Link to source code repository',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional data: authors array, venue, grant amount, etc.',
      },
    },
  ],
  timestamps: true,
}
