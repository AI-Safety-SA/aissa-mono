'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FRONTEND_GATE_RETURN_TO_SEARCH_PARAM } from '@/utilities/frontend-gate-shared'

export function FunderAccessButton() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const nextSearchParams = new URLSearchParams({
    [FRONTEND_GATE_RETURN_TO_SEARCH_PARAM]: returnTo,
  })

  return (
    <Link
      href={`/frontend-gate?${nextSearchParams.toString()}`}
      className={cn(buttonVariants({ size: 'sm', variant: 'link' }), 'h-auto px-0')}
    >
      Funder access
    </Link>
  )
}
