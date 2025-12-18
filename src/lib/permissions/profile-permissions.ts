/**
 * Tiered Permission System for Therapist Profiles
 *
 * Defines what each subscription tier can access and edit.
 */

import type { AccountType } from "@/types/therapist";
import type { ThemeName } from "@/types/profile";

// All possible editable fields
export type ProfileField =
  // Basic Info
  | "name"
  | "title"
  | "imageUrl"
  | "shortDescription"
  | "headline"
  | "longDescription"
  // Location
  | "city"
  | "postalCode"
  | "street"
  | "practiceName"
  // Professional
  | "specializations"
  | "specializationRanks"
  | "therapyTypes"
  | "languages"
  | "insurance"
  // Pricing & Availability
  | "pricePerSession"
  | "sessionType"
  | "availability"
  | "gender"
  // Contact
  | "phone"
  | "email"
  | "website"
  | "linkedIn"
  | "instagram"
  // Extended Profile
  | "education"
  | "certifications"
  | "memberships"
  | "experienceYears"
  // Images & Media
  | "galleryImages"
  | "officeImages"
  | "videoIntroUrl"
  // Therapy Style
  | "communicationStyle"
  | "usesHomework"
  | "therapyFocus"
  | "clientTalkRatio"
  | "therapyDepth"
  // Theme
  | "themeName"
  | "themeColor"
  // Features
  | "offersTrialSession"
  | "trialSessionPrice"
  | "firstSessionInfo"
  | "consultationInfo";

export interface TierPermissions {
  // Core permissions
  canEdit: boolean;
  tierLabel: string;
  tierLabelKey: string; // i18n key

  // Limits
  maxSpecializations: number;
  maxSpecializationsRanked: number;
  maxImages: number;
  maxGalleryImages: number;
  maxOfficeImages: number;

  // Allowed themes
  allowedThemes: ThemeName[];

  // Editable fields (or "all" for premium)
  editableFields: ProfileField[] | "all";

  // Feature flags
  allowVideoIntro: boolean;
  allowTherapyStyle: boolean;
  allowExtendedProfile: boolean;
  allowCustomTheme: boolean;
  allowSocialLinks: boolean;
  allowTrialSession: boolean;
}

// Fields available for "mittel" tier
const MITTEL_FIELDS: ProfileField[] = [
  // Basic Info
  "name",
  "title",
  "imageUrl",
  "shortDescription",
  // Location
  "city",
  "postalCode",
  // Professional
  "specializations",
  "specializationRanks",
  "therapyTypes",
  "languages",
  "insurance",
  // Pricing & Availability
  "pricePerSession",
  "sessionType",
  "availability",
  "gender",
  // Basic Contact
  "phone",
  "email",
  // Basic Theme
  "themeName",
];

export const TIER_PERMISSIONS: Record<AccountType, TierPermissions> = {
  gratis: {
    canEdit: false,
    tierLabel: "Gratis",
    tierLabelKey: "pricing.tiers.gratis",

    maxSpecializations: 0,
    maxSpecializationsRanked: 0,
    maxImages: 0,
    maxGalleryImages: 0,
    maxOfficeImages: 0,

    allowedThemes: [],
    editableFields: [],

    allowVideoIntro: false,
    allowTherapyStyle: false,
    allowExtendedProfile: false,
    allowCustomTheme: false,
    allowSocialLinks: false,
    allowTrialSession: false,
  },

  mittel: {
    canEdit: true,
    tierLabel: "Basis",
    tierLabelKey: "pricing.tiers.mittel",

    maxSpecializations: 3,
    maxSpecializationsRanked: 1,
    maxImages: 3,
    maxGalleryImages: 2,
    maxOfficeImages: 1,

    allowedThemes: ["warm", "professional"],
    editableFields: MITTEL_FIELDS,

    allowVideoIntro: false,
    allowTherapyStyle: false,
    allowExtendedProfile: false,
    allowCustomTheme: false,
    allowSocialLinks: false,
    allowTrialSession: false,
  },

  premium: {
    canEdit: true,
    tierLabel: "Premium",
    tierLabelKey: "pricing.tiers.premium",

    maxSpecializations: 8,
    maxSpecializationsRanked: 3,
    maxImages: 20,
    maxGalleryImages: 10,
    maxOfficeImages: 10,

    allowedThemes: ["warm", "cool", "nature", "professional", "minimal"],
    editableFields: "all",

    allowVideoIntro: true,
    allowTherapyStyle: true,
    allowExtendedProfile: true,
    allowCustomTheme: true,
    allowSocialLinks: true,
    allowTrialSession: true,
  },
};

