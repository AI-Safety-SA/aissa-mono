import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CodeOfConductPage, { metadata } from '@/app/(frontend)/code-of-conduct/page'

describe('code-of-conduct page', () => {
  it('renders the embedded document with the correct viewport offsets', () => {
    render(<CodeOfConductPage />)

    const frame = screen.getByTitle('AISSA Code of Conduct')
    expect(frame).toHaveAttribute('sandbox', 'allow-same-origin allow-scripts')
    expect(frame).toHaveAttribute('loading', 'lazy')
    expect(frame).toHaveStyle({ minHeight: 'calc(100vh - 5rem)' })
    expect(frame.parentElement).toHaveClass('min-h-[calc(100vh-5rem)]')
  })

  it('exports the expected metadata', () => {
    expect(metadata).toMatchObject({
      title: 'Code of Conduct',
      description: 'AISSA Community Code of Conduct',
    })
  })
})
