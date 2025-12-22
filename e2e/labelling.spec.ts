import { test, expect } from "@playwright/test";

test.describe("Labelling Portal", () => {
  test.describe("Authentication & Authorization", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
      await page.goto("/de/labelling");
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should redirect from cases page to login", async ({ page }) => {
      await page.goto("/de/labelling/cases");
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should redirect from new case page to login", async ({ page }) => {
      await page.goto("/de/labelling/cases/new");
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should redirect from stats page to login", async ({ page }) => {
      await page.goto("/de/labelling/stats");
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("API Endpoints", () => {
    test("suggest-labels API should require authentication", async ({ request }) => {
      const response = await request.post("/api/labelling/suggest-labels", {
        data: { text: "Test text for labelling" },
      });

      // Should return 401 for unauthenticated requests
      expect(response.status()).toBe(401);
    });
  });
});

// Authenticated tests require setup - these tests document the expected behavior
// To run these tests, you need to:
// 1. Create a test user with LABELLER role in the database
// 2. Use Playwright's storageState to persist auth session
// 3. Set up the auth fixture in playwright.config.ts

test.describe.skip("Labelling Portal (Authenticated)", () => {
  // These tests are skipped by default as they require auth setup
  // Remove .skip and configure auth to run them

  test.describe("Quick Label Flow", () => {
    test("should load quick label page", async ({ page }) => {
      await page.goto("/de/labelling/cases/new");

      // Should show the page title
      await expect(page.locator("h1")).toContainText(/neuer fall|neuen fall/i);

      // Should have a text input area
      const textarea = page.locator('textarea, [role="textbox"]');
      await expect(textarea).toBeVisible();
    });

    test("should show AI suggestions after entering text", async ({ page }) => {
      await page.goto("/de/labelling/cases/new");

      const textarea = page.locator('textarea');

      // Enter text that should trigger AI suggestions
      await textarea.fill("Ich fühle mich seit Wochen antriebslos und traurig. Nichts macht mir mehr Freude.");

      // Wait for debounce and API call
      await page.waitForTimeout(2000);

      // Should show suggestions or loading state
      const suggestionsOrLoading = page.locator('[data-testid="suggestions"], [data-testid="suggestions-loading"]');
      await expect(suggestionsOrLoading).toBeVisible({ timeout: 10000 });
    });

    test("should allow accepting AI suggestions", async ({ page }) => {
      await page.goto("/de/labelling/cases/new");

      const textarea = page.locator('textarea');
      await textarea.fill("Ich habe Probleme mit meiner Beziehung und fühle mich oft einsam.");

      // Wait for suggestions
      await page.waitForTimeout(2000);

      // Click accept on first suggestion
      const acceptButton = page.getByRole("button", { name: /übernehmen/i }).first();
      if (await acceptButton.isVisible()) {
        await acceptButton.click();

        // Should update the selection
        const selectedCategory = page.locator('[data-selected="true"]');
        await expect(selectedCategory).toBeVisible();
      }
    });

    test("should allow manual category selection", async ({ page }) => {
      await page.goto("/de/labelling/cases/new");

      // Click button to add category
      const addCategoryButton = page.getByRole("button", { name: /kategorie|hinzufügen/i });
      if (await addCategoryButton.isVisible()) {
        await addCategoryButton.click();

        // Sheet/dialog should open
        const categorySheet = page.locator('[role="dialog"], [data-state="open"]');
        await expect(categorySheet).toBeVisible();
      }
    });

    test("should save label and redirect", async ({ page }) => {
      await page.goto("/de/labelling/cases/new");

      const textarea = page.locator('textarea');
      await textarea.fill("Test case text for E2E testing purposes.");

      // Wait for any AI suggestions
      await page.waitForTimeout(2000);

      // Find and click save button
      const saveButton = page.getByRole("button", { name: /speichern/i });
      await expect(saveButton).toBeVisible();

      // Click save
      await saveButton.click();

      // Should redirect to cases list or show success
      await expect(page).toHaveURL(/\/labelling\/cases/);
    });
  });

  test.describe("Inbox", () => {
    test("should load inbox page", async ({ page }) => {
      await page.goto("/de/labelling/cases");

      // Should show inbox title
      await expect(page.locator("h1")).toContainText(/inbox/i);
    });

    test("should show filter tabs", async ({ page }) => {
      await page.goto("/de/labelling/cases");

      // Should have filter options
      const tabs = page.locator('[role="tablist"], [data-testid="filter-tabs"]');
      await expect(tabs).toBeVisible();
    });

    test("should navigate to case detail on click", async ({ page }) => {
      await page.goto("/de/labelling/cases");

      // Find a case item
      const caseItem = page.locator('[data-testid="case-item"], button').first();

      if (await caseItem.isVisible()) {
        await caseItem.click();
        await expect(page).toHaveURL(/\/labelling\/cases\/[^/]+$/);
      }
    });
  });

  test.describe("Case Review", () => {
    test("should load case detail page", async ({ page }) => {
      // This test would need a valid case ID
      await page.goto("/de/labelling/cases/test-case-id");

      // Should show case content or redirect if not found
      const content = page.locator('main');
      await expect(content).toBeVisible();
    });
  });

  test.describe("Stats Dashboard", () => {
    test("should load stats page", async ({ page }) => {
      await page.goto("/de/labelling/stats");

      // Should show stats title
      await expect(page.locator("h1")).toContainText(/statistik/i);
    });

    test("should show category distribution", async ({ page }) => {
      await page.goto("/de/labelling/stats");

      // Should have category distribution section
      const categorySection = page.locator('text=/kategorie/i');
      await expect(categorySection.first()).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should show sidebar navigation", async ({ page }) => {
      await page.goto("/de/labelling");

      // Should have sidebar with navigation items
      const sidebar = page.locator('aside, [role="navigation"]');
      await expect(sidebar.first()).toBeVisible();
    });

    test("should navigate between pages", async ({ page }) => {
      await page.goto("/de/labelling");

      // Click on "Neuer Fall" link
      const newCaseLink = page.getByRole("link", { name: /neuer fall/i });
      if (await newCaseLink.isVisible()) {
        await newCaseLink.click();
        await expect(page).toHaveURL(/\/labelling\/cases\/new/);
      }
    });
  });

  test.describe("Fallback: AI Offline", () => {
    test("should allow manual labeling when AI fails", async ({ page }) => {
      // Mock the AI endpoint to fail
      await page.route("/api/labelling/suggest-labels", (route) => {
        route.fulfill({ status: 500, body: "Internal Server Error" });
      });

      await page.goto("/de/labelling/cases/new");

      const textarea = page.locator('textarea');
      await textarea.fill("Test text without AI suggestions");

      // Wait for failed request
      await page.waitForTimeout(2000);

      // Should still be able to add categories manually
      const addCategoryButton = page.getByRole("button", { name: /kategorie|hinzufügen/i });
      await expect(addCategoryButton).toBeVisible();
    });
  });
});

// Mobile viewport tests
test.describe("Labelling Mobile Experience", () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X dimensions

  test("login page should be mobile-friendly", async ({ page }) => {
    await page.goto("/de/labelling/cases/new");

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/);

    // Login form should be visible and usable on mobile
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check touch target sizes (min 44x44px)
    const submitButton = page.getByRole("button", { name: /anmelden|login/i });
    if (await submitButton.isVisible()) {
      const box = await submitButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });
});

// Tests that verify the API structure (without auth)
test.describe("API Structure", () => {
  test("suggest-labels endpoint should exist", async ({ request }) => {
    const response = await request.post("/api/labelling/suggest-labels", {
      data: { text: "test" },
    });

    // Should not return 404
    expect(response.status()).not.toBe(404);
  });
});
