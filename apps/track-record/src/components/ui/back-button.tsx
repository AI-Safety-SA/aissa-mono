'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href?: string
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function BackButton({ href, className, variant = 'ghost' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (href) return // Let the Link handle it if href is provided (though we use Button here)
    e.preventDefault()
    router.back()
  }

  if (href) {
    return (
      <Button
        variant={variant}
        size="sm"
        className={cn('gap-2 pl-2', className)}
        asChild
      >
        <a href={href}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </a>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size="sm"
      className={cn('gap-2 pl-2', className)}
      onClick={handleClick}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  )
}
