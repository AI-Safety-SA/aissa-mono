import Link from 'next/link'
import { AissaBrand } from '@/components/aissa-brand'
import { CodeOfConductCard } from '@/components/code-of-conduct-card'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-primary/10 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,42,87,0.08),transparent_38%),linear-gradient(180deg,rgba(248,251,255,0.64),rgba(255,255,255,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.08),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.98))]" />

      <div className="container relative mx-auto space-y-8 px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="space-y-5 rounded-[1.75rem] border border-primary/10 bg-card/78 p-6 shadow-[0_24px_80px_-52px_rgba(11,31,70,0.5)] backdrop-blur">
            <AissaBrand href="/" />
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              A live record of AISSA’s programs, events, grants, research, and community impact
              across South Africa.
            </p>

            <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link href="/programs" className="transition-colors hover:text-foreground">
                Programs
              </Link>
              <Link href="/events" className="transition-colors hover:text-foreground">
                Events
              </Link>
              <Link href="/research" className="transition-colors hover:text-foreground">
                Research
              </Link>
              <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
            </nav>
          </div>

          <CodeOfConductCard />
        </div>

        <div className="flex flex-col gap-2 border-t border-primary/10 pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} AI Safety South Africa. All rights reserved.</p>
          <p>Built for transparent community reporting and program accountability.</p>
        </div>
      </div>
    </footer>
  )
}
