import type { AccountType } from "./therapist";

// ============================================
// MICROSITE STATUS & CONFIG
// ============================================

export type MicrositeStatus = "draft" | "published";

export interface MicrositeConfig {
  hero: HeroConfig;
  about: AboutConfig;
  competencies: Competency[];
  offerings: Offering[];
  contact: ContactConfig;
  footer: FooterConfig;
  theme: MicrositeTheme;
  sectionOrder: SectionId[];
  hiddenSections: SectionId[];
}

export type SectionId = "hero" | "about" | "competencies" | "offerings" | "contact" | "footer";

// ============================================
// HERO SECTION
// ============================================

export interface HeroConfig {
  logoUrl: string | null;
  brandText: string;
  brandStyle: BrandTextStyle;
  tagline: string;
  coverImageUrl: string | null;
  ctaPrimary: CtaButton | null;
  ctaSecondary: CtaButton | null;
  locationBadges: string[];
}

export interface BrandTextStyle {
  font: string;
  weight: number; // 400, 500, 600, 700
  letterSpacing: number; // em units, e.g., 0.02
  color: string;
  effect: BrandTextEffect;
}

export type BrandTextEffect = "none" | "shadow" | "outline" | "glow";

export interface CtaButton {
  text: string;
  link: string;
  style: CtaStyle;
}

export type CtaStyle = "primary" | "secondary" | "outline" | "ghost";

// ============================================
// ABOUT SECTION
// ============================================

export interface AboutConfig {
  richContent: object | null; // TipTap JSON
  showLanguages: boolean;
  showMethods: boolean;
  showTargetGroups: boolean;
}

// ============================================
// COMPETENCIES SECTION
// ============================================

export interface Competency {
  id: string;
  icon: string | null; // lucide icon name
  title: string;
  description: string;
  order: number;
  visible: boolean;
}

// ============================================
// OFFERINGS SECTION
// ============================================

export interface Offering {
  id: string;
  title: string;
  description: string;
  price: number | null; // in cents
  duration: string | null; // e.g., "50 min"
  isHighlighted: boolean;
}

// ============================================
// CONTACT SECTION
// ============================================

export interface ContactConfig {
  buttonText: string;
  showEmail: boolean;
  showPhone: boolean;
  socialLinks: SocialLinks;
}

export interface SocialLinks {
  instagram: string | null;
  linkedIn: string | null;
  xing: string | null;
  website: string | null;
}

// ============================================
// FOOTER SECTION
// ============================================

export interface FooterConfig {
  legalLinks: LegalLinks;
  showPoweredBy: boolean;
}

export interface LegalLinks {
  impressum: string | null;
  datenschutz: string | null;
  agb: string | null;
}

// ============================================
// THEME SYSTEM
// ============================================

export interface MicrositeTheme {
  preset: MicrositeThemePreset;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  effects: ThemeEffects;
}

export type MicrositeThemePreset = "calm" | "clinical" | "warm" | "modern" | "minimal";

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  scale: TypographyScale;
}

export type TypographyScale = "sm" | "md" | "lg";

export interface ThemeLayout {
  cornerRadius: CornerRadius;
  cardStyle: CardStyle;
  sectionSpacing: SectionSpacing;
}

export type CornerRadius = "sm" | "md" | "lg" | "xl";
export type CardStyle = "glass" | "solid" | "outline";
export type SectionSpacing = "compact" | "normal" | "spacious";

export interface ThemeEffects {
  heroOverlay: HeroOverlayStyle;
  textGlow: boolean;
  parallax: boolean;
}

export type HeroOverlayStyle = "gradient" | "blur" | "none";

// ============================================
// THEME PRESET DEFINITIONS
// ============================================

export interface MicrositeThemePresetDefinition {
  name: MicrositeThemePreset;
  label: string;
  labelDe: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  effects: Partial<ThemeEffects>;
}

// ============================================
// BUILDER STATE
// ============================================

