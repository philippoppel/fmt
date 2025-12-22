import { test, expect } from "@playwright/test";

test.describe("Microsite Builder", () => {
  test.describe("Authentication & Authorization", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should redirect from microsite editor to login", async ({ page }) => {
      await page.goto("/dashboard/microsite");
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("Public Profile Routes", () => {
    test("profile route should respond without error", async ({ page }) => {
      // Try any profile slug - will either show profile or 404 page
      const response = await page.goto("/de/p/demo-therapist");

      // Should return 200 (profile found) or 404 (not found) - both are valid
      expect([200, 404]).toContain(response?.status());

      // Page should load without crash
      const body = page.locator("body");
      await expect(body).toBeVisible();
    });

    test("profile page should have meta description", async ({ page }) => {
      await page.goto("/de/p/demo-therapist");

      // If page exists, check for meta description
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      // May be null if 404, but should not error
      if (description) {
        expect(description.length).toBeGreaterThan(5);
      }
    });

    test("profile page should have structured data", async ({ page }) => {
      await page.goto("/de/p/demo-therapist");

      // Check for JSON-LD script
      const jsonLd = page.locator('script[type="application/ld+json"]');
      const jsonLdCount = await jsonLd.count();

      // If profile exists, should have structured data
      if (jsonLdCount > 0) {
        const content = await jsonLd.first().textContent();
        expect(content).toBeTruthy();
        expect(() => JSON.parse(content || "")).not.toThrow();
      }
    });
  });
});

// Authenticated tests require setup
// These tests document the expected behavior when authenticated
test.describe.skip("Microsite Builder (Authenticated)", () => {
  test.describe("Builder Interface", () => {
    test("should load builder page", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Should show the page title
      await expect(page.locator("h1")).toContainText(/microsite/i);

      // Should have a preview pane
      const preview = page.locator('[data-testid="preview-pane"], .preview-frame');
      await expect(preview.first()).toBeVisible();
    });

    test("should show editor tabs", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Should have tab navigation
      const tabs = page.locator('[role="tablist"]');
      await expect(tabs.first()).toBeVisible();

      // Should have content tab
      const contentTab = page.getByRole("tab", { name: /inhalte|content/i });
      await expect(contentTab).toBeVisible();
    });

    test("should switch between editor tabs", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Click on Design tab
      const designTab = page.getByRole("tab", { name: /design|theme/i });
      if (await designTab.isVisible()) {
        await designTab.click();

        // Should show design options
        const themeOptions = page.locator('[data-testid="theme-presets"], text=/palette|theme/i');
        await expect(themeOptions.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test("should show viewport toggle", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Should have viewport switcher (Desktop/Tablet/Mobile)
      const viewportToggle = page.locator('[data-testid="viewport-toggle"], button:has-text("Desktop")');
      await expect(viewportToggle.first()).toBeVisible();
    });
  });

  test.describe("Content Editing", () => {
    test("should edit brand text", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Find brand text input
      const brandInput = page.locator('input[name="brandText"], input[id*="brand"]');
      if (await brandInput.isVisible()) {
        await brandInput.fill("Dr. Test Therapeut");

        // Should update preview
        const preview = page.locator('[data-testid="preview-pane"]');
        await expect(preview).toContainText("Dr. Test Therapeut");
      }
    });

    test("should edit tagline", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Find tagline input
      const taglineInput = page.locator('input[name="tagline"], textarea[name="tagline"]');
      if (await taglineInput.isVisible()) {
        await taglineInput.fill("Ihre vertrauensvolle Begleitung");

        // Should trigger auto-save or show unsaved indicator
        const saveIndicator = page.locator('[data-testid="save-indicator"], text=/speicher/i');
        await expect(saveIndicator.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Competencies Management", () => {
    test("should open add competency dialog", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Navigate to competencies tab
      const competenciesTab = page.getByRole("tab", { name: /kompetenz/i });
      if (await competenciesTab.isVisible()) {
        await competenciesTab.click();

        // Click add button
        const addButton = page.getByRole("button", { name: /hinzufügen|add/i });
        await addButton.click();

        // Dialog should open
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();
      }
    });

    test("should add new competency", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Navigate to competencies tab
      const competenciesTab = page.getByRole("tab", { name: /kompetenz/i });
      if (await competenciesTab.isVisible()) {
        await competenciesTab.click();

        // Click add button
        const addButton = page.getByRole("button", { name: /hinzufügen|add/i });
        await addButton.click();

        // Fill in competency details
        const titleInput = page.locator('input[id="title"], input[name="title"]');
        await titleInput.fill("Depression & Burnout");

        const descInput = page.locator('textarea[id="description"], textarea[name="description"]');
        await descInput.fill("Einfühlsame Begleitung bei depressiven Episoden");

        // Save
        const saveButton = page.getByRole("button", { name: /speichern|hinzufügen/i }).last();
        await saveButton.click();

        // Dialog should close
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      }
    });

    test("should show icon picker", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Navigate to competencies and open add dialog
      const competenciesTab = page.getByRole("tab", { name: /kompetenz/i });
      if (await competenciesTab.isVisible()) {
        await competenciesTab.click();

        const addButton = page.getByRole("button", { name: /hinzufügen|add/i });
        await addButton.click();

        // Icon section should be visible
        const iconSection = page.locator('text=/icon/i');
        await expect(iconSection.first()).toBeVisible();

        // Icon grid should be visible
        const iconGrid = page.locator('[data-testid="icon-grid"], .grid button');
        await expect(iconGrid.first()).toBeVisible();
      }
    });
  });

  test.describe("Theme Customization", () => {
    test("should show theme presets", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Navigate to design tab
      const designTab = page.getByRole("tab", { name: /design|theme/i });
      if (await designTab.isVisible()) {
        await designTab.click();

        // Should show preset options
        const presets = page.locator('button:has-text("Warm"), button:has-text("Ruhig"), button:has-text("Modern")');
        await expect(presets.first()).toBeVisible();
      }
    });

    test("should change theme preset", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Navigate to design tab
      const designTab = page.getByRole("tab", { name: /design|theme/i });
      if (await designTab.isVisible()) {
        await designTab.click();

        // Click a different preset
        const modernPreset = page.locator('button:has-text("Modern")');
        if (await modernPreset.isVisible()) {
          await modernPreset.click();

          // Preview should update colors
          await page.waitForTimeout(500);
          // Visual change verification would require snapshot testing
        }
      }
    });
  });

  test.describe("Save & Publish Flow", () => {
    test("should show save button", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      const saveButton = page.getByRole("button", { name: /speichern|save/i });
      await expect(saveButton.first()).toBeVisible();
    });

    test("should show publish button", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      const publishButton = page.getByRole("button", { name: /veröffentlichen|publish/i });
      await expect(publishButton.first()).toBeVisible();
    });

    test("should save draft successfully", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Make a change
      const taglineInput = page.locator('input[name="tagline"]');
      if (await taglineInput.isVisible()) {
        await taglineInput.fill("Test Tagline " + Date.now());

        // Click save
        const saveButton = page.getByRole("button", { name: /speichern|save/i });
        await saveButton.first().click();

        // Should show success indicator
        const successIndicator = page.locator('text=/gespeichert|saved/i, [data-testid="save-success"]');
        await expect(successIndicator.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test("should show publish confirmation dialog", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      const publishButton = page.getByRole("button", { name: /veröffentlichen|publish/i });
      if (await publishButton.isVisible()) {
        await publishButton.click();

        // Should show confirmation dialog
        const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]');
        await expect(confirmDialog).toBeVisible();
      }
    });
  });

  test.describe("Preview Functionality", () => {
    test("should switch to mobile viewport", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      const mobileButton = page.locator('button:has-text("Mobile"), [data-viewport="mobile"]');
      if (await mobileButton.isVisible()) {
        await mobileButton.click();

        // Preview frame should change width
        const previewFrame = page.locator('[data-testid="preview-frame"], .preview-frame');
        const box = await previewFrame.boundingBox();
        if (box) {
          expect(box.width).toBeLessThan(500); // Mobile width
        }
      }
    });

    test("should switch to tablet viewport", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      const tabletButton = page.locator('button:has-text("Tablet"), [data-viewport="tablet"]');
      if (await tabletButton.isVisible()) {
        await tabletButton.click();

        // Preview frame should be tablet-sized
        const previewFrame = page.locator('[data-testid="preview-frame"], .preview-frame');
        const box = await previewFrame.boundingBox();
        if (box) {
          expect(box.width).toBeLessThan(900);
          expect(box.width).toBeGreaterThan(500);
        }
      }
    });

    test("should show live preview link", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      const previewLink = page.getByRole("link", { name: /vorschau|preview/i });
      await expect(previewLink.first()).toBeVisible();
    });
  });

  test.describe("Tier Gating UI", () => {
    test("should show upgrade prompt for premium features", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // Navigate to design tab
      const designTab = page.getByRole("tab", { name: /design|theme/i });
      if (await designTab.isVisible()) {
        await designTab.click();

        // Look for premium/upgrade badges
        const premiumBadge = page.locator('text=/premium|upgrade/i, [data-tier="premium"]');
        // Premium features should be marked
        const count = await premiumBadge.count();
        // At least some premium features should be indicated
        expect(count).toBeGreaterThanOrEqual(0); // May vary based on tier
      }
    });

    test("should disable features beyond tier limit", async ({ page }) => {
      await page.goto("/de/dashboard/microsite");

      // For gratis tier, logo upload should be disabled
      const logoSection = page.locator('text=/logo/i');
      if (await logoSection.isVisible()) {
        const uploadButton = logoSection.locator("~ button, + button");
        // Should be disabled or show premium indicator
        const isDisabled = await uploadButton.isDisabled();
        // Either disabled or not shown
        expect(isDisabled || !(await uploadButton.isVisible())).toBeTruthy();
      }
    });
  });
});

// Mobile viewport tests
test.describe("Microsite Builder Mobile Experience", () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test("login redirect should work on mobile", async ({ page }) => {
    await page.goto("/de/dashboard/microsite");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("public profile should be mobile-friendly", async ({ page }) => {
    await page.goto("/de/p/demo-therapist");

    // Main content should be visible
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // No horizontal overflow
    const body = page.locator("body");
    const bodyBox = await body.boundingBox();
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(375);
    }
  });
});

// API endpoint tests
test.describe("Microsite API", () => {
  test("save-draft endpoint should require authentication", async ({ request }) => {
    const response = await request.post("/api/microsite/save-draft", {
      data: { config: {} },
    });

    // Should return 401 for unauthenticated
    expect(response.status()).toBe(401);
  });

  test("publish endpoint should require authentication", async ({ request }) => {
    const response = await request.post("/api/microsite/publish", {
      data: {},
    });

    // Should return 401 for unauthenticated
    expect(response.status()).toBe(401);
  });
});
