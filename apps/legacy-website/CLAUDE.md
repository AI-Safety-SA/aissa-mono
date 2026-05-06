# Legacy Website — Agent Instructions

Astro 5 static site, deployed to Vercel.

## Stack

- **Framework**: Astro 5 (static output)
- **Styling**: Tailwind v4 with its own `src/styles/theme.css` — NOT shared with track-record
- **No database, no Payload CMS**

## Build

```bash
# From workspace root
pnpm build --filter=legacy-website

# From apps/legacy-website/
pnpm build
```

## Structure

```
src/
├── assets/        # Static assets (images, etc.)
├── components/    # Astro/HTML components
├── data/          # Static data files
├── layouts/       # Page layouts
├── pages/         # Route pages
├── styles/        # theme.css + component styles
└── utils/         # Utility functions
```

## Design System

The website has its own color tokens (`--color-bg-deep`, `--color-surface`, etc.) and component classes (`btn-primary`, `surface-card`, etc.) defined in `src/styles/theme.css`. These do NOT overlap with the shadcn tokens used in track-record. Do not mix them.
