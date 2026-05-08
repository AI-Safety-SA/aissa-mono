import { buildPublicWebsiteThemeScript } from "@/lib/theme";

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: buildPublicWebsiteThemeScript() }}
      id="public-website-theme"
    />
  );
}
