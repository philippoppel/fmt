import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProfileWithMicrositeBySlug, getAllProfileSlugs } from "@/lib/data/profile";
import { ProfilePage } from "@/components/profile/profile-page";
import { generateProfileSchema } from "@/lib/seo/profile-schema";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Allow dynamic params (profiles not in generateStaticParams)
export const dynamicParams = true;

// Revalidate pages on-demand (when revalidatePath is called) or every 60 seconds
export const revalidate = 60;

// Generate static params for all published profiles
export async function generateStaticParams() {
  const slugs = await getAllProfileSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate SEO metadata for each profile
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const result = await getProfileWithMicrositeBySlug(slug);

  if (!result) {
    return {
      title: "Profil nicht gefunden",
    };
  }

  const { profile, micrositeConfig } = result;

  // Use hero tagline from microsite config if available
  const heroTagline = micrositeConfig?.hero?.tagline;

  const title = profile.name + (profile.title ? ` - ${profile.title}` : "");
  const description = heroTagline || profile.shortDescription || profile.headline ||
    `${profile.name} - Psychotherapeutin in ${profile.city}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const profileUrl = `${baseUrl}/${locale === "de" ? "" : locale + "/"}p/${slug}`;

  // Use cover image from microsite config if available, fallback to profile image
  const ogImage = micrositeConfig?.hero?.coverImageUrl || profile.imageUrl;

  return {
    title,
    description,
    keywords: [
      "Psychotherapie",
      "Psychotherapeut",
      profile.city,
      ...profile.specializations.map(s => s.replace("_", " ")),
      profile.name,
    ],
    authors: [{ name: profile.name }],
    openGraph: {
      title,
      description,
      url: profileUrl,
      type: "profile",
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: profile.name,
        },
      ] : undefined,
      locale: locale === "de" ? "de_DE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: profileUrl,
      languages: {
        de: `${baseUrl}/p/${slug}`,
        en: `${baseUrl}/en/p/${slug}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function TherapistProfilePage({ params }: Props) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const result = await getProfileWithMicrositeBySlug(slug);

  if (!result) {
    notFound();
  }

  const { profile, micrositeConfig } = result;

  // Generate JSON-LD structured data
  const jsonLd = generateProfileSchema(profile, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfilePage
        profile={profile}
        locale={locale}
        micrositeConfig={micrositeConfig}
      />
    </>
  );
}
