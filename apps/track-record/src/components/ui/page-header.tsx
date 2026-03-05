import type { ReactNode } from 'react'
import { BackButton } from '@/components/ui/back-button'
import { cn } from '@/lib/utils'

type PageHeaderSize = 'compact' | 'default'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
  containerClassName?: string
  titleClassName?: string
  contentClassName?: string
  leftClassName?: string
  as?: 'header' | 'section'
  size?: PageHeaderSize
  muted?: boolean
  backHref?: string
  showBackButton?: boolean
}

const sizeStyles: Record<PageHeaderSize, { container: string; back: string; title: string }> = {
  compact: {
    container: 'py-12 md:py-16',
    back: 'mb-6',
    title: 'text-3xl sm:text-4xl',
  },
  default: {
    container: 'py-8',
    back: 'mb-6',
    title: 'text-3xl sm:text-4xl',
  },
}

export function PageHeader({
  title,
  description,
  eyebrow,
  meta,
  actions,
  children,
  className,
  containerClassName,
  titleClassName,
  contentClassName,
  leftClassName,
  as = 'section',
  size = 'default',
  muted = false,
  backHref,
  showBackButton = true,
}: PageHeaderProps) {
  const RootTag = as
  const styles = sizeStyles[size]

  return (
    <RootTag className={cn('border-b', muted && 'bg-muted/30', className)}>
      <div className={cn('container mx-auto px-4', styles.container, containerClassName)}>
        {showBackButton && <BackButton href={backHref} className={styles.back} />}
        <div className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', contentClassName)}>
          <div className={cn('space-y-4', leftClassName)}>
            {eyebrow}
            <h1 className={cn('font-bold tracking-tight', styles.title, titleClassName)}>{title}</h1>
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
            {meta}
            {children}
          </div>
          {actions}
        </div>
      </div>
    </RootTag>
  )
}
