export interface SiteNavItem {
  href: string
  label: string
}

const siteNavItems: SiteNavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/programs', label: 'Programs' },
  { href: '/events', label: 'Events' },
  { href: '/grants', label: 'Grants' },
  { href: '/research', label: 'Research' },
]

export function getSiteNavItems(canViewFundingDetails: boolean): SiteNavItem[] {
  if (canViewFundingDetails) {
    return siteNavItems
  }

  return siteNavItems.filter((item) => item.href !== '/grants')
}
