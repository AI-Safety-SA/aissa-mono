import { s3Storage } from '@payloadcms/storage-s3'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import {
  Users,
  Media,
  Persons,
  ExternalIdentities,
  Organisations,
  Partnerships,
  Programs,
  Cohorts,
  Events,
  Projects,
  EventHosts,
  ProjectContributors,
  Engagements,
  EngagementImpacts,
  Testimonials,
  FeedbackSubmissions,
} from './collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
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
  collections: [
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
    // Junction Tables
    EventHosts,
    ProjectContributors,
    // Auth & Media
    Users,
    Media,
  ],
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

  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        }
      },
      bucket: process.env.S3_BUCKET || '',
      clientUploads: true, // Since vercel limits server uploads to 4.5MB
      config: {
        forcePathStyle: true, // Important for using Supabase
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),
  ],
})
