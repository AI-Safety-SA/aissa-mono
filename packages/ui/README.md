# @repo/ui

A shared React component library for the AISSA monorepo, built with Tailwind CSS v4.

## Features

- **Tailwind CSS v4**: Uses the latest Tailwind with CSS-first configuration
- **Prefixed Classes**: All classes use a `ui-` prefix to prevent conflicts with app styles
- **shadcn/ui Compatible**: Integrates with the shared theme configuration
- **TypeScript**: Full type support with React 19
- **Compiled Output**: Components compiled to `dist/` for fast imports

## Installation

This package is included in the monorepo workspace. To use it in an app:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

## Usage

### Import Styles

First, import the compiled styles in your app's CSS or layout:

```css
/* In your CSS file */
@import "@repo/ui/styles.css";
```

Or in your layout component:

```tsx
import "@repo/ui/styles.css";
```

### Import Components

```tsx
import { Card } from "@repo/ui/card";
import { Gradient } from "@repo/ui/gradient";
import { TurborepoLogo } from "@repo/ui/turborepo-logo";
```

## Available Components

### Card

A card component for displaying linked content with hover effects.

```tsx
import { Card } from "@repo/ui/card";

<Card title="Documentation" href="https://example.com">
  Learn how to use our platform.
</Card>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title |
| `children` | `ReactNode` | Card description/content |
| `href` | `string` | Link URL |

### Gradient

A background gradient component for visual effects.

```tsx
import { Gradient } from "@repo/ui/gradient";

<Gradient variant="primary" />
```

### TurborepoLogo

The Turborepo logo component.

```tsx
import { TurborepoLogo } from "@repo/ui/turborepo-logo";

<TurborepoLogo size={48} />
```

## Development

### Build Components

```bash
# Compile TypeScript components
pnpm build:components

# Build Tailwind CSS styles
pnpm build:styles
```

### Watch Mode

```bash
# Watch and recompile components
pnpm dev:components

# Watch and rebuild styles
pnpm dev:styles
```

### Type Checking

```bash
pnpm check-types
```

### Linting

```bash
pnpm lint
```

## Architecture

### File Structure

```
packages/ui/
├── src/
│   ├── card.tsx           # Card component
│   ├── gradient.tsx       # Gradient component
│   ├── turborepo-logo.tsx # Logo component
│   └── styles.css         # Tailwind CSS entry point
├── dist/                  # Compiled output
│   ├── card.js
│   ├── gradient.js
│   ├── turborepo-logo.js
│   └── index.css
├── package.json
└── tsconfig.json
```

### Class Prefixing

The UI package uses a `ui-` prefix for all Tailwind classes to prevent conflicts when components are used alongside app-level styles:

```tsx
// Component uses prefixed classes
<div className="ui:rounded-lg ui:border ui:px-5 ui:py-4">
```

This is configured in `styles.css`:

```css
@import "tailwindcss" prefix(ui);
@import "@repo/tailwind-config";
```

### Exports

The package uses conditional exports defined in `package.json`:

```json
{
  "exports": {
    "./styles.css": "./dist/index.css",
    "./*": "./dist/*.js"
  }
}
```

This allows importing:
- `@repo/ui/styles.css` → Compiled CSS
- `@repo/ui/card` → Card component
- `@repo/ui/gradient` → Gradient component

## Styling

### Theme Integration

The package integrates with `@repo/tailwind-config` which provides:
- shadcn/ui semantic color tokens
- Light and dark theme support
- Custom radius variables

### Customization

Apps can override the theme by defining CSS custom properties:

```css
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
}
```

## Dependencies

### Peer Dependencies

- `react: ^19` - React 19 is required

### Dev Dependencies

- `@repo/tailwind-config` - Shared Tailwind configuration
- `@repo/typescript-config` - Shared TypeScript configuration
- `@repo/eslint-config` - Shared ESLint configuration
- `tailwindcss: ^4.1` - Tailwind CSS v4
- `typescript: 5.9` - TypeScript compiler

## Adding New Components

1. Create a new `.tsx` file in `src/`:

```tsx
// src/button.tsx
import { type ReactNode } from "react";

export function Button({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "outline";
}) {
  return (
    <button
      className={`ui:px-4 ui:py-2 ui:rounded-md ${
        variant === "outline"
          ? "ui:border ui:border-input"
          : "ui:bg-primary ui:text-primary-foreground"
      }`}
    >
      {children}
    </button>
  );
}
```

2. The component will be automatically available via `@repo/ui/button` after rebuild.

3. Run `pnpm build:components` to compile.

