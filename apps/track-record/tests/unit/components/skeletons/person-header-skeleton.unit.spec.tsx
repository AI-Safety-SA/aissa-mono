import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PersonHeaderSkeleton } from '@/components/skeletons/person-header-skeleton'

describe('PersonHeaderSkeleton component', () => {
  it('renders header structure', () => {
    render(<PersonHeaderSkeleton />)

    // Should render header element
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('renders avatar placeholder', () => {
    render(<PersonHeaderSkeleton />)

    // Should have rounded-full avatar placeholder
    const avatar = document.querySelector('.rounded-full')
    expect(avatar).toBeTruthy()
  })

  it('renders stats section', () => {
    render(<PersonHeaderSkeleton />)

    // Should render stats container with border
    const statsContainer = document.querySelector('.border.rounded-lg')
    expect(statsContainer).toBeTruthy()
  })

  it('renders back button placeholder', () => {
    render(<PersonHeaderSkeleton />)

    // Should have skeleton for back button
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
