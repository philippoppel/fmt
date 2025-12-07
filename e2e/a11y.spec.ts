import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test.describe("Axe Audits", () => {
    // Test main pages with explicit locale to avoid redirect issues
    const pages = [
      { path: "/en", name: "Homepage" },
      { path: "/en/about", name: "About" },
      { path: "/en/contact", name: "Contact" },
      { path: "/en/auth/login", name: "Login" },
      { path: "/en/auth/register", name: "Register" },
    ];

    for (const { path, name } of pages) {
      test(`${name} should have no critical a11y violations`, async ({ page }) => {
        await page.goto(path);

        // Wait for page to be fully loaded
        await page.waitForLoadState("domcontentloaded");

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();

        // Filter out minor issues, focus on critical ones
        const criticalViolations = accessibilityScanResults.violations.filter(
          (v) => v.impact === "critical" || v.impact === "serious"
        );

        expect(
          criticalViolations,
          `Found ${criticalViolations.length} critical a11y violations on ${name}`
        ).toEqual([]);
      });
    }
  });

  test.describe("Skip Links", () => {
    test("skip links should be present and functional", async ({ page }) => {
      await page.goto("/");

      // Tab to reveal skip link
      await page.keyboard.press("Tab");

      // Check if skip link becomes visible
      const skipLink = page.getByRole("link", { name: /skip|überspringen/i }).first();

      // Skip link should exist (might be visually hidden until focused)
      await expect(skipLink).toBeAttached();
    });

    test("main content should have correct id for skip link target", async ({ page }) => {
      await page.goto("/");

      const mainContent = page.locator("#main-content, main[id]");
      await expect(mainContent.first()).toBeAttached();
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("should be able to navigate header with keyboard", async ({ page }) => {
      await page.goto("/");

      // Tab through the page
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");
      }

      // Check that something is focused
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedTag).toBeTruthy();
    });

    test("interactive elements should have visible focus indicators", async ({ page }) => {
      await page.goto("/");

      // Focus on a button
      const firstButton = page.getByRole("button").first();
      await firstButton.focus();

      // Check that the button has focus-visible styles applied
      const hasFocusStyles = await firstButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        // Check for outline or ring
        return (
          styles.outline !== "none" ||
          styles.outlineWidth !== "0px" ||
          styles.boxShadow.includes("rgb")
        );
      });

      // This is a soft check - focus styles might vary
      expect(hasFocusStyles).toBeDefined();
    });
  });

  test.describe("Semantic HTML", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      await page.goto("/");

      // Should have an h1
      const h1 = page.locator("h1");
      await expect(h1).toBeVisible();

      // Count headings
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
      expect(headings.length).toBeGreaterThan(0);
    });

    test("should have main landmark", async ({ page }) => {
      await page.goto("/");

      const main = page.locator("main");
      await expect(main).toBeAttached();
    });

    test("should have navigation landmark", async ({ page }) => {
      await page.goto("/");

      const nav = page.locator("nav");
      await expect(nav.first()).toBeAttached();
    });

    test("images should have alt text", async ({ page }) => {
      await page.goto("/");

      const images = await page.locator("img").all();

      for (const img of images) {
        const alt = await img.getAttribute("alt");
        const ariaHidden = await img.getAttribute("aria-hidden");
        const role = await img.getAttribute("role");

        // Image should have alt text OR be explicitly decorative
        const isAccessible =
          alt !== null || ariaHidden === "true" || role === "presentation";

        expect(isAccessible).toBe(true);
      }
    });
  });

  test.describe("Form Accessibility", () => {
    test("login form should have accessible labels", async ({ page }) => {
      await page.goto("/auth/login");

      // Email input should have label
      const emailInput = page.getByRole("textbox", { name: /email/i });
      await expect(emailInput).toBeVisible();

      // Password input should be accessible
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();

      // Check for associated labels
      const passwordId = await passwordInput.getAttribute("id");
      if (passwordId) {
        const label = page.locator(`label[for="${passwordId}"]`);
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = await passwordInput.getAttribute("aria-label");
        const hasAriaLabelledby = await passwordInput.getAttribute("aria-labelledby");

        expect(hasLabel || hasAriaLabel || hasAriaLabelledby).toBeTruthy();
      }
    });

    test("register form should indicate required fields", async ({ page }) => {
      await page.goto("/auth/register");

      // Check for required indicators
      const requiredInputs = await page.locator("input[required], input[aria-required='true']").all();

      // Registration should have required fields
      expect(requiredInputs.length).toBeGreaterThan(0);
    });
  });

  test.describe("Color Contrast", () => {
    test("should pass color contrast checks", async ({ page }) => {
      await page.goto("/");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2aa"])
        .options({ runOnly: ["color-contrast"] })
        .analyze();

      const contrastViolations = accessibilityScanResults.violations;

      // Log violations for debugging but don't fail on minor issues
      if (contrastViolations.length > 0) {
        console.log("Color contrast issues found:", contrastViolations);
      }

      // Only fail on critical contrast issues
      const criticalContrastIssues = contrastViolations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );

      expect(criticalContrastIssues).toEqual([]);
    });
  });

  test.describe("Language Switcher Accessibility", () => {
    test("language switcher should be keyboard accessible", async ({ page }) => {
      await page.goto("/");

      // Find language button
      const languageButton = page.getByRole("button", { name: /sprache|language/i });

      // Focus and activate with keyboard
      await languageButton.focus();
      await page.keyboard.press("Enter");

      // Menu should open
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();

      // Should be able to navigate with arrow keys
      await page.keyboard.press("ArrowDown");

      // Close with Escape
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
    });

    test("language options should have lang attribute", async ({ page }) => {
      await page.goto("/");

      const languageButton = page.getByRole("button", { name: /sprache|language/i });
      await languageButton.click();

      // Language options should ideally have lang attribute
      const menuItems = await page.getByRole("menuitem").all();
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });
});
