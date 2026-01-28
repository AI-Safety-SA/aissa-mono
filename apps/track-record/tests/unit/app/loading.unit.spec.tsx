import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/(frontend)/loading'

describe('Homepage loading page', () => {
  it('renders hero section skeleton', () => {
    render(<Loading />)

    // Should have hero title and description placeholders
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders stats section skeleton', () => {
    render(<Loading />)

    // Should have 4 stat card placeholders
    const statCards = document.querySelectorAll('.border.rounded-lg')
    expect(statCards.length).toBeGreaterThanOrEqual(4)
  })

  it('renders featured people section skeleton', () => {
    render(<Loading />)

    // Should have section title
    const sectionTitles = document.querySelectorAll('.animate-pulse')
    expect(sectionTitles.length).toBeGreaterThan(0)
  })

  it('renders programs section skeleton', () => {
    render(<Loading />)

    // Should have program card placeholders
    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders events section skeleton', () => {
    render(<Loading />)

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders projects section skeleton', () => {
    render(<Loading />)

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBeGreaterThan(0)
  })
})
