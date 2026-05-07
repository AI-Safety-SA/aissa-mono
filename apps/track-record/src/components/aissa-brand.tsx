import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type AissaBrandProps = {
  className?: string
  href?: string
  priority?: boolean
  showDescriptor?: boolean
  size?: 'sm' | 'lg'
  title?: string
}

const sizeClasses = {
  sm: {
    logoFrame: 'h-7 w-[105px] md:h-8 md:w-[120px]',
    logoImage: 'h-full w-auto object-contain',
    eyebrow: 'text-[0.62rem] tracking-[0.3em]',
    title: 'text-sm',
  },
  lg: {
    logoFrame: 'h-10 w-[150px] md:h-12 md:w-[180px]',
    logoImage: 'h-full w-auto object-contain',
    eyebrow: 'text-[0.68rem] tracking-[0.35em]',
    title: 'text-base md:text-lg',
  },
} as const

function BrandContent({
  className,
  priority = false,
  showDescriptor = true,
  size = 'sm',
  title = 'Impact dashboard',
}: Omit<AissaBrandProps, 'href'>) {
  const classes = sizeClasses[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative block shrink-0', classes.logoFrame)}>
        <Image
          src="/brand/aissa-logo-black.png"
          alt="AI Safety South Africa"
          width={2045}
          height={544}
          priority={priority}
          className={cn(classes.logoImage, '[html[data-theme=dark]_&]:hidden')}
        />
        <Image
          src="/brand/aissa-logo-light.png"
          alt="AI Safety South Africa"
          width={2045}
          height={544}
          className={cn(classes.logoImage, 'hidden [html[data-theme=dark]_&]:block')}
        />
      </div>

      {showDescriptor ? (
        <div className="space-y-1">
          <p className={cn('font-semibold uppercase text-primary/70', classes.eyebrow)}>
            Track Record
          </p>
          <p className={cn('font-semibold text-foreground', classes.title)}>{title}</p>
        </div>
      ) : null}
    </div>
  )
}

export function AissaBrand(props: AissaBrandProps) {
  const { href, ...contentProps } = props

  if (!href) {
    return <BrandContent {...contentProps} />
  }

  return (
    <Link href={href} className="group inline-flex">
      <BrandContent
        {...contentProps}
        className={cn(
          'transition-transform duration-200 group-hover:-translate-y-px',
          props.className,
        )}
      />
    </Link>
  )
}
