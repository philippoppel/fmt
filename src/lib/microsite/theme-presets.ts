import type {
  MicrositeThemePreset,
  MicrositeThemePresetDefinition,
  ThemeColors,
  ThemeTypography,
  ThemeEffects,
  MicrositeTheme,
} from "@/types/microsite";

/**
 * Microsite theme preset definitions
 * Each preset provides a complete, harmonious color scheme
 * optimized for readability and professional appearance
 */
export const MICROSITE_THEME_PRESETS: Record<MicrositeThemePreset, MicrositeThemePresetDefinition> = {
  calm: {
    name: "calm",
    label: "Calm",
    labelDe: "Ruhig & Sanft",
    colors: {
      primary: "#6B8E9F",      // Muted teal-blue
      secondary: "#E8F1F5",    // Light blue-gray
      background: "#FAFCFD",   // Very light blue-white
      surface: "#FFFFFF",
      text: "#2D3E4A",         // Dark blue-gray
      accent: "#8BACBC",       // Soft teal
    },
    typography: {
      headingFont: "Cormorant Garamond",
      bodyFont: "Open Sans",
      scale: "md",
    },
    effects: {
      heroOverlay: "gradient",
      textGlow: false,
    },
  },

  clinical: {
    name: "clinical",
    label: "Clinical",
    labelDe: "Klinisch & Professionell",
    colors: {
      primary: "#4A5568",      // Professional gray
      secondary: "#EDF2F7",    // Light gray
      background: "#F7FAFC",   // Very light gray
      surface: "#FFFFFF",
      text: "#1A202C",         // Dark charcoal
      accent: "#63B3ED",       // Professional blue accent
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      scale: "md",
    },
    effects: {
      heroOverlay: "none",
      textGlow: false,
    },
  },

  warm: {
    name: "warm",
    label: "Warm",
    labelDe: "Warm & Einladend",
    colors: {
      primary: "#8B7355",      // Warm brown
      secondary: "#F5F0EB",    // Cream
      background: "#FAFAF8",   // Warm white
      surface: "#FFFFFF",
      text: "#2D3748",         // Warm dark gray
      accent: "#D4A574",       // Warm gold
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Lato",
      scale: "md",
    },
    effects: {
      heroOverlay: "gradient",
      textGlow: false,
    },
  },

  modern: {
    name: "modern",
    label: "Modern",
    labelDe: "Modern & Klar",
    colors: {
      primary: "#2563EB",      // Vibrant blue
      secondary: "#EFF6FF",    // Light blue
      background: "#FAFAFA",   // Neutral light
      surface: "#FFFFFF",
      text: "#18181B",         // Near black
      accent: "#3B82F6",       // Bright blue
    },
    typography: {
      headingFont: "DM Sans",
      bodyFont: "Inter",
      scale: "md",
    },
    effects: {
      heroOverlay: "blur",
      textGlow: false,
    },
  },

  minimal: {
    name: "minimal",
    label: "Minimal",
    labelDe: "Minimalistisch",
    colors: {
      primary: "#18181B",      // Rich black
      secondary: "#F4F4F5",    // Light gray
      background: "#FFFFFF",   // Pure white
      surface: "#FAFAFA",      // Subtle gray
      text: "#09090B",         // Near black
      accent: "#71717A",       // Medium gray
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      scale: "md",
    },
    effects: {
      heroOverlay: "none",
      textGlow: false,
    },
  },
};

/**
 * Get a theme preset by name
 */
export function getThemePreset(name: MicrositeThemePreset): MicrositeThemePresetDefinition {
  return MICROSITE_THEME_PRESETS[name];
}

/**
 * Get all available theme presets
 */
export function getAllThemePresets(): MicrositeThemePresetDefinition[] {
  return Object.values(MICROSITE_THEME_PRESETS);
}

/**
 * Create a full theme from a preset
 */
export function createThemeFromPreset(presetName: MicrositeThemePreset): MicrositeTheme {
  const preset = MICROSITE_THEME_PRESETS[presetName];

  return {
    preset: presetName,
    colors: { ...preset.colors },
    typography: { ...preset.typography },
    layout: {
      cornerRadius: "lg",
      cardStyle: "glass",
      sectionSpacing: "normal",
    },
    effects: {
      heroOverlay: preset.effects.heroOverlay ?? "gradient",
      textGlow: preset.effects.textGlow ?? false,
      parallax: false,
    },
  };
}

/**
 * Merge custom colors into a preset
 */
export function mergeThemeColors(
  preset: MicrositeThemePreset,
  customColors: Partial<ThemeColors>
): ThemeColors {
  const presetColors = MICROSITE_THEME_PRESETS[preset].colors;
  return {
    ...presetColors,
    ...customColors,
  };
}

/**
 * CSS variable mapping for theme application
 */
export const THEME_CSS_VARS = {
  primary: "--ms-primary",
  secondary: "--ms-secondary",
  background: "--ms-background",
  surface: "--ms-surface",
  text: "--ms-text",
  accent: "--ms-accent",
} as const;

/**
 * Generate CSS custom properties object from theme
 */
export function generateThemeCssVars(theme: MicrositeTheme): Record<string, string> {
  return {
    "--ms-primary": theme.colors.primary,
    "--ms-secondary": theme.colors.secondary,
    "--ms-background": theme.colors.background,
    "--ms-surface": theme.colors.surface,
    "--ms-text": theme.colors.text,
    "--ms-accent": theme.colors.accent,
    "--ms-font-heading": theme.typography.headingFont,
    "--ms-font-body": theme.typography.bodyFont,
    "--ms-radius": getRadiusValue(theme.layout.cornerRadius),
    "--ms-spacing": getSpacingValue(theme.layout.sectionSpacing),
  };
}

/**
 * Radius value mapping
 */
function getRadiusValue(radius: string): string {
  const map: Record<string, string> = {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  };
  return map[radius] || map.lg;
}

/**
 * Spacing value mapping
 */
function getSpacingValue(spacing: string): string {
  const map: Record<string, string> = {
    compact: "3rem",
    normal: "5rem",
    spacious: "7rem",
  };
  return map[spacing] || map.normal;
}

/**
 * Available Google Fonts for microsite builder
 */
export const GOOGLE_FONTS = [
  { name: "Inter", category: "sans-serif", weight: [400, 500, 600, 700] },
  { name: "Open Sans", category: "sans-serif", weight: [400, 500, 600, 700] },
  { name: "Lato", category: "sans-serif", weight: [400, 700] },
  { name: "Roboto", category: "sans-serif", weight: [400, 500, 700] },
  { name: "Source Sans 3", category: "sans-serif", weight: [400, 600, 700] },
  { name: "Nunito", category: "sans-serif", weight: [400, 600, 700] },
  { name: "DM Sans", category: "sans-serif", weight: [400, 500, 700] },
  { name: "Playfair Display", category: "serif", weight: [400, 600, 700] },
  { name: "Cormorant Garamond", category: "serif", weight: [400, 500, 600] },
  { name: "Libre Baskerville", category: "serif", weight: [400, 700] },
  { name: "Merriweather", category: "serif", weight: [400, 700] },
  { name: "Crimson Pro", category: "serif", weight: [400, 600] },
] as const;

export type GoogleFontName = (typeof GOOGLE_FONTS)[number]["name"];
