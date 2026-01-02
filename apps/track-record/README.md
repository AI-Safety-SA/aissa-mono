# AISSA Track Record

A comprehensive track record dashboard for AI Safety South Africa (AISSA), built with Payload CMS 3.x and Next.js 15.

## Overview

This application manages and displays AISSA's programs, events, projects, and impact metrics. It provides:

- **Admin Panel**: Full-featured CMS for managing all content
- **Public Dashboard**: Frontend showcasing AISSA's track record
- **API**: REST and GraphQL endpoints for data access

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **CMS**: Payload CMS 3.69
- **Database**: PostgreSQL (via `@payloadcms/db-postgres`)
- **Rich Text**: Lexical editor (`@payloadcms/richtext-lexical`)
- **Styling**: Tailwind CSS v4 with shadcn/ui theme
- **Testing**: Vitest (integration), Playwright (E2E)
- **Language**: TypeScript

## Data Model

### Collections

The application manages the following collections:

#### Core Entities
| Collection | Description |
|------------|-------------|
| `users` | Admin users with authentication |
| `media` | File uploads and images |
| `persons` | People involved with AISSA |
| `organisations` | Partner organisations |
| `external-identities` | External profiles (LinkedIn, Twitter, etc.) |

#### Programs & Events
| Collection | Description |
|------------|-------------|
| `programs` | Fellowship, course, coworking, volunteer programs |
| `cohorts` | Instances of programs with participant stats |
| `events` | Workshops, talks, meetups, reading groups, panels |
| `partnerships` | Venue, funding, and collaboration partnerships |

#### Projects & Impact
| Collection | Description |
|------------|-------------|
| `projects` | Research papers, bounty submissions, grants, tools |
| `engagements` | Person-to-program/event engagements |
| `engagement-impacts` | Impact metrics for engagements |
| `testimonials` | Quotes and feedback from participants |
| `feedback-submissions` | Raw feedback form submissions |

#### Junction Tables
| Collection | Description |
|------------|-------------|
| `event-hosts` | Many-to-many: events ↔ persons |
| `project-contributors` | Many-to-many: projects ↔ persons with roles |

## Getting Started

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9.x or 10.x
- PostgreSQL database

### Environment Setup

```bash
# Copy the example environment file
cp .env.example .env
```

Configure the following environment variables:

```env
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/aissa_track_record

# Payload secret (generate a secure random string)
PAYLOAD_SECRET=your-secret-key-here

# Optional: Supabase connection (if using Supabase PostgreSQL)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Installation

```bash
# From monorepo root
pnpm install

# Or from this directory
cd apps/track-record
pnpm install
```

### Database Setup

```bash
# Run migrations
pnpm payload migrate

# Seed with AISSA data (optional)
pnpm seed
```

### Development

```bash
# Start development server
pnpm dev

# Or with a clean .next cache
pnpm devsafe
```

The application runs at:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:3000/api

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
│   ├── seed/                    # Database seeding
│   │   ├── index.ts             # Main seed script
│   │   ├── data/                # Seed data files
│   │   ├── imports/             # CSV import scripts
│   │   └── utils/               # Seeding utilities
│   ├── migrations/              # Database migrations
│   ├── payload.config.ts        # Payload configuration
│   └── payload-types.ts         # Generated TypeScript types
├── tests/
│   ├── e2e/                     # Playwright E2E tests
│   └── int/                     # Vitest integration tests
├── AGENTS.md                    # AI/LLM development rules
├── docker-compose.yml           # Docker setup for local DB
└── package.json
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm devsafe` | Clean .next cache and start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm payload` | Run Payload CLI commands |
| `pnpm generate:types` | Generate TypeScript types from schema |
| `pnpm generate:importmap` | Regenerate component import map |
| `pnpm seed` | Seed database with AISSA data |
| `pnpm seed:events` | Import events from CSV |
| `pnpm seed:facilitators` | Import facilitator data |
| `pnpm seed:feedback` | Import participant feedback |
| `pnpm test` | Run all tests |
| `pnpm test:int` | Run Vitest integration tests |
| `pnpm test:e2e` | Run Playwright E2E tests |

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
- Media library
- User authentication

### API Endpoints

- **REST API**: `/api/{collection}`
- **GraphQL**: `/api/graphql`

### Type Generation

After modifying collections, regenerate types:

```bash
pnpm generate:types
```

This updates `payload-types.ts` with the latest schema types.

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

## Docker

For local PostgreSQL development:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down
```

Update `.env` to use the Docker database:

```env
DATABASE_URL=mongodb://127.0.0.1/aissa-track-record
```

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

### Code Style

- ESLint configuration extends `@repo/eslint-config`
- Prettier for formatting
- Path aliases configured: `@/` maps to `src/`

## Deployment

### Environment Variables

Ensure these are set in production:

```env
DATABASE_URL=<production-postgres-url>
PAYLOAD_SECRET=<secure-random-string>
NODE_ENV=production
```

### Build

```bash
pnpm build
pnpm start
```

### Docker Deployment

A `Dockerfile` is provided for containerized deployments.

## Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
