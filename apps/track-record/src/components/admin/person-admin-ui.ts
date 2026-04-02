'use client'

import { PayloadAPIError } from './person-admin-api'

export function getPersonAdminErrorMessage(error: unknown): string {
  if (error instanceof PayloadAPIError) return error.message
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

export function toDateInputValue(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''

  const explicitDate = value.match(/^\d{4}-\d{2}-\d{2}/)
  if (explicitDate) return explicitDate[0]

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.valueOf())) return ''
  return parsedDate.toISOString().slice(0, 10)
}

export function toFormattedDate(value?: string | null): string {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return date.toLocaleString()
}

export function personAdminModalStyles(): Record<string, string | number> {
  return {
    background: 'rgba(15, 23, 42, 0.35)',
    inset: 0,
    overflowY: 'auto',
    padding: 24,
    position: 'fixed',
    zIndex: 1000,
  }
}

export function personAdminModalCardStyles(): Record<string, string | number> {
  return {
    background: 'var(--theme-bg)',
    borderRadius: 8,
    margin: '0 auto',
    maxWidth: 760,
    padding: 20,
  }
}

export function personAdminSectionStyles(): Record<string, string | number> {
  return {
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: 8,
    marginTop: 24,
    padding: 16,
  }
}
