import type { TherapistProfileData } from "@/types/profile";

/**
 * Generate JSON-LD structured data for a therapist profile
 * Follows Schema.org specifications for Physician/MedicalBusiness
 */
export function generateProfileSchema(profile: TherapistProfileData, locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const profileUrl = `${baseUrl}/${locale === "de" ? "" : locale + "/"}p/${profile.slug}`;

  // Map specializations to medical specialty schema values
  const medicalSpecialties = profile.specializations.map((spec) => {
    const specialtyMap: Record<string, string> = {
      depression: "Psychiatry",
      anxiety: "Psychiatry",
      trauma: "Psychiatry",
      relationships: "Psychology",
      addiction: "Psychiatry",
      eating_disorders: "Psychiatry",
      adhd: "Psychiatry",
      burnout: "Psychology",
    };
    return specialtyMap[spec] || "Psychology";
  });

  // Main Person/Physician schema
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": profileUrl,
    name: profile.name,
    jobTitle: profile.title,
    description: profile.shortDescription || profile.headline,
    image: profile.imageUrl,
    url: profileUrl,
    telephone: profile.phone || undefined,
    email: profile.email || undefined,
    medicalSpecialty: [...new Set(medicalSpecialties)],
    knowsLanguage: profile.languages.map((lang) => ({
      "@type": "Language",
      name: lang === "de" ? "German" : lang === "en" ? "English" : lang === "tr" ? "Turkish" : "Arabic",
      alternateName: lang,
    })),
    ...(profile.rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: profile.rating.toString(),
        reviewCount: profile.reviewCount.toString(),
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(profile.city && {
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.city,
        postalCode: profile.postalCode,
        streetAddress: profile.street || undefined,
        addressCountry: "DE",
      },
    }),
    ...(profile.pricePerSession > 0 && {
      priceRange: `€${profile.pricePerSession}`,
    }),
  };

  // LocalBusiness schema for the practice
  const localBusinessSchema = profile.practiceName || profile.city
    ? {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        name: profile.practiceName || `Praxis ${profile.name}`,
        description: profile.headline || profile.shortDescription,
        image: profile.officeImages?.[0] || profile.imageUrl,
        url: profileUrl,
        telephone: profile.phone || undefined,
        email: profile.email || undefined,
        ...(profile.city && {
          address: {
            "@type": "PostalAddress",
            addressLocality: profile.city,
            postalCode: profile.postalCode,
            streetAddress: profile.street || undefined,
            addressCountry: "DE",
          },
        }),
        ...(profile.workingHours && {
          openingHoursSpecification: generateOpeningHours(profile.workingHours),
        }),
        ...(profile.rating > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: profile.rating.toString(),
            reviewCount: profile.reviewCount.toString(),
            bestRating: "5",
            worstRating: "1",
          },
        }),
        priceRange: profile.pricePerSession > 0 ? `€${profile.pricePerSession}` : undefined,
        paymentAccepted: profile.insurance.map((ins) =>
          ins === "public" ? "Gesetzliche Krankenversicherung" : "Private Krankenversicherung"
        ),
        medicalSpecialty: [...new Set(medicalSpecialties)],
      }
    : null;

  // Service schema for offered therapy types
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: locale === "de" ? "Psychotherapie" : "Psychotherapy",
    provider: {
      "@type": "Physician",
      name: profile.name,
      url: profileUrl,
    },
    serviceType: profile.therapyTypes.map((type) => {
      const typeMap: Record<string, string> = {
        cbt: locale === "de" ? "Kognitive Verhaltenstherapie" : "Cognitive Behavioral Therapy",
        psychoanalysis: locale === "de" ? "Psychoanalyse" : "Psychoanalysis",
        systemic: locale === "de" ? "Systemische Therapie" : "Systemic Therapy",
        gestalt: "Gestalttherapie",
        humanistic: locale === "de" ? "Humanistische Therapie" : "Humanistic Therapy",
      };
      return typeMap[type] || type;
    }),
    areaServed: profile.city
      ? {
          "@type": "City",
          name: profile.city,
        }
      : undefined,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceType:
        profile.sessionType === "online"
          ? "Online"
          : profile.sessionType === "in_person"
            ? "In-Person"
            : "Online and In-Person",
    },
    ...(profile.pricePerSession > 0 && {
      offers: {
        "@type": "Offer",
        price: profile.pricePerSession.toString(),
        priceCurrency: "EUR",
        description: locale === "de" ? "Preis pro Sitzung" : "Price per session",
      },
    }),
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "de" ? "Therapeuten" : "Therapists",
        item: `${baseUrl}/${locale === "de" ? "" : locale + "/"}therapists`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: profile.name,
        item: profileUrl,
      },
    ],
  };

  return [
    personSchema,
    ...(localBusinessSchema ? [localBusinessSchema] : []),
    serviceSchema,
    breadcrumbSchema,
  ];
}

// Helper function to generate opening hours
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateOpeningHours(workingHours: any) {
  const dayMap: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const hours = [];

  for (const [day, times] of Object.entries(workingHours)) {
    const dayTimes = times as { from?: string; to?: string; closed?: boolean } | undefined;
    if (dayTimes && dayTimes.from && dayTimes.to && !dayTimes.closed) {
      hours.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayMap[day],
        opens: dayTimes.from,
        closes: dayTimes.to,
      });
    }
  }

  return hours;
}
