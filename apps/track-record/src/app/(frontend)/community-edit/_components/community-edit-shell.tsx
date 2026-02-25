import type { ReactNode } from 'react'
import Link from 'next/link'

type CommunityEditShellProps = {
  children: ReactNode
  description: string
  step: number
  title: string
}

const STEP_LABELS = [
  'Identify',
  'Verify',
  'Profile',
  'Engagements',
  'Testimonials',
  'Impacts',
  'Review',
  'Submitted',
]

export function CommunityEditShell({
  children,
  description,
  step,
  title,
}: CommunityEditShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to dashboard
          </Link>
        </div>

        <header className="mb-8 space-y-3">
          <div className="text-sm text-muted-foreground">
            Step {step} of {STEP_LABELS.length}: {STEP_LABELS[step - 1]}
          </div>
          <h1 className="m-0 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="m-0 text-base text-muted-foreground">{description}</p>
        </header>

        <div className="mb-8 overflow-hidden rounded-lg border">
          <div className="flex w-full">
            {STEP_LABELS.map((label, index) => (
              <div
                key={label}
                className={`h-2 flex-1 ${index < step ? 'bg-primary' : 'bg-muted'}`}
                title={label}
              />
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}

