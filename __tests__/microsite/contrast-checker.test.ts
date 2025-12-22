import { describe, it, expect } from "vitest";
import {
  getContrastRatio,
  validateContrast,
  validateThemeContrast,
  isLightColor,
  getTextColorForBackground,
  blendColors,
  adjustLightness,
} from "@/lib/microsite/contrast-checker";
import type { ThemeColors } from "@/types/microsite";

describe("Contrast Checker", () => {
  describe("getContrastRatio", () => {
    it("should return 21 for black on white", () => {
      const ratio = getContrastRatio("#000000", "#FFFFFF");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should return 21 for white on black", () => {
      const ratio = getContrastRatio("#FFFFFF", "#000000");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should return 1 for same colors", () => {
      const ratio = getContrastRatio("#FF0000", "#FF0000");
      expect(ratio).toBe(1);
    });

    it("should handle 3-character hex codes", () => {
      const ratio = getContrastRatio("#000", "#FFF");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should handle hex codes without #", () => {
      const ratio = getContrastRatio("000000", "FFFFFF");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should return 0 for invalid hex codes", () => {
      const ratio = getContrastRatio("invalid", "#FFFFFF");
      expect(ratio).toBe(0);
    });

    it("should calculate correct ratio for gray on white", () => {
      // Gray #767676 on white #FFFFFF should have ratio around 4.5
      const ratio = getContrastRatio("#767676", "#FFFFFF");
      expect(ratio).toBeGreaterThan(4.4);
      expect(ratio).toBeLessThan(4.6);
    });
  });

  describe("validateContrast", () => {
    it("should pass WCAG AA for high contrast combinations", () => {
      const result = validateContrast("#000000", "#FFFFFF");
      expect(result.isValid).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("should fail WCAG AA for low contrast combinations", () => {
      const result = validateContrast("#CCCCCC", "#FFFFFF");
      expect(result.isValid).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    });

    it("should use lower threshold (3:1) for large text", () => {
      // This color combination might fail for normal text but pass for large
      const result = validateContrast("#888888", "#FFFFFF", true);
      expect(result.requiredRatio).toBe(3);
    });

    it("should suggest better color when contrast is insufficient", () => {
      const result = validateContrast("#BBBBBB", "#FFFFFF");
      expect(result.isValid).toBe(false);
      expect(result.suggestion).toBeDefined();
      expect(result.suggestion).not.toBe("#BBBBBB");
    });

    it("should round ratio to 2 decimal places", () => {
      const result = validateContrast("#333333", "#FFFFFF");
      const decimalPlaces = result.ratio.toString().split(".")[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe("validateThemeContrast", () => {
    it("should validate all theme color combinations", () => {
      const goodTheme: ThemeColors = {
        primary: "#2563EB",
        secondary: "#EFF6FF",
        background: "#FFFFFF",
        surface: "#FAFAFA",
        text: "#18181B",
        accent: "#3B82F6",
      };

      const result = validateThemeContrast(goodTheme);
      expect(result.textOnBackground.isValid).toBe(true);
      expect(result.textOnSurface.isValid).toBe(true);
    });

    it("should report errors for poor contrast", () => {
      const badTheme: ThemeColors = {
        primary: "#CCCCCC",
        secondary: "#EEEEEE",
        background: "#FFFFFF",
        surface: "#FFFFFF",
        text: "#AAAAAA", // Too light for white background
        accent: "#DDDDDD",
      };

      const result = validateThemeContrast(badTheme);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate primary on background as large text", () => {
      const theme: ThemeColors = {
        primary: "#888888",
        secondary: "#EEEEEE",
        background: "#FFFFFF",
        surface: "#FFFFFF",
        text: "#000000",
        accent: "#666666",
      };

      const result = validateThemeContrast(theme);
      // Primary is validated as large text (3:1 ratio)
      expect(result.primaryOnBackground.requiredRatio).toBe(3);
    });
  });

  describe("isLightColor", () => {
    it("should return true for white", () => {
      expect(isLightColor("#FFFFFF")).toBe(true);
    });

    it("should return false for black", () => {
      expect(isLightColor("#000000")).toBe(false);
    });

    it("should return true for light colors", () => {
      expect(isLightColor("#F0F0F0")).toBe(true);
      expect(isLightColor("#FAFAFA")).toBe(true);
    });

    it("should return false for dark colors", () => {
      expect(isLightColor("#333333")).toBe(false);
      expect(isLightColor("#18181B")).toBe(false);
    });

    it("should return true for invalid hex (default)", () => {
      expect(isLightColor("invalid")).toBe(true);
    });
  });

  describe("getTextColorForBackground", () => {
    it("should return dark text for light backgrounds", () => {
      expect(getTextColorForBackground("#FFFFFF")).toBe("#18181B");
      expect(getTextColorForBackground("#FAFAFA")).toBe("#18181B");
    });

    it("should return light text for dark backgrounds", () => {
      expect(getTextColorForBackground("#000000")).toBe("#FAFAFA");
      expect(getTextColorForBackground("#333333")).toBe("#FAFAFA");
    });
  });

  describe("blendColors", () => {
    it("should return first color at ratio 0", () => {
      const result = blendColors("#FF0000", "#0000FF", 0);
      expect(result.toUpperCase()).toBe("#FF0000");
    });

    it("should return second color at ratio 1", () => {
      const result = blendColors("#FF0000", "#0000FF", 1);
      expect(result.toUpperCase()).toBe("#0000FF");
    });

    it("should blend colors at 0.5 ratio", () => {
      const result = blendColors("#FF0000", "#0000FF", 0.5);
      // Should be purple-ish (middle between red and blue)
      expect(result.toUpperCase()).toBe("#800080");
    });

    it("should return first color for invalid second color", () => {
      const result = blendColors("#FF0000", "invalid", 0.5);
      expect(result).toBe("#FF0000");
    });
  });

  describe("adjustLightness", () => {
    it("should lighten color with positive amount", () => {
      const result = adjustLightness("#808080", 0.5);
      // Should be lighter than original
      expect(parseInt(result.substring(1, 3), 16)).toBeGreaterThan(0x80);
    });

    it("should darken color with negative amount", () => {
      const result = adjustLightness("#808080", -0.5);
      // Should be darker than original
      expect(parseInt(result.substring(1, 3), 16)).toBeLessThan(0x80);
    });

    it("should not exceed #FFFFFF when lightening", () => {
      const result = adjustLightness("#FFFFFF", 1);
      expect(result.toUpperCase()).toBe("#FFFFFF");
    });

    it("should not go below #000000 when darkening", () => {
      const result = adjustLightness("#000000", -1);
      expect(result.toUpperCase()).toBe("#000000");
    });

    it("should return original for invalid hex", () => {
      const result = adjustLightness("invalid", 0.5);
      expect(result).toBe("invalid");
    });
  });
});
