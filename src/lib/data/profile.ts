import { db } from "@/lib/db";
import type { TherapistProfileData, WorkingHours, ThemeName } from "@/types/profile";
import type { Specialty, TherapyType, Language, SessionType, Insurance, Availability, Gender, CommunicationStyle, TherapyFocus, TherapyDepth, AccountType } from "@/types/therapist";
import { getDemoProfileBySlug, getAllDemoProfileSlugs as getDemoSlugs } from "./demo-profiles";

/**
 * Get a therapist profile by slug for public display
 * Falls back to ID lookup if slug not found, then demo profiles
 */
export async function getProfileBySlug(slug: string): Promise<TherapistProfileData | null> {
  try {
    // First try to find by slug
    let profile = await db.therapistProfile.findUnique({
      where: { slug, isPublished: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // If not found by slug, try to find by ID (fallback for profiles without slugs)
    if (!profile) {
      profile = await db.therapistProfile.findFirst({
        where: { id: slug, isPublished: true },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    }

    if (profile) {
      return transformProfileToData(profile);
    }

    // Fallback to demo profile
    const demoProfile = getDemoProfileBySlug(slug);
    if (demoProfile) {
      return transformDemoProfileToData(demoProfile);
    }

    return null;
  } catch {
    // On database error, try demo profiles
    const demoProfile = getDemoProfileBySlug(slug);
    if (demoProfile) {
      return transformDemoProfileToData(demoProfile);
    }
    return null;
  }
}

/**
 * Get a therapist profile by ID
 */
export async function getProfileById(id: string): Promise<TherapistProfileData | null> {
  try {
    const profile = await db.therapistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!profile) return null;

    return transformProfileToData(profile);
  } catch {
    return null;
  }
}

/**
 * Get a therapist profile by user ID (for editing own profile)
 */
export async function getProfileByUserId(userId: string): Promise<TherapistProfileData | null> {
  try {
    const profile = await db.therapistProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!profile) return null;

    return transformProfileToData(profile);
  } catch {
    return null;
  }
}

/**
 * Get all published profile slugs for static generation
 * Includes demo profiles as fallback
 */
export async function getAllProfileSlugs(): Promise<string[]> {
  try {
    const profiles = await db.therapistProfile.findMany({
      where: { isPublished: true, slug: { not: null } },
      select: { slug: true },
    });

    const dbSlugs = profiles.map((p: { slug: string | null }) => p.slug).filter((slug: string | null): slug is string => slug !== null);

    // Add demo slugs if no DB profiles found
    if (dbSlugs.length === 0) {
      return getDemoSlugs();
    }

    return dbSlugs;
  } catch {
    // Fallback to demo slugs on error
    return getDemoSlugs();
  }
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string, excludeUserId?: string): Promise<boolean> {
  try {
    const existing = await db.therapistProfile.findUnique({
      where: { slug },
      select: { userId: true },
    });

    if (!existing) return true;
    if (excludeUserId && existing.userId === excludeUserId) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Generate a slug from a name
 */
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

// Helper function to transform database profile to frontend data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProfileToData(profile: any): TherapistProfileData {
  return {
    id: profile.id,
    slug: profile.slug || "",
    userId: profile.userId,

    // Basic Info
    name: profile.user?.name || "Unbekannt",
    title: profile.title || "",
    imageUrl: profile.imageUrl || "/images/placeholder-avatar.jpg",
    headline: profile.headline || "",
    shortDescription: profile.shortDescription || "",
    longDescription: profile.longDescription || "",

    // Location
    city: profile.city || "",
    postalCode: profile.postalCode || "",
    street: profile.street || "",
    practiceName: profile.practiceName || "",

    // Professional Details
    specializations: (profile.specializations || []) as Specialty[],
    specializationRanks: (profile.specializationRanks as Record<string, number>) || {},
    therapyTypes: (profile.therapyTypes || []) as TherapyType[],
    languages: (profile.languages || []) as Language[],
    insurance: (profile.insurance || []) as Insurance[],

    // Qualifications
    education: profile.education || [],
    certifications: profile.certifications || [],
    memberships: profile.memberships || [],
    experienceYears: profile.experienceYears || 0,

    // Pricing & Availability
    pricePerSession: profile.pricePerSession || 0,
    sessionType: (profile.sessionType || "both") as SessionType,
    availability: (profile.availability || "flexible") as Availability,
    gender: (profile.gender || "diverse") as Gender,
    workingHours: profile.workingHours as WorkingHours | null,

    // Ratings
    rating: profile.rating || 0,
    reviewCount: profile.reviewCount || 0,

    // Images
    galleryImages: profile.galleryImages || [],
    officeImages: profile.officeImages || [],

    // Contact
    phone: profile.phone || "",
    email: profile.email || profile.user?.email || "",
    website: profile.website || "",
    linkedIn: profile.linkedIn || "",
    instagram: profile.instagram || "",

    // Theme
    themeColor: profile.themeColor || "#8B7355",
    themeName: (profile.themeName || "warm") as ThemeName,

    // Additional Info
    consultationInfo: profile.consultationInfo || "",
    firstSessionInfo: profile.firstSessionInfo || "",
    videoIntroUrl: profile.videoIntroUrl || "",
    offersTrialSession: profile.offersTrialSession || false,
    trialSessionPrice: profile.trialSessionPrice || 0,

    // Account & Verification
    accountType: (profile.accountType || "gratis") as AccountType,
    isVerified: profile.isVerified || false,

    // Therapy Style
    communicationStyle: (profile.communicationStyle || "balanced") as CommunicationStyle,
    usesHomework: profile.usesHomework ?? true,
    therapyFocus: (profile.therapyFocus || "holistic") as TherapyFocus,
    clientTalkRatio: profile.clientTalkRatio || 50,
    therapyDepth: (profile.therapyDepth || "flexible") as TherapyDepth,
  };
}

// Helper function to transform demo profile to frontend data
function transformDemoProfileToData(profile: Partial<TherapistProfileData>): TherapistProfileData {
  return {
    id: profile.id || "demo",
    slug: profile.slug || "",
    userId: profile.userId || "demo-user",

    // Basic Info
    name: profile.name || "Demo Therapeut",
    title: profile.title || "",
    imageUrl: profile.imageUrl || "/images/placeholder-avatar.jpg",
    headline: profile.headline || "",
    shortDescription: profile.shortDescription || "",
    longDescription: profile.longDescription || "",

    // Location
    city: profile.city || "",
    postalCode: profile.postalCode || "",
    street: profile.street || "",
    practiceName: profile.practiceName || "",

    // Professional Details
    specializations: (profile.specializations || []) as Specialty[],
    specializationRanks: profile.specializationRanks || {},
    therapyTypes: (profile.therapyTypes || []) as TherapyType[],
    languages: (profile.languages || []) as Language[],
    insurance: (profile.insurance || []) as Insurance[],

    // Qualifications
    education: profile.education || [],
    certifications: profile.certifications || [],
    memberships: profile.memberships || [],
    experienceYears: profile.experienceYears || 0,

    // Pricing & Availability
    pricePerSession: profile.pricePerSession || 0,
    sessionType: (profile.sessionType || "both") as SessionType,
    availability: (profile.availability || "flexible") as Availability,
    gender: (profile.gender || "diverse") as Gender,
    workingHours: profile.workingHours || null,

    // Ratings
    rating: profile.rating || 0,
    reviewCount: profile.reviewCount || 0,

    // Images
    galleryImages: profile.galleryImages || [],
    officeImages: profile.officeImages || [],

    // Contact
    phone: profile.phone || "",
    email: profile.email || "",
    website: profile.website || "",
    linkedIn: profile.linkedIn || "",
    instagram: profile.instagram || "",

    // Theme
    themeColor: profile.themeColor || "#8B7355",
    themeName: (profile.themeName || "warm") as ThemeName,

    // Additional Info
    consultationInfo: profile.consultationInfo || "",
    firstSessionInfo: profile.firstSessionInfo || "",
    videoIntroUrl: profile.videoIntroUrl || "",
    offersTrialSession: profile.offersTrialSession || false,
    trialSessionPrice: profile.trialSessionPrice || 0,

    // Account & Verification
    accountType: (profile.accountType || "gratis") as AccountType,
    isVerified: profile.isVerified || false,

    // Therapy Style
    communicationStyle: (profile.communicationStyle || "balanced") as CommunicationStyle,
    usesHomework: profile.usesHomework ?? true,
    therapyFocus: (profile.therapyFocus || "holistic") as TherapyFocus,
    clientTalkRatio: profile.clientTalkRatio || 50,
    therapyDepth: (profile.therapyDepth || "flexible") as TherapyDepth,
  };
}
