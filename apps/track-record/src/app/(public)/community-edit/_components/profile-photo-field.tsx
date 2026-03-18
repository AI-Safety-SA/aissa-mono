import type { ChangeEvent, RefObject } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { ProfileHeadshot } from '../_lib/profile-types'

type ProfilePhotoFieldProps = {
  canonicalHeadshot: ProfileHeadshot | null
  displayName: string
  headshot: ProfileHeadshot | null
  headshotError: string | null
  headshotInputRef: RefObject<HTMLInputElement | null>
  initials: string
  isSubmitting: boolean
  isUploadingHeadshot: boolean
  onHeadshotSelection: (event: ChangeEvent<HTMLInputElement>) => void
  onOpenPicker: () => void
  onRemove: () => void
  onReset: () => void
}

function getProfilePhotoStateCopy(args: {
  canonicalHeadshot: ProfileHeadshot | null
  headshot: ProfileHeadshot | null
}): string {
  const canonicalHeadshotId = args.canonicalHeadshot?.id ?? null
  const selectedHeadshotId = args.headshot?.id ?? null

  if (canonicalHeadshotId === selectedHeadshotId) {
    return selectedHeadshotId ? 'Current photo retained.' : 'No photo selected yet.'
  }

  if (selectedHeadshotId === null) {
    return 'Current photo will be removed.'
  }

  return canonicalHeadshotId ? 'Replacement photo selected for review.' : 'New photo selected for review.'
}

export function ProfilePhotoField({
  canonicalHeadshot,
  displayName,
  headshot,
  headshotError,
  headshotInputRef,
  initials,
  isSubmitting,
  isUploadingHeadshot,
  onHeadshotSelection,
  onOpenPicker,
  onRemove,
  onReset,
}: ProfilePhotoFieldProps) {
  const headshotChanged = (canonicalHeadshot?.id ?? null) !== (headshot?.id ?? null)
  const hasCanonicalHeadshot = Boolean(canonicalHeadshot)
  const hasSelectedHeadshot = Boolean(headshot)
  const headshotStateCopy = getProfilePhotoStateCopy({ canonicalHeadshot, headshot })

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-primary/10 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.45)_100%)] p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Profile Photo
        </h2>
        <p className="m-0 text-sm text-muted-foreground">
          Use a clear JPEG, PNG, or WebP image up to 5MB. Circular framing matches the
          public profile view.
        </p>
      </div>

      <input
        ref={headshotInputRef}
        id="community-headshot-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Choose profile photo"
        className="sr-only"
        disabled={isSubmitting || isUploadingHeadshot}
        onChange={onHeadshotSelection}
      />

      <div className="rounded-[1.5rem] border border-primary/10 bg-background/80 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <button
            type="button"
            onClick={onOpenPicker}
            disabled={isSubmitting || isUploadingHeadshot}
            aria-label={
              headshot
                ? 'Open profile photo picker to change photo'
                : 'Open profile photo picker to upload photo'
            }
            className="group relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-primary/5 text-left shadow-[0_18px_48px_-28px_hsl(var(--foreground)/0.45)] transition-transform hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-70"
          >
            {headshot?.url ? (
              <Image
                src={headshot.url}
                alt={headshot.alt || `${displayName} headshot`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="176px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_62%),linear-gradient(160deg,hsl(var(--muted))_0%,hsl(var(--background))_100%)] text-5xl font-semibold tracking-tight text-primary/75">
                {initials}
              </div>
            )}
            <div
              aria-hidden="true"
              className="absolute inset-x-5 bottom-5 rounded-full bg-background/92 px-3 py-2 text-center text-xs font-medium uppercase tracking-[0.22em] text-foreground shadow-sm backdrop-blur-sm"
            >
              {isUploadingHeadshot ? 'Uploading photo...' : headshot ? 'Change photo' : 'Upload photo'}
            </div>
          </button>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                {headshotChanged
                  ? headshot
                    ? hasCanonicalHeadshot
                      ? 'Pending replacement'
                      : 'Pending upload'
                    : hasCanonicalHeadshot
                      ? 'Pending removal'
                      : 'No photo selected'
                  : headshot
                    ? 'Current photo'
                    : 'No photo selected'}
              </span>
              {isUploadingHeadshot ? (
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Upload in progress
                </span>
              ) : null}
            </div>
            <p className="m-0 text-sm text-muted-foreground" aria-live="polite">
              {headshotStateCopy}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onOpenPicker} disabled={isSubmitting || isUploadingHeadshot}>
          {isUploadingHeadshot ? 'Uploading photo...' : headshot ? 'Change photo' : 'Upload photo'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting || isUploadingHeadshot || !hasSelectedHeadshot}
          onClick={onRemove}
        >
          Remove photo
        </Button>
        {headshotChanged ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || isUploadingHeadshot}
            onClick={onReset}
          >
            Revert to current
          </Button>
        ) : null}
      </div>

      {headshotError ? (
        <div
          className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          aria-live="polite"
        >
          {headshotError}
        </div>
      ) : null}

      <p className="m-0 text-xs leading-6 text-muted-foreground">
        The current photo appears in circular cards and profile headers across Track
        Record. Cropping and repositioning are not part of this pass.
      </p>
    </div>
  )
}
