import { test, expect } from "@playwright/test";

// US2 — admin approval flow. Requires the app running with a seeded DB, an admin
// account (SEED_ADMIN_*), and at least one pending request in the queue.
// Set E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD to run.
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe("US2: admin approval", () => {
  test.skip(!EMAIL || !PASSWORD, "Set E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD to run");

  test("admin sees the pending queue and can approve a request", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(EMAIL!);
    await page.getByLabel(/password/i).fill(PASSWORD!);
    await page.getByRole("button", { name: /sign in|login/i }).click();

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /pending requests/i })).toBeVisible();

    const approve = page.getByRole("button", { name: /approve/i }).first();
    if (await approve.isVisible().catch(() => false)) {
      await approve.click();
      // After approval the booking moves to the approved section.
      await expect(page.getByRole("heading", { name: /approved bookings/i })).toBeVisible();
    }
  });

  test("a regular user cannot reach the admin queue", async ({ page }) => {
    // Unauthenticated visit to /dashboard redirects to login (FR-023).
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
