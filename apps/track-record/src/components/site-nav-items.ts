export interface SiteNavItem {
  href: string
  label: string
}

export const siteNavItems: SiteNavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/programs', label: 'Programs' },
  { href: '/events', label: 'Events' },
  { href: '/grants', label: 'Grants' },
  { href: '/research', label: 'Research' },
]
