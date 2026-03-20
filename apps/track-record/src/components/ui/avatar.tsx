import * as React from 'react'
import Image, { type ImageProps } from 'next/image'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      sm: 'size-8',
      md: 'size-10',
      lg: 'size-14',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

type AvatarProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof avatarVariants>

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size, ...props }, ref) => (
    <span ref={ref} className={cn(avatarVariants({ size }), className)} {...props} />
  ),
)
Avatar.displayName = 'Avatar'

function AvatarImage({ alt, className, sizes = '80px', ...props }: ImageProps) {
  return (
    <Image
      alt={alt}
      fill
      sizes={sizes}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  ),
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarFallback, AvatarImage }
