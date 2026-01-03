# AISSA Monorepo

A Turborepo-powered monorepo for AI Safety South Africa (AISSA) applications and shared packages.

## What's Inside?

### Applications

| App | Description | Port | Stack |
|-----|-------------|------|-------|
| `track-record` | AISSA Track Record Dashboard - A Payload CMS-powered application for tracking programs, events, projects, and impact | 3000 | Next.js 15, Payload CMS 3.x, PostgreSQL |
| `aissa-website` | AI Safety South Africa main website - Public-facing Astro site with Notion and Substack integration | 4321 | Astro 5.x, Tailwind CSS v4, Notion API, Substack RSS |
| `docs` | Example documentation site (from template) | 3000 | Next.js 16, Tailwind CSS |
| `web` | Example website (from template) | 3001 | Next.js 16, Tailwind CSS, Supabase |

### Packages

| Package | Description |
|---------|-------------|
| `@repo/ui` | Shared React component library with Tailwind CSS (uses `ui-` prefix) |
| `@repo/tailwind-config` | Shared Tailwind CSS v4 configuration with shadcn/ui theme variables |
| `@repo/eslint-config` | Shared ESLint configurations for different contexts (base, Next.js, React) |
| `@repo/typescript-config` | Shared TypeScript configurations |

## Tech Stack

- **Build System**: [Turborepo](https://turbo.build/) with pnpm workspaces
- **Package Manager**: pnpm 10.x
- **Runtime**: Node.js 18+
- **Frontend**: React 19, Next.js 15/16, Astro 5.x
- **Styling**: Tailwind CSS v4 with shadcn/ui theming
- **CMS**: Payload CMS 3.x (track-record app), Notion API (aissa-website)
- **Database**: PostgreSQL (track-record), Supabase (web - example)
- **Language**: TypeScript throughout
- **Linting**: ESLint 9 with flat config
- **Formatting**: Prettier

## Getting Started

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9.x or 10.x
- PostgreSQL (for track-record app)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aissa-mono

# Install dependencies
pnpm install
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run a specific app
pnpm --filter track-record dev
pnpm --filter aissa-website dev
pnpm --filter docs dev
pnpm --filter web dev

# Build all packages and apps
pnpm build

# Lint all packages
pnpm lint

# Type-check all packages
pnpm check-types

# Format code
pnpm format
```

### Track Record App Setup

The track-record app requires additional setup:

```bash
cd apps/track-record

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials:
# - DATABASE_URL=postgresql://...
# - PAYLOAD_SECRET=your-secret-key

# Run database migrations
pnpm payload migrate

# Seed the database (optional)
pnpm seed

# Start development
pnpm dev
```

### AISSA Website Setup

The aissa-website app requires environment variables for Notion integration:

```bash
cd apps/aissa-website

# Copy environment variables
cp env.example .env

# Edit .env with your Notion credentials:
# - NOTION_TOKEN=your_notion_integration_token
# - NOTION_DATABASE_ID=your_notion_database_id
# - SITE_URL=http://localhost:4321 (for local dev)
# - BASE_URL=/ (default)

# Start development
pnpm dev
```

## Project Structure

```
aissa-mono/
├── apps/
│   ├── track-record/      # Payload CMS + Next.js app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (frontend)/   # Public frontend routes
│   │   │   │   └── (payload)/    # Payload admin routes
│   │   │   ├── collections/      # Payload collection schemas
│   │   │   ├── components/       # React components
│   │   │   ├── lib/              # Utility functions
│   │   │   └── seed/             # Database seeding scripts
│   │   └── tests/
│   │       ├── e2e/              # Playwright E2E tests
│   │       └── int/              # Vitest integration tests
│   ├── aissa-website/     # AISSA main website (Astro)
│   │   ├── src/
│   │   │   ├── components/       # Astro components
│   │   │   ├── layouts/          # Page layouts
│   │   │   ├── pages/            # Astro pages/routes
│   │   │   └── utils/            # Utility functions
│   │   └── scripts/              # Build-time scripts (Notion/Substack)
│   ├── docs/                     # Example documentation site (from template)
│   └── web/                      # Example website (from template)
├── packages/
│   ├── ui/                       # Shared React components
│   ├── tailwind-config/          # Shared Tailwind configuration
│   ├── eslint-config/            # Shared ESLint configuration
│   └── typescript-config/        # Shared TypeScript configuration
├── info/                         # Project documentation and data files
├── turbo.json                    # Turborepo configuration
├── pnpm-workspace.yaml           # pnpm workspace configuration
└── package.json                  # Root package.json
```

## Shared Styling

This monorepo uses Tailwind CSS v4 with a shared theme configuration based on shadcn/ui.

### Using the Shared Theme

In your app's CSS entry point:

```css
@import "tailwindcss";
@import "@repo/tailwind-config";
```

This provides:
- Semantic color utilities (`bg-background`, `text-foreground`, `border-border`, etc.)
- Light and dark theme support
- shadcn/ui compatible CSS variables
- Custom radius utilities

### Using Shared UI Components

```tsx
import { Card } from "@repo/ui/card";
import "@repo/ui/styles.css";

export function MyComponent() {
  return <Card title="Hello" href="/about">Description</Card>;
}
```

Note: The UI package uses a `ui-` prefix for its classes to avoid conflicts with app-level styles.

## Scripts

### Root Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm check-types` | Type-check all packages |
| `pnpm format` | Format code with Prettier |

### Track Record Scripts

| Script | Description |
|--------|-------------|
| `pnpm seed` | Seed the database with AISSA data |
| `pnpm payload migrate` | Run database migrations |
| `pnpm generate:types` | Generate Payload TypeScript types |
| `pnpm test` | Run all tests (integration + E2E) |
| `pnpm test:int` | Run Vitest integration tests |
| `pnpm test:e2e` | Run Playwright E2E tests |

## Turborepo Features

This project leverages Turborepo for:

- **Caching**: Build outputs are cached for faster subsequent builds
- **Parallel Execution**: Independent tasks run in parallel
- **Dependency Awareness**: Tasks run in the correct order based on dependencies
- **Remote Caching**: (Optional) Share cache across team members

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` and `pnpm check-types` to ensure code quality
4. Run tests if applicable
5. Submit a pull request

## License

MIT
