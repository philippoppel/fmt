import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateSeoMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateFAQSchema,
} from "@/lib/seo";

// Mock getBaseUrl
vi.mock("@/lib/utils", () => ({
  getBaseUrl: () => "https://example.com",
}));

describe("SEO Metadata Generation", () => {
  describe("generateSeoMetadata", () => {
    it("should generate correct canonical URL for default locale (de)", () => {
      const metadata = generateSeoMetadata({
        title: "Test Page",
        description: "Test description",
        locale: "de",
        path: "/about",
      });

      expect(metadata.alternates?.canonical).toBe("https://example.com/about");
    });

    it("should generate correct canonical URL for non-default locale (en)", () => {
      const metadata = generateSeoMetadata({
        title: "Test Page",
        description: "Test description",
        locale: "en",
        path: "/about",
      });

      expect(metadata.alternates?.canonical).toBe("https://example.com/en/about");
    });

    it("should include all 2 language alternates plus x-default", () => {
      const metadata = generateSeoMetadata({
        title: "Test",
        description: "Test description",
        locale: "de",
      });

      const languages = metadata.alternates?.languages;
      expect(languages).toHaveProperty("de-DE");
      expect(languages).toHaveProperty("en-US");
      expect(languages).toHaveProperty("x-default");
    });

    it("should set noindex/nofollow when noIndex is true", () => {
      const metadata = generateSeoMetadata({
        title: "Login",
        description: "Login page",
        locale: "de",
        noIndex: true,
      });

      expect(metadata.robots).toEqual({ index: false, follow: false });
    });

    it("should set index/follow when noIndex is false", () => {
      const metadata = generateSeoMetadata({
        title: "Public Page",
        description: "Public content",
        locale: "de",
        noIndex: false,
      });

      expect(metadata.robots).toHaveProperty("index", true);
      expect(metadata.robots).toHaveProperty("follow", true);
    });

    it("should include OpenGraph metadata with correct locale format", () => {
      const metadata = generateSeoMetadata({
        title: "Test",
        description: "Test description",
        locale: "en",
      });

      expect(metadata.openGraph?.locale).toBe("en_US");
      expect(metadata.openGraph?.title).toBe("Test");
      expect(metadata.openGraph?.description).toBe("Test description");
      expect(metadata.openGraph?.siteName).toBe("FindMyTherapy");
    });

    it("should include Twitter card metadata", () => {
      const metadata = generateSeoMetadata({
        title: "Test",
        description: "Test description",
        locale: "de",
      });

      const twitter = metadata.twitter as Record<string, unknown>;
      expect(twitter?.card).toBe("summary_large_image");
      expect(twitter?.title).toBe("Test");
      expect(twitter?.creator).toBe("@findmytherapy");
    });

    it("should use correct locale mapping for all locales", () => {
      const locales = ["de", "en"];
      const expectedMapping: Record<string, string> = {
        de: "de_DE",
        en: "en_US",
      };

      locales.forEach((locale) => {
        const metadata = generateSeoMetadata({
          title: "Test",
          description: "Test",
          locale,
        });
        expect(metadata.openGraph?.locale).toBe(expectedMapping[locale]);
      });
    });

    it("should generate homepage canonical without trailing path", () => {
      const metadata = generateSeoMetadata({
        title: "Home",
        description: "Homepage",
        locale: "de",
        path: "",
      });

      // German homepage should be just the base URL
      expect(metadata.alternates?.canonical).toBe("https://example.com/");
    });
  });
});

