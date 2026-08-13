import { expect, test } from "@playwright/test";

test.describe("public screen smoke tests", () => {
  test("renders the home page and its public navigation", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "기술 기록과 가족 앨범을 한 홈에서 분리합니다." })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Tech Blog 보기" })).toHaveAttribute("href", "/blog");
    await expect(page.getByRole("link", { name: "Family Album 입장" })).toHaveAttribute("href", "/album");
  });

  test("shows the public blog list response", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByRole("heading", { name: "Tech Blog" })).toBeVisible();
    await expect(page.getByText("백엔드 API에서 가져온 공개 게시물 목록입니다.")).toBeVisible();
    expect(await page.locator("a.card-link, .empty-state").count()).toBeGreaterThan(0);
  });

  test("denies anonymous access to the family album", async ({ page }) => {
    await page.goto("/album");

    await expect(page.getByText("Access Denied")).toBeVisible();
    await expect(page.getByRole("heading", { name: "가족 앨범 권한이 없습니다." })).toBeVisible();
  });
});
