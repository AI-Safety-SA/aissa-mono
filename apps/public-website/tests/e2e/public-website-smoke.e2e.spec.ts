import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/",
    heading: "A hub for global AI safety work on the African continent",
  },
  { path: "/get-involved", heading: /Help build AI safety capacity/i },
  { path: "/programs", heading: /Programs/i },
  { path: "/events", heading: /^Events$/i },
  { path: "/research", heading: /Research/i },
  { path: "/privacy-policy", heading: /AI Safety SA Privacy and Data Policy/i },
  { path: "/code-of-conduct", heading: /AI Safety SA Code of Conduct/i },
];

for (const { heading, path } of routes) {
  test(`${path} renders recognizable public content`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  });
}
