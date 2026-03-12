'use client'

import * as React from 'react'
import { MoonStar, SunMedium } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  applyTrackRecordTheme,
  resolveTrackRecordTheme,
  TRACK_RECORD_THEME_STORAGE_KEY,
  type TrackRecordTheme,
} from '@/lib/theme'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<TrackRecordTheme>('light')

  React.useEffect(() => {
    const storedTheme = resolveTrackRecordTheme(
      window.localStorage.getItem(TRACK_RECORD_THEME_STORAGE_KEY),
    )

    applyTrackRecordTheme(document.documentElement, storedTheme)
    setTheme(storedTheme)
  }, [])

  function handleToggle() {
    const nextTheme: TrackRecordTheme = theme === 'dark' ? 'light' : 'dark'

    applyTrackRecordTheme(document.documentElement, nextTheme)
    window.localStorage.setItem(TRACK_RECORD_THEME_STORAGE_KEY, nextTheme)
    setTheme(nextTheme)
  }

  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={cn(
        'h-10 rounded-full border-primary/15 bg-background/80 px-3 text-foreground shadow-sm hover:border-primary/35 hover:bg-accent/70',
        className,
      )}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </Button>
  )
}
