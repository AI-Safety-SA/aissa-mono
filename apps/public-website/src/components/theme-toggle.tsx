"use client";

import * as React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  applyPublicWebsiteTheme,
  PUBLIC_WEBSITE_THEME_STORAGE_KEY,
  resolvePublicWebsiteTheme,
  type PublicWebsiteTheme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<PublicWebsiteTheme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const storedTheme = resolvePublicWebsiteTheme(
      window.localStorage.getItem(PUBLIC_WEBSITE_THEME_STORAGE_KEY),
    );

    applyPublicWebsiteTheme(document.documentElement, storedTheme);
    setTheme(storedTheme);
    setMounted(true);
  }, []);

  function handleToggle() {
    const nextTheme: PublicWebsiteTheme = theme === "dark" ? "light" : "dark";

    applyPublicWebsiteTheme(document.documentElement, nextTheme);
    window.localStorage.setItem(PUBLIC_WEBSITE_THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  const isDark = theme === "dark";
  const label = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Toggle theme";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      aria-label={label}
      aria-pressed={mounted ? isDark : undefined}
      disabled={!mounted}
      className={cn(
        "h-10 gap-2 rounded-full border-primary/15 bg-background/80 px-3 text-foreground shadow-sm hover:border-primary/35 hover:bg-accent/70",
        className,
      )}
    >
      {mounted && isDark ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <MoonStar className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {mounted ? (isDark ? "Light mode" : "Dark mode") : ""}
      </span>
    </Button>
  );
}
