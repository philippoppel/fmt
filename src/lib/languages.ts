/**
 * ISO 639-1 Language utilities
 * Uses @cospired/i18n-iso-languages for standardized language codes and names
 */

import languages from "@cospired/i18n-iso-languages";

// Register German and English locales for language name translations
// eslint-disable-next-line @typescript-eslint/no-require-imports
languages.registerLocale(require("@cospired/i18n-iso-languages/langs/de.json"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
languages.registerLocale(require("@cospired/i18n-iso-languages/langs/en.json"));

// Common languages for therapy in Germany (shown first in the list)
export const COMMON_LANGUAGES = [
  "de", // German
  "en", // English
  "tr", // Turkish
  "ar", // Arabic
  "ru", // Russian
  "pl", // Polish
  "uk", // Ukrainian
  "fa", // Persian
  "es", // Spanish
  "fr", // French
  "it", // Italian
  "pt", // Portuguese
  "nl", // Dutch
  "ro", // Romanian
  "el", // Greek
  "sr", // Serbian
  "hr", // Croatian
  "bs", // Bosnian
  "ku", // Kurdish
  "vi", // Vietnamese
  "zh", // Chinese
] as const;

export type CommonLanguage = (typeof COMMON_LANGUAGES)[number];

/**
 * Get all ISO 639-1 language codes
 */
export function getAllLanguageCodes(): string[] {
  return Object.keys(languages.getAlpha2Codes());
}

/**
 * Get language name in the specified locale
 */
export function getLanguageName(code: string, locale: "de" | "en" = "de"): string {
  return languages.getName(code, locale) || code.toUpperCase();
}

/**
 * Get all languages as options for select/combobox
 * Common languages are shown first, then all others alphabetically
 */
export function getLanguageOptions(locale: "de" | "en" = "de"): Array<{
  code: string;
  name: string;
  isCommon: boolean;
}> {
  const allCodes = getAllLanguageCodes();

  // Get common languages first
  const commonOptions = COMMON_LANGUAGES.map((code) => ({
    code,
    name: getLanguageName(code, locale),
    isCommon: true,
  }));

  // Get remaining languages, sorted alphabetically by name
  const otherCodes = allCodes.filter((code) => !COMMON_LANGUAGES.includes(code as CommonLanguage));
  const otherOptions = otherCodes
    .map((code) => ({
      code,
      name: getLanguageName(code, locale),
      isCommon: false,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));

  return [...commonOptions, ...otherOptions];
}

/**
 * Check if a language code is valid ISO 639-1
 */
export function isValidLanguageCode(code: string): boolean {
  return languages.isValid(code);
}

/**
 * Language flag emoji mapping (for common languages)
 * Note: Some languages don't map 1:1 to countries
 */
export const LANGUAGE_FLAGS: Record<string, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  tr: "🇹🇷",
  ar: "🇸🇦",
  ru: "🇷🇺",
  es: "🇪🇸",
  fr: "🇫🇷",
  it: "🇮🇹",
  pl: "🇵🇱",
  uk: "🇺🇦",
  fa: "🇮🇷",
  pt: "🇵🇹",
  nl: "🇳🇱",
  ro: "🇷🇴",
  el: "🇬🇷",
  sr: "🇷🇸",
  hr: "🇭🇷",
  bs: "🇧🇦",
  ku: "🇮🇶", // Kurdish - using Iraq flag
  vi: "🇻🇳",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
  hi: "🇮🇳",
  bn: "🇧🇩",
  th: "🇹🇭",
  id: "🇮🇩",
  ms: "🇲🇾",
  sv: "🇸🇪",
  da: "🇩🇰",
  no: "🇳🇴",
  fi: "🇫🇮",
  cs: "🇨🇿",
  sk: "🇸🇰",
  hu: "🇭🇺",
  bg: "🇧🇬",
  he: "🇮🇱",
  // Default for unknown
};

export function getLanguageFlag(code: string): string {
  return LANGUAGE_FLAGS[code] || "🌐";
}
