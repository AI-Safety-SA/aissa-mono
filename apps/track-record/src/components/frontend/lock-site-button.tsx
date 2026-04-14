'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LockSiteButton(props: { label?: string }) {
  const { label = 'Lock site' } = props
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  return (
    <form action="/frontend-gate/lock" method="post">
      <input type="hidden" name="returnTo" value={returnTo} />
      <button type="submit" className={cn(buttonVariants({ size: 'sm', variant: 'link' }), 'h-auto px-0')}>
        {label}
      </button>
    </form>
  )
}
