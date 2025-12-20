"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ThemeName } from "@/types/profile";
import type { SessionType, Availability, Gender } from "@/types/therapist";
import { generateSlugFromName } from "@/lib/data/profile";

interface UpdateProfileData {
  // Basic Info
  title?: string;
  headline?: string;
  shortDescription?: string;
  longDescription?: string;

  // Location
  city?: string;
  postalCode?: string;
  street?: string;
  practiceName?: string;

  // Images
  imageUrl?: string;
  galleryImages?: string[];
  officeImages?: string[];

  // Specializations (string[] for form flexibility, validated server-side)
  specializations?: string[];
  specializationRanks?: Record<string, number>;
  therapyTypes?: string[];

  // Professional
  education?: string[];
  certifications?: string[];
  memberships?: string[];
  experienceYears?: number;

  // Contact
  phone?: string;
  email?: string;
  website?: string;
  linkedIn?: string;
  instagram?: string;

  // Settings (string[] for form flexibility)
  languages?: string[];
  insurance?: string[];
  pricePerSession?: number;
  sessionType?: SessionType;
  availability?: Availability;
  gender?: Gender;

  // Theme
  themeColor?: string;
  themeName?: ThemeName;

  // Additional
  consultationInfo?: string;
  offersTrialSession?: boolean;
  trialSessionPrice?: number;
}

export async function updateTherapistProfile(data: UpdateProfileData): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const userId = session.user.id;

    // Get existing profile to check if slug needs to be generated
    const existingProfile = await db.therapistProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true } } },
    });

    if (!existingProfile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    // Generate slug if not exists
    let slug = existingProfile.slug;
    if (!slug && existingProfile.user?.name) {
      slug = generateSlugFromName(existingProfile.user.name);
      // Make slug unique if needed
      let counter = 1;
      let uniqueSlug = slug;
      while (true) {
        const existing = await db.therapistProfile.findUnique({ where: { slug: uniqueSlug } });
        if (!existing || existing.userId === userId) break;
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = uniqueSlug;
    }

    // Calculate profile completeness
    const completeness = calculateProfileCompleteness({
      ...existingProfile,
      ...data,
    });

    // Update profile
    await db.therapistProfile.update({
      where: { userId },
      data: {
        // Basic Info
        title: data.title,
        headline: data.headline,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,

        // Location
        city: data.city,
        postalCode: data.postalCode,
        street: data.street,
        practiceName: data.practiceName,

        // Images
        imageUrl: data.imageUrl,
        galleryImages: data.galleryImages,
        officeImages: data.officeImages,

        // Specializations
        specializations: data.specializations,
        specializationRanks: data.specializationRanks || {},
        therapyTypes: data.therapyTypes,

        // Professional
        education: data.education,
        certifications: data.certifications,
        memberships: data.memberships,
        experienceYears: data.experienceYears,

        // Contact
        phone: data.phone,
        email: data.email,
        website: data.website,
        linkedIn: data.linkedIn,
        instagram: data.instagram,

        // Settings
        languages: data.languages,
        insurance: data.insurance,
        pricePerSession: data.pricePerSession,
        sessionType: data.sessionType,
        availability: data.availability,
        gender: data.gender,

        // Theme
        themeColor: data.themeColor,
        themeName: data.themeName,

        // Additional
        consultationInfo: data.consultationInfo,
        offersTrialSession: data.offersTrialSession,
        trialSessionPrice: data.trialSessionPrice,

        // Auto-generated
        slug,
        profileCompleteness: completeness,

        updatedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath(`/p/${slug}`);
    revalidatePath("/therapists");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Fehler beim Speichern des Profils" };
  }
}

// Helper function to calculate profile completeness
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateProfileCompleteness(profile: any): number {
  let score = 0;
  const weights = {
    imageUrl: 15,
    shortDescription: 10,
    longDescription: 10,
    headline: 5,
    city: 10,
    phone: 5,
    email: 5,
    specializations: 15,
    therapyTypes: 10,
    education: 5,
    certifications: 5,
    galleryImages: 5,
    pricePerSession: 5,
  };

  if (profile.imageUrl && profile.imageUrl.length > 0) score += weights.imageUrl;
  if (profile.shortDescription && profile.shortDescription.length > 50) score += weights.shortDescription;
  if (profile.longDescription && profile.longDescription.length > 100) score += weights.longDescription;
  if (profile.headline && profile.headline.length > 10) score += weights.headline;
  if (profile.city && profile.city.length > 0) score += weights.city;
  if (profile.phone && profile.phone.length > 0) score += weights.phone;
  if (profile.email && profile.email.length > 0) score += weights.email;
  if (profile.specializations && profile.specializations.length > 0) score += weights.specializations;
  if (profile.therapyTypes && profile.therapyTypes.length > 0) score += weights.therapyTypes;
  if (profile.education && profile.education.length > 0) score += weights.education;
  if (profile.certifications && profile.certifications.length > 0) score += weights.certifications;
  if (profile.galleryImages && profile.galleryImages.length > 0) score += weights.galleryImages;
  if (profile.pricePerSession && profile.pricePerSession > 0) score += weights.pricePerSession;

  return Math.min(100, score);
}

interface UpdateThemeData {
  themeName: ThemeName;
  themeColor: string;
  headline?: string;
}

/**
 * Update theme settings for a therapist profile
 * Requires at least "mittel" tier
 */
export async function updateTheme(
  data: UpdateThemeData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, accountType: true },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    // Check tier access
    if (profile.accountType === "gratis") {
      return { success: false, error: "Upgrade erforderlich für Theme-Anpassungen" };
    }

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        themeName: data.themeName,
        themeColor: data.themeColor,
        headline: data.headline,
      },
    });

    revalidatePath("/dashboard/customize");

    return { success: true };
  } catch (error) {
    console.error("Failed to update theme:", error);
    return { success: false, error: "Fehler beim Speichern" };
  }
}
