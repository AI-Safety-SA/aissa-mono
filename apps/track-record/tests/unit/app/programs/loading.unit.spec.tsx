import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/(frontend)/programs/[slug]/loading'

describe('Program detail loading page', () => {
  it('renders program header skeleton', () => {
    render(<Loading />)

    const header = document.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('renders stats section skeleton', () => {
    render(<Loading />)

    // Should have stats container
    const statsContainer = document.querySelector('.border.rounded-lg')
    expect(statsContainer).toBeTruthy()
  })

  it('renders cohort cards skeleton', () => {
    render(<Loading />)

    // Should have multiple cohort card placeholders
    const cohortCards = document.querySelectorAll('.border.rounded-lg.p-6')
    expect(cohortCards.length).toBeGreaterThan(0)
  })

  it('renders about section skeleton', () => {
    render(<Loading />)

    // Should have content lines
    const contentLines = document.querySelectorAll('.animate-pulse')
    expect(contentLines.length).toBeGreaterThan(0)
  })
})
