import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: /Building South Africa's AI safety community/i },
  { path: "/get-involved", heading: /Help build AI safety capacity/i },
  { path: "/programs", heading: /Programs/i },
  { path: "/events", heading: /Events/i },
  { path: "/research", heading: /Research/i },
  { path: "/testimonials", heading: /Testimonials/i },
  { path: "/privacy-policy", heading: /AISSA Privacy Policy/i },
  { path: "/code-of-conduct", heading: /AISSA Code of Conduct/i },
];

for (const { heading, path } of routes) {
  test(`${path} renders recognizable public content`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  });
}
