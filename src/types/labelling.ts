/**
 * Type definitions for the Labelling Portal
 */

import type {
  LabellingCase as PrismaLabellingCase,
  Label as PrismaLabel,
  TaxonomyVersion as PrismaTaxonomyVersion,
  CalibrationPool as PrismaCalibrationPool,
  ModelRun as PrismaModelRun,
  User,
  CaseSource,
  CaseStatus,
  UserRole,
  RelatedTopicStrength,
} from "@prisma/client";

// Re-export Prisma enums
export { CaseSource, CaseStatus, UserRole, RelatedTopicStrength };

// ============================================
// Core Types
// ============================================

/**
 * Primary category with ranking (1 = highest priority)
 */
export interface PrimaryCategory {
  key: string;
  rank: 1 | 2 | 3;
}

/**
 * Related topic with strength indicator
 */
export interface RelatedTopic {
  key: string;
  strength: "OFTEN" | "SOMETIMES";
}

/**
 * Evidence snippet - text range that supports the labelling decision
 */
export interface EvidenceSnippet {
  start: number;
  end: number;
}

/**
 * Subcategories mapped by primary category key
 */
export type SubcategoriesMap = Record<string, string[]>;

/**
 * Intensity markers mapped by primary category key
 */
export type IntensityMap = Record<string, string[]>;

// ============================================
// Database Types with JSON parsed
// ============================================

export interface LabellingCase extends Omit<PrismaLabellingCase, "metadata"> {
  metadata: Record<string, unknown> | null;
}

export interface Label
  extends Omit<
    PrismaLabel,
    | "primaryCategories"
    | "subcategories"
    | "intensity"
    | "relatedTopics"
    | "evidenceSnippets"
  > {
  primaryCategories: PrimaryCategory[];
  subcategories: SubcategoriesMap;
  intensity: IntensityMap;
  relatedTopics: RelatedTopic[] | null;
  evidenceSnippets: EvidenceSnippet[] | null;
}

export interface TaxonomyVersion
  extends Omit<PrismaTaxonomyVersion, "schema"> {
  schema: TaxonomySchema;
}

export type CalibrationPool = PrismaCalibrationPool;

export interface ModelRun
  extends Omit<PrismaModelRun, "parameters" | "metrics"> {
  parameters: ModelRunParameters | null;
  metrics: ModelRunMetrics | null;
}

// ============================================
// Taxonomy Schema Types
// ============================================

export interface TaxonomyTopic {
  id: string;
  labelKey: string;
  subTopics: TaxonomySubTopic[];
}

export interface TaxonomySubTopic {
  id: string;
  labelKey: string;
  weight: number;
}

export interface TaxonomyIntensity {
  id: string;
  topicId: string;
  labelKey: string;
  weight: number;
}

export interface TaxonomySchema {
  version: string;
  topics: TaxonomyTopic[];
  intensity: Record<string, TaxonomyIntensity[]>;
}

// ============================================
// Model Run Types
// ============================================

export interface ModelRunParameters {
  k?: number; // For kNN
  threshold?: number;
  testSplit?: number;
  randomSeed?: number;
}

export interface ModelRunMetrics {
  top3Accuracy: number;
  macroF1: number;
  perLabelRecall: Record<string, number>;
  totalSamples: number;
  trainSamples: number;
  testSamples: number;
}

// ============================================
// Input Types for Actions
// ============================================

export interface CreateCaseInput {
  text: string;
  language?: string;
  source?: CaseSource;
  metadata?: Record<string, unknown>;
}

