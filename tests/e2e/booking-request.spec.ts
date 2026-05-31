import { test, expect } from "@playwright/test";

// US1 — booking request flow. Requires the app running with a seeded DB and a
// regular user account. Set E2E_USER_EMAIL / E2E_USER_PASSWORD (a pre-registered
// USER) in the environment before running.
const EMAIL = process.env.E2E_USER_EMAIL;
const PASSWORD = process.env.E2E_USER_PASSWORD;

test.describe("US1: request a hall", () => {
  test.skip(!EMAIL || !PASSWORD, "Set E2E_USER_EMAIL/E2E_USER_PASSWORD to run");

  test("user submits a booking request and sees it pending", async ({ page }) => {
    // Sign in
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(EMAIL!);
    await page.getByLabel(/password/i).fill(PASSWORD!);
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Open the first hall from the listing
    await page.goto("/halls");
    await page.getByRole("link").filter({ hasText: /.+/ }).first().click();
    await expect(page).toHaveURL(/\/halls\/.+/);

    // Pick a day slot and submit
    await page.getByRole("button", { name: /^Day/ }).click();
    await page.getByRole("button", { name: /request booking/i }).click();

    // Confirmation message
    await expect(page.getByText(/request submitted/i)).toBeVisible();

    // Appears in dashboard as Pending
    await page.goto("/dashboard");
    await expect(page.getByText(/PENDING/).first()).toBeVisible();
  });
});
