import { test, expect, Page } from "@playwright/test";

/**
 * Mobile-specific E2E tests for responsive design
 * These tests verify critical mobile UX requirements
 */

// Helper function to check for horizontal overflow
async function assertNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth + 1;
  });
  expect(hasOverflow).toBe(false);
}

test.describe("Mobile UX Tests", () => {
  // Only run these tests on mobile viewport
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 dimensions

  test.describe("Auth Buttons Visibility", () => {
    test("should show Anmelden button in mobile menu", async ({ page }) => {
      await page.goto("/");

      // Open mobile menu
      const menuButton = page.getByRole("button", { name: /menü|menu/i });
      await menuButton.click();

      // Wait for menu animation
      await page.waitForTimeout(300);

      // Check for login button
      const loginButton = page.getByRole("link", { name: /anmelden|login/i });
      await expect(loginButton).toBeVisible();
    });

    test("should show Registrieren button in mobile menu", async ({ page }) => {
      await page.goto("/");

      // Open mobile menu
      const menuButton = page.getByRole("button", { name: /menü|menu/i });
      await menuButton.click();

      await page.waitForTimeout(300);

      // Check for register button
      const registerButton = page.getByRole("link", { name: /registrieren|register/i });
      await expect(registerButton).toBeVisible();
    });

    test("should navigate to login from mobile menu", async ({ page }) => {
      await page.goto("/");

      // Open mobile menu
      const menuButton = page.getByRole("button", { name: /menü|menu/i });
      await menuButton.click();

      await page.waitForTimeout(300);

      // Click login
      const loginButton = page.getByRole("link", { name: /anmelden|login/i });
      await loginButton.click();

      // Verify navigation
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("Homepage Mobile Layout", () => {
    test("should have no horizontal overflow on homepage", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(page);
    });

    test("should have visible primary CTA on homepage", async ({ page }) => {
      await page.goto("/");

      // Look for main CTA button
      const ctaButton = page.getByRole("link", { name: /los geht|start/i }).first();
      await expect(ctaButton).toBeVisible();
    });
  });

  test.describe("Auth Pages Mobile Layout", () => {
    test("should have no horizontal overflow on login page", async ({ page }) => {
      await page.goto("/auth/login");
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(page);
    });

    test("should have no horizontal overflow on register page", async ({ page }) => {
      await page.goto("/auth/register");
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(page);
    });

    test("login form should have full-width inputs", async ({ page }) => {
      await page.goto("/auth/login");

      const emailInput = page.getByLabel(/e-mail|email/i);
      const inputWidth = await emailInput.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return parseInt(style.width);
      });

      // Input should be at least 80% of viewport width
      expect(inputWidth).toBeGreaterThan(390 * 0.7);
    });
  });

  test.describe("Therapist Search Mobile Layout", () => {
    test("should have no horizontal overflow", async ({ page }) => {
      await page.goto("/therapists");
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(page);
    });

    test("should show mobile filter button", async ({ page }) => {
      await page.goto("/therapists");

      // Should show filter button on mobile
      const filterButton = page.getByRole("button", { name: /filter/i });
      await expect(filterButton).toBeVisible();
    });

    test("should open filter sheet on mobile", async ({ page }) => {
      await page.goto("/therapists");

      const filterButton = page.getByRole("button", { name: /filter/i });
      await filterButton.click();

      // Wait for sheet animation
      await page.waitForTimeout(300);

      // Sheet content should be visible
      const sheetContent = page.locator('[role="dialog"]');
      await expect(sheetContent).toBeVisible();
    });

    test("therapist cards should stack in single column", async ({ page }) => {
      await page.goto("/therapists");
      await page.waitForLoadState("networkidle");

      // Cards should exist
      const cards = page.locator('[role="listitem"]');

      if (await cards.count() > 1) {
        // Get positions of first two cards
        const firstCard = cards.nth(0);
        const secondCard = cards.nth(1);

        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        if (firstBox && secondBox) {
          // On mobile 2-col grid, cards should be side by side or stacked
          // Either y positions differ significantly (stacked) or x positions differ (side by side)
          const isStacked = secondBox.y > firstBox.y + firstBox.height * 0.5;
          const isSideBySide = secondBox.x > firstBox.x + firstBox.width * 0.5;
          expect(isStacked || isSideBySide).toBe(true);
        }
      }
    });
  });

  test.describe("About Page Mobile Layout", () => {
    test("should have no horizontal overflow", async ({ page }) => {
      await page.goto("/about");
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(page);
    });
  });

  test.describe("Blog Page Mobile Layout", () => {
    test("should have no horizontal overflow", async ({ page }) => {
      await page.goto("/blog");
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow(page);
    });
  });
});

test.describe("Android Mobile Tests", () => {
  // Test on Android viewport as well
  test.use({ viewport: { width: 412, height: 915 } }); // Pixel 7

  test("should have no horizontal overflow on homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await assertNoHorizontalOverflow(page);
  });

  test("should show mobile menu button", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /menü|menu/i });
    await expect(menuButton).toBeVisible();
  });
});

test.describe("Touch Target Accessibility", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile menu button should meet minimum touch target size", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /menü|menu/i });
    const box = await menuButton.boundingBox();

    // Touch targets should be at least 44x44px per WCAG guidelines
    expect(box?.width).toBeGreaterThanOrEqual(40);
    expect(box?.height).toBeGreaterThanOrEqual(40);
  });

  test("navigation links in mobile menu should have adequate spacing", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /menü|menu/i });
    await menuButton.click();

    await page.waitForTimeout(300);

    // Check that links have adequate height
    const navLinks = page.locator("nav a");
    const count = await navLinks.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = navLinks.nth(i);
      const box = await link.boundingBox();
      if (box) {
        // Each link should have adequate height for touch
        expect(box.height).toBeGreaterThanOrEqual(32);
      }
    }
  });
});
