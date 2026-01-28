import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/(frontend)/events/loading'

describe('Events list loading page', () => {
  it('renders header skeleton', () => {
    render(<Loading />)

    const header = document.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('renders event cards grid skeleton', () => {
    render(<Loading />)

    const cards = document.querySelectorAll('.border.rounded-lg')
    expect(cards.length).toBeGreaterThan(0)
  })
})
