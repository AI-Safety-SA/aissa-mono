import { s3Storage } from '@payloadcms/storage-s3'
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
import { DefaultImages } from './globals/DefaultImages'
import { applyGlobalCollectionAccessPolicy } from './access/collectionAccess'
import { cleanupCommunityHeadshotUploadTask } from './jobs/cleanupCommunityHeadshotUpload'
import { processTallySubmissionTask } from './jobs/processTallySubmission'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const payloadSharp: SharpDependency = (input, options) => sharp(input, options)
const payloadSecret = process.env.PAYLOAD_SECRET
const r2Endpoint = process.env.R2_ENDPOINT?.trim()
const r2PublicBaseUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, '')

if (!payloadSecret) {
  throw new Error('PAYLOAD_SECRET environment variable is required')
}

function normalizeEndpoint(endpoint: string | undefined): string {
  if (!endpoint) return ''
  return endpoint.startsWith('https://') ? endpoint : `https://${endpoint}`
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
  globals: [CommunityStats, DefaultImages],
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
    s3Storage({
      collections: {
        media: r2PublicBaseUrl
          ? {
              generateFileURL: ({ filename }) =>
                new URL(filename, `${r2PublicBaseUrl}/`).toString(),
            }
          : true,
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        endpoint: normalizeEndpoint(r2Endpoint),
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        forcePathStyle: true,
      },
    }),
  ],
  jobs: {
    tasks: [processTallySubmissionTask as any, cleanupCommunityHeadshotUploadTask as any],
  },
})
