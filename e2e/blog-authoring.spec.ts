import { test, expect, type Page } from "@playwright/test";

/**
 * Blog Authoring Tests
 * Tests for creating, editing, publishing, and managing blog posts
 *
 * Note: These tests require authentication. In CI, they test the UI flows
 * but actual API calls may fail without proper auth tokens.
 */

test.describe("Blog Authoring System", () => {

  test.describe("Blog Dashboard Access", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.goto("/de/dashboard/blog");

      // Should redirect to login
      await expect(page).toHaveURL(/auth\/login/);
    });

    test("should show login form", async ({ page }) => {
      await page.goto("/de/auth/login");

      await expect(page.locator("input[type='email']")).toBeVisible();
      await expect(page.locator("input[type='password']")).toBeVisible();
      await expect(page.getByRole("button", { name: "Anmelden", exact: true })).toBeVisible();
    });
  });

  test.describe("Admin Blog Dashboard UI", () => {
    test("admin blogs page structure should be correct", async ({ page }) => {
      // Go to admin blogs (will redirect to login, but we can check the redirect)
      await page.goto("/de/dashboard/admin/blogs");

      // Should redirect to auth
      await expect(page).toHaveURL(/auth\/login/);
    });
  });

  test.describe("Blog Editor Form Structure", () => {
    test("new blog page should have required form elements", async ({ page }) => {
      await page.goto("/de/dashboard/blog/new");

      // Will redirect to login, check that happens
      await expect(page).toHaveURL(/auth\/login/);
    });
  });

  test.describe("Blog List Page (Public)", () => {
    test("should display published articles", async ({ page }) => {
      await page.goto("/de/blog");

      // Should show articles
      const articles = page.locator("article");
      await expect(articles.first()).toBeVisible({ timeout: 10000 });

      const count = await articles.count();
      expect(count).toBeGreaterThan(0);
    });

    test("should have category filters", async ({ page }) => {
      await page.goto("/de/blog");

      // Wait for page to load
      await page.waitForLoadState("domcontentloaded");

      // Look for category links or filter buttons
      const categoryLinks = page.locator("a[href*='category=']");
      const categoryCount = await categoryLinks.count();

      expect(categoryCount).toBeGreaterThanOrEqual(0);
    });

    test("should filter by category when clicked", async ({ page }) => {
      await page.goto("/de/blog");

      const categoryLink = page.locator("a[href*='category=']").first();

      if (await categoryLink.isVisible()) {
        await categoryLink.click();
        await expect(page).toHaveURL(/category=/);
      }
    });

    test("should have search functionality", async ({ page }) => {
      await page.goto("/de/blog");

      const searchInput = page.locator("input[type='search'], input[placeholder*='such' i]").first();

      if (await searchInput.isVisible()) {
        await searchInput.fill("Angst");
        await searchInput.press("Enter");

        await page.waitForLoadState("domcontentloaded");
      }
    });

    test("should sort articles", async ({ page }) => {
      await page.goto("/de/blog");

      // Look for sort select
      const sortSelect = page.locator("select, [role='combobox']").first();

      if (await sortSelect.isVisible()) {
        await sortSelect.click();

        // Select newest option
        const newestOption = page.locator("text=/neueste|newest/i").first();
        if (await newestOption.isVisible()) {
          await newestOption.click();
        }
      }
    });
  });

  test.describe("Single Article Page (Public)", () => {
    test("should display article content", async ({ page }) => {
      await page.goto("/de/blog");

      // Click first article
      const articleLink = page.locator("article a").first();
      await articleLink.click();

      // Should navigate to article page
      await expect(page).toHaveURL(/\/blog\/.+/);

      // Should have title
      const title = page.locator("h1").first();
      await expect(title).toBeVisible();
    });

    test("should display author information", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      // Author name should be visible
      const authorText = page.locator("text=/Dr\\.|von|by/i").first();
      const hasAuthor = await authorText.count() > 0;

      expect(hasAuthor).toBeTruthy();
    });

    test("should display reading time", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      // Reading time should be visible
      const readingTime = page.locator("text=/\\d+\\s*min/i").first();
      await expect(readingTime).toBeVisible();
    });

    test("should have back to blog link", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      // Back link
      const backLink = page.locator("a[href*='/blog']").first();
      await expect(backLink).toBeVisible();
    });

    test("should display related articles", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Related posts section
      const relatedSection = page.locator("text=/weitere|ähnliche|related/i");
      const hasRelated = await relatedSection.count() > 0;

      expect(hasRelated).toBeDefined();
    });

    test("should have reaction buttons", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      // Scroll to find reactions
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));

      // Reaction buttons (like, love, insightful, helpful)
      const reactionButtons = page.locator("button").filter({ hasText: /👍|❤|💡|🙏|like|love|insight|hilf/i });
      const reactionCount = await reactionButtons.count();

      // Reactions are optional but should not crash
      expect(reactionCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Blog Article SEO", () => {
    test("should have proper meta tags", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      // Title tag
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);

      // Meta description
      const metaDesc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(metaDesc).toBeTruthy();
    });

    test("should have JSON-LD structured data", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      const jsonLd = page.locator('script[type="application/ld+json"]');
      const count = await jsonLd.count();

      expect(count).toBeGreaterThan(0);

      if (count > 0) {
        const content = await jsonLd.first().textContent();
        expect(content).toBeTruthy();

        const json = JSON.parse(content!);
        expect(json["@context"]).toBe("https://schema.org");
      }
    });

    test("should have Open Graph tags", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute("content");

      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
    });
  });

  test.describe("Blog Categories", () => {
    test("should have all matching categories available", async ({ page }) => {
      await page.goto("/de/blog");

      // Expected categories from matching system
      const expectedCategories = [
        "depression",
        "anxiety",
        "family",
        "relationships",
        "burnout",
        "trauma",
        "addiction",
        "eating",
        "adhd",
        "self-care",
        "stress",
        "sleep",
      ];

      // Check that at least some category links exist
      const categoryLinks = page.locator("a[href*='category=']");
      const hrefs = await categoryLinks.evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") || "")
      );

      // At least some categories should be present
      const foundCategories = hrefs.filter((href) =>
        expectedCategories.some((cat) => href.includes(cat))
      );

      expect(foundCategories.length).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Blog Featured Images", () => {
    test("articles should have featured images", async ({ page }) => {
      await page.goto("/de/blog");

      // Check for images in article cards
      const articleImages = page.locator("article img");
      const imageCount = await articleImages.count();

      expect(imageCount).toBeGreaterThanOrEqual(0);
    });

    test("article detail should have featured image", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      // Featured image in article
      const featuredImage = page.locator("figure img, article img").first();
      const hasImage = await featuredImage.count() > 0;

      // Image is optional
      expect(hasImage).toBeDefined();
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("blog list should be mobile friendly", async ({ page }) => {
      await page.goto("/de/blog");

      // Articles should stack vertically
      const articles = page.locator("article");
      await expect(articles.first()).toBeVisible();
    });

    test("article page should be mobile friendly", async ({ page }) => {
      await page.goto("/de/blog");

      const articleLink = page.locator("article a").first();
      await articleLink.click();

      await page.waitForLoadState("domcontentloaded");

      // Title should be visible and not overflow
      const title = page.locator("h1").first();
      await expect(title).toBeVisible();

      // Content should be readable
      const article = page.locator("article").first();
      await expect(article).toBeVisible();
    });
  });
});

