import Link from 'next/link'
import { AissaBrand } from '@/components/aissa-brand'

export function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-primary/10 bg-background/90">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <AissaBrand title="Community Edit" />
          <nav className="flex flex-row items-center gap-4 text-sm">
            {[
              { href: '/privacy-policy', label: 'Privacy Policy' },
              { href: '/code-of-conduct', label: 'Code of Conduct' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-2 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} AI Safety South Africa. All rights reserved.</p>
          <p>Built for transparent community reporting and program accountability.</p>
        </div>
      </div>
    </footer>
  )
}
