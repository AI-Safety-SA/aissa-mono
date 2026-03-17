import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DataConsentControls } from './data-consent-controls'

type CommunityEditShellProps = {
  children: ReactNode
  description: string
  step: number
  title: string
}

const STEPS = [
  { label: 'Identify', url: '/community-edit' },
  { label: 'Verify', url: '/community-edit/verify' },
  { label: 'Profile', url: '/community-edit/profile' },
  { label: 'Engagements', url: '/community-edit/engagements' },
  { label: 'Testimonials', url: '/community-edit/testimonials' },
  { label: 'Impacts', url: '/community-edit/impacts' },
  { label: 'Review', url: '/community-edit/review' },
  { label: 'Submitted', url: '/community-edit/submitted' },
]

export function CommunityEditShell({
  children,
  description,
  step,
  title,
}: CommunityEditShellProps) {
  const showDataConsentControls = step === 3 || step === 7

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto flex flex-1 max-w-3xl flex-col px-4 py-10">
        <div className="flex-1">
          <header className="mb-8 space-y-3">
            <div className="text-sm text-muted-foreground">
              Step {step} of {STEPS.length}: {STEPS[step - 1]?.label}
            </div>
            <h1 className="m-0 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="m-0 text-base text-muted-foreground">{description}</p>
          </header>

          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              {STEPS.map((s, index) => {
                const stepNumber = index + 1
                const isCompleted = index < step - 1
                const isCurrent = index === step - 1
                const isLast = index === STEPS.length - 1

                const dot = (
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                      isCompleted && 'bg-primary text-primary-foreground',
                      isCurrent && 'border-2 border-primary text-primary',
                      !isCompleted &&
                        !isCurrent &&
                        'border border-muted-foreground/30 text-muted-foreground',
                    )}
                  >
                    {stepNumber}
                  </div>
                )

                return (
                  <Fragment key={s.label}>
                    <div className="flex min-w-0 flex-col items-center gap-1">
                      {isCompleted ? (
                        <Link
                          href={s.url}
                          className="hover:opacity-70 transition-opacity"
                          title={`Go back to ${s.label}`}
                        >
                          {dot}
                        </Link>
                      ) : (
                        dot
                      )}
                      <span
                        className={cn(
                          'hidden text-xs sm:block truncate max-w-16 text-center',
                          isCurrent && 'font-medium text-foreground',
                          !isCurrent && 'text-muted-foreground',
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className={cn('mx-1 h-px flex-1', isCompleted ? 'bg-primary' : 'bg-muted')}
                      />
                    )}
                  </Fragment>
                )
              })}
            </div>
          </div>

          {children}

          {showDataConsentControls ? <DataConsentControls /> : null}
        </div>
      </div>
    </div>
  )
}
