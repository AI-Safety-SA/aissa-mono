import Link from 'next/link'
import { BookOpen, Calendar, GraduationCap, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const destinations = [
  { href: '/programs', label: 'Programs', icon: GraduationCap },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/research', label: 'Research', icon: BookOpen },
  { href: '/people', label: 'Community', icon: Users },
] as const

export function DashboardHero() {
  return (
    <section className="relative overflow-hidden border-b border-primary/10 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,42,87,0.14),transparent_42%),radial-gradient(circle_at_right,rgba(37,99,235,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,255,0.94))] dark:bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.12),transparent_32%),radial-gradient(circle_at_right,rgba(37,99,235,0.18),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))]" />

      <div className="container relative mx-auto px-4 py-14 md:py-20">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-primary/15 bg-background/75 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary shadow-[0_12px_40px_-24px_rgba(11,31,70,0.45)] backdrop-blur">
            South African AI safety community
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              AISSA Track Record
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              A live view of the programs, events, research, grants, and people shaping AI safety
              work in South Africa.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {destinations.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'h-11 rounded-full border-primary/15 bg-background/70 px-4 text-sm font-medium shadow-[0_14px_40px_-28px_rgba(11,31,70,0.45)] backdrop-blur hover:border-primary/25 hover:bg-accent/70',
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Built for transparent community reporting, participant outcomes, and the institutions
            AISSA helps build.
          </p>
        </div>
      </div>
    </section>
  )
}
