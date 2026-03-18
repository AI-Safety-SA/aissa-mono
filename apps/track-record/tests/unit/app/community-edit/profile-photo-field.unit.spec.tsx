import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ImgHTMLAttributes,
} from 'react'
import { ProfilePhotoField } from '@/app/(public)/community-edit/_components/profile-photo-field'
import type { ProfileHeadshot } from '@/app/(public)/community-edit/_lib/profile-types'

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    src,
    ...props
  }: { alt: string; fill?: boolean; src: string } & ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt} src={src} {...props} />
  ),
}))

const canonicalHeadshot: ProfileHeadshot = {
  alt: 'Canonical headshot',
  filename: 'canonical.webp',
  id: 44,
  url: '/canonical.webp',
}

const uploadedHeadshot: ProfileHeadshot = {
  alt: 'Updated headshot',
  filename: 'updated.webp',
  id: 300,
  url: '/updated.webp',
}

function renderField(overrides: Partial<ComponentProps<typeof ProfilePhotoField>> = {}) {
  return render(
    <ProfilePhotoField
      canonicalHeadshot={null}
      displayName="Alice Example"
      headshot={null}
      headshotError={null}
      headshotInputRef={{ current: null }}
      initials="A"
      isSubmitting={false}
      isUploadingHeadshot={false}
      onHeadshotSelection={() => undefined}
      onOpenPicker={() => undefined}
      onRemove={() => undefined}
      onReset={() => undefined}
      {...overrides}
    />,
  )
}

function ProfilePhotoFieldHarness({
  initialCanonicalHeadshot = null,
}: {
  initialCanonicalHeadshot?: ProfileHeadshot | null
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [headshot, setHeadshot] = useState<ProfileHeadshot | null>(initialCanonicalHeadshot)

  function handleSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setHeadshot({
      alt: 'Updated headshot',
      filename: file.name,
      id: 300,
      url: '/updated.webp',
    })
  }

  return (
    <ProfilePhotoField
      canonicalHeadshot={initialCanonicalHeadshot}
      displayName="Alice Example"
      headshot={headshot}
      headshotError={null}
      headshotInputRef={inputRef}
      initials="A"
      isSubmitting={false}
      isUploadingHeadshot={false}
      onHeadshotSelection={handleSelection}
      onOpenPicker={() => undefined}
      onRemove={() => setHeadshot(null)}
      onReset={() => setHeadshot(initialCanonicalHeadshot)}
    />
  )
}

describe('ProfilePhotoField', () => {
  it('renders a compact empty state with avatar fallback and upload action', () => {
    renderField()

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('Profile photo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload photo' })).toBeInTheDocument()
    expect(screen.getByText('No photo selected yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  it('renders the canonical headshot with current-state messaging', () => {
    renderField({
      canonicalHeadshot,
      headshot: canonicalHeadshot,
    })

    expect(screen.getByAltText('Canonical headshot')).toHaveAttribute('src', '/canonical.webp')
    expect(screen.getByText('Current photo retained.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revert to current' })).not.toBeInTheDocument()
  })

  it('disables photo controls while an upload is in progress', () => {
    renderField({
      canonicalHeadshot,
      headshot: canonicalHeadshot,
      isUploadingHeadshot: true,
    })

    expect(screen.getByRole('button', { name: 'Uploading...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled()
    expect(screen.getByText('Uploading photo...')).toBeInTheDocument()
  })

  it('updates to a pending uploaded photo when a new file is selected', () => {
    render(<ProfilePhotoFieldHarness />)

    fireEvent.change(screen.getByLabelText('Choose profile photo'), {
      target: {
        files: [new File(['avatar'], 'avatar.webp', { type: 'image/webp' })],
      },
    })

    expect(screen.getByRole('button', { name: 'Change photo' })).toBeInTheDocument()
    expect(screen.getByAltText('Updated headshot')).toHaveAttribute('src', '/updated.webp')
    expect(screen.getByText('New photo selected for review.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revert to current' })).toBeInTheDocument()
  })

  it('marks the current photo for removal and can revert to the canonical photo', () => {
    render(<ProfilePhotoFieldHarness initialCanonicalHeadshot={canonicalHeadshot} />)

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.queryByAltText('Canonical headshot')).not.toBeInTheDocument()
    expect(screen.getByText('Current photo will be removed.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revert to current' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Revert to current' }))

    expect(screen.getByAltText('Canonical headshot')).toHaveAttribute('src', '/canonical.webp')
    expect(screen.getByText('Current photo retained.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revert to current' })).not.toBeInTheDocument()
  })
})
