import type { GlobalConfig } from 'payload'

export const CommunityStats: GlobalConfig = {
  slug: 'community-stats',
  admin: {
    group: 'Site Settings',
  },
  fields: [
    {
      name: 'linkedinFollowers',
      type: 'number',
      label: 'LinkedIn Followers',
      defaultValue: 0,
    },
    {
      name: 'substackSubscribers',
      type: 'number',
      label: 'Substack Subscribers',
      defaultValue: 0,
    },
    {
      name: 'lumaSubscribers',
      type: 'number',
      label: 'Luma Subscribers',
      defaultValue: 0,
    },
    {
      name: 'xFollowers',
      type: 'number',
      label: 'X Followers',
      defaultValue: 0,
    },
    {
      name: 'whatsappCommunitySize',
      type: 'number',
      label: 'WhatsApp Community Size',
      defaultValue: 0,
    },
    {
      name: 'slackMembers',
      type: 'number',
      label: 'Slack Workspace Members',
      defaultValue: 0,
    },
    {
      name: 'coworkingSeats',
      type: 'number',
      label: 'Coworking Seats Available',
      defaultValue: 0,
    },
  ],
}