describe("JSON-LD Schema Generation", () => {
  describe("generateOrganizationSchema", () => {
    it("should return valid Organization schema structure", () => {
      const schema = generateOrganizationSchema();

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Organization");
      expect(schema.name).toBe("FindMyTherapy");
      expect(schema.url).toBe("https://example.com");
      expect(schema.logo).toBe("https://example.com/favicon.svg");
    });

    it("should match snapshot", () => {
      const schema = generateOrganizationSchema();
      expect(schema).toMatchSnapshot();
    });
  });

  describe("generateWebSiteSchema", () => {
    it("should include correct inLanguage for each locale", () => {
      const locales = ["de", "en"];

      locales.forEach((locale) => {
        const schema = generateWebSiteSchema(locale);
        expect(schema["@context"]).toBe("https://schema.org");
        expect(schema["@type"]).toBe("WebSite");
        expect(schema.inLanguage).toBe(locale);
      });
    });

    it("should match snapshot for German locale", () => {
      const schema = generateWebSiteSchema("de");
      expect(schema).toMatchSnapshot();
    });
  });

  describe("generateBreadcrumbSchema", () => {
    it("should generate correct position numbers starting at 1", () => {
      const items = [
        { name: "Home", url: "https://example.com" },
        { name: "About", url: "https://example.com/about" },
        { name: "Team", url: "https://example.com/about/team" },
      ];

      const schema = generateBreadcrumbSchema(items);

      expect(schema["@type"]).toBe("BreadcrumbList");
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[2].position).toBe(3);
    });

    it("should include name and item for each breadcrumb", () => {
      const items = [{ name: "Home", url: "https://example.com" }];

      const schema = generateBreadcrumbSchema(items);

      expect(schema.itemListElement[0].name).toBe("Home");
      expect(schema.itemListElement[0].item).toBe("https://example.com");
    });
  });

  describe("generateArticleSchema", () => {
    const articleData = {
      title: "Test Article",
      description: "Article description",
      url: "https://example.com/article",
      image: "https://example.com/image.jpg",
      publishedTime: "2024-01-01T00:00:00Z",
      authors: ["John Doe"],
    };

    it("should generate valid Article schema", () => {
      const schema = generateArticleSchema(articleData);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Article");
      expect(schema.headline).toBe("Test Article");
      expect(schema.description).toBe("Article description");
    });

    it("should use publishedTime for dateModified if modifiedTime is undefined", () => {
      const schema = generateArticleSchema(articleData);

      expect(schema.datePublished).toBe("2024-01-01T00:00:00Z");
      expect(schema.dateModified).toBe("2024-01-01T00:00:00Z");
    });

    it("should use modifiedTime when provided", () => {
      const schema = generateArticleSchema({
        ...articleData,
        modifiedTime: "2024-06-01T00:00:00Z",
      });

      expect(schema.dateModified).toBe("2024-06-01T00:00:00Z");
    });

    it("should map authors to Person schema", () => {
      const schema = generateArticleSchema({
        ...articleData,
        authors: ["Alice", "Bob"],
      });

      expect(schema.author).toHaveLength(2);
      expect(schema.author[0]["@type"]).toBe("Person");
      expect(schema.author[0].name).toBe("Alice");
      expect(schema.author[1].name).toBe("Bob");
    });
  });

  describe("generateFAQSchema", () => {
    it("should generate valid FAQPage schema", () => {
      const faqs = [
        { question: "What is this?", answer: "A test application." },
        { question: "How does it work?", answer: "It just works." },
      ];

      const schema = generateFAQSchema(faqs);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("FAQPage");
      expect(schema.mainEntity).toHaveLength(2);
    });

    it("should map questions to Question schema", () => {
      const faqs = [{ question: "Test Q?", answer: "Test A." }];

      const schema = generateFAQSchema(faqs);

      expect(schema.mainEntity[0]["@type"]).toBe("Question");
      expect(schema.mainEntity[0].name).toBe("Test Q?");
      expect(schema.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
      expect(schema.mainEntity[0].acceptedAnswer.text).toBe("Test A.");
    });

    it("should match snapshot", () => {
      const faqs = [
        { question: "What is FMT?", answer: "A web application." },
        { question: "Is it free?", answer: "Yes, it is." },
      ];
      const schema = generateFAQSchema(faqs);
      expect(schema).toMatchSnapshot();
    });
  });
});
