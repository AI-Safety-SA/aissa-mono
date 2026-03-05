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

const sizeStyles: Record<
  PageHeaderSize,
  { container: string; title: string; content: string; left: string }
> = {
  compact: {
    container: 'py-6 md:py-8',
    title: 'text-3xl sm:text-4xl',
    content: 'gap-3',
    left: 'space-y-1.5',
  },
  default: {
    container: 'py-6 md:py-8',
    title: 'text-3xl sm:text-4xl',
    content: 'gap-3',
    left: 'space-y-1.5',
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
        <div
          className={cn(
            'flex flex-col md:flex-row md:items-end md:justify-between',
            styles.content,
            contentClassName
          )}
        >
          <div className={cn(styles.left, leftClassName)}>
            {(showBackButton || eyebrow) && (
              <div className="flex flex-wrap items-center gap-3">
                {showBackButton && (
                  <BackButton
                    href={backHref}
                    variant="link"
                    className="h-auto p-0 pl-0! text-sm font-normal text-muted-foreground hover:text-foreground"
                  />
                )}
                {eyebrow}
              </div>
            )}
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
