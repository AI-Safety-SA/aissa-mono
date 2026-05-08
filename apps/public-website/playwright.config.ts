import { defineConfig, devices } from "@playwright/test";

const externalBaseURL =
  process.env.PUBLIC_WEBSITE_E2E_BASE_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.E2E_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

const baseURL = externalBaseURL?.replace(/\/$/, "") || "http://localhost:3001";

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: "cd ../.. && pnpm dev:public-local",
        reuseExistingServer: true,
        timeout: 120_000,
        url: "http://localhost:3001",
      },
});
