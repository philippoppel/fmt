/**
 * Zod validation schemas for the Labelling Portal
 */

import { z } from "zod";

// ============================================
// Enums
// ============================================

export const caseSourceSchema = z.enum(["MANUAL", "IMPORT", "AI_SEEDED"]);

export const caseStatusSchema = z.enum(["NEW", "LABELED", "REVIEW"]);

export const relatedTopicStrengthSchema = z.enum(["OFTEN", "SOMETIMES"]);

export const userRoleSchema = z.enum(["USER", "LABELLER", "ADMIN"]);

// ============================================
// Core Schemas
// ============================================

/**
 * Primary category with ranking (1-3)
 */
export const primaryCategorySchema = z.object({
  key: z.string().min(1, "Kategorie-Key erforderlich"),
  rank: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

/**
 * Related topic with strength
 */
export const relatedTopicSchema = z.object({
  key: z.string().min(1, "Kategorie-Key erforderlich"),
  strength: relatedTopicStrengthSchema,
});

/**
 * Evidence snippet - text range
 */
export const evidenceSnippetSchema = z.object({
  start: z.number().int().min(0, "Start muss >= 0 sein"),
  end: z.number().int().min(1, "End muss > 0 sein"),
}).refine((data) => data.end > data.start, {
  message: "End muss größer als Start sein",
});

/**
 * Subcategories map: category key -> array of subcategory keys
 */
export const subcategoriesMapSchema = z.record(
  z.string(),
  z.array(z.string())
);

/**
 * Intensity map: category key -> array of intensity statement IDs
 */
export const intensityMapSchema = z.record(
  z.string(),
  z.array(z.string())
);

// ============================================
// Case Schemas
// ============================================

/**
 * Create a new case
 */
export const createCaseSchema = z.object({
  text: z
    .string()
    .min(10, "Text muss mindestens 10 Zeichen lang sein")
    .max(10000, "Text darf maximal 10.000 Zeichen lang sein"),
  language: z.string().length(2).default("de"),
  source: caseSourceSchema.default("MANUAL"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Single item for bulk import
 */
export const importCaseItemSchema = z.object({
  text: z
    .string()
    .min(10, "Text muss mindestens 10 Zeichen lang sein")
    .max(10000, "Text darf maximal 10.000 Zeichen lang sein"),
  language: z.string().length(2).default("de"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Bulk import cases
 */
export const importCasesSchema = z.object({
  cases: z
    .array(importCaseItemSchema)
    .min(1, "Mindestens ein Fall erforderlich")
    .max(1000, "Maximal 1000 Fälle pro Import"),
});

/**
 * Case filters for querying
 */
export const caseFiltersSchema = z.object({
  status: caseStatusSchema.optional(),
  source: caseSourceSchema.optional(),
  createdById: z.string().optional(),
  search: z.string().optional(),
  language: z.string().length(2).optional(),
  calibrationOnly: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

/**
 * Update case status
 */
export const updateCaseStatusSchema = z.object({
  caseId: z.string().cuid(),
  status: caseStatusSchema,
});

// ============================================
// Label Schemas
// ============================================

/**
 * Create or update a label
 */
export const labelInputSchema = z.object({
  caseId: z.string().cuid(),
  primaryCategories: z
    .array(primaryCategorySchema)
    .min(1, "Mindestens eine Kategorie erforderlich")
    .max(3, "Maximal 3 Kategorien erlaubt")
    .refine(
      (categories) => {
        const ranks = categories.map((c) => c.rank);
        return new Set(ranks).size === ranks.length;
      },
      { message: "Ränge müssen eindeutig sein (1, 2, 3)" }
    )
    .refine(
      (categories) => {
        const sortedRanks = categories.map((c) => c.rank).sort((a, b) => a - b);
        for (let i = 0; i < sortedRanks.length; i++) {
          if (sortedRanks[i] !== i + 1) return false;
        }
        return true;
      },
      { message: "Ränge müssen fortlaufend sein (z.B. 1 oder 1,2 oder 1,2,3)" }
    ),
  subcategories: subcategoriesMapSchema,
  intensity: intensityMapSchema,
  relatedTopics: z.array(relatedTopicSchema).optional().default([]),
  uncertain: z.boolean().optional().default(false),
  evidenceSnippets: z.array(evidenceSnippetSchema).max(5).optional().default([]),
});

// ============================================
// Export Schemas
// ============================================

/**
 * Export options
 */
export const exportOptionsSchema = z.object({
  format: z.enum(["jsonl", "csv"]),
  taxonomyVersionId: z.string().cuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  includeUncertain: z.boolean().optional().default(true),
});

// ============================================
// Model Run Schemas
// ============================================

/**
 * Model run parameters
 */
export const modelRunParametersSchema = z.object({
  k: z.number().int().min(1).max(50).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.5),
  testSplit: z.number().min(0.1).max(0.5).optional().default(0.2),
  randomSeed: z.number().int().optional().default(42),
});

/**
 * Trigger a new model run
 */
export const triggerModelRunSchema = z.object({
  method: z.enum(["knn", "logreg"]),
  parameters: modelRunParametersSchema.default({
    k: 5,
    threshold: 0.5,
    testSplit: 0.2,
    randomSeed: 42,
  }),
});

// ============================================
// Calibration Schemas
// ============================================

/**
 * Add/remove case from calibration pool
 */
export const calibrationPoolActionSchema = z.object({
  caseId: z.string().cuid(),
});

// ============================================
// Admin Schemas
// ============================================

/**
 * Create a new labeller account
 */
export const createLabellerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Passwort muss Groß-, Kleinbuchstaben und Zahl enthalten"
    ),
  role: z.enum(["LABELLER", "ADMIN"]).default("LABELLER"),
});

/**
 * Update user role
 */
export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: userRoleSchema,
});

// ============================================
// Type Exports
// ============================================

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type ImportCaseItem = z.infer<typeof importCaseItemSchema>;
export type ImportCasesInput = z.infer<typeof importCasesSchema>;
export type CaseFilters = z.infer<typeof caseFiltersSchema>;
export type LabelInput = z.infer<typeof labelInputSchema>;
export type ExportOptions = z.infer<typeof exportOptionsSchema>;
export type TriggerModelRunInput = z.infer<typeof triggerModelRunSchema>;
export type CreateLabellerInput = z.infer<typeof createLabellerSchema>;
