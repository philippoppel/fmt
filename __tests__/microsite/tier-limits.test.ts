import { describe, it, expect } from "vitest";
import {
  TIER_LIMITS,
  getTierLimits,
  hasFeatureAccess,
  getRequiredTier,
  validateAgainstTierLimits,
  getAllowedFonts,
  getAllowedPresets,
  ALLOWED_FONTS,
  ALLOWED_PRESETS,
} from "@/lib/microsite/tier-limits";
import type { AccountType } from "@/types/therapist";

describe("Tier Limits", () => {
  describe("TIER_LIMITS configuration", () => {
    it("should have all three tiers defined", () => {
      expect(TIER_LIMITS.gratis).toBeDefined();
      expect(TIER_LIMITS.mittel).toBeDefined();
      expect(TIER_LIMITS.premium).toBeDefined();
    });

    it("should have progressively more features as tiers increase", () => {
      expect(TIER_LIMITS.gratis.maxCompetencies).toBeLessThan(
        TIER_LIMITS.mittel.maxCompetencies
      );
      expect(TIER_LIMITS.mittel.maxCompetencies).toBeLessThan(
        TIER_LIMITS.premium.maxCompetencies
      );
    });

    it("should restrict logo upload to premium only", () => {
      expect(TIER_LIMITS.gratis.canUploadLogo).toBe(false);
      expect(TIER_LIMITS.mittel.canUploadLogo).toBe(false);
      expect(TIER_LIMITS.premium.canUploadLogo).toBe(true);
    });

    it("should allow hero image for mittel and premium", () => {
      expect(TIER_LIMITS.gratis.canUploadHeroImage).toBe(false);
      expect(TIER_LIMITS.mittel.canUploadHeroImage).toBe(true);
      expect(TIER_LIMITS.premium.canUploadHeroImage).toBe(true);
    });

    it("should have unlimited competencies for premium", () => {
      expect(TIER_LIMITS.premium.maxCompetencies).toBe(Infinity);
    });

    it("should have auto-save for mittel and premium", () => {
      expect(TIER_LIMITS.gratis.hasAutoSave).toBe(false);
      expect(TIER_LIMITS.mittel.hasAutoSave).toBe(true);
      expect(TIER_LIMITS.premium.hasAutoSave).toBe(true);
    });
  });

  describe("getTierLimits", () => {
    it("should return correct limits for gratis", () => {
      const limits = getTierLimits("gratis");
      expect(limits.maxCompetencies).toBe(3);
      expect(limits.canUploadLogo).toBe(false);
    });

    it("should return correct limits for mittel", () => {
      const limits = getTierLimits("mittel");
      expect(limits.maxCompetencies).toBe(8);
      expect(limits.canUploadHeroImage).toBe(true);
    });

    it("should return correct limits for premium", () => {
      const limits = getTierLimits("premium");
      expect(limits.maxCompetencies).toBe(Infinity);
      expect(limits.canReorderSections).toBe(true);
    });
  });

  describe("hasFeatureAccess", () => {
    it("should correctly identify boolean features", () => {
      expect(hasFeatureAccess("gratis", "canUploadLogo")).toBe(false);
      expect(hasFeatureAccess("premium", "canUploadLogo")).toBe(true);
    });

    it("should return true for numeric features > 0", () => {
      expect(hasFeatureAccess("gratis", "maxCompetencies")).toBe(true);
      expect(hasFeatureAccess("mittel", "allowedFontCount")).toBe(true);
    });

    it("should correctly check all tier features", () => {
      // Gratis limitations
      expect(hasFeatureAccess("gratis", "canUploadHeroImage")).toBe(false);
      expect(hasFeatureAccess("gratis", "hasAutoSave")).toBe(false);

      // Mittel features
      expect(hasFeatureAccess("mittel", "canUploadHeroImage")).toBe(true);
      expect(hasFeatureAccess("mittel", "canCustomizeColors")).toBe(true);

      // Premium features
      expect(hasFeatureAccess("premium", "canUseEffects")).toBe(true);
      expect(hasFeatureAccess("premium", "hasUndoRedo")).toBe(true);
    });
  });

  describe("getRequiredTier", () => {
    it("should return gratis for basic features", () => {
      // All tiers have some competencies
      expect(getRequiredTier("maxCompetencies")).toBe("gratis");
    });

    it("should return mittel for mid-tier features", () => {
      expect(getRequiredTier("canUploadHeroImage")).toBe("mittel");
      expect(getRequiredTier("canCustomizeColors")).toBe("mittel");
    });

    it("should return premium for premium-only features", () => {
      expect(getRequiredTier("canUploadLogo")).toBe("premium");
      expect(getRequiredTier("canReorderSections")).toBe("premium");
      expect(getRequiredTier("canUseEffects")).toBe("premium");
    });
  });

  describe("validateAgainstTierLimits", () => {
    describe("gratis tier", () => {
      it("should pass for valid gratis content", () => {
        const result = validateAgainstTierLimits("gratis", {
          competenciesCount: 3,
          offeringsCount: 2,
        });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should fail when exceeding competency limit", () => {
        const result = validateAgainstTierLimits("gratis", {
          competenciesCount: 5,
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === "competencies")).toBe(true);
      });

      it("should fail when using logo", () => {
        const result = validateAgainstTierLimits("gratis", {
          hasLogo: true,
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === "heroLogoUrl")).toBe(true);
      });

      it("should fail when using hero image", () => {
        const result = validateAgainstTierLimits("gratis", {
          hasHeroImage: true,
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === "heroCoverImageUrl")).toBe(true);
      });

      it("should fail when using custom colors", () => {
        const result = validateAgainstTierLimits("gratis", {
          hasCustomColors: true,
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === "theme.colors")).toBe(true);
      });
    });

    describe("mittel tier", () => {
      it("should pass for valid mittel content", () => {
        const result = validateAgainstTierLimits("mittel", {
          competenciesCount: 8,
          offeringsCount: 6,
          hasHeroImage: true,
          hasProfileImage: true,
          hasCustomColors: true,
        });
        expect(result.valid).toBe(true);
      });

      it("should fail when exceeding competency limit", () => {
        const result = validateAgainstTierLimits("mittel", {
          competenciesCount: 10,
        });
        expect(result.valid).toBe(false);
      });

      it("should fail when using logo", () => {
        const result = validateAgainstTierLimits("mittel", {
          hasLogo: true,
        });
        expect(result.valid).toBe(false);
      });

      it("should fail when using effects", () => {
        const result = validateAgainstTierLimits("mittel", {
          hasEffects: true,
        });
        expect(result.valid).toBe(false);
      });

      it("should fail when reordering sections", () => {
        const result = validateAgainstTierLimits("mittel", {
          hasSectionReorder: true,
        });
        expect(result.valid).toBe(false);
      });
    });

    describe("premium tier", () => {
      it("should pass for any valid content", () => {
        const result = validateAgainstTierLimits("premium", {
          competenciesCount: 100,
          offeringsCount: 50,
          hasLogo: true,
          hasHeroImage: true,
          hasProfileImage: true,
          hasCustomColors: true,
          hasEffects: true,
          hasSectionReorder: true,
        });
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should include required tier in error", () => {
      const result = validateAgainstTierLimits("gratis", {
        hasLogo: true,
      });
      expect(result.errors[0].requiredTier).toBe("premium");
    });
  });

  describe("getAllowedFonts", () => {
    it("should return correct fonts for each tier", () => {
      expect(getAllowedFonts("gratis")).toHaveLength(2);
      expect(getAllowedFonts("mittel")).toHaveLength(6);
      expect(getAllowedFonts("premium")).toHaveLength(12);
    });

    it("should include Inter for all tiers", () => {
      expect(getAllowedFonts("gratis")).toContain("Inter");
      expect(getAllowedFonts("mittel")).toContain("Inter");
      expect(getAllowedFonts("premium")).toContain("Inter");
    });

    it("should only include serif fonts for premium", () => {
      expect(getAllowedFonts("gratis")).not.toContain("Playfair Display");
      expect(getAllowedFonts("mittel")).not.toContain("Playfair Display");
      expect(getAllowedFonts("premium")).toContain("Playfair Display");
    });
  });

  describe("getAllowedPresets", () => {
    it("should return correct presets for each tier", () => {
      expect(getAllowedPresets("gratis")).toHaveLength(3);
      expect(getAllowedPresets("mittel")).toHaveLength(5);
      expect(getAllowedPresets("premium")).toHaveLength(5);
    });

    it("should include warm preset for all tiers", () => {
      expect(getAllowedPresets("gratis")).toContain("warm");
      expect(getAllowedPresets("mittel")).toContain("warm");
      expect(getAllowedPresets("premium")).toContain("warm");
    });

    it("should only include calm preset for mittel and premium", () => {
      expect(getAllowedPresets("gratis")).not.toContain("calm");
      expect(getAllowedPresets("mittel")).toContain("calm");
      expect(getAllowedPresets("premium")).toContain("calm");
    });
  });

  describe("ALLOWED_FONTS constant", () => {
    it("should be properly typed", () => {
      const tiers: AccountType[] = ["gratis", "mittel", "premium"];
      tiers.forEach((tier) => {
        expect(Array.isArray(ALLOWED_FONTS[tier])).toBe(true);
      });
    });
  });

  describe("ALLOWED_PRESETS constant", () => {
    it("should be properly typed", () => {
      const tiers: AccountType[] = ["gratis", "mittel", "premium"];
      tiers.forEach((tier) => {
        expect(Array.isArray(ALLOWED_PRESETS[tier])).toBe(true);
      });
    });
  });
});
