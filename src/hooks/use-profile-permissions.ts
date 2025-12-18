"use client";

import { useMemo } from "react";
import type { AccountType } from "@/types/therapist";
import type { ThemeName } from "@/types/profile";
import {
  TIER_PERMISSIONS,
  canEditField,
  isFieldLocked,
  getRequiredTierForField,
  validateAgainstTier,
  type ProfileField,
  type TierPermissions,
} from "@/lib/permissions/profile-permissions";

export interface UseProfilePermissionsReturn {
  // The full permissions object
  permissions: TierPermissions;

  // Convenience methods
  canEdit: boolean;
  canEditField: (field: ProfileField) => boolean;
  isFieldLocked: (field: ProfileField) => boolean;
  getRequiredTier: (field: ProfileField) => AccountType;

  // Limits
  maxSpecializations: number;
  maxSpecializationsRanked: number;
  maxImages: number;
  maxGalleryImages: number;
  maxOfficeImages: number;

  // Feature checks
  allowVideoIntro: boolean;
  allowTherapyStyle: boolean;
  allowExtendedProfile: boolean;
  allowCustomTheme: boolean;
  allowSocialLinks: boolean;
  allowTrialSession: boolean;

  // Theme
  allowedThemes: ThemeName[];
  isThemeAllowed: (theme: ThemeName) => boolean;

  // Validation
  validate: (data: Parameters<typeof validateAgainstTier>[1]) => ReturnType<typeof validateAgainstTier>;

  // Tier info
  tierLabel: string;
  tierLabelKey: string;
  isGratis: boolean;
  isMittel: boolean;
  isPremium: boolean;
}

/**
 * Hook to access profile permissions based on account type
 */
export function useProfilePermissions(accountType: AccountType): UseProfilePermissionsReturn {
  return useMemo(() => {
    const permissions = TIER_PERMISSIONS[accountType];

    return {
      permissions,

      // Core
      canEdit: permissions.canEdit,
      canEditField: (field: ProfileField) => canEditField(accountType, field),
      isFieldLocked: (field: ProfileField) => isFieldLocked(accountType, field),
      getRequiredTier: (field: ProfileField) => getRequiredTierForField(field),

      // Limits
      maxSpecializations: permissions.maxSpecializations,
      maxSpecializationsRanked: permissions.maxSpecializationsRanked,
      maxImages: permissions.maxImages,
      maxGalleryImages: permissions.maxGalleryImages,
      maxOfficeImages: permissions.maxOfficeImages,

      // Features
      allowVideoIntro: permissions.allowVideoIntro,
      allowTherapyStyle: permissions.allowTherapyStyle,
      allowExtendedProfile: permissions.allowExtendedProfile,
      allowCustomTheme: permissions.allowCustomTheme,
      allowSocialLinks: permissions.allowSocialLinks,
      allowTrialSession: permissions.allowTrialSession,

      // Theme
      allowedThemes: permissions.allowedThemes,
      isThemeAllowed: (theme: ThemeName) => permissions.allowedThemes.includes(theme),

      // Validation
      validate: (data) => validateAgainstTier(accountType, data),

      // Tier info
      tierLabel: permissions.tierLabel,
      tierLabelKey: permissions.tierLabelKey,
      isGratis: accountType === "gratis",
      isMittel: accountType === "mittel",
      isPremium: accountType === "premium",
    };
  }, [accountType]);
}