export interface ImportCaseItem {
  text: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

export interface CaseFilters {
  status?: CaseStatus;
  source?: CaseSource;
  createdById?: string;
  search?: string;
  language?: string;
  calibrationOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface LabelInput {
  caseId: string;
  primaryCategories: PrimaryCategory[];
  subcategories: SubcategoriesMap;
  intensity: IntensityMap;
  relatedTopics?: RelatedTopic[];
  uncertain?: boolean;
  evidenceSnippets?: EvidenceSnippet[];
}

export interface ExportOptions {
  format: "jsonl" | "csv";
  taxonomyVersionId?: string;
  fromDate?: Date;
  toDate?: Date;
  includeUncertain?: boolean;
}

export interface TriggerModelRunInput {
  method: "knn" | "logreg";
  parameters?: ModelRunParameters;
}

// ============================================
// Response Types
// ============================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

export interface ExportResult {
  url: string;
  totalCases: number;
  exportedCases: number;
  conflictCases: number;
  report: ExportReport;
}

export interface ExportReport {
  taxonomyVersion: string;
  exportedAt: string;
  totalCases: number;
  exportedCases: number;
  excludedCases: number;
  conflicts: ConflictCase[];
  categoryDistribution: Record<string, number>;
}

export interface ConflictCase {
  caseId: string;
  raterCount: number;
  disagreementCategories: string[];
}

// ============================================
// Agreement Metrics Types
// ============================================

export interface AgreementMetrics {
  caseId: string;
  raterCount: number;
  cohensKappa: number | null;
  jaccardSimilarity: number;
  categoryAgreement: CategoryAgreement[];
  hasConflict: boolean;
}

export interface CategoryAgreement {
  category: string;
  agreedRanks: number[];
  disagreedRanks: number[];
}

// ============================================
// Statistics Types
// ============================================

export interface LabellingStats {
  totalCases: number;
  casesByStatus: Record<CaseStatus, number>;
  casesBySource: Record<CaseSource, number>;
  totalLabels: number;
  labelsByCategory: Record<string, number>;
  labelsByRater: RaterStats[];
  calibrationPoolSize: number;
  averageAgreement: number | null;
}

export interface RaterStats {
  raterId: string;
  raterName: string;
  totalLabels: number;
  casesLabeled: number;
  lastLabeledAt: Date | null;
}

// ============================================
// Extended Types with Relations
// ============================================

export interface LabellingCaseWithLabels extends LabellingCase {
  labels: Label[];
  calibrationPool: CalibrationPool | null;
  createdBy: Pick<User, "id" | "name" | "email">;
}

export interface LabelWithRater extends Label {
  rater: Pick<User, "id" | "name" | "email">;
}

export interface CalibrationCaseView extends LabellingCase {
  labels: LabelWithRater[];
  calibrationPool: CalibrationPool;
  agreementMetrics: AgreementMetrics | null;
}

// ============================================
// JSONL Export Format
// ============================================

export interface ExportedCase {
  id: string;
  text: string;
  taxonomy_version: string;
  labels_main: { key: string; rank: number }[];
  labels_sub: Record<string, string[]>;
  intensity: Record<string, string[]>;
  related_topics: { key: string; strength: string }[];
  uncertain: boolean;
}

// ============================================
// AI Suggestion Types
// ============================================

/**
 * Category suggestion from AI with confidence score
 */
export interface CategorySuggestion {
  key: string;
  rank: 1 | 2 | 3;
  confidence: number; // 0-1
}

/**
 * Related topic suggestion from AI
 */
export interface RelatedTopicSuggestion {
  key: string;
  strength: "OFTEN" | "SOMETIMES";
}

/**
 * Complete label suggestion from AI
 */
export interface LabelSuggestion {
  main: CategorySuggestion[];
  sub: SubcategoriesMap;
  intensity: IntensityMap;
  related: RelatedTopicSuggestion[];
  uncertainSuggested: boolean;
  rationaleShort: string;
}

/**
 * Input for saving a label with AI audit trail
 */
export interface SaveLabelWithAuditInput {
  caseId?: string;
  text?: string;
  aiSuggestion: LabelSuggestion | null;
  finalLabel: Omit<LabelInput, "caseId">;
}

/**
 * Result of saving a label with audit
 */
export interface SaveLabelResult {
  caseId: string;
  labelId: string;
}
