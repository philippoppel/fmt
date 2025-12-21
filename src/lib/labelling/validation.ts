/**
 * Label validation logic for the Labelling Portal
 *
 * Validates that:
 * 1. Max 3 primary categories with unique, consecutive ranks (1, 2, 3)
 * 2. Subcategory keys belong to selected primary categories
 * 3. Intensity keys belong to selected primary categories
 * 4. Evidence snippets have valid ranges within text length
 * 5. Related topics don't overlap with primary categories
 */

import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { INTENSITY_STATEMENTS } from "@/lib/matching/intensity";
import type {
  PrimaryCategory,
  SubcategoriesMap,
  IntensityMap,
  RelatedTopic,
  EvidenceSnippet,
  TaxonomySchema,
} from "@/types/labelling";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Get all valid topic IDs from the matching topics
 */
export function getValidTopicIds(): Set<string> {
  return new Set(MATCHING_TOPICS.map((t) => t.id).filter((id) => id !== "other"));
}

/**
 * Get valid subtopic IDs for a specific topic
 */
export function getValidSubTopicIds(topicId: string): Set<string> {
  const topic = MATCHING_TOPICS.find((t) => t.id === topicId);
  if (!topic) return new Set();
  return new Set(topic.subTopics.map((st) => st.id));
}

/**
 * Get valid intensity statement IDs for a specific topic
 */
export function getValidIntensityIds(topicId: string): Set<string> {
  const statements = INTENSITY_STATEMENTS[topicId];
  if (!statements) return new Set();
  return new Set(statements.map((s) => s.id));
}

/**
 * Validate primary categories
 */
