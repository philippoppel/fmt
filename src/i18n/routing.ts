import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Alle unterstützten Sprachen
  locales: ["de", "en"],

  // Standardsprache
  defaultLocale: "de",

  // URL-Präfix nur für nicht-Standard-Sprachen
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
