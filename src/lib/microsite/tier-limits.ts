import type { AccountType } from "@/types/therapist";
import type { MicrositeTierLimits, TierLimitsMap } from "@/types/microsite";

/**
 * Tier-based limits for microsite builder features
 */
export const TIER_LIMITS: TierLimitsMap = {
  gratis: {
    // Branding
    canUploadLogo: false,
    canUploadHeroImage: false,
    canUploadProfileImage: false,

    // Theme
    allowedPaletteCount: 3,
    allowedFontCount: 2,
    canCustomizeColors: false,
    canUseEffects: false,

    // Content
    maxCompetencies: 3,
    maxOfferings: 2,
    canReorderSections: false,
    canHideSections: false,

    // Features
    hasAutoSave: false,
    hasUndoRedo: false,
  },

  mittel: {
    // Branding
    canUploadLogo: false,
    canUploadHeroImage: true,
    canUploadProfileImage: true,

    // Theme
    allowedPaletteCount: 5,
    allowedFontCount: 6,
    canCustomizeColors: true,
    canUseEffects: false,

    // Content
    maxCompetencies: 8,
    maxOfferings: 6,
    canReorderSections: false,
    canHideSections: true,

    // Features
    hasAutoSave: true,
    hasUndoRedo: false,
  },

  premium: {
    // Branding
    canUploadLogo: true,
    canUploadHeroImage: true,
    canUploadProfileImage: true,

    // Theme
    allowedPaletteCount: Infinity,
    allowedFontCount: 12,
    canCustomizeColors: true,
    canUseEffects: true,

    // Content
    maxCompetencies: Infinity,
    maxOfferings: Infinity,
    canReorderSections: true,
    canHideSections: true,

    // Features
    hasAutoSave: true,
    hasUndoRedo: true,
  },
};

/**
 * Get tier limits for a specific account type
 */
export function getTierLimits(accountType: AccountType): MicrositeTierLimits {
  return TIER_LIMITS[accountType];
}

/**
 * Check if a feature is available for a tier
 */
export function hasFeatureAccess(
  accountType: AccountType,
  feature: keyof MicrositeTierLimits
): boolean {
  const limits = TIER_LIMITS[accountType];
  const value = limits[feature];

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  return false;
}

/**
 * Get the minimum tier required for a feature
 */
export function getRequiredTier(feature: keyof MicrositeTierLimits): AccountType {
  if (hasFeatureAccess("gratis", feature)) {
    return "gratis";
  }
  if (hasFeatureAccess("mittel", feature)) {
    return "mittel";
  }
  return "premium";
}

/**
 * Validate content against tier limits
 */
export interface TierValidationResult {
  valid: boolean;
  errors: TierValidationError[];
}

export interface TierValidationError {
  field: string;
  message: string;
  requiredTier: AccountType;
}

export function validateAgainstTierLimits(
  accountType: AccountType,
  data: {
    competenciesCount?: number;
    offeringsCount?: number;
    hasLogo?: boolean;
    hasHeroImage?: boolean;
    hasProfileImage?: boolean;
    hasCustomColors?: boolean;
    hasEffects?: boolean;
    hasSectionReorder?: boolean;
  }
): TierValidationResult {
  const limits = TIER_LIMITS[accountType];
  const errors: TierValidationError[] = [];

  // Check competencies count
  if (data.competenciesCount !== undefined && data.competenciesCount > limits.maxCompetencies) {
    errors.push({
      field: "competencies",
      message: `Maximal ${limits.maxCompetencies} Kompetenzen für ${accountType}-Tier`,
      requiredTier: limits.maxCompetencies === 3 ? "mittel" : "premium",
    });
  }

  // Check offerings count
  if (data.offeringsCount !== undefined && data.offeringsCount > limits.maxOfferings) {
    errors.push({
      field: "offerings",
      message: `Maximal ${limits.maxOfferings} Angebote für ${accountType}-Tier`,
      requiredTier: limits.maxOfferings === 2 ? "mittel" : "premium",
    });
  }

  // Check logo upload
  if (data.hasLogo && !limits.canUploadLogo) {
    errors.push({
      field: "heroLogoUrl",
      message: "Logo-Upload erfordert Premium-Tier",
      requiredTier: "premium",
    });
  }

  // Check hero image
  if (data.hasHeroImage && !limits.canUploadHeroImage) {
    errors.push({
      field: "heroCoverImageUrl",
      message: "Titelbild erfordert Mittel-Tier oder höher",
      requiredTier: "mittel",
    });
  }

  // Check profile image
  if (data.hasProfileImage && !limits.canUploadProfileImage) {
    errors.push({
      field: "imageUrl",
      message: "Profilbild erfordert Mittel-Tier oder höher",
      requiredTier: "mittel",
    });
  }

  // Check custom colors
  if (data.hasCustomColors && !limits.canCustomizeColors) {
    errors.push({
      field: "theme.colors",
      message: "Individuelle Farben erfordern Mittel-Tier oder höher",
      requiredTier: "mittel",
    });
  }

  // Check effects
  if (data.hasEffects && !limits.canUseEffects) {
    errors.push({
      field: "theme.effects",
      message: "Effekte erfordern Premium-Tier",
      requiredTier: "premium",
    });
  }

  // Check section reorder
  if (data.hasSectionReorder && !limits.canReorderSections) {
    errors.push({
      field: "sectionOrder",
      message: "Abschnitte neu anordnen erfordert Premium-Tier",
      requiredTier: "premium",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Allowed fonts per tier
 */
export const ALLOWED_FONTS: Record<AccountType, string[]> = {
  gratis: ["Inter", "Open Sans"],
  mittel: ["Inter", "Open Sans", "Lato", "Roboto", "Source Sans 3", "Nunito"],
  premium: [
    "Inter",
    "Open Sans",
    "Lato",
    "Roboto",
    "Source Sans 3",
    "Nunito",
    "Playfair Display",
    "Cormorant Garamond",
    "Libre Baskerville",
    "Merriweather",
    "Crimson Pro",
    "DM Sans",
  ],
};

/**
 * Allowed theme presets per tier
 */
export const ALLOWED_PRESETS: Record<AccountType, string[]> = {
  gratis: ["warm", "clinical", "minimal"],
  mittel: ["calm", "clinical", "warm", "modern", "minimal"],
  premium: ["calm", "clinical", "warm", "modern", "minimal"], // Plus custom
};

/**
 * Get allowed fonts for a tier
 */
export function getAllowedFonts(accountType: AccountType): string[] {
  return ALLOWED_FONTS[accountType];
}

/**
 * Get allowed presets for a tier
 */
export function getAllowedPresets(accountType: AccountType): string[] {
  return ALLOWED_PRESETS[accountType];
}
