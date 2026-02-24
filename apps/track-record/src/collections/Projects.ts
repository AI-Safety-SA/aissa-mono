import type { CollectionConfig } from 'payload'

const defaultTierByType: Record<string, 'gold' | 'silver' | 'bronze' | null> = {
  bounty_submission: 'gold',
  grant_award: 'gold',
  research_paper: 'silver',
  software_tool: 'silver',
  program_project: 'bronze',
  other: null,
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'tier', 'project_status', 'isPublished', 'createdAt'],
    group: 'Projects',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== 'object') return data

        const nextData = { ...data }
        if (!nextData.tier && typeof nextData.type === 'string') {
          nextData.tier = defaultTierByType[nextData.type] ?? null
        }

        return nextData
      },
    ],
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
        { label: 'Program Project', value: 'program_project' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'typeOther',
      type: 'text',
      admin: {
        condition: (data) => data.type === 'other',
        description: 'Please specify the project type',
      },
      required: true,
      validate: (value: any, { data }: { data: any }) => {
        if (data.type === 'other' && !value) {
          return 'Please specify the project type when "Other" is selected'
        }
        return true
      },
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
      name: 'tier',
      type: 'select',
      options: [
        { label: 'Gold', value: 'gold' },
        { label: 'Silver', value: 'silver' },
        { label: 'Bronze', value: 'bronze' },
      ],
      admin: {
        description: 'Project impact tier used for frontend highlighting',
      },
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
