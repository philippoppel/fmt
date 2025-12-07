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
  const url = `${baseUrl}${path}`;
  const ogLocale = localeMap[locale] || "de_DE";

  const defaultImage = `${baseUrl}/og-image.png`;
  const ogImage = image || defaultImage;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: authors?.map((name) => ({ name })),
    creator: "Meine App",
    publisher: "Meine App",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
      languages: {
        "de-DE": `${baseUrl}/de${path}`,
        "en-US": `${baseUrl}/en${path}`,
        "fr-FR": `${baseUrl}/fr${path}`,
        "es-ES": `${baseUrl}/es${path}`,
        "it-IT": `${baseUrl}/it${path}`,
        "x-default": `${baseUrl}${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Meine App",
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
      creator: "@meineapp",
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
    name: "Meine App",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      "https://twitter.com/meineapp",
      "https://linkedin.com/company/meineapp",
      "https://github.com/meineapp",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+49-XXX-XXXXXXX",
      contactType: "customer service",
      availableLanguage: ["German", "English", "French", "Spanish", "Italian"],
    },
  };
}

export function generateWebSiteSchema(locale: string) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Meine App",
    url: baseUrl,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
      name: "Meine App",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
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
