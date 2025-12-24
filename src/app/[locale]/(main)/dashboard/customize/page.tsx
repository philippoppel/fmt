import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateSeoMetadata } from "@/lib/seo";
import { CustomizeContent } from "./customize-content";
import type { TherapistProfileData, ThemeName } from "@/types/profile";
import type { MicrositeConfig } from "@/types/microsite";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.customize" });

  return generateSeoMetadata({
    title: t("title"),
    description: t("subtitle"),
    locale,
    path: "/dashboard/customize",
    noIndex: true,
  });
}

export default async function CustomizePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login`);
  }

  const dbProfile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      slug: true,
      userId: true,
      user: { select: { name: true } },
      title: true,
      imageUrl: true,
      headline: true,
      shortDescription: true,
      longDescription: true,
      city: true,
      postalCode: true,
      street: true,
      practiceName: true,
      specializations: true,
      specializationRanks: true,
      specializationIcons: true,
      therapyTypes: true,
      therapySettings: true,
      languages: true,
      insurance: true,
      education: true,
      certifications: true,
      memberships: true,
      experienceYears: true,
      pricePerSession: true,
      sessionType: true,
      availability: true,
      gender: true,
      workingHours: true,
      rating: true,
      reviewCount: true,
      galleryImages: true,
      officeImages: true,
      heroCoverImageUrl: true,
      phone: true,
      email: true,
      website: true,
      linkedIn: true,
      instagram: true,
      themeColor: true,
      themeName: true,
      consultationInfo: true,
      firstSessionInfo: true,
      videoIntroUrl: true,
      offersTrialSession: true,
      trialSessionPrice: true,
      accountType: true,
      isVerified: true,
      communicationStyle: true,
      usesHomework: true,
      therapyFocus: true,
      clientTalkRatio: true,
      therapyDepth: true,
      // Microsite fields
      micrositeDraft: true,
    },
  });

  if (!dbProfile) {
    redirect(`/${locale}/dashboard/profile`);
  }

  // Check if user has access to customization (mittel or premium)
  const hasAccess = dbProfile.accountType === "mittel" || dbProfile.accountType === "premium";

  // Transform to TherapistProfileData
  const profile: TherapistProfileData = {
    id: dbProfile.id,
    slug: dbProfile.slug || "",
    userId: dbProfile.userId,
    name: dbProfile.user?.name || "",
    title: dbProfile.title || "",
    imageUrl: dbProfile.imageUrl || "",
    headline: dbProfile.headline || "",
    shortDescription: dbProfile.shortDescription || "",
    longDescription: dbProfile.longDescription || "",
    city: dbProfile.city || "",
    postalCode: dbProfile.postalCode || "",
    street: dbProfile.street || "",
    practiceName: dbProfile.practiceName || "",
    specializations: (dbProfile.specializations || []) as TherapistProfileData["specializations"],
    specializationRanks: (dbProfile.specializationRanks || {}) as Record<string, number>,
    specializationIcons: (dbProfile.specializationIcons || {}) as Record<string, string>,
    therapyTypes: (dbProfile.therapyTypes || []) as TherapistProfileData["therapyTypes"],
    therapySettings: (dbProfile.therapySettings || []) as TherapistProfileData["therapySettings"],
    languages: (dbProfile.languages || []) as TherapistProfileData["languages"],
    insurance: (dbProfile.insurance || []) as TherapistProfileData["insurance"],
    education: dbProfile.education || [],
    certifications: dbProfile.certifications || [],
    memberships: dbProfile.memberships || [],
    experienceYears: dbProfile.experienceYears || 0,
    pricePerSession: dbProfile.pricePerSession || 0,
    sessionType: (dbProfile.sessionType || "einzeltherapie") as TherapistProfileData["sessionType"],
    availability: (dbProfile.availability || "accepting_new") as TherapistProfileData["availability"],
    gender: (dbProfile.gender || "keine_angabe") as TherapistProfileData["gender"],
    workingHours: dbProfile.workingHours as TherapistProfileData["workingHours"],
    rating: dbProfile.rating || 0,
    reviewCount: dbProfile.reviewCount || 0,
    galleryImages: dbProfile.galleryImages || [],
    officeImages: dbProfile.officeImages || [],
    heroCoverImageUrl: dbProfile.heroCoverImageUrl || "",
    phone: dbProfile.phone || "",
    email: dbProfile.email || "",
    website: dbProfile.website || "",
    linkedIn: dbProfile.linkedIn || "",
    instagram: dbProfile.instagram || "",
    themeColor: dbProfile.themeColor || "#F97316",
    themeName: (dbProfile.themeName as ThemeName) || "warm",
    consultationInfo: dbProfile.consultationInfo || "",
    firstSessionInfo: dbProfile.firstSessionInfo || "",
    videoIntroUrl: dbProfile.videoIntroUrl || "",
    offersTrialSession: dbProfile.offersTrialSession || false,
    trialSessionPrice: dbProfile.trialSessionPrice || 0,
    accountType: dbProfile.accountType as TherapistProfileData["accountType"],
    isVerified: dbProfile.isVerified || false,
    communicationStyle: (dbProfile.communicationStyle || "empathisch") as TherapistProfileData["communicationStyle"],
    usesHomework: dbProfile.usesHomework || false,
    therapyFocus: (dbProfile.therapyFocus || "gegenwartsorientiert") as TherapistProfileData["therapyFocus"],
    clientTalkRatio: dbProfile.clientTalkRatio || 50,
    therapyDepth: (dbProfile.therapyDepth || "mittel") as TherapistProfileData["therapyDepth"],
  };

  // Parse microsite config
  const micrositeConfig = dbProfile.micrositeDraft
    ? (dbProfile.micrositeDraft as unknown as MicrositeConfig)
    : null;

  return (
    <CustomizeContent
      hasAccess={hasAccess}
      accountType={dbProfile.accountType}
      profile={profile}
      micrositeConfig={micrositeConfig}
      slug={dbProfile.slug}
    />
  );
}
