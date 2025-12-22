import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MicrositeBuilder } from "./_components/microsite-builder";

export const metadata = {
  title: "Microsite Builder | Dashboard",
  description: "Gestalten Sie Ihre persönliche Therapeuten-Microsite",
};

export default async function MicrositePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Fetch profile with microsite data
  const profile = await db.therapistProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!profile) {
    redirect("/dashboard/settings");
  }

  // Transform data for the builder - cast to expected types
  const builderData = {
    profile: {
      id: profile.id,
      userId: profile.userId,
      slug: profile.slug || "",
      name: profile.user?.name || "",
      title: profile.title || "",
      imageUrl: profile.imageUrl || "",
      headline: profile.headline || "",
      shortDescription: profile.shortDescription || "",
      longDescription: profile.longDescription || "",
      city: profile.city || "",
      postalCode: profile.postalCode || "",
      street: profile.street || "",
      practiceName: profile.practiceName || "",
      specializations: profile.specializations as string[],
      specializationRanks: (profile.specializationRanks as Record<string, number>) || {},
      therapyTypes: profile.therapyTypes as string[],
      therapySettings: profile.therapySettings as string[],
      languages: profile.languages as string[],
      insurance: profile.insurance as string[],
      education: profile.education,
      certifications: profile.certifications,
      memberships: profile.memberships,
      experienceYears: profile.experienceYears || 0,
      pricePerSession: profile.pricePerSession || 0,
      sessionType: profile.sessionType,
      availability: profile.availability,
      gender: profile.gender,
      workingHours: profile.workingHours,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      galleryImages: profile.galleryImages,
      officeImages: profile.officeImages,
      phone: profile.phone || "",
      email: profile.email || "",
      website: profile.website || "",
      linkedIn: profile.linkedIn || "",
      instagram: profile.instagram || "",
      themeColor: profile.themeColor || "#8B7355",
      themeName: (profile.themeName || "warm") as "warm" | "cool" | "nature" | "professional" | "minimal",
      consultationInfo: profile.consultationInfo || "",
      firstSessionInfo: profile.firstSessionInfo || "",
      videoIntroUrl: profile.videoIntroUrl || "",
      offersTrialSession: profile.offersTrialSession,
      trialSessionPrice: profile.trialSessionPrice || 0,
      accountType: profile.accountType,
      isVerified: profile.isVerified,
      communicationStyle: profile.communicationStyle || "balanced",
      usesHomework: profile.usesHomework ?? true,
      therapyFocus: profile.therapyFocus || "holistic",
      clientTalkRatio: profile.clientTalkRatio || 50,
      therapyDepth: profile.therapyDepth || "flexible",
    } as import("@/types/profile").TherapistProfileData,
    microsite: {
      draft: profile.micrositeDraft,
      published: profile.micrositePublished,
      status: profile.micrositeStatus,
      lastSavedAt: profile.micrositeLastSavedAt,
      publishedAt: profile.micrositePublishedAt,
    },
    accountType: profile.accountType,
  };

  return <MicrositeBuilder initialData={builderData} />;
}
