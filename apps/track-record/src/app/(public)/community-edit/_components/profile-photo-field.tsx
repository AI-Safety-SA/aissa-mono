import { useEffect, useState, type ChangeEvent, type RefObject } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
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

  return canonicalHeadshotId
    ? 'Replacement photo selected for review.'
    : 'New photo selected for review.'
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
  const hasSelectedHeadshot = Boolean(headshot)
  const headshotStateCopy = getProfilePhotoStateCopy({ canonicalHeadshot, headshot })
  const [isPreviewLoading, setIsPreviewLoading] = useState(Boolean(headshot?.url))
  const helperTextId = 'community-headshot-help'
  const statusTextId = 'community-headshot-status'
  const errorTextId = 'community-headshot-error'
  const describedBy = [helperTextId, statusTextId, headshotError ? errorTextId : null]
    .filter(Boolean)
    .join(' ')
  const showAvatarSpinner = isUploadingHeadshot || (Boolean(headshot?.url) && isPreviewLoading)

  useEffect(() => {
    setIsPreviewLoading(Boolean(headshot?.url))
  }, [headshot?.url])

  return (
    <div className="rounded-xl border p-4">
      <Input
        ref={headshotInputRef}
        id="community-headshot-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Choose profile photo"
        aria-describedby={describedBy}
        className="sr-only"
        disabled={isSubmitting || isUploadingHeadshot}
        onChange={onHeadshotSelection}
      />

      <Field className="gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="xl" className="border border-border bg-muted">
              {headshot?.url ? (
                <>
                  <AvatarFallback className="bg-muted text-xl font-semibold tracking-tight text-foreground">
                    {initials}
                  </AvatarFallback>
                  <AvatarImage
                    src={headshot.url}
                    alt={headshot.alt || `${displayName} headshot`}
                    className={cn(
                      'transition-opacity duration-200',
                      isPreviewLoading ? 'opacity-0' : 'opacity-100',
                    )}
                    onLoad={() => setIsPreviewLoading(false)}
                  />
                </>
              ) : (
                <AvatarFallback className="bg-muted text-xl font-semibold tracking-tight text-foreground">
                  {initials}
                </AvatarFallback>
              )}
              {showAvatarSpinner ? (
                <span
                  className="absolute inset-0 flex items-center justify-center bg-background/45"
                  role="status"
                  aria-live="polite"
                >
                  <span className="size-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
                  <span className="sr-only">Loading profile photo preview</span>
                </span>
              ) : null}
            </Avatar>

            <div className="min-w-0 space-y-1">
              <FieldLabel htmlFor="community-headshot-upload">Profile photo</FieldLabel>
              <FieldDescription id={helperTextId}>
                Upload a clear JPEG, PNG, or WebP image up to 5MB. It appears in circular cards and
                profile headers.
              </FieldDescription>
              <p id={statusTextId} className="text-sm text-muted-foreground" aria-live="polite">
                {isUploadingHeadshot ? 'Uploading photo...' : headshotStateCopy}
              </p>
              {headshotError ? (
                <p id={errorTextId} className="text-sm text-destructive" aria-live="polite">
                  {headshotError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:max-w-60 md:justify-end">
            <Button
              type="button"
              onClick={onOpenPicker}
              disabled={isSubmitting || isUploadingHeadshot}
            >
              {isUploadingHeadshot ? 'Uploading...' : headshot ? 'Change photo' : 'Upload photo'}
            </Button>
            {hasSelectedHeadshot ? (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || isUploadingHeadshot}
                onClick={onRemove}
              >
                Remove
              </Button>
            ) : null}
            {headshotChanged ? (
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting || isUploadingHeadshot}
                onClick={onReset}
              >
                Revert to current
              </Button>
            ) : null}
          </div>
        </div>
      </Field>
    </div>
  )
}
