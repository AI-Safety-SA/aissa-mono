import Link from 'next/link'
import { withAuth } from '@workos-inc/authkit-nextjs'
import { getPayload } from 'payload'
import config from '@payload-config'
import { resolveOrCreatePersonForWorkOSUser } from '@/utilities/workos-person'

export const dynamic = 'force-dynamic'

export default async function MemberPage() {
  const auth = await withAuth({ ensureSignedIn: true })
  const payload = await getPayload({ config })
  const person = await resolveOrCreatePersonForWorkOSUser(payload, auth.user)

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-primary/10 bg-card p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Member Identity</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Signed in with WorkOS</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This route verifies the shared member identity layer and the canonical person mapping in
          Track Record.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-background/80 p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">WorkOS User</dt>
            <dd className="mt-2 text-sm font-medium text-foreground">{auth.user.id}</dd>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/80 p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
            <dd className="mt-2 text-sm font-medium text-foreground">{auth.user.email}</dd>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/80 p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Person ID</dt>
            <dd className="mt-2 text-sm font-medium text-foreground">{person.id}</dd>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/80 p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Full Name</dt>
            <dd className="mt-2 text-sm font-medium text-foreground">{person.fullName}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            href="/api/member/session"
          >
            View Session JSON
          </Link>
          <Link
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground"
            href="/logout?returnTo=/"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </main>
  )
}