export interface MicrositeBuilderState {
  config: MicrositeConfig;
  status: MicrositeStatus;
  isDirty: boolean;
  lastSavedAt: Date | null;
  publishedAt: Date | null;
  activeTab: BuilderTab;
  previewViewport: PreviewViewport;
}

export type BuilderTab =
  | "content"
  | "competencies"
  | "offerings"
  | "contact"
  | "theme"
  | "sections";

export type PreviewViewport = "desktop" | "tablet" | "mobile";

// ============================================
// DRAFT INPUT FOR SERVER ACTIONS
// ============================================

export interface MicrositeDraftInput {
  hero?: Partial<HeroConfig>;
  about?: Partial<AboutConfig>;
  competencies?: Competency[];
  offerings?: Offering[];
  contact?: Partial<ContactConfig>;
  footer?: Partial<FooterConfig>;
  theme?: Partial<MicrositeTheme>;
  sectionOrder?: SectionId[];
  hiddenSections?: SectionId[];
}

// ============================================
// TIER-BASED FEATURE ACCESS
// ============================================

export interface MicrositeTierLimits {
  // Branding
  canUploadLogo: boolean;
  canUploadHeroImage: boolean;
  canUploadProfileImage: boolean;

  // Theme
  allowedPaletteCount: number;
  allowedFontCount: number;
  canCustomizeColors: boolean;
  canUseEffects: boolean;

  // Content
  maxCompetencies: number;
  maxOfferings: number;
  canReorderSections: boolean;
  canHideSections: boolean;

  // Features
  hasAutoSave: boolean;
  hasUndoRedo: boolean;
}

export type TierLimitsMap = Record<AccountType, MicrositeTierLimits>;

// ============================================
// ICON LIBRARY
// ============================================

export interface CuratedIcon {
  name: string;
  keywords: string[];
  category: IconCategory;
}

export type IconCategory =
  | "psyche"
  | "relationships"
  | "wellness"
  | "growth"
  | "body"
  | "general";

export interface IconCategoryInfo {
  id: IconCategory;
  label: string;
  labelDe: string;
}

// ============================================
// VALIDATION
// ============================================

export interface ContrastValidation {
  isValid: boolean;
  ratio: number;
  requiredRatio: number;
  suggestion?: string;
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_MICROSITE_CONFIG: MicrositeConfig = {
  hero: {
    logoUrl: null,
    brandText: "",
    brandStyle: {
      font: "Inter",
      weight: 600,
      letterSpacing: 0,
      color: "#18181B",
      effect: "none",
    },
    tagline: "",
    coverImageUrl: null,
    ctaPrimary: {
      text: "Termin anfragen",
      link: "",
      style: "primary",
    },
    ctaSecondary: null,
    locationBadges: [],
  },
  about: {
    richContent: null,
    showLanguages: true,
    showMethods: true,
    showTargetGroups: true,
  },
  competencies: [],
  offerings: [],
  contact: {
    buttonText: "Kontakt aufnehmen",
    showEmail: true,
    showPhone: true,
    socialLinks: {
      instagram: null,
      linkedIn: null,
      xing: null,
      website: null,
    },
  },
  footer: {
    legalLinks: {
      impressum: null,
      datenschutz: null,
      agb: null,
    },
    showPoweredBy: true,
  },
  theme: {
    preset: "warm",
    colors: {
      primary: "#8B7355",
      secondary: "#F5F0EB",
      background: "#FAFAF8",
      surface: "#FFFFFF",
      text: "#2D3748",
      accent: "#D4A574",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      scale: "md",
    },
    layout: {
      cornerRadius: "lg",
      cardStyle: "glass",
      sectionSpacing: "normal",
    },
    effects: {
      heroOverlay: "gradient",
      textGlow: false,
      parallax: false,
    },
  },
  sectionOrder: ["hero", "about", "competencies", "offerings", "contact", "footer"],
  hiddenSections: [],
};

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  "hero",
  "about",
  "competencies",
  "offerings",
  "contact",
  "footer",
];
