# Netlify Deployment Setup

## Why PAYLOAD_SECRET is Required During Build

When deploying to Netlify, Next.js attempts to prerender pages during the build process. Even though your pages use `export const dynamic = 'force-dynamic'` to prevent static generation, Next.js still evaluates the page components during build to determine routing and metadata.

When your server components execute (even during build evaluation), they call `getPayload({ config })`, which initializes Payload CMS. Payload requires `PAYLOAD_SECRET` to be set for security reasons, even during initialization.

## Required Environment Variables

You **must** set the following environment variables in your Netlify dashboard:

1. **PAYLOAD_SECRET**: A secure random string used to encrypt Payload sessions
   - Generate one: `openssl rand -base64 32`
   - Set in: Netlify Dashboard → Site settings → Build & deploy → Environment variables

2. **DATABASE_URL**: Your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database`
   - Set in: Netlify Dashboard → Site settings → Build & deploy → Environment variables

## Setting Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment**
3. Click **Add variable** for each required variable
4. Set the variable name and value
5. **Important**: Make sure the scope includes "Build" (not just "Runtime")

## Why `force-dynamic` is Necessary

Your pages (`/`, `/programs`, `/events`, `/projects`) depend on database data that changes over time. These pages **cannot** be statically generated because:

1. They fetch data from Payload CMS (database)
2. The data changes as content is added/updated
3. Static generation would create stale pages

Using `export const dynamic = 'force-dynamic'` tells Next.js to render these pages on-demand at request time, ensuring users always see the latest data.

## Troubleshooting

If you see "missing secret key" errors:

1. **Verify environment variables are set**: Check Netlify dashboard
2. **Check variable scope**: Ensure variables are available during "Build" phase
3. **Verify variable names**: Must be exactly `PAYLOAD_SECRET` and `DATABASE_URL` (case-sensitive)
4. **Redeploy**: After adding variables, trigger a new deployment

## Local Development

For local development, create a `.env` file in `apps/track-record/`:

```env
PAYLOAD_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

**Note**: `.env` files are gitignored and not deployed to Netlify. You must set environment variables in the Netlify dashboard.
