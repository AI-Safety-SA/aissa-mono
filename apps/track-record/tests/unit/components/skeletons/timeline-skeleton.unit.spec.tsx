import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimelineSkeleton } from '@/components/skeletons/timeline-skeleton'

describe('TimelineSkeleton component', () => {
  it('renders three timeline item skeletons', () => {
    render(<TimelineSkeleton />)

    // Should render 3 card containers (pb-8 for spacing between items)
    const cards = document.querySelectorAll('.pb-8')
    expect(cards.length).toBe(3)
  })

  it('renders skeleton elements with proper styling', () => {
    render(<TimelineSkeleton />)

    // Check for pulse animation elements (skeletons)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders timeline structure with icons and lines', () => {
    render(<TimelineSkeleton />)

    // Check for timeline connector lines (uses bg-muted class)
    const lines = document.querySelectorAll('.bg-muted')
    expect(lines.length).toBeGreaterThan(0)

    // Check for icon placeholders (rounded-full elements)
    const iconPlaceholders = document.querySelectorAll('.rounded-full')
    expect(iconPlaceholders.length).toBeGreaterThanOrEqual(3)
  })
})
