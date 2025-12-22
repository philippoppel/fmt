import { z } from "zod";

// ============================================
// BASE SCHEMAS
// ============================================

const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Ungültiger Hex-Farbcode");

const urlSchema = z
  .string()
  .url("Ungültige URL")
  .or(z.literal(""))
  .nullable()
  .optional();

// ============================================
// BRAND TEXT STYLE
// ============================================

export const brandTextStyleSchema = z.object({
  font: z.string().min(1),
  weight: z.number().int().min(100).max(900),
  letterSpacing: z.number().min(-0.1).max(0.5),
  color: hexColorSchema,
  effect: z.enum(["none", "shadow", "outline", "glow"]),
});

// ============================================
// CTA BUTTON
// ============================================

export const ctaButtonSchema = z.object({
  text: z.string().min(1).max(50),
  link: z.string().max(500),
  style: z.enum(["primary", "secondary", "outline", "ghost"]),
});

// ============================================
// HERO CONFIG
// ============================================

export const heroConfigSchema = z.object({
  logoUrl: urlSchema.nullable(),
  brandText: z.string().max(100),
  brandStyle: brandTextStyleSchema,
  tagline: z.string().max(200),
  coverImageUrl: urlSchema.nullable(),
  ctaPrimary: ctaButtonSchema.nullable(),
  ctaSecondary: ctaButtonSchema.nullable(),
  locationBadges: z.array(z.string().max(50)).max(5),
});

// ============================================
// ABOUT CONFIG
// ============================================

export const aboutConfigSchema = z.object({
  richContent: z.any().nullable(), // TipTap JSON
  showLanguages: z.boolean(),
  showMethods: z.boolean(),
  showTargetGroups: z.boolean(),
});

// ============================================
// COMPETENCY
// ============================================

export const competencySchema = z.object({
  id: z.string().min(1),
  icon: z.string().nullable(),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  order: z.number().int().min(0),
  visible: z.boolean(),
});

// ============================================
// OFFERING
// ============================================

export const offeringSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  price: z.number().int().min(0).nullable(), // In cents
  duration: z.string().max(50).nullable(),
  isHighlighted: z.boolean(),
});

// ============================================
// SOCIAL LINKS
// ============================================

export const socialLinksSchema = z.object({
  instagram: urlSchema,
  linkedIn: urlSchema,
  xing: urlSchema,
  website: urlSchema,
});

// ============================================
// CONTACT CONFIG
// ============================================

export const contactConfigSchema = z.object({
  buttonText: z.string().max(50),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  socialLinks: socialLinksSchema,
});

// ============================================
// LEGAL LINKS
// ============================================

export const legalLinksSchema = z.object({
  impressum: urlSchema,
  datenschutz: urlSchema,
  agb: urlSchema,
});

// ============================================
// FOOTER CONFIG
// ============================================

export const footerConfigSchema = z.object({
  legalLinks: legalLinksSchema,
  showPoweredBy: z.boolean(),
});

// ============================================
// THEME COLORS
// ============================================

export const themeColorsSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  background: hexColorSchema,
  surface: hexColorSchema,
  text: hexColorSchema,
  accent: hexColorSchema,
});

// ============================================
// THEME TYPOGRAPHY
// ============================================

export const themeTypographySchema = z.object({
  headingFont: z.string().min(1),
  bodyFont: z.string().min(1),
  scale: z.enum(["sm", "md", "lg"]),
});

// ============================================
// THEME LAYOUT
// ============================================

export const themeLayoutSchema = z.object({
  cornerRadius: z.enum(["sm", "md", "lg", "xl"]),
  cardStyle: z.enum(["glass", "solid", "outline"]),
  sectionSpacing: z.enum(["compact", "normal", "spacious"]),
});

// ============================================
// THEME EFFECTS
// ============================================

export const themeEffectsSchema = z.object({
  heroOverlay: z.enum(["gradient", "blur", "none"]),
  textGlow: z.boolean(),
  parallax: z.boolean(),
});

// ============================================
// FULL THEME
// ============================================

export const micrositeThemeSchema = z.object({
  preset: z.enum(["calm", "clinical", "warm", "modern", "minimal"]),
  colors: themeColorsSchema,
  typography: themeTypographySchema,
  layout: themeLayoutSchema,
  effects: themeEffectsSchema,
});

// ============================================
// SECTION ID
// ============================================

export const sectionIdSchema = z.enum([
  "hero",
  "about",
  "competencies",
  "offerings",
  "contact",
  "footer",
]);

// ============================================
// FULL MICROSITE CONFIG
// ============================================

export const micrositeConfigSchema = z.object({
  hero: heroConfigSchema,
  about: aboutConfigSchema,
  competencies: z.array(competencySchema),
  offerings: z.array(offeringSchema),
  contact: contactConfigSchema,
  footer: footerConfigSchema,
  theme: micrositeThemeSchema,
  sectionOrder: z.array(sectionIdSchema),
  hiddenSections: z.array(sectionIdSchema),
});

// ============================================
// DRAFT INPUT (Partial)
// ============================================

export const micrositeDraftInputSchema = z.object({
  hero: heroConfigSchema.partial().optional(),
  about: aboutConfigSchema.partial().optional(),
  competencies: z.array(competencySchema).optional(),
  offerings: z.array(offeringSchema).optional(),
  contact: contactConfigSchema.partial().optional(),
  footer: footerConfigSchema.partial().optional(),
  theme: micrositeThemeSchema.partial().optional(),
  sectionOrder: z.array(sectionIdSchema).optional(),
  hiddenSections: z.array(sectionIdSchema).optional(),
});

// ============================================
// COMPETENCY INPUT
// ============================================

export const competencyInputSchema = z.object({
  id: z.string().optional(), // New if not provided
  icon: z.string().nullable().optional(),
  title: z.string().min(1, "Titel ist erforderlich").max(100),
  description: z.string().max(500).optional().default(""),
  visible: z.boolean().optional().default(true),
});

// ============================================
// OFFERING INPUT
// ============================================

export const offeringInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Titel ist erforderlich").max(100),
  description: z.string().max(500).optional().default(""),
  price: z.number().int().min(0).nullable().optional(),
  duration: z.string().max(50).nullable().optional(),
  isHighlighted: z.boolean().optional().default(false),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type BrandTextStyleInput = z.infer<typeof brandTextStyleSchema>;
export type CtaButtonInput = z.infer<typeof ctaButtonSchema>;
export type HeroConfigInput = z.infer<typeof heroConfigSchema>;
export type AboutConfigInput = z.infer<typeof aboutConfigSchema>;
export type CompetencyInput = z.infer<typeof competencyInputSchema>;
export type OfferingInput = z.infer<typeof offeringInputSchema>;
export type ContactConfigInput = z.infer<typeof contactConfigSchema>;
export type FooterConfigInput = z.infer<typeof footerConfigSchema>;
export type MicrositeThemeInput = z.infer<typeof micrositeThemeSchema>;
export type MicrositeConfigInput = z.infer<typeof micrositeConfigSchema>;
export type MicrositeDraftInput = z.infer<typeof micrositeDraftInputSchema>;
