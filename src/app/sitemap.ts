import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/utils";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const locales = routing.locales;
  const defaultLocale = routing.defaultLocale;

  // Definiere alle statischen Seiten
  const staticPages = [
    "",
    "/about",
    "/contact",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generiere Einträge für jede Seite und jede Sprache
  staticPages.forEach((page) => {
    locales.forEach((locale) => {
      const isDefaultLocale = locale === defaultLocale;
      const url = isDefaultLocale
        ? `${baseUrl}${page}`
        : `${baseUrl}/${locale}${page}`;

      // Generiere alternates für alle Sprachen
      const languages: Record<string, string> = {};
      locales.forEach((altLocale) => {
        const isAltDefault = altLocale === defaultLocale;
        const langCode = altLocale === "de" ? "de-DE"
          : altLocale === "en" ? "en-US"
          : altLocale === "fr" ? "fr-FR"
          : altLocale === "es" ? "es-ES"
          : "it-IT";
        languages[langCode] = isAltDefault
          ? `${baseUrl}${page}`
          : `${baseUrl}/${altLocale}${page}`;
      });
      languages["x-default"] = `${baseUrl}${page}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
        alternates: {
          languages,
        },
      });
    });
  });

  return sitemapEntries;
}
