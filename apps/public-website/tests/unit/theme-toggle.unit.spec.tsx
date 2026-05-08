import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle";
import { PUBLIC_WEBSITE_THEME_STORAGE_KEY } from "@/lib/theme";

describe("public website theme toggle", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => {
          storage = {};
        },
        getItem: (key: string) => storage[key] ?? null,
        removeItem: (key: string) => {
          delete storage[key];
        },
        setItem: (key: string, value: string) => {
          storage[key] = value;
        },
      },
    });
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = "";
  });

  it("defaults to dark mode when no preference is stored", async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
    });

    expect(document.documentElement).toHaveClass("dark");
    const toggle = screen.getByRole("button", { name: "Switch to light mode" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).not.toBeDisabled();
  });

  it("restores and persists the shared theme preference", async () => {
    window.localStorage.setItem(PUBLIC_WEBSITE_THEME_STORAGE_KEY, "dark");

    render(<ThemeToggle />);

    await waitFor(() => {
      expect(document.documentElement).toHaveClass("dark");
    });

    const toggle = screen.getByRole("button", { name: "Switch to light mode" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(PUBLIC_WEBSITE_THEME_STORAGE_KEY)).toBe(
      "light",
    );
  });
});
