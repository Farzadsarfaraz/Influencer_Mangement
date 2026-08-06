import { expect, test } from "@playwright/test";

/**
 * Requires the seeded database (npm run db:seed) and a running app
 * (the webServer config in playwright.config.ts builds + starts it).
 * Credentials match prisma/seed.ts.
 */
const SEED_PASSWORD = "password123";

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test.describe("sign-in", () => {
  test("redirects an unauthenticated visitor to /sign-in", async ({ page }) => {
    await page.goto("/agency/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("agency admin lands on the agency dashboard", async ({ page }) => {
    await signIn(page, "farzad@octagon.dev");
    await expect(page).toHaveURL(/\/agency\/dashboard/);
    await expect(page.getByRole("heading", { name: "Agency Dashboard" })).toBeVisible();
  });

  test("client contact lands on the customer dashboard", async ({ page }) => {
    await signIn(page, "client@brightpeak.dev");
    await expect(page).toHaveURL(/\/customer\/dashboard/);
  });

  test("influencer lands on the influencer dashboard", async ({ page }) => {
    await signIn(page, "influencer@octagon.dev");
    await expect(page).toHaveURL(/\/influencer\/dashboard/);
  });

  test("shows an error and stays on the page for a wrong password", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("farzad@octagon.dev");
    await page.getByLabel("Password").fill("not-the-right-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("cross-portal access", () => {
  test("an influencer hitting an agency-only route gets a not-found page, not the agency UI", async ({
    page,
  }) => {
    await signIn(page, "influencer@octagon.dev");
    await page.goto("/agency/dashboard");
    await expect(page.getByText("This page doesn't exist")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agency Dashboard" })).not.toBeVisible();
  });

  test("a client contact hitting the influencer portal gets a not-found page", async ({
    page,
  }) => {
    await signIn(page, "client@brightpeak.dev");
    await page.goto("/influencer/dashboard");
    await expect(page.getByText("This page doesn't exist")).toBeVisible();
  });
});