/**
 * Check if a field can be edited by a given tier
 */
export function canEditField(accountType: AccountType, field: ProfileField): boolean {
  const permissions = TIER_PERMISSIONS[accountType];

  if (!permissions.canEdit) {
    return false;
  }

  if (permissions.editableFields === "all") {
    return true;
  }

  return permissions.editableFields.includes(field);
}

/**
 * Check if a field is locked (requires upgrade)
 */
export function isFieldLocked(accountType: AccountType, field: ProfileField): boolean {
  return !canEditField(accountType, field);
}

/**
 * Get the minimum tier required to edit a field
 */
export function getRequiredTierForField(field: ProfileField): AccountType {
  // Check if mittel can edit
  if (MITTEL_FIELDS.includes(field)) {
    return "mittel";
  }
  // Otherwise premium required
  return "premium";
}

/**
 * Get all permissions for a tier
 */
export function getPermissions(accountType: AccountType): TierPermissions {
  return TIER_PERMISSIONS[accountType];
}

/**
 * Validate profile data against tier limits
 */
export function validateAgainstTier(
  accountType: AccountType,
  data: {
    specializations?: string[];
    specializationRanks?: Record<string, number>;
    galleryImages?: string[];
    officeImages?: string[];
    themeName?: string;
  }
): { valid: boolean; errors: string[] } {
  const permissions = TIER_PERMISSIONS[accountType];
  const errors: string[] = [];

  if (!permissions.canEdit) {
    errors.push("Gratis accounts cannot edit profile");
    return { valid: false, errors };
  }

  // Check specializations limit
  if (data.specializations && data.specializations.length > permissions.maxSpecializations) {
    errors.push(`Maximum ${permissions.maxSpecializations} specializations allowed`);
  }

  // Check ranked specializations limit
  if (data.specializationRanks) {
    const rankedCount = Object.keys(data.specializationRanks).length;
    if (rankedCount > permissions.maxSpecializationsRanked) {
      errors.push(`Maximum ${permissions.maxSpecializationsRanked} ranked specializations allowed`);
    }
  }

  // Check gallery images limit
  if (data.galleryImages && data.galleryImages.length > permissions.maxGalleryImages) {
    errors.push(`Maximum ${permissions.maxGalleryImages} gallery images allowed`);
  }

  // Check office images limit
  if (data.officeImages && data.officeImages.length > permissions.maxOfficeImages) {
    errors.push(`Maximum ${permissions.maxOfficeImages} office images allowed`);
  }

  // Check theme
  if (data.themeName && !permissions.allowedThemes.includes(data.themeName as ThemeName)) {
    errors.push(`Theme '${data.themeName}' not available in your plan`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Feature comparison for pricing page
 */
export const FEATURE_COMPARISON = [
  {
    key: "editProfile",
    labelKey: "pricing.features.editProfile",
    gratis: false,
    mittel: true,
    premium: true,
  },
  {
    key: "searchVisibility",
    labelKey: "pricing.features.searchVisibility",
    gratis: true,
    mittel: true,
    premium: true,
  },
  {
    key: "specializations",
    labelKey: "pricing.features.specializations",
    gratis: "0",
    mittel: "3 (1 ranked)",
    premium: "8 (3 ranked)",
  },
  {
    key: "images",
    labelKey: "pricing.features.images",
    gratis: "0",
    mittel: "3",
    premium: "20",
  },
  {
    key: "themes",
    labelKey: "pricing.features.themes",
    gratis: "-",
    mittel: "2",
    premium: "5 + Custom",
  },
  {
    key: "videoIntro",
    labelKey: "pricing.features.videoIntro",
    gratis: false,
    mittel: false,
    premium: true,
  },
  {
    key: "therapyStyle",
    labelKey: "pricing.features.therapyStyle",
    gratis: false,
    mittel: false,
    premium: true,
  },
  {
    key: "extendedProfile",
    labelKey: "pricing.features.extendedProfile",
    gratis: false,
    mittel: false,
    premium: true,
  },
  {
    key: "socialLinks",
    labelKey: "pricing.features.socialLinks",
    gratis: false,
    mittel: false,
    premium: true,
  },
  {
    key: "trialSession",
    labelKey: "pricing.features.trialSession",
    gratis: false,
    mittel: false,
    premium: true,
  },
  {
    key: "matchingBoost",
    labelKey: "pricing.features.matchingBoost",
    gratis: false,
    mittel: false,
    premium: true,
  },
];
