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

const THEME_CHANGE_EVENT = "public-website-theme-change";

function getThemeSnapshot(): PublicWebsiteTheme {
  if (typeof window === "undefined") return "dark";

  return resolvePublicWebsiteTheme(
    window.localStorage.getItem(PUBLIC_WEBSITE_THEME_STORAGE_KEY),
  );
}

function getServerThemeSnapshot(): PublicWebsiteTheme {
  return "dark";
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = React.useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  React.useEffect(() => {
    applyPublicWebsiteTheme(document.documentElement, theme);
  }, [theme]);

  function handleToggle() {
    const nextTheme: PublicWebsiteTheme = theme === "dark" ? "light" : "dark";

    applyPublicWebsiteTheme(document.documentElement, nextTheme);
    window.localStorage.setItem(PUBLIC_WEBSITE_THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const isDark = theme === "dark";
  const label = `Switch to ${isDark ? "light" : "dark"} mode`;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      aria-label={label}
      aria-pressed={isDark}
      className={cn(
        "h-9 w-9 rounded-full border-border/70 bg-transparent p-0 text-muted-foreground shadow-none hover:border-border hover:bg-secondary/55 hover:text-foreground",
        className,
      )}
    >
      {isDark ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <MoonStar className="h-4 w-4" />
      )}
    </Button>
  );
}
