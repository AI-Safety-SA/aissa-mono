import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/(frontend)/projects/loading'

describe('Projects list loading page', () => {
  it('renders header skeleton', () => {
    render(<Loading />)

    const header = document.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('renders project cards grid skeleton', () => {
    render(<Loading />)

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBeGreaterThan(0)
  })
})
