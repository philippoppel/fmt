import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getProfileBySlug, getAllProfileSlugs } from "@/lib/data/profile";
import { ProfilePage } from "@/components/profile/profile-page";
import { generateProfileSchema } from "@/lib/seo/profile-schema";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Generate static params for all published profiles
export async function generateStaticParams() {
  const slugs = await getAllProfileSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate SEO metadata for each profile
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const profile = await getProfileBySlug(slug);

  if (!profile) {
    return {
      title: "Profil nicht gefunden",
    };
  }

  const title = profile.name + (profile.title ? ` - ${profile.title}` : "");
  const description = profile.shortDescription || profile.headline ||
    `${profile.name} - Psychotherapeutin in ${profile.city}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
  const profileUrl = `${baseUrl}/${locale === "de" ? "" : locale + "/"}p/${slug}`;

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
      images: profile.imageUrl ? [
        {
          url: profile.imageUrl,
          width: 400,
          height: 400,
          alt: profile.name,
        },
      ] : undefined,
      locale: locale === "de" ? "de_DE" : "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile.imageUrl ? [profile.imageUrl] : undefined,
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

  const profile = await getProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  // Generate JSON-LD structured data
  const jsonLd = generateProfileSchema(profile, locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfilePage profile={profile} locale={locale} />
    </>
  );
}
