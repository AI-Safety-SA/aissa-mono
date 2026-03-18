import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import type { SharpDependency } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import {
  Users,
  Media,
  Grants,
  Persons,
  ExternalIdentities,
  Organisations,
  Partnerships,
  Programs,
  Cohorts,
  Events,
  Projects,
  Research,
  EventHosts,
  ProjectContributors,
  Engagements,
  EngagementImpacts,
  Testimonials,
  FeedbackSubmissions,
  CommunitySubmissions,
  StagedPersonUpdates,
  StagedEngagements,
  StagedEngagementRemovals,
  StagedTestimonials,
  StagedEngagementImpacts,
} from './collections'
import { CommunityStats } from './globals/CommunityStats'
import { applyGlobalCollectionAccessPolicy } from './access/collectionAccess'
import { cleanupCommunityHeadshotUploadTask } from './jobs/cleanupCommunityHeadshotUpload'
import { processTallySubmissionTask } from './jobs/processTallySubmission'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const payloadSharp: SharpDependency = (input, options) => sharp(input, options)
const payloadSecret = process.env.PAYLOAD_SECRET

if (!payloadSecret) {
  throw new Error('PAYLOAD_SECRET environment variable is required')
}

const collections = [
  // Community Edits
  CommunitySubmissions,
  StagedPersonUpdates,
  StagedEngagements,
  StagedEngagementRemovals,
  StagedTestimonials,
  StagedEngagementImpacts,
  // Engagements & Impact
  Engagements,
  EngagementImpacts,
  Testimonials,
  FeedbackSubmissions,
  // Core Entities
  Persons,
  ExternalIdentities,
  Organisations,
  Partnerships,
  // Programs & Events
  Programs,
  Cohorts,
  Events,
  // Projects
  Projects,
  Grants,
  Research,
  // Junction Tables
  EventHosts,
  ProjectContributors,
  // Auth & Media
  Users,
  Media,
].map(applyGlobalCollectionAccessPolicy)

export default buildConfig({
  admin: {
    user: Users.slug,
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: process.env.LOCAL_ACC_EMAIL || '',
            password: process.env.LOCAL_ACC_PASSWORD || '',
            prefillOnly: false,
          }
        : false,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: [
        '/components/admin/CommunityReviewDashboardCTA#CommunityReviewDashboardCTA',
      ],
    },
    meta: {
      titleSuffix: '- Track Record',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/icon.png',
        },
      ],
    },
  },
  collections,
  globals: [CommunityStats],
  editor: lexicalEditor(),

  // email: nodemailerAdapter({
  //   defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'admin@track-record.co.za',
  //   defaultFromName: process.env.SMTP_FROM_NAME || 'Track Record Admin',
  //   transportOptions: {
  //     host: process.env.SMTP_HOST,
  //     port: Number(process.env.SMTP_PORT) || 587,
  //     auth: {
  //       user: process.env.SMTP_USER,
  //       pass: process.env.SMTP_PASS,
  //     },
  //     // secure: true // use true for 465, false for other ports
  //   },
  // }),

  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false, // disable push mode
  }),
  sharp: payloadSharp,
  plugins: [
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN || '',
        acl: 'public-read',
      },
    }),
  ],
  jobs: {
    tasks: [processTallySubmissionTask as any, cleanupCommunityHeadshotUploadTask as any],
  },
})
