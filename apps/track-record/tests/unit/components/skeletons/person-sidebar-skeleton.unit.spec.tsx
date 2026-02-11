import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PersonSidebarSkeleton } from '@/components/skeletons/person-sidebar-skeleton'

describe('PersonSidebarSkeleton component', () => {
  it('renders sidebar card structure', () => {
    render(<PersonSidebarSkeleton />)

    // Should render card container
    const card = document.querySelector('.rounded-lg.border')
    expect(card).toBeTruthy()
  })

  it('renders quick info title', () => {
    render(<PersonSidebarSkeleton />)

    // Should have skeleton for title
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders info item placeholders', () => {
    render(<PersonSidebarSkeleton />)

    // Should have multiple rows for joined date, first engagement, website
    const rows = document.querySelectorAll('.flex.items-center')
    expect(rows.length).toBeGreaterThanOrEqual(3)
  })
})