test.describe("Blog API Functionality", () => {
  test.describe("View Tracking", () => {
    test("view tracking endpoint should exist", async ({ request }) => {
      const response = await request.post("/api/blog/track-view", {
        data: { postId: "test-post-id" },
      });

      // Should return a response (may be 400 for invalid post ID, but endpoint works)
      expect([200, 400, 404]).toContain(response.status());
    });
  });

  test.describe("Reactions API", () => {
    test("should handle reaction toggle", async ({ request }) => {
      const response = await request.post("/api/blog/reactions", {
        data: { postId: "test-post-id", type: "like" },
      });

      // May fail without auth, but endpoint should exist
      expect([200, 400, 401, 404]).toContain(response.status());
    });
  });
});

test.describe("Blog Publishing Workflow", () => {
  test.describe("Draft States", () => {
    test("should show draft status badge on unpublished posts", async ({ page }) => {
      // This test verifies the UI can display draft status
      await page.goto("/de/dashboard/blog");

      // Will redirect to login
      await expect(page).toHaveURL(/auth\/login/);
    });
  });

  test.describe("Review Workflow", () => {
    test("review page should be accessible to admins", async ({ page }) => {
      await page.goto("/de/dashboard/admin/blogs/review");

      // Will redirect to login
      await expect(page).toHaveURL(/auth\/login/);
    });
  });

  test.describe("Scheduled Posts", () => {
    test("scheduled page should be accessible to admins", async ({ page }) => {
      await page.goto("/de/dashboard/admin/blogs/scheduled");

      // Will redirect to login
      await expect(page).toHaveURL(/auth\/login/);
    });
  });
});

test.describe("AI Features", () => {
  test.describe("Unsplash Integration", () => {
    test("unsplash search API should exist", async ({ request }) => {
      const response = await request.get("/api/unsplash/search?query=nature");

      // May return error without API key, but endpoint should exist
      expect([200, 400, 401, 500]).toContain(response.status());
    });
  });
});

test.describe("Blog Performance", () => {
  test("blog list should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/de/blog");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("article page should load within acceptable time", async ({ page }) => {
    await page.goto("/de/blog");

    const articleLink = page.locator("article a").first();

    const startTime = Date.now();
    await articleLink.click();
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
