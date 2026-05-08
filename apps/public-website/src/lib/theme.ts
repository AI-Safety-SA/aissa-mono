// Keep the stored key shared with Track Record so legal-document navigation
// between the public site and Track Record preserves the user's preference.
export const PUBLIC_WEBSITE_THEME_STORAGE_KEY = "track-record-theme";

export type PublicWebsiteTheme = "light" | "dark";

export function resolvePublicWebsiteTheme(
  value: string | null | undefined,
): PublicWebsiteTheme {
  return value === "light" ? "light" : "dark";
}

export function applyPublicWebsiteTheme(
  root: HTMLElement,
  theme: PublicWebsiteTheme,
) {
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function buildPublicWebsiteThemeScript(
  storageKey: string = PUBLIC_WEBSITE_THEME_STORAGE_KEY,
): string {
  return `(() => {
    const root = document.documentElement;
    try {
      const stored = window.localStorage.getItem(${JSON.stringify(storageKey)});
      const theme = stored === 'light' ? 'light' : 'dark';
      root.classList.toggle('dark', theme === 'dark');
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } catch (error) {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
      root.style.colorScheme = 'dark';
    }
  })();`;
}
