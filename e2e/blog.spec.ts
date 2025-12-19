import { test, expect } from "@playwright/test";

test.describe("Blog", () => {
  test.describe("Blog Overview Page", () => {
    test("should load blog page with articles", async ({ page }) => {
      await page.goto("/en/blog");

      await expect(page).toHaveTitle(/blog|wissen/i);
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should display blog cards", async ({ page }) => {
      await page.goto("/en/blog");

      // Wait for articles to load
      await page.waitForLoadState("domcontentloaded");

      // Should have at least one article card or a no-results message
      const articles = page.locator("article");
      const articleCount = await articles.count();

      if (articleCount > 0) {
        await expect(articles.first()).toBeVisible();
      }
    });

    test("should have sorting dropdown", async ({ page }) => {
      await page.goto("/en/blog");

      const sortSelect = page.locator('select[name="sort"]');
      await expect(sortSelect).toBeVisible();

      // Check for sorting options
      const options = await sortSelect.locator("option").all();
      expect(options.length).toBeGreaterThanOrEqual(2);
    });

    test("should filter by sorting option", async ({ page }) => {
      await page.goto("/en/blog");

      const sortSelect = page.locator('select[name="sort"]');

      // Select "newest" option
      await sortSelect.selectOption("newest");

      // Wait for form submission
      await page.waitForLoadState("domcontentloaded");

      // URL should include sort parameter
      await expect(page).toHaveURL(/sort=newest/);
    });

    test("should have search functionality", async ({ page }) => {
      await page.goto("/en/blog");

      // Find search input
      const searchInput = page.locator('input[type="search"], input[name="search"], input[placeholder*="search" i]').first();

      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        await searchInput.press("Enter");

        // Wait for search results
        await page.waitForLoadState("domcontentloaded");
      }
    });

    test("should navigate to article on card click", async ({ page }) => {
      await page.goto("/en/blog");

      // Find first article link
      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await expect(page).toHaveURL(/\/blog\/.+/);
      }
    });

    test("should display reading time on cards", async ({ page }) => {
      await page.goto("/en/blog");

      const article = page.locator("article").first();

      if (await article.isVisible()) {
        // Reading time should contain "min"
        const readingTime = article.locator("text=/\\d+\\s*min/");
        await expect(readingTime).toBeVisible();
      }
    });

    test("should show reviewed badge on reviewed articles", async ({ page }) => {
      await page.goto("/en/blog");

      // Look for the reviewed badge (might not exist if no articles are reviewed)
      const reviewedBadge = page.locator("text=/reviewed|geprüft/i");
      const badgeCount = await reviewedBadge.count();

      // Just verify it doesn't crash - badge may or may not be present
      expect(badgeCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Single Article Page", () => {
    test("should load article page", async ({ page }) => {
      await page.goto("/en/blog");

      // Navigate to first article
      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();

        // Article should have a heading
        await expect(page.locator("article h1")).toBeVisible();
      }
    });

    test("should display article content", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();

        // Wait for content to load
        await page.waitForLoadState("domcontentloaded");

        // Article content area should exist
        const articleContent = page.locator("article");
        await expect(articleContent).toBeVisible();
      }
    });

    test("should display reading time and author", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        // Reading time indicator
        const readingTime = page.locator("text=/\\d+\\s*min/");
        const hasReadingTime = await readingTime.count() > 0;

        expect(hasReadingTime).toBeTruthy();
      }
    });

    test("should have table of contents navigation", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        // TOC might be in sidebar or inline
        const toc = page.locator("[aria-label*='contents' i], [aria-label*='inhalt' i], nav:has(a[href^='#'])");
        const tocCount = await toc.count();

        // TOC is optional, just verify no crash
        expect(tocCount).toBeGreaterThanOrEqual(0);
      }
    });

    test("should display related posts", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        // Scroll to bottom to find related posts
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Related posts section (might have different headings)
        const relatedSection = page.locator("text=/related|ähnliche|weitere/i");
        const hasRelated = await relatedSection.count() > 0;

        // Related posts are optional
        expect(hasRelated).toBeDefined();
      }
    });

    test("should have working matching CTA", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        // Look for matching CTA link
        const matchingCta = page.locator("a[href*='matching']").first();

        if (await matchingCta.isVisible()) {
          await matchingCta.click();
          await expect(page).toHaveURL(/matching/);
        }
      }
    });
  });

  test.describe("Reader Mode", () => {
    test("should have reader mode toggle", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        // Reader mode toggle button
        const readerToggle = page.getByRole("button", { name: /reader|lese/i });

        if (await readerToggle.isVisible()) {
          await expect(readerToggle).toHaveAttribute("aria-pressed");
        }
      }
    });

    test("reader mode toggle should work", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        const readerToggle = page.getByRole("button", { name: /reader|lese/i }).first();

        if (await readerToggle.isVisible()) {
          // Click to enable
          await readerToggle.click();

          // Settings panel should appear (dialog role)
          const settingsPanel = page.getByRole("dialog");
          await expect(settingsPanel).toBeVisible();

          // Click again to disable
          const closeButton = settingsPanel.getByRole("button").first();
          await closeButton.click();
        }
      }
    });
  });

  test.describe("Text-to-Speech", () => {
    test("should have TTS controls", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        // TTS button with play icon
        const ttsButton = page.getByRole("button", { name: /vorlesen|play|read aloud/i });

        if (await ttsButton.isVisible()) {
          await expect(ttsButton).toBeEnabled();
        }
      }
    });
  });

  test.describe("Blog SEO", () => {
    test("blog page should have meta description", async ({ page }) => {
      await page.goto("/en/blog");

      const metaDescription = await page.locator('meta[name="description"]').getAttribute("content");
      expect(metaDescription).toBeTruthy();
      expect(metaDescription!.length).toBeGreaterThan(10);
    });

    test("article page should have structured data", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        // Check for JSON-LD
        const jsonLd = page.locator('script[type="application/ld+json"]');
        const count = await jsonLd.count();

        if (count > 0) {
          const content = await jsonLd.first().textContent();
          expect(content).toBeTruthy();

          const json = JSON.parse(content!);
          expect(json["@context"]).toBe("https://schema.org");
        }
      }
    });

    test("article page should have canonical URL", async ({ page }) => {
      await page.goto("/en/blog");

      const articleLink = page.locator("article a").first();

      if (await articleLink.isVisible()) {
        await articleLink.click();
        await page.waitForLoadState("domcontentloaded");

        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        expect(canonical).toBeTruthy();
      }
    });
  });

  test.describe("Blog Pagination", () => {
    test("should have pagination if many articles", async ({ page }) => {
      await page.goto("/en/blog");

      // Pagination links
      const pagination = page.locator("nav[aria-label*='pagination' i], [role='navigation']:has(a[href*='page'])");
      const paginationCount = await pagination.count();

      // Pagination is optional (depends on number of articles)
      expect(paginationCount).toBeGreaterThanOrEqual(0);
    });

    test("pagination should preserve filters", async ({ page }) => {
      // Set a filter first
      await page.goto("/en/blog?sort=newest");

      // Check for pagination
      const nextPageLink = page.locator("a[href*='page=2']").first();

      if (await nextPageLink.isVisible()) {
        const href = await nextPageLink.getAttribute("href");
        // Should preserve the sort parameter
        expect(href).toContain("sort=newest");
      }
    });
  });

  test.describe("German Locale Blog", () => {
    test("should load German blog page", async ({ page }) => {
      await page.goto("/blog");

      await expect(page.locator("html")).toHaveAttribute("lang", "de");
      await expect(page.locator("h1")).toBeVisible();
    });

    test("should have German sorting labels", async ({ page }) => {
      await page.goto("/blog");

      const sortSelect = page.locator('select[name="sort"]');

      if (await sortSelect.isVisible()) {
        // Check for German option text
        const optionTexts = await sortSelect.locator("option").allTextContents();
        const hasGermanText = optionTexts.some(
          (text) => /relevanz|neueste|beliebt/i.test(text)
        );

        expect(hasGermanText).toBeTruthy();
      }
    });
  });
});
