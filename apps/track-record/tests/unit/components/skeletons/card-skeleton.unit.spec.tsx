import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CardSkeleton } from '@/components/skeletons/card-skeleton'

describe('CardSkeleton component', () => {
  it('renders default 3 cards', () => {
    render(<CardSkeleton />)

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBe(3)
  })

  it('renders custom card count', () => {
    render(<CardSkeleton count={6} />)

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBe(6)
  })

  it('renders card with image placeholder', () => {
    render(<CardSkeleton count={1} />)

    // Should have aspect-video for image
    const imagePlaceholder = document.querySelector('.aspect-video')
    expect(imagePlaceholder).toBeTruthy()
  })

  it('renders card content structure', () => {
    render(<CardSkeleton count={1} />)

    // Should have content area with padding
    const content = document.querySelector('.p-4')
    expect(content).toBeTruthy()

    // Should have skeleton elements for title and description
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })
})
