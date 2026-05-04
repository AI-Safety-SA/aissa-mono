export const TRACK_RECORD_THEME_STORAGE_KEY = "track-record-theme";

export type TrackRecordTheme = "light" | "dark";

export function resolveTrackRecordTheme(
  value: string | null | undefined,
): TrackRecordTheme {
  return value === "dark" ? "dark" : "light";
}

export function applyTrackRecordTheme(
  root: HTMLElement,
  theme: TrackRecordTheme,
) {
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function buildTrackRecordThemeScript(
  storageKey: string = TRACK_RECORD_THEME_STORAGE_KEY,
): string {
  return `(() => {
    const root = document.documentElement;
    try {
      const stored = window.localStorage.getItem(${JSON.stringify(storageKey)});
      const theme = stored === 'dark' ? 'dark' : 'light';
      root.classList.toggle('dark', theme === 'dark');
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } catch (error) {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
      root.style.colorScheme = 'light';
    }
  })();`;
}
