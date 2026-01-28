import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/(frontend)/projects/[slug]/loading'

describe('Project detail loading page', () => {
  it('renders project header skeleton', () => {
    render(<Loading />)

    const header = document.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('renders action buttons skeleton', () => {
    render(<Loading />)

    // Should have button placeholders
    const buttons = document.querySelectorAll('.animate-pulse')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders contributors section skeleton', () => {
    render(<Loading />)

    // Should have contributor card placeholders
    const contributorCards = document.querySelectorAll('.border.rounded-lg')
    expect(contributorCards.length).toBeGreaterThan(0)
  })
})
