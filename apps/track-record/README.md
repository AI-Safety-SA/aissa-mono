# AISSA Track Record

A comprehensive track record dashboard for AI Safety South Africa (AISSA), built with Payload CMS 3.x and Next.js 15.

**TODOs**

- [ ] Create webhook and connect with Tally for live data imports
- [ ] Fix the way that components and styling is being done - follow a consistent pattern and integrate the components from the shadcn/ui starter project
- [ ] Add good application logging

## Overview

This application manages and displays AISSA's programs, events, projects, and impact metrics. It provides:

- **Admin Panel**: Full-featured CMS for managing data
- **Public Dashboard**: Frontend showcasing AISSA's track record
- **API**: REST and GraphQL endpoints for data access

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **CMS**: Payload CMS 3.72
- **Database**: PostgreSQL on [Neon](https://neon.tech) with database branching
- **Rich Text**: Lexical editor (`@payloadcms/richtext-lexical`)
- **Styling**: Tailwind CSS v4 with shadcn/ui theme
- **Testing**: Vitest (integration), Playwright (E2E)
- **Language**: TypeScript
- **Monorepo**: Turborepo with pnpm workspaces
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 24
- pnpm 9.x or 10.x
- [Neon CLI](https://neon.tech/docs/reference/neon-cli) (`brew install neonctl` or `npm install -g neonctl`)
- Neon account with access to the project

### Neon CLI Setup

1. Install the Neon CLI globally:

```bash
npm install -g neonctl
```

2. Authenticate with Neon:

```bash
neon auth
```

This will open a browser window to authenticate with your Neon account. See the [Neon CLI documentation](https://neon.tech/docs/reference/neon-cli) for more details.

3. Verify access to the project:

```bash
neon branches list --project-id <project-id>
```

### Environment Setup

```bash
# Copy the example environment file
cp .env.example .env.development
```

Configure the following environment variables in `.env.development`:

```env
# Database connection (get from Neon dashboard or CLI)
# Use the pooled connection string for DATABASE_URL
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Use the unpooled connection string for migrations
DATABASE_URL_UNPOOLED=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Payload secret (generate a secure random string)
PAYLOAD_SECRET=your-secret-key-here

# Optional frontend password gate. Omit or set to anything other than "true" for the public site.
FRONTEND_GATE_ENABLED=false
FRONTEND_GATE_PASSWORD=shared_frontend_password

# Cloudflare R2 storage for media uploads
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET=aissa-track-record-media
R2_ENDPOINT=<account-id>.r2.cloudflarestorage.com
```

To get your connection strings from Neon:

1. Go to the [Neon Console](https://console.neon.tech)
2. Select your project and the `dev` branch
3. Click "Connection string" and copy both the pooled and unpooled connection strings

Or via CLI:

```bash
neon connection-string --project-id <project-id> --branch dev
neon connection-string --project-id <project-id> --branch dev --pooled
```

### Installation (Clean Clone)

When cloning this monorepo for the first time, run the following commands from the monorepo root:

```bash
# From the monorepo root
pnpm install

# Build all required workspace packages
pnpm turbo build:local -F track-record
```

This ensures all workspace dependencies (like `@repo/ui` and `@repo/tailwind-config`) are built before running the application.

### Database Setup

Create or reset the dev db branch

```bash
# rest dev
neon branches reset dev --parent prod-main

# or create dev if it doesn't exist
neon branches create dev --parent prod-main
```

### Development

```bash
# Start development server
pnpm dev
```

The application runs at:

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

## Database Branching Workflow

This project uses Neon's database branching feature for development and production isolation.

### Branch Structure

- **`prod`**: The production database branch. This is the **source of truth** and should only be modified through migrations.
- **`dev`**: The development database branch. Used for local development and testing.

### Key Principles

1. **Migrations Only**: Push mode is disabled (`push: false` in `payload.config.ts`). All schema changes must go through migrations.
2. **Dev Branch Resets**: The `dev` branch is frequently reset from `prod` to ensure a clean development environment with production data.
3. **Never Modify Prod Directly**: Always develop against `dev` and deploy migrations through the CI/CD pipeline.

### Resetting the Dev Branch

To reset your dev branch to match production:

```bash
# Reset the branch
neon branches reset dev --parent prod-main
```

## Migration Workflow

This project uses a unified migration workflow script (`scripts/migrate.ts`) with different modes for development, testing, and production.

### Quick Start

```bash
# Full development workflow (recommended after schema changes)
pnpm migrate:dev

# Check migration status
pnpm migrate:status
```

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm migrate dev` | Full workflow: generate all → detect changes → create migration → run |
| `pnpm migrate test` | Run existing migrations only (for test database branches) |
| `pnpm migrate precommit` | Validate schema changes are committed (for pre-commit hooks) |
| `pnpm migrate prod` | Run migrations with `DATABASE_URL_UNPOOLED` (production) |
| `pnpm migrate status` | Check migration status |

### Options

```bash
pnpm migrate dev --env=.env.custom   # Use custom environment file
pnpm migrate dev --force-create      # Force create migration even if no changes
pnpm migrate dev --skip-create       # Skip migration creation step
pnpm migrate dev --dry-run           # Show what would happen without executing
pnpm migrate --help                  # Show help
```

### Development Workflow

When you make changes to Payload collections:

```bash
# Run the full development workflow
pnpm migrate:dev
```

This command will:
1. **Generate all files** - Types, DB schema, and import map
2. **Detect changes** - Check if `payload-generated-schema.ts` has uncommitted changes
3. **Create migration** - If changes detected, create a new migration file
4. **Run migrations** - Apply all pending migrations to your development database

### Manual Commands (if needed)

You can still run individual Payload commands manually:

```bash
pnpm payload:local generate:types      # Update src/payload-types.ts
pnpm payload:local generate:db-schema  # Update src/payload-generated-schema.ts
pnpm payload:local generate:importmap  # Update admin import map
pnpm payload:local migrate:create      # Create a new migration
pnpm payload:local migrate             # Run pending migrations
```

### Testing Integration

For integration tests, the `globalSetup.ts` runs migrations programmatically using `payload.db.migrate()` on Neon test branches. This approach is faster and provides better error handling than spawning a child process.

For standalone CLI usage with test branches, use `pnpm migrate test`.

## Data Model

### Collections

The application manages the following collections:

#### Core Entities

| Collection            | Description                                 |
| --------------------- | ------------------------------------------- |
| `users`               | Admin users with authentication             |
| `media`               | File uploads and images                     |
| `persons`             | People involved with AISSA                  |
| `organisations`       | Partner organisations                       |
| `external-identities` | External profiles (LinkedIn, Twitter, etc.) |

#### Programs & Events

| Collection     | Description                                       |
| -------------- | ------------------------------------------------- |
| `programs`     | Fellowship, course, coworking, volunteer programs |
| `cohorts`      | Instances of programs with participant stats      |
| `events`       | Workshops, talks, meetups, reading groups, panels |
| `partnerships` | Venue, funding, and collaboration partnerships    |

#### Projects & Impact

| Collection             | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `projects`             | Research papers, bounty submissions, grants, tools |
| `engagements`          | Person-to-program/event engagements                |
| `engagement-impacts`   | Impact metrics for engagements                     |
| `testimonials`         | Quotes and feedback from participants              |
| `feedback-submissions` | Raw feedback form submissions                      |

#### Junction Tables

| Collection             | Description                                 |
| ---------------------- | ------------------------------------------- |
| `event-hosts`          | Many-to-many: events ↔ persons              |
| `project-contributors` | Many-to-many: projects ↔ persons with roles |

## Project Structure

```
apps/track-record/
├── src/
│   ├── app/
│   │   ├── (frontend)/          # Public frontend routes
│   │   │   ├── page.tsx         # Dashboard homepage
│   │   │   ├── events/          # Events listing
│   │   │   ├── programs/        # Programs listing
│   │   │   ├── projects/        # Projects listing
│   │   │   ├── globals.css      # Frontend styles
│   │   │   └── layout.tsx       # Frontend layout
│   │   └── (payload)/           # Payload CMS routes
│   │       ├── admin/           # Admin panel
│   │       └── api/             # REST/GraphQL API
│   ├── collections/             # Payload collection schemas
│   │   ├── index.ts             # Collection exports
│   │   ├── Users.ts
│   │   ├── Programs.ts
│   │   ├── Events.ts
│   │   └── ...
│   ├── components/              # React components
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── stats-card.tsx
│   │   │   ├── program-card.tsx
│   │   │   ├── event-card.tsx
│   │   │   └── ...
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── badge.tsx
│   ├── lib/
│   │   ├── data.ts              # Data fetching utilities
│   │   └── utils.ts             # Helper functions (cn, etc.)
│   ├── migrations/              # Database migrations
│   ├── payload.config.ts        # Payload configuration
│   ├── payload-types.ts         # Generated TypeScript types
│   └── payload-generated-schema.ts  # Generated DB schema
├── tests/
│   ├── e2e/                     # Playwright E2E tests
│   └── int/                     # Vitest integration tests
├── scripts/
│   ├── migrate.ts               # Migration workflow script (dev, test, prod modes)
│   └── migrate-media-to-r2.ts   # One-off backfill of remote media into Cloudflare R2
├── AGENTS.md                    # AI/LLM development rules
└── package.json                 # All available scripts
```

## Available Scripts

All application scripts are defined in `package.json`. Run `pnpm run` to see the full list, or inspect the file directly.

Key scripts include:

- `pnpm dev` - Start development server
- `pnpm build` - Production build
- `pnpm migrate:dev` - Full migration workflow (generate → detect → create → run)
- `pnpm migrate:status` - Check migration status
- `pnpm payload:local <command>` - Run Payload CLI commands in development mode
- `pnpm test` - Run all tests

## Testing

### Integration Tests (Vitest)

```bash
pnpm test:int
```

Configuration in `vitest.config.mts`:

- Environment: jsdom
- Path aliases via tsconfig paths

### E2E Tests (Playwright)

```bash
pnpm test:e2e
```

Configuration in `playwright.config.ts`:

- Browser: Chromium
- Auto-starts dev server
- HTML reporter

## Deployment

This application deploys to **Vercel** as part of the monorepo.

### Environment Variables

Ensure these are set in Vercel:

```env
DATABASE_URL=<neon-pooled-connection-string>
DATABASE_URL_UNPOOLED=<neon-unpooled-connection-string>
PAYLOAD_SECRET=<secure-random-string>
R2_ACCESS_KEY_ID=<cloudflare-r2-access-key-id>
R2_SECRET_ACCESS_KEY=<cloudflare-r2-secret-access-key>
R2_BUCKET=<r2-bucket-name>
R2_ENDPOINT=<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=<public-r2-base-url>
NODE_ENV=production
```

### Build Process

The build process includes a **prebuild step** that runs migrations using the unpooled connection:

1. **Prebuild** (`pnpm prebuild`): Runs `tsx scripts/migrate.ts prod --no-env-files` which applies pending migrations using environment variables provided by Vercel (`DATABASE_URL_UNPOOLED`)
2. **Build** (`pnpm build`): Runs `next build` to create the production bundle

This ensures the production database schema is always in sync with the codebase.

### Vercel Configuration

The `vercel.json` file configures the project as a Next.js application. Vercel automatically detects the monorepo structure and builds the correct package.

## Contributing

Contribution standards and PR workflow are documented in:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) (Track Record-specific guide)
- [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) (Monorepo-wide guide)

## Development Guidelines

### AI/LLM Development

See `AGENTS.md` for comprehensive Payload CMS development rules, including:

- Security-critical patterns
- Access control best practices
- Hook patterns and gotchas
- Type safety guidelines

### Key Patterns

1. **TypeScript-First**: Always use proper types from `payload-types.ts`
2. **Type Generation**: Run `generate:types` after schema changes
3. **Access Control**: Configure proper access control for production
4. **Transaction Safety**: Pass `req` to nested operations in hooks
5. **Migrations Only**: Never use push mode; always create migrations

### Code Style

- ESLint configuration extends `@repo/eslint-config`
- Prettier for formatting
- Path aliases configured: `@/` maps to `src/`

## Frontend Features

### Dashboard Homepage

The main dashboard displays:

- **Impact Stats**: Total participants, events, programs, projects
- **Featured Programs**: Recent fellowship and course programs
- **Recent Events**: Latest workshops, talks, and meetups
- **Featured Projects**: Research papers and submissions
- **Testimonials**: Carousel of participant feedback

### Data Fetching

Frontend pages use Payload's Local API for server-side data fetching:

```typescript
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getImpactStats() {
  const payload = await getPayload({ config })

  const programs = await payload.find({
    collection: 'programs',
    where: { isPublished: { equals: true } },
    limit: 0,
  })

  return { totalPrograms: programs.totalDocs }
}
```

## Payload CMS

### Admin Panel

Access the admin panel at `/admin`. Features include:

- Collection CRUD operations
- Rich text editing with Lexical
- Relationship management
- Media library (via Cloudflare R2)
- User authentication

### API Endpoints

- **REST API**: `/api/{collection}`
- **GraphQL**: `/api/graphql`

## Styling

### Tailwind CSS v4

The app uses Tailwind CSS v4 with the shared monorepo configuration:

```css
/* globals.css */
@import 'tailwindcss';
@import '@repo/tailwind-config';
```

### shadcn/ui Theme

The shared config provides semantic color tokens:

- `bg-background`, `text-foreground`
- `bg-primary`, `text-primary-foreground`
- `bg-secondary`, `text-secondary-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-card`, `text-card-foreground`
- `border-border`, `ring-ring`

### Dark Mode

Dark mode is enabled by default with the `dark` class on `<html>`:

```tsx
<html lang="en" className="dark">
```

## Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Neon CLI Reference](https://neon.tech/docs/reference/neon-cli)
- [Neon Database Branching](https://neon.tech/docs/introduction/branching)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
