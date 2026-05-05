import { Suspense } from 'react'
import Link from 'next/link'
import { AissaBrand } from '@/components/aissa-brand'
import { LockSiteButton } from '@/components/frontend/lock-site-button'
import { getSiteNavItems } from '@/components/site-nav-items'
import { getPublicWebsiteUrl } from '@/components/public-website-url'

const footerLegalLinks = [
  { href: getPublicWebsiteUrl('/privacy-policy'), label: 'Privacy Policy' },
  { href: getPublicWebsiteUrl('/code-of-conduct'), label: 'Code of Conduct' },
]

export function Footer(props: { canViewFundingDetails: boolean; showLockAction: boolean }) {
  const { canViewFundingDetails, showLockAction } = props
  const currentYear = new Date().getFullYear()
  const navItems = getSiteNavItems(canViewFundingDetails)

  return (
    <footer className="border-t border-primary/10 bg-background/90">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <AissaBrand href="/" />

          {/* Nav links */}
          <nav className="flex flex-row flex-wrap items-center gap-4 text-sm">
            {[...navItems, ...footerLegalLinks].map(({ href, label }) => (
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
          <div className="flex flex-col gap-1 md:items-end">
            <p>Built for transparent community reporting and program accountability.</p>
            {showLockAction ? (
              <Suspense fallback={null}>
                <LockSiteButton />
              </Suspense>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
