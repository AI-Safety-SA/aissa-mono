import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/(frontend)/programs/loading'

describe('Programs list loading page', () => {
  it('renders header skeleton', () => {
    render(<Loading />)

    const header = document.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('renders program cards grid skeleton', () => {
    render(<Loading />)

    // Should have multiple program card placeholders
    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('renders title and view all link skeleton', () => {
    render(<Loading />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
