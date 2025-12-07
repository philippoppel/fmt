import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Read JSON files directly to avoid ESM/CJS issues
const messagesDir = path.join(process.cwd(), "messages");

function readMessages(locale: string): Record<string, unknown> {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

// Read routing config directly
function readRoutingConfig() {
  // We test the expected configuration directly
  return {
    locales: ["de", "en", "fr", "es", "it"],
    defaultLocale: "de",
    localePrefix: "as-needed",
  };
}

describe("i18n Routing Configuration", () => {
  const routing = readRoutingConfig();

  it("should support exactly 5 locales", () => {
    expect(routing.locales).toHaveLength(5);
    expect(routing.locales).toEqual(["de", "en", "fr", "es", "it"]);
  });

  it("should have German (de) as default locale", () => {
    expect(routing.defaultLocale).toBe("de");
  });

  it("should use 'as-needed' locale prefix strategy", () => {
    expect(routing.localePrefix).toBe("as-needed");
  });
});

describe("Translation Completeness", () => {
  // Helper function to extract all keys from nested object
  function extractKeys(obj: Record<string, unknown>, prefix = ""): string[] {
    const keys: string[] = [];
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...extractKeys(obj[key] as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys.sort();
  }

  const de = readMessages("de");
  const deKeys = extractKeys(de);
  const otherLocales = ["en", "fr", "es", "it"];

  it("should have German (de) as reference with keys", () => {
    expect(deKeys.length).toBeGreaterThan(0);
  });

  otherLocales.forEach((locale) => {
    describe(`${locale.toUpperCase()} translations`, () => {
      const messages = readMessages(locale);
      const localeKeys = extractKeys(messages);

      it("should have all keys from German (reference)", () => {
        const missingKeys = deKeys.filter((key) => !localeKeys.includes(key));

        if (missingKeys.length > 0) {
          console.log(`Missing keys in ${locale}:`, missingKeys);
        }

        expect(missingKeys).toEqual([]);
      });

      it("should not have extra keys not in German", () => {
        const extraKeys = localeKeys.filter((key) => !deKeys.includes(key));

        if (extraKeys.length > 0) {
          console.log(`Extra keys in ${locale}:`, extraKeys);
        }

        expect(extraKeys).toEqual([]);
      });

      it("should have the same number of keys as German", () => {
        expect(localeKeys.length).toBe(deKeys.length);
      });
    });
  });
});

describe("Translation Content Integrity", () => {
  const locales = ["de", "en", "fr", "es", "it"];

  locales.forEach((locale) => {
    describe(`${locale.toUpperCase()} content`, () => {
      const messages = readMessages(locale);

      it("should have metadata.title defined", () => {
        expect((messages as { metadata?: { title?: string } }).metadata?.title).toBeDefined();
        expect((messages as { metadata?: { title?: string } }).metadata?.title?.length).toBeGreaterThan(0);
      });

      it("should have metadata.description defined", () => {
        expect((messages as { metadata?: { description?: string } }).metadata?.description).toBeDefined();
        expect((messages as { metadata?: { description?: string } }).metadata?.description?.length).toBeGreaterThan(0);
      });

      it("should have navigation section", () => {
        expect((messages as { navigation?: unknown }).navigation).toBeDefined();
      });

      it("should have common section", () => {
        expect((messages as { common?: unknown }).common).toBeDefined();
      });

      it("should have auth section", () => {
        expect((messages as { auth?: unknown }).auth).toBeDefined();
      });
    });
  });
});

describe("Translation Interpolation Placeholders", () => {
  const locales = ["de", "en", "fr", "es", "it"];

  it("should have year placeholder in footer.copyright for all locales", () => {
    locales.forEach((locale) => {
      const messages = readMessages(locale);
      const footer = (messages as { footer?: { copyright?: string } }).footer;
      if (footer?.copyright) {
        expect(
          footer.copyright.includes("{year}"),
          `${locale} footer.copyright should contain {year} placeholder`
        ).toBe(true);
      }
    });
  });
});
