import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton component', () => {
  it('renders with default styling', () => {
    render(<Skeleton />)

    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeTruthy()
    expect(skeleton).toHaveClass('bg-muted')
    expect(skeleton).toHaveClass('rounded-md')
  })

  it('applies custom className', () => {
    render(<Skeleton className="h-10 w-20" />)

    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toHaveClass('h-10')
    expect(skeleton).toHaveClass('w-20')
  })

  it('renders as div element', () => {
    render(<Skeleton />)

    const skeleton = document.querySelector('div')
    expect(skeleton?.tagName).toBe('DIV')
  })
})
