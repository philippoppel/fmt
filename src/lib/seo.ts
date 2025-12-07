import type { Metadata } from "next";
import { getBaseUrl } from "./utils";

type SeoParams = {
  title: string;
  description: string;
  keywords?: string[];
  locale: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
};

const localeMap: Record<string, string> = {
  de: "de_DE",
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  it: "it_IT",
};

export function generateSeoMetadata({
  title,
  description,
  keywords = [],
  locale,
  path = "",
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: SeoParams): Metadata {
  const baseUrl = getBaseUrl();
  // Canonical URL mit locale prefix
  const localePath = locale === "de" ? "" : `/${locale}`;
  const canonicalPath = `${localePath}${path || ""}` || "/";
  const url = `${baseUrl}${canonicalPath}`;
  const ogLocale = localeMap[locale] || "de_DE";

  const defaultImage = `${baseUrl}/og-image.svg`;
  const ogImage = image || defaultImage;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: authors?.map((name) => ({ name })),
    creator: "FMT",
    publisher: "FMT",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/icons/icon.svg", type: "image/svg+xml" },
      ],
    },
    alternates: {
      canonical: url,
      languages: {
        "de-DE": `${baseUrl}${path || "/"}`,
        "en-US": `${baseUrl}/en${path || ""}`,
        "fr-FR": `${baseUrl}/fr${path || ""}`,
        "es-ES": `${baseUrl}/es${path || ""}`,
        "it-IT": `${baseUrl}/it${path || ""}`,
        "x-default": `${baseUrl}${path || "/"}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "FMT",
      locale: ogLocale,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@fmt_app",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      // yandex: process.env.YANDEX_VERIFICATION,
      // bing: process.env.BING_VERIFICATION,
    },
  };
}

// JSON-LD Structured Data Generators
export function generateOrganizationSchema() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FMT",
    url: baseUrl,
    logo: `${baseUrl}/icons/icon.svg`,
    sameAs: [
      "https://github.com/philippoppel/fmt",
    ],
  };
}

export function generateWebSiteSchema(locale: string) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FMT",
    url: baseUrl,
    inLanguage: locale,
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  authors,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedTime: string;
  modifiedTime?: string;
  authors: string[];
}) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    url,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: authors.map((name) => ({
      "@type": "Person",
      name,
    })),
    publisher: {
      "@type": "Organization",
      name: "FMT",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icons/icon.svg`,
      },
    },
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
