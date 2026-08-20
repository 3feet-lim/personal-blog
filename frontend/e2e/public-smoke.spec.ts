import { expect, test } from "@playwright/test";

test.describe("public screen smoke tests", () => {
  test("renders the home page with the tech feed and sidebar", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Archive" })).toHaveAttribute("href", "/archive/");
    await expect(page.getByRole("link", { name: "Tags" })).toHaveAttribute("href", "/tags/");
    await expect(page.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about/");
    await expect(page.locator(".sidebar-block h4").first()).toHaveText("Series");
  });

  test("shows the public blog list response", async ({ page }) => {
    await page.goto("/blog/");

    await expect(page.getByRole("heading", { name: "Tech Blog" })).toBeVisible();
    expect(await page.locator("a.post-list-item, .empty-state").count()).toBeGreaterThan(0);
  });

  test("denies anonymous access to the family feed", async ({ page }) => {
    await page.goto("/family/");

    await expect(page.getByText("Access Denied")).toBeVisible();
    await expect(page.getByRole("heading", { name: "가족 앨범 권한이 없습니다." })).toBeVisible();
  });
});
