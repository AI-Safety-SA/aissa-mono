import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'
import { TRACK_RECORD_THEME_STORAGE_KEY } from '@/lib/theme'

describe('ThemeToggle component', () => {
  let storage: Record<string, string>

  beforeEach(() => {
    storage = {}

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => {
          storage[key] = value
        },
        removeItem: (key: string) => {
          delete storage[key]
        },
        clear: () => {
          storage = {}
        },
      },
    })
  })

  afterEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    delete document.documentElement.dataset.theme
    document.documentElement.style.colorScheme = ''
  })

  it('defaults to light mode when no preference is stored', async () => {
    render(<ThemeToggle />)

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light')
    })

    expect(document.documentElement).not.toHaveClass('dark')
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
  })

  it('restores dark mode from localStorage and persists toggles', async () => {
    window.localStorage.setItem(TRACK_RECORD_THEME_STORAGE_KEY, 'dark')

    render(<ThemeToggle />)

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })

    const toggle = screen.getByRole('button', { name: 'Switch to light mode' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(toggle)

    expect(document.documentElement).not.toHaveClass('dark')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem(TRACK_RECORD_THEME_STORAGE_KEY)).toBe('light')
  })
})
