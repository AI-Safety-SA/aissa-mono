import { buildTrackRecordThemeScript } from '@/lib/theme'

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: buildTrackRecordThemeScript() }}
      id="track-record-theme"
    />
  )
}
