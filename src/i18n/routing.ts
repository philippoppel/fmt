import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Alle unterstützten Sprachen
  locales: ["de", "en"],

  // Standardsprache
  defaultLocale: "de",

  // URL-Präfix nur für nicht-Standard-Sprachen
  localePrefix: "as-needed",

  // Browser-Spracherkennung deaktivieren - immer Deutsch als Standard
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
