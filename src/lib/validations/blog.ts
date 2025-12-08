import { z } from "zod";

/**
 * Blog post validation schema
 */
export const blogPostSchema = z.object({
  title: z
    .string()
    .min(1, "Titel ist erforderlich")
    .max(200, "Titel darf maximal 200 Zeichen haben"),
  content: z.any(), // TipTap JSON - validated separately
  summaryShort: z
    .string()
    .min(1, "Kurze Zusammenfassung ist erforderlich")
    .max(280, "Kurze Zusammenfassung darf maximal 280 Zeichen haben"),
  summaryMedium: z.string().max(1000).optional().nullable(),
  featuredImage: z.string().url().optional().nullable().or(z.literal("")),
  featuredImageAlt: z.string().max(200).optional().nullable(),
  categoryIds: z
    .array(z.string())
    .min(1, "Mindestens eine Kategorie erforderlich"),
  tags: z.array(z.string()).optional().default([]),
  metaTitle: z.string().max(60, "Meta-Titel max. 60 Zeichen").optional().nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta-Beschreibung max. 160 Zeichen")
    .optional()
    .nullable(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
});

/**
 * Citation validation schema
 */
export const citationSchema = z.object({
  doi: z.string().optional().nullable(),
  title: z.string().min(1, "Titel ist erforderlich"),
  authors: z
    .array(z.string())
    .min(1, "Mindestens ein Autor erforderlich"),
  journal: z.string().optional().nullable(),
  year: z.number().int().min(1800).max(2100).optional().nullable(),
  volume: z.string().optional().nullable(),
  issue: z.string().optional().nullable(),
  pages: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  url: z.string().url().optional().nullable(),
  type: z
    .enum(["article", "book", "chapter", "website", "conference", "thesis", "report"])
    .optional()
    .default("article"),
  inlineKey: z
    .string()
    .min(1, "Inline-Key ist erforderlich")
    .regex(/^[a-z]+\d+$/, "Format: autorjahr (z.B. smith2023)"),
});

/**
 * Comment validation schema
 */
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Kommentar darf nicht leer sein")
    .max(2000, "Kommentar darf maximal 2000 Zeichen haben"),
  parentId: z.string().optional().nullable(),
  // For guest comments
  guestName: z.string().min(2).max(100).optional(),
  guestEmail: z.string().email().optional(),
});

/**
 * Category validation schema
 */
export const categorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  name: z.string().min(1).max(100),
  nameDE: z.string().min(1).max(100),
  nameEN: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  descriptionDE: z.string().max(500).optional().nullable(),
  descriptionEN: z.string().max(500).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Ungültiger Hex-Farbcode")
    .optional()
    .nullable(),
  icon: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

/**
 * Tag validation schema
 */
export const tagSchema = z.object({
  name: z.string().min(1).max(50),
});

/**
 * Draft autosave schema (minimal validation)
 */
export const draftSchema = z.object({
  title: z.string().optional().nullable(),
  content: z.any(),
  summaryShort: z.string().max(280).optional().nullable(),
  postId: z.string().optional().nullable(),
});

/**
 * Bookmark schema
 */
export const bookmarkSchema = z.object({
  postId: z.string().min(1),
  readProgress: z.number().min(0).max(100).optional(),
});

// Type exports
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type CitationInput = z.infer<typeof citationSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type DraftInput = z.infer<typeof draftSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
