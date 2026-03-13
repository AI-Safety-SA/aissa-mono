import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PersonTimelineExplorer } from '@/components/person/person-timeline-explorer'

describe('PersonTimelineExplorer', () => {
  it('toggles the full timeline table', () => {
    render(
      <PersonTimelineExplorer
        rows={[
          {
            date: '2025-01-01T00:00:00.000Z',
            detail: 'completed',
            href: null,
            id: 'engagement-1',
            kind: 'Engagement',
            title: 'Participant at Program',
          },
        ]}
      />,
    )

    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /view full timeline/i }))
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Participant at Program')).toBeInTheDocument()
  })
})
