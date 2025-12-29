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
} from './collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // Auth & Media
    Users,
    Media,
    // People
    Persons,
    // Organisations & Partnerships
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
    // Engagements & Impact
    Engagements,
    EngagementImpacts,
    Testimonials,
  ],
  editor: lexicalEditor(),
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
  plugins: [],
})