function validatePrimaryCategories(
  categories: PrimaryCategory[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const validTopicIds = getValidTopicIds();

  // Check max 3 categories
  if (categories.length > 3) {
    errors.push({
      field: "primaryCategories",
      message: "Maximal 3 Hauptkategorien erlaubt",
    });
  }

  // Check min 1 category
  if (categories.length === 0) {
    errors.push({
      field: "primaryCategories",
      message: "Mindestens eine Hauptkategorie erforderlich",
    });
    return errors;
  }

  // Check valid keys
  for (const cat of categories) {
    if (!validTopicIds.has(cat.key)) {
      errors.push({
        field: "primaryCategories",
        message: `Unbekannte Kategorie: ${cat.key}`,
      });
    }
  }

  // Check unique ranks
  const ranks = categories.map((c) => c.rank);
  if (new Set(ranks).size !== ranks.length) {
    errors.push({
      field: "primaryCategories",
      message: "Ränge müssen eindeutig sein",
    });
  }

  // Check consecutive ranks starting from 1
  const sortedRanks = [...ranks].sort((a, b) => a - b);
  for (let i = 0; i < sortedRanks.length; i++) {
    if (sortedRanks[i] !== i + 1) {
      errors.push({
        field: "primaryCategories",
        message: "Ränge müssen fortlaufend bei 1 beginnen (z.B. 1, 2, 3)",
      });
      break;
    }
  }

  // Check unique keys
  const keys = categories.map((c) => c.key);
  if (new Set(keys).size !== keys.length) {
    errors.push({
      field: "primaryCategories",
      message: "Kategorien dürfen nicht doppelt vorkommen",
    });
  }

  return errors;
}

/**
 * Validate subcategories belong to selected primary categories
 */
function validateSubcategories(
  subcategories: SubcategoriesMap,
  primaryCategories: PrimaryCategory[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const selectedKeys = new Set(primaryCategories.map((c) => c.key));

  for (const [categoryKey, subKeys] of Object.entries(subcategories)) {
    // Check category is selected
    if (!selectedKeys.has(categoryKey)) {
      errors.push({
        field: "subcategories",
        message: `Subkategorien für nicht-gewählte Kategorie: ${categoryKey}`,
      });
      continue;
    }

    // Check subcategory keys are valid for this category
    const validSubIds = getValidSubTopicIds(categoryKey);
    for (const subKey of subKeys) {
      if (!validSubIds.has(subKey)) {
        errors.push({
          field: "subcategories",
          message: `Ungültige Subkategorie '${subKey}' für Kategorie '${categoryKey}'`,
        });
      }
    }
  }

  return errors;
}

/**
 * Validate intensity markers belong to selected primary categories
 */
function validateIntensity(
  intensity: IntensityMap,
  primaryCategories: PrimaryCategory[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const selectedKeys = new Set(primaryCategories.map((c) => c.key));

  for (const [categoryKey, intensityIds] of Object.entries(intensity)) {
    // Check category is selected
    if (!selectedKeys.has(categoryKey)) {
      errors.push({
        field: "intensity",
        message: `Intensitätsfragen für nicht-gewählte Kategorie: ${categoryKey}`,
      });
      continue;
    }

    // Check intensity IDs are valid for this category
    const validIntensityIds = getValidIntensityIds(categoryKey);
    for (const intensityId of intensityIds) {
      if (!validIntensityIds.has(intensityId)) {
        errors.push({
          field: "intensity",
          message: `Ungültige Intensitätsfrage '${intensityId}' für Kategorie '${categoryKey}'`,
        });
      }
    }
  }

  return errors;
}

/**
 * Validate related topics don't overlap with primary categories
 */
function validateRelatedTopics(
  relatedTopics: RelatedTopic[] | null | undefined,
  primaryCategories: PrimaryCategory[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!relatedTopics || relatedTopics.length === 0) return errors;

  const selectedKeys = new Set(primaryCategories.map((c) => c.key));
  const validTopicIds = getValidTopicIds();

  for (const related of relatedTopics) {
    // Check valid key
    if (!validTopicIds.has(related.key)) {
      errors.push({
        field: "relatedTopics",
        message: `Unbekanntes Related Topic: ${related.key}`,
      });
      continue;
    }

    // Check no overlap with primary
    if (selectedKeys.has(related.key)) {
      errors.push({
        field: "relatedTopics",
        message: `'${related.key}' ist bereits als Hauptkategorie gewählt`,
      });
    }
  }

  // Check unique keys
  const relatedKeys = relatedTopics.map((r) => r.key);
  if (new Set(relatedKeys).size !== relatedKeys.length) {
    errors.push({
      field: "relatedTopics",
      message: "Related Topics dürfen nicht doppelt vorkommen",
    });
  }

  return errors;
}

/**
 * Validate evidence snippets have valid ranges
 */
function validateEvidenceSnippets(
  snippets: EvidenceSnippet[] | null | undefined,
  textLength: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!snippets || snippets.length === 0) return errors;

  // Max 5 snippets
  if (snippets.length > 5) {
    errors.push({
      field: "evidenceSnippets",
      message: "Maximal 5 Evidenz-Snippets erlaubt",
    });
  }

  for (let i = 0; i < snippets.length; i++) {
    const snippet = snippets[i];

    if (snippet.start < 0) {
      errors.push({
        field: "evidenceSnippets",
        message: `Snippet ${i + 1}: Start muss >= 0 sein`,
      });
    }

    if (snippet.end > textLength) {
      errors.push({
        field: "evidenceSnippets",
        message: `Snippet ${i + 1}: End (${snippet.end}) überschreitet Textlänge (${textLength})`,
      });
    }

    if (snippet.end <= snippet.start) {
      errors.push({
        field: "evidenceSnippets",
        message: `Snippet ${i + 1}: End muss größer als Start sein`,
      });
    }
  }

  return errors;
}

/**
 * Main validation function
 */
export function validateLabel(
  input: {
    primaryCategories: PrimaryCategory[];
    subcategories: SubcategoriesMap;
    intensity: IntensityMap;
    relatedTopics?: RelatedTopic[] | null;
    evidenceSnippets?: EvidenceSnippet[] | null;
  },
  textLength: number
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate primary categories
  errors.push(...validatePrimaryCategories(input.primaryCategories));

  // Only continue if primary categories are valid
  if (errors.length === 0) {
    // Validate subcategories
    errors.push(...validateSubcategories(input.subcategories, input.primaryCategories));

    // Validate intensity
    errors.push(...validateIntensity(input.intensity, input.primaryCategories));

    // Validate related topics
    errors.push(...validateRelatedTopics(input.relatedTopics, input.primaryCategories));
  }

  // Validate evidence snippets
  errors.push(...validateEvidenceSnippets(input.evidenceSnippets, textLength));

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Build taxonomy schema from current topics and intensity data
 */
export function buildTaxonomySchema(version: string): TaxonomySchema {
  const topics = MATCHING_TOPICS.filter((t) => t.id !== "other").map((topic) => ({
    id: topic.id,
    labelKey: topic.labelKey,
    subTopics: topic.subTopics.map((st) => ({
      id: st.id,
      labelKey: st.labelKey,
      weight: st.weight,
    })),
  }));

  const intensity: Record<string, { id: string; topicId: string; labelKey: string; weight: number }[]> = {};
  for (const [topicId, statements] of Object.entries(INTENSITY_STATEMENTS)) {
    intensity[topicId] = statements.map((s) => ({
      id: s.id,
      topicId: s.topicId,
      labelKey: s.labelKey,
      weight: s.weight,
    }));
  }

  return {
    version,
    topics,
    intensity,
  };
}
