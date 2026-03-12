import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type AissaBrandProps = {
  className?: string
  href?: string
  priority?: boolean
  showDescriptor?: boolean
  size?: 'sm' | 'lg'
}

const sizeClasses = {
  sm: {
    logoFrame: 'rounded-[1.25rem] px-3 py-2',
    logoImage: 'h-6 w-auto md:h-7',
    eyebrow: 'text-[0.62rem] tracking-[0.3em]',
    title: 'text-sm',
  },
  lg: {
    logoFrame: 'rounded-[1.8rem] px-5 py-4',
    logoImage: 'h-10 w-auto md:h-12',
    eyebrow: 'text-[0.68rem] tracking-[0.35em]',
    title: 'text-base md:text-lg',
  },
} as const

function BrandContent({
  className,
  priority = false,
  showDescriptor = true,
  size = 'sm',
}: Omit<AissaBrandProps, 'href'>) {
  const classes = sizeClasses[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'shrink-0 border border-white/10 bg-[#0b1f46] shadow-[0_18px_50px_-28px_rgba(11,31,70,0.95)]',
          classes.logoFrame,
        )}
      >
        <Image
          src="/brand/aissa-logo.png"
          alt="AI Safety South Africa"
          width={205}
          height={54}
          priority={priority}
          className={classes.logoImage}
        />
      </div>

      {showDescriptor ? (
        <div className="space-y-1">
          <p className={cn('font-semibold uppercase text-primary/70', classes.eyebrow)}>
            Track Record
          </p>
          <p className={cn('font-semibold text-foreground', classes.title)}>Impact dashboard</p>
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
          'transition-transform duration-200 group-hover:translate-y-[-1px]',
          props.className,
        )}
      />
    </Link>
  )
}
