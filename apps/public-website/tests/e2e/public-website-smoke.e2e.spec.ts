import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/",
    heading: "Building networks for an empowered future.",
  },
];

for (const { heading, path } of routes) {
  test(`${path} renders recognizable public content`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  });
}
