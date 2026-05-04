# AISSA Monorepo

A Turborepo-powered monorepo for AI Safety South Africa (AISSA) applications and shared packages.

## What's Inside?

### Applications

| App              | Description                                                                                                          | Port | Stack                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------- |
| `track-record`   | AISSA Track Record Dashboard - A Payload CMS-powered application for tracking programs, events, projects, and impact | 3000 | Next.js 15, Payload CMS 3.x, PostgreSQL |
| `public-website` | AI Safety South Africa public website - Read-only Next.js site backed by track-record API                            | 3001 | Next.js 15, Tailwind CSS v4             |
| `legacy-website` | Legacy AI Safety South Africa Astro site, kept for reference/history                                                 | 4321 | Astro 5.x, Tailwind CSS v4              |

### Packages

| Package                   | Description                                                                |
| ------------------------- | -------------------------------------------------------------------------- |
| `@repo/ui`                | Shared React component library with Tailwind CSS (uses `ui-` prefix)       |
| `@repo/tailwind-config`   | Shared Tailwind CSS v4 configuration with shadcn/ui theme variables        |
| `@repo/eslint-config`     | Shared ESLint configurations for different contexts (base, Next.js, React) |
| `@repo/typescript-config` | Shared TypeScript configurations                                           |

## Tech Stack

- **Build System**: [Turborepo](https://turbo.build/) with pnpm workspaces
- **Package Manager**: pnpm 10.x
- **Runtime**: Node.js 18+
- **Frontend**: React 19, Next.js 15/16, Astro 5.x
- **Styling**: Tailwind CSS v4 with shadcn/ui theming
- **CMS**: Payload CMS 3.x (track-record app)
- **Database**: PostgreSQL (track-record)
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
pnpm --filter public-website dev

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

The public website app requires server-to-server track-record API configuration:

```bash
cd apps/public-website

# Copy environment variables
cp env.example .env

# Edit .env with your site settings:
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
│   ├── public-website/            # Public AISSA website (Next.js)
│   │   └── src/
│   │       ├── app/               # App Router pages
│   │       ├── components/        # Frontend-only React components
│   │       └── lib/               # Public API client and types
│   ├── legacy-website/            # Legacy AISSA website (Astro)
│   │   ├── src/
│   │   │   ├── components/       # Astro components
│   │   │   ├── layouts/          # Page layouts
│   │   │   ├── pages/            # Astro pages/routes
│   │   │   └── utils/            # Utility functions
│   │   └── scripts/              # Project tooling scripts
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
  return (
    <Card title="Hello" href="/about">
      Description
    </Card>
  );
}
```

Note: The UI package uses a `ui-` prefix for its classes to avoid conflicts with app-level styles.

## Scripts

### Root Scripts

| Script             | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `pnpm dev`         | Start all apps in development mode                      |
| `pnpm build`       | Build all packages and apps                             |
| `pnpm lint`        | Run ESLint across all packages                          |
| `pnpm check-types` | Type-check all packages                                 |
| `pnpm test`        | Run full test suite across workspaces that define tests |
| `pnpm test:unit`   | Run unit tests across workspaces that define them       |
| `pnpm precommit`   | Run pre-commit quality gate (types + lint + unit tests) |
| `pnpm run ci`      | Run CI quality gate (types + lint + full test suite)    |
| `pnpm format`      | Format code with Prettier                               |

### Track Record Scripts

| Script                 | Description                       |
| ---------------------- | --------------------------------- |
| `pnpm seed`            | Seed the database with AISSA data |
| `pnpm payload migrate` | Run database migrations           |
| `pnpm generate:types`  | Generate Payload TypeScript types |
| `pnpm test`            | Run all tests (integration + E2E) |
| `pnpm test:int`        | Run Vitest integration tests      |
| `pnpm test:e2e`        | Run Playwright E2E tests          |

## Turborepo Features

This project leverages Turborepo for:

- **Caching**: Build outputs are cached for faster subsequent builds
- **Parallel Execution**: Independent tasks run in parallel
- **Dependency Awareness**: Tasks run in the correct order based on dependencies
- **Remote Caching**: (Optional) Share cache across team members

## Contributing

See the repository contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

For app-specific workflows:

- Track Record: [`apps/track-record/CONTRIBUTING.md`](./apps/track-record/CONTRIBUTING.md)
- Public Website: [`apps/public-website/package.json`](./apps/public-website/package.json)
- Legacy Website: [`apps/legacy-website/README.md`](./apps/legacy-website/README.md)

## License

MIT
