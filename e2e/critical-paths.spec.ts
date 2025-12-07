import { test, expect } from "@playwright/test";

test.describe("Critical Paths", () => {
  test.describe("Homepage", () => {
    test("should load homepage with correct title", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveTitle(/.+/); // Should have some title
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should have HTML lang attribute set to de (default)", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", "de");
    });

    test("should have meta description", async ({ page }) => {
      await page.goto("/");
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(10);
    });

    test("should have canonical URL", async ({ page }) => {
      await page.goto("/");
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBeTruthy();
      expect(canonical).toContain("http");
    });
  });

  test.describe("Locale Routes", () => {
    const locales = [
      { code: "de", path: "/", expectedLang: "de" },
      { code: "en", path: "/en", expectedLang: "en" },
      { code: "fr", path: "/fr", expectedLang: "fr" },
      { code: "es", path: "/es", expectedLang: "es" },
      { code: "it", path: "/it", expectedLang: "it" },
    ];

    for (const locale of locales) {
      test(`should load ${locale.code} homepage correctly`, async ({ page }) => {
        await page.goto(locale.path);
        await expect(page.locator("html")).toHaveAttribute("lang", locale.expectedLang);
        await expect(page.locator("h1")).toBeVisible();
      });
    }
  });

  test.describe("Language Switcher", () => {
    test("should navigate to English when switching language", async ({ page }) => {
      await page.goto("/");

      // Find and click the language switcher
      const languageButton = page.getByRole("button", { name: /sprache|language/i });
      await languageButton.click();

      // Select English
      await page.getByRole("menuitem", { name: "English" }).click();

      // Verify navigation
      await expect(page).toHaveURL(/\/en$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });

    test("should preserve path when switching languages", async ({ page }) => {
      await page.goto("/about");

      const languageButton = page.getByRole("button", { name: /sprache|language/i });
      await languageButton.click();

      await page.getByRole("menuitem", { name: "English" }).click();

      await expect(page).toHaveURL(/\/en\/about$/);
    });
  });

  test.describe("SEO Elements", () => {
    test("should have hreflang tags for all locales", async ({ page }) => {
      await page.goto("/");

      const hreflangs = await page.locator('link[rel="alternate"][hreflang]').all();
      expect(hreflangs.length).toBeGreaterThanOrEqual(6); // 5 locales + x-default

      const hreflangValues = await Promise.all(
        hreflangs.map((link) => link.getAttribute("hreflang"))
      );

      expect(hreflangValues).toContain("de-DE");
      expect(hreflangValues).toContain("en-US");
      expect(hreflangValues).toContain("fr-FR");
      expect(hreflangValues).toContain("es-ES");
      expect(hreflangValues).toContain("it-IT");
      expect(hreflangValues).toContain("x-default");
    });

    test("should have JSON-LD structured data", async ({ page }) => {
      await page.goto("/");

      const scripts = await page.locator('script[type="application/ld+json"]').all();
      expect(scripts.length).toBeGreaterThanOrEqual(1);

      for (const script of scripts) {
        const content = await script.textContent();
        expect(content).toBeTruthy();
        const json = JSON.parse(content!);
        expect(json["@context"]).toBe("https://schema.org");
      }
    });

    test("robots.txt should be accessible and valid", async ({ page }) => {
      const response = await page.goto("/robots.txt");
      expect(response?.status()).toBe(200);

      const content = await page.textContent("body");
      expect(content).toContain("User-agent");
      expect(content).toContain("Sitemap");
      expect(content).toContain("Disallow: /api/");
    });

    test("sitemap.xml should be accessible", async ({ page }) => {
      const response = await page.goto("/sitemap.xml");
      expect(response?.status()).toBe(200);

      const content = await page.content();
      expect(content).toContain("<urlset");
      expect(content).toContain("<loc>");
    });
  });

  test.describe("Auth Pages", () => {
    test("login page should load and have noindex", async ({ page }) => {
      await page.goto("/auth/login");

      await expect(page.locator("h1, h2")).toBeVisible();

      const robotsMeta = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robotsMeta).toContain("noindex");
    });

    test("register page should load and have noindex", async ({ page }) => {
      await page.goto("/auth/register");

      await expect(page.locator("h1, h2")).toBeVisible();

      const robotsMeta = await page.locator('meta[name="robots"]').getAttribute("content");
      expect(robotsMeta).toContain("noindex");
    });

    test("should navigate between login and register", async ({ page }) => {
      await page.goto("/auth/login");

      // Find link to register
      const registerLink = page.getByRole("link", { name: /registrieren|register/i });
      await registerLink.click();

      await expect(page).toHaveURL(/\/auth\/register/);

      // Find link back to login
      const loginLink = page.getByRole("link", { name: /anmelden|login|sign in/i });
      await loginLink.click();

      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("Navigation", () => {
    test("should have working main navigation links", async ({ page }) => {
      await page.goto("/");

      // Check navigation exists
      const nav = page.locator('nav[aria-label*="navigation" i], nav');
      await expect(nav.first()).toBeVisible();
    });

    test("should navigate to about page", async ({ page }) => {
      await page.goto("/");

      const aboutLink = page.getByRole("link", { name: /about|über/i });
      if (await aboutLink.isVisible()) {
        await aboutLink.click();
        await expect(page).toHaveURL(/\/about/);
      }
    });

    test("should navigate to contact page", async ({ page }) => {
      await page.goto("/");

      const contactLink = page.getByRole("link", { name: /contact|kontakt/i });
      if (await contactLink.isVisible()) {
        await contactLink.click();
        await expect(page).toHaveURL(/\/contact/);
      }
    });
  });
});
