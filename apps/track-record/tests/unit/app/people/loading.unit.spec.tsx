import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/(frontend)/people/[id]/loading'

describe('Person detail loading page', () => {
  it('renders person header skeleton', () => {
    render(<Loading />)

    // Should render header with border
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
  })

  it('renders timeline skeleton', () => {
    render(<Loading />)

    // Should have timeline skeleton elements
    const timelineItems = document.querySelectorAll('.pb-8')
    expect(timelineItems.length).toBeGreaterThan(0)
  })

  it('renders sidebar skeleton', () => {
    render(<Loading />)

    // Should have sidebar card
    const sidebar = document.querySelector('.rounded-lg.border')
    expect(sidebar).toBeTruthy()
  })

  it('renders main content area', () => {
    render(<Loading />)

    // Should have main element
    const main = document.querySelector('main')
    expect(main).toBeTruthy()
  })
})
