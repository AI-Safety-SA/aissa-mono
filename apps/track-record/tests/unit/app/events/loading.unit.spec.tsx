import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/(frontend)/events/[slug]/loading'

describe('Event detail loading page', () => {
  it('renders event header skeleton', () => {
    render(<Loading />)

    const header = document.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('renders attendance stats skeleton', () => {
    render(<Loading />)

    const statsContainer = document.querySelector('.border.rounded-lg')
    expect(statsContainer).toBeTruthy()
  })

  it('renders hosts section skeleton', () => {
    render(<Loading />)

    // Should have host card placeholders
    const hostCards = document.querySelectorAll('.border.rounded-lg')
    expect(hostCards.length).toBeGreaterThan(0)
  })
})
