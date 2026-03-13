'use client'

import Link from 'next/link'

export function CommunityReviewDashboardCTA() {
  return (
    <section
      style={{
        alignItems: 'center',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '10px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '16px',
      }}
    >
      <div style={{ maxWidth: '780px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Community Review Queue</h2>
        <p style={{ color: 'var(--theme-text-dim)', margin: '6px 0 0 0' }}>
          Open the custom admin review workspace to process community edit submissions.
        </p>
      </div>

      <Link
        href="/admin/community-review"
        style={{
          backgroundColor: 'var(--theme-success-500)',
          borderRadius: '8px',
          color: 'var(--theme-success-50)',
          fontSize: '0.875rem',
          fontWeight: 600,
          padding: '8px 12px',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Open Review Queue
      </Link>
    </section>
  )
}
