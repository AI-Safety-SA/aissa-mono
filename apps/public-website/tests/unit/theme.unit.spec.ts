import { describe, expect, it } from "vitest";
import {
  applyPublicWebsiteTheme,
  buildPublicWebsiteThemeScript,
  PUBLIC_WEBSITE_THEME_STORAGE_KEY,
  resolvePublicWebsiteTheme,
} from "@/lib/theme";

describe("public website theme module", () => {
  it("keeps the persisted preference shared with Track Record", () => {
    expect(PUBLIC_WEBSITE_THEME_STORAGE_KEY).toBe("track-record-theme");
  });

  it("resolves missing and unknown values to dark mode", () => {
    expect(resolvePublicWebsiteTheme("dark")).toBe("dark");
    expect(resolvePublicWebsiteTheme("light")).toBe("light");
    expect(resolvePublicWebsiteTheme("system")).toBe("dark");
    expect(resolvePublicWebsiteTheme(null)).toBe("dark");
  });

  it("applies the root class, data attribute, and color scheme", () => {
    const root = document.createElement("html");

    applyPublicWebsiteTheme(root, "dark");
    expect(root).toHaveClass("dark");
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");

    applyPublicWebsiteTheme(root, "light");
    expect(root).not.toHaveClass("dark");
    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
  });

  it("builds a boot script from the public website interface", () => {
    const script = buildPublicWebsiteThemeScript("custom-theme-key");

    expect(script).toContain("custom-theme-key");
    expect(script).toContain("root.dataset.theme = theme");
    expect(script).toContain("root.style.colorScheme = theme");
  });
});
