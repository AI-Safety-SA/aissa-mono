// Keep the stored key shared with Track Record so legal-document navigation
// between the public site and Track Record preserves the user's preference.
export const PUBLIC_WEBSITE_THEME_STORAGE_KEY = "track-record-theme";

export type PublicWebsiteTheme = "light" | "dark";

export function resolvePublicWebsiteTheme(
  value: string | null | undefined,
): PublicWebsiteTheme {
  return value === "dark" ? "dark" : "light";
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
