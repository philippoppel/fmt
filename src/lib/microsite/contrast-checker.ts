import type { ContrastValidation, ThemeColors } from "@/types/microsite";

/**
 * WCAG 2.1 Contrast Requirements:
 * - Normal text (< 24px): 4.5:1 for AA, 7:1 for AAA
 * - Large text (>= 24px or >= 18.5px bold): 3:1 for AA, 4.5:1 for AAA
 * - UI components and graphics: 3:1 for AA
 */

const WCAG_AA_NORMAL_TEXT = 4.5;
const WCAG_AA_LARGE_TEXT = 3;
const WCAG_AAA_NORMAL_TEXT = 7;

/**
 * Parse hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, "");

  // Handle 3-char and 6-char hex
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (fullHex.length !== 6) {
    return null;
  }

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return 0;
  }

  const fgLuminance = getRelativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate color contrast meets WCAG AA requirements
 */
export function validateContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastValidation {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
  const isValid = ratio >= requiredRatio;

  let suggestion: string | undefined;
  if (!isValid) {
    suggestion = suggestBetterColor(foreground, background, requiredRatio);
  }

  return {
    isValid,
    ratio: Math.round(ratio * 100) / 100,
    requiredRatio,
    suggestion,
  };
}

/**
 * Suggest a color adjustment to meet contrast requirements
 */
function suggestBetterColor(
  foreground: string,
  background: string,
  requiredRatio: number
): string {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return foreground;
  }

  const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Determine if we should lighten or darken the foreground
  // Based on whether background is light or dark
  const shouldDarken = bgLuminance > 0.5;

  // Iteratively adjust until we meet the contrast
  let adjustedColor = { ...fgRgb };
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const currentRatio = getContrastRatio(
      rgbToHex(adjustedColor.r, adjustedColor.g, adjustedColor.b),
      background
    );

    if (currentRatio >= requiredRatio) {
      break;
    }

    if (shouldDarken) {
      // Darken the color
      adjustedColor.r = Math.max(0, adjustedColor.r - 5);
      adjustedColor.g = Math.max(0, adjustedColor.g - 5);
      adjustedColor.b = Math.max(0, adjustedColor.b - 5);
    } else {
      // Lighten the color
      adjustedColor.r = Math.min(255, adjustedColor.r + 5);
      adjustedColor.g = Math.min(255, adjustedColor.g + 5);
      adjustedColor.b = Math.min(255, adjustedColor.b + 5);
    }

    attempts++;
  }

  return rgbToHex(adjustedColor.r, adjustedColor.g, adjustedColor.b);
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Validate all theme color combinations
 */
export interface ThemeContrastValidation {
  textOnBackground: ContrastValidation;
  textOnSurface: ContrastValidation;
  primaryOnBackground: ContrastValidation;
  accentOnBackground: ContrastValidation;
  isValid: boolean;
  errors: string[];
}

export function validateThemeContrast(colors: ThemeColors): ThemeContrastValidation {
  const textOnBackground = validateContrast(colors.text, colors.background);
  const textOnSurface = validateContrast(colors.text, colors.surface);
  const primaryOnBackground = validateContrast(colors.primary, colors.background, true);
  const accentOnBackground = validateContrast(colors.accent, colors.background, true);

  const errors: string[] = [];

  if (!textOnBackground.isValid) {
    errors.push(
      `Text auf Hintergrund: Kontrast ${textOnBackground.ratio}:1 ist zu gering (benötigt ${textOnBackground.requiredRatio}:1)`
    );
  }

  if (!textOnSurface.isValid) {
    errors.push(
      `Text auf Fläche: Kontrast ${textOnSurface.ratio}:1 ist zu gering (benötigt ${textOnSurface.requiredRatio}:1)`
    );
  }

  if (!primaryOnBackground.isValid) {
    errors.push(
      `Primärfarbe auf Hintergrund: Kontrast ${primaryOnBackground.ratio}:1 ist zu gering (benötigt ${primaryOnBackground.requiredRatio}:1)`
    );
  }

  return {
    textOnBackground,
    textOnSurface,
    primaryOnBackground,
    accentOnBackground,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a color is "light" or "dark"
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;

  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5;
}

/**
 * Get appropriate text color for a background
 */
export function getTextColorForBackground(background: string): string {
  return isLightColor(background) ? "#18181B" : "#FAFAFA";
}

/**
 * Blend two colors
 */
export function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return rgbToHex(r, g, b);
}

/**
 * Generate a color with adjusted lightness
 */
export function adjustLightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    if (amount > 0) {
      // Lighten
      return Math.min(255, value + (255 - value) * amount);
    } else {
      // Darken
      return Math.max(0, value + value * amount);
    }
  };

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}
