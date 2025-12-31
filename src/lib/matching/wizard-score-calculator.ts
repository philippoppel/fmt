/**
 * Wizard V2 Score Calculator
 *
 * Scoring logic for the therapy matching wizard MVP.
 *
 * Weights:
 * - Topic Fit: 60% (category + subcategory match)
 * - Style Fit: 35% (structure + engagement match)
 * - Logistics: Hard Filter (session type, insurance)
 *
 * Experience bonus based on severity score.
 */

import type { SessionType, Insurance, Gender, Language } from "@/types/therapist";
import type {
  StyleStructure,
  StyleEngagement,
  TherapyGoal,
  TimeOrientation,
  MatchReason,
  MatchedTherapistV2,
} from "@/components/matching/wizard-v2/wizard-context";
import { getCategoryById } from "./wizard-categories";

// ============================================================================
// TYPES
// ============================================================================

export interface WizardMatchInput {
  categoryId: string;
  subcategoryId: string;
  severityScore: number;
  styleStructure: StyleStructure;
  styleEngagement: StyleEngagement;
  // Evidence-based preferences (P2, P3)
  therapyGoal: TherapyGoal;
  timeOrientation: TimeOrientation;
  // Logistics
  sessionType: SessionType | null;
  insurance: Insurance | null;
  // Additional preferences
  genderPreference: Gender | null;
  location: string | null;
  searchRadius: number | null; // km
  languages: Language[]; // Required languages (empty = German only)
  // Evidence-based: negative experience
  hadNegativeExperience: boolean;
}

export interface TherapistForMatching {
  id: string;
  slug: string | null;
  name: string;
  imageUrl: string | null;
  shortDescription: string | null;
  city: string | null;
  postalCode: string | null;
  sessionType: SessionType;
  insurance: string[];
  experienceYears: number | null;
  wizardCategories: string[];
  wizardSubcategories: string[];
  primaryStyleStructure: string | null;
  primaryStyleEngagement: string | null;
  styleTags: string[];
  availability: string;
  specializations: string[]; // Fallback for category matching
  // Additional fields for filtering
  gender: Gender | null;
  languages: string[]; // Languages the therapist offers
  // Evidence-based matching fields
  therapyDepth: string | null; // symptom_relief | deep_change | flexible
  therapyFocus: string | null; // past | present | future | holistic
  therapeuticStance: string[]; // explaining | holding | challenging | validating | structuring
  // Exclusion criteria - topics therapist does NOT work with
  excludedTopics: string[];
}

export interface ScoringResult {
  therapist: TherapistForMatching;
  totalScore: number;
  topicFitScore: number;
  styleFitScore: number;
  matchReasons: MatchReason[];
  passesLogistics: boolean;
}

// ============================================================================
// LOGISTICS FILTER
// ============================================================================

interface LogisticsCheckResult {
  passes: boolean;
  reasons: MatchReason[];
}

function checkLogistics(
  therapist: TherapistForMatching,
  input: WizardMatchInput
): LogisticsCheckResult {
  const reasons: MatchReason[] = [];

  // EXCLUSION CRITERIA: Check if therapist has excluded the user's selected topic
  const excludedTopics = therapist.excludedTopics || [];
  if (excludedTopics.length > 0) {
    // Check if user's category or subcategory is in the exclusion list
    if (input.categoryId && excludedTopics.includes(input.categoryId)) {
      return { passes: false, reasons: [] };
    }
    if (input.subcategoryId && excludedTopics.includes(input.subcategoryId)) {
      return { passes: false, reasons: [] };
    }
  }

  // Session type filter
  if (input.sessionType) {
    if (input.sessionType === "both") {
      // User wants both - therapist must offer both
      if (therapist.sessionType !== "both") {
        return { passes: false, reasons: [] };
      }
    } else if (input.sessionType === "online") {
      // User wants online - therapist must offer online or both
      if (therapist.sessionType !== "online" && therapist.sessionType !== "both") {
        return { passes: false, reasons: [] };
      }
    } else if (input.sessionType === "in_person") {
      // User wants in person - therapist must offer in person or both
      if (therapist.sessionType !== "in_person" && therapist.sessionType !== "both") {
        return { passes: false, reasons: [] };
      }
    }
  }

  // Insurance filter
  if (input.insurance) {
    if (!therapist.insurance.includes(input.insurance)) {
      return { passes: false, reasons: [] };
    }
  }

  // Gender preference filter (hard filter)
  if (input.genderPreference) {
    if (therapist.gender !== input.genderPreference) {
      return { passes: false, reasons: [] };
    }
    // Add reason for matching gender preference
    const genderLabel = {
      female: "Weibliche Therapeutin",
      male: "Männlicher Therapeut",
      diverse: "Diverse:r Therapeut:in",
    }[input.genderPreference];
    reasons.push({
      type: "logistics" as const,
      textDE: genderLabel,
      priority: 4,
    });
  }

  // Language filter (hard filter)
  if (input.languages.length > 0) {
    // Therapist must offer at least one of the required languages
    const therapistLangs = therapist.languages || ["de"]; // Default to German
    const hasMatchingLanguage = input.languages.some((lang) =>
      therapistLangs.includes(lang)
    );
    if (!hasMatchingLanguage) {
      return { passes: false, reasons: [] };
    }
    // Add reason for matching language
    const matchedLangs = input.languages.filter((lang) =>
      therapistLangs.includes(lang)
    );
    if (matchedLangs.length > 0) {
      const langLabels: Record<string, string> = {
        en: "Englisch",
        tr: "Türkisch",
        ar: "Arabisch",
        ru: "Russisch",
        pl: "Polnisch",
        uk: "Ukrainisch",
        fa: "Persisch",
        es: "Spanisch",
        fr: "Französisch",
      };
      const langName = langLabels[matchedLangs[0]] || matchedLangs[0].toUpperCase();
      reasons.push({
        type: "logistics" as const,
        textDE: `Spricht ${langName}`,
        priority: 4,
      });
    }
  }

  // Location filter (soft filter for now - just check if in same city/area)
  // TODO: Implement proper distance calculation with geocoding
  if (input.location && input.sessionType !== "online") {
    const locationLower = input.location.toLowerCase().trim();
    const therapistCity = (therapist.city || "").toLowerCase();
    const therapistPLZ = (therapist.postalCode || "");

    // Simple matching: check if PLZ starts with same digits or city contains search
    const locationMatches =
      therapistCity.includes(locationLower) ||
      locationLower.includes(therapistCity) ||
      therapistPLZ.startsWith(locationLower.slice(0, 2)) ||
      locationLower.startsWith(therapistPLZ.slice(0, 2));

    // For now, don't hard filter by location - just boost matching locations
    if (locationMatches && therapist.city) {
      reasons.push({
        type: "logistics" as const,
        textDE: `Praxis in ${therapist.city}`,
        priority: 4,
      });
    }
  }

  return { passes: true, reasons };
}

// ============================================================================
// SPECIALIZATION TO WIZARD CATEGORY MAPPING (Fallback)
// ============================================================================

const SPECIALIZATION_TO_CATEGORY: Record<string, string[]> = {
  // Existing specializations → Wizard category IDs
  anxiety: ["anxiety_panic"],
  panic: ["anxiety_panic"],
  depression: ["depression_emptiness"],
  burnout: ["stress_burnout"],
  stress: ["stress_burnout"],
  trauma: ["trauma_ptsd"],
  relationships: ["family_relationships"],
  family: ["family_relationships"],
  couples: ["family_relationships"],
  addiction: ["addiction"],
  eating_disorders: ["eating_disorders"],
  adhd: ["attention"],
  children: ["school_learning"],
  psychosomatic: ["psychosomatic"],
  grief: ["grief_loss"],
  ocd: ["ocd"],
  sexuality: ["sexuality"],
  chronic_illness: ["chronic_illness"],
};

function getEffectiveCategories(therapist: TherapistForMatching): string[] {
  // Use wizardCategories if available
  if (therapist.wizardCategories.length > 0) {
    return therapist.wizardCategories;
  }

  // Fallback: Map specializations to wizard categories
  const mapped = new Set<string>();
  for (const spec of therapist.specializations ?? []) {
    const categories = SPECIALIZATION_TO_CATEGORY[spec];
    if (categories) {
      categories.forEach(c => mapped.add(c));
    }
  }
  return Array.from(mapped);
}

// ============================================================================
// TOPIC FIT SCORING (0-100 scale)
// ============================================================================

function calculateTopicFit(
  therapist: TherapistForMatching,
  input: WizardMatchInput
): { score: number; reasons: MatchReason[] } {
  let score = 0;
  const reasons: MatchReason[] = [];

  const category = getCategoryById(input.categoryId);
  const categoryLabel = category?.labelDE ?? input.categoryId;

  // Get effective categories (wizard or fallback from specializations)
  const effectiveCategories = getEffectiveCategories(therapist);

  // Category match (max 100 points)
  if (effectiveCategories.includes(input.categoryId)) {
    // Exact category match
    if (therapist.wizardSubcategories.includes(input.subcategoryId)) {
      // Perfect match - both category and subcategory
      score = 100;
      reasons.push({
        type: "topic",
        textDE: `Spezialisiert auf ${categoryLabel}`,
        priority: 1,
      });
    } else {
      // Category matches but not subcategory
      score = 75;
      reasons.push({
        type: "topic",
        textDE: `Erfahrung mit ${categoryLabel}`,
        priority: 1,
      });
    }
  } else if (effectiveCategories.length > 0) {
    // Has some specializations but not the selected category
    // Give partial credit based on general expertise
    score = 40;

    // Find a related specialty to mention
    const relatedSpec = therapist.specializations?.[0];
    if (relatedSpec) {
      const specLabels: Record<string, string> = {
        anxiety: "Angst",
        depression: "Depression",
        burnout: "Burnout",
        trauma: "Trauma",
        relationships: "Beziehungen",
        stress: "Stress",
        addiction: "Sucht",
        eating_disorders: "Essstörungen",
        adhd: "ADHS",
        grief: "Trauer",
        ocd: "Zwangsstörungen",
        psychosomatic: "Psychosomatik",
      };
      const label = specLabels[relatedSpec] || relatedSpec;
      reasons.push({
        type: "topic",
        textDE: `Erfahrung mit ${label}`,
        priority: 2,
      });
    }
  } else {
    // No specific specializations
    score = 20;
  }

  // Note: Severity score is NOT used for ranking
  // The symptom questions exist to make users feel heard and cared for,
  // not to discriminate against newer therapists.

  return { score, reasons };
}

// ============================================================================
// STYLE FIT SCORING (0-100 scale)
// ============================================================================

function calculateStyleFit(
  therapist: TherapistForMatching,
  input: WizardMatchInput
): { score: number; reasons: MatchReason[] } {
  const reasons: MatchReason[] = [];

  // If user didn't specify preferences, give neutral score
  const userHasStructurePref = input.styleStructure && input.styleStructure !== "unsure";
  const userHasEngagementPref = input.styleEngagement && input.styleEngagement !== "unsure";

  // If user has no preferences, everyone gets 70 (good baseline)
  if (!userHasStructurePref && !userHasEngagementPref) {
    return { score: 70, reasons };
  }

  let structureScore = 50; // Neutral baseline
  let engagementScore = 50; // Neutral baseline

  // Structure preference match
  if (userHasStructurePref) {
    if (therapist.primaryStyleStructure === null) {
      // Therapist hasn't specified - assume flexible/mixed
      structureScore = input.styleStructure === "mixed" ? 80 : 60;
    } else if (therapist.primaryStyleStructure === input.styleStructure) {
      // Perfect match
      structureScore = 100;
      const styleLabel =
        input.styleStructure === "structured"
          ? "strukturiertem Ansatz"
          : input.styleStructure === "open"
            ? "freiem Gespräch"
            : "flexiblem Stil";
      reasons.push({
        type: "style",
        textDE: `Passt zu Ihrem Wunsch nach ${styleLabel}`,
        priority: 2,
      });
    } else if (
      therapist.primaryStyleStructure === "mixed" ||
      input.styleStructure === "mixed"
    ) {
      // Partial match for mixed/flexible
      structureScore = 75;
    } else {
      // Mismatch
      structureScore = 40;
    }
  }

  // Engagement preference match
  if (userHasEngagementPref) {
    if (therapist.primaryStyleEngagement === null) {
      // Therapist hasn't specified - assume situational/flexible
      engagementScore = input.styleEngagement === "situational" ? 80 : 60;
    } else if (therapist.primaryStyleEngagement === input.styleEngagement) {
      // Perfect match
      engagementScore = 100;
      // Only add reason if we don't already have a style reason
      if (reasons.filter((r) => r.type === "style").length === 0) {
        const engageLabel =
          input.styleEngagement === "active"
            ? "aktiver Begleitung"
            : input.styleEngagement === "receptive"
              ? "zuhörender Haltung"
              : "situativer Anpassung";
        reasons.push({
          type: "style",
          textDE: `Bietet ${engageLabel}`,
          priority: 2,
        });
      }
    } else if (
      therapist.primaryStyleEngagement === "situational" ||
      input.styleEngagement === "situational"
    ) {
      // Partial match for situational
      engagementScore = 75;
    } else {
      // Mismatch
      engagementScore = 40;
    }
  }

  // Average the scores
  let score: number;
  if (userHasStructurePref && userHasEngagementPref) {
    score = (structureScore + engagementScore) / 2;
  } else if (userHasStructurePref) {
    score = structureScore;
  } else {
    score = engagementScore;
  }

  return { score, reasons };
}

// ============================================================================
// GOAL FIT SCORING (0-100 scale) - Evidence-based P2/P3
// ============================================================================

function calculateGoalFit(
  therapist: TherapistForMatching,
  input: WizardMatchInput
): { score: number; reasons: MatchReason[] } {
  const reasons: MatchReason[] = [];
  let goalScore = 50;
  let focusScore = 50;

  // Map user's therapy goal to therapist's therapyDepth
  // User: symptom_relief | deep_understanding | both
  // Therapist: symptom_relief | deep_change | flexible
  if (input.therapyGoal) {
    const depthMap: Record<string, string> = {
      symptom_relief: "symptom_relief",
      deep_understanding: "deep_change",
      both: "flexible",
    };
    const expectedDepth = depthMap[input.therapyGoal];

    if (therapist.therapyDepth === null || therapist.therapyDepth === "flexible") {
      // Therapist is flexible - good match for any preference
      goalScore = input.therapyGoal === "both" ? 90 : 70;
    } else if (therapist.therapyDepth === expectedDepth) {
      // Perfect match
      goalScore = 100;
      const goalLabel =
        input.therapyGoal === "symptom_relief"
          ? "Fokus auf Symptomlinderung"
          : input.therapyGoal === "deep_understanding"
            ? "Tiefgreifende Veränderung"
            : "Ganzheitlicher Ansatz";
      reasons.push({
        type: "style",
        textDE: goalLabel,
        priority: 1,
      });
    } else {
      // Mismatch
      goalScore = 35;
    }
  }

  // Map user's time orientation to therapist's therapyFocus
  // User: present | past | holistic
  // Therapist: past | present | future | holistic
  if (input.timeOrientation) {
    if (therapist.therapyFocus === null || therapist.therapyFocus === "holistic") {
      // Therapist is holistic - good match for any preference
      focusScore = input.timeOrientation === "holistic" ? 90 : 70;
    } else if (therapist.therapyFocus === input.timeOrientation) {
      // Perfect match
      focusScore = 100;
      // Only add reason if we don't already have one
      if (reasons.length === 0) {
        const focusLabel =
          input.timeOrientation === "present"
            ? "Gegenwartsorientierter Ansatz"
            : input.timeOrientation === "past"
              ? "Biografiearbeit"
              : "Ganzheitliche Betrachtung";
        reasons.push({
          type: "style",
          textDE: focusLabel,
          priority: 2,
        });
      }
    } else if (input.timeOrientation === "holistic") {
      // User wants holistic - partial match with any focus
      focusScore = 75;
    } else {
      // Mismatch
      focusScore = 40;
    }
  }

  // Average the scores
  const score = (goalScore + focusScore) / 2;
  return { score, reasons };
}

// ============================================================================
// THERAPEUTIC STANCE REASONS (T3 from evidence-based spec)
// ============================================================================

const STANCE_LABELS: Record<string, string> = {
  explaining: "Erklärender Ansatz",
  holding: "Haltende Begleitung",
  challenging: "Herausfordernde Impulse",
  validating: "Validierende Haltung",
  structuring: "Strukturgebend",
};

function getTherapeuticStanceReasons(
  therapist: TherapistForMatching,
  input: WizardMatchInput
): MatchReason[] {
  const reasons: MatchReason[] = [];
  const stances = therapist.therapeuticStance || [];

  if (stances.length === 0) return reasons;

  // PRIORITY: Users with negative therapy experiences need holding/validating therapists
  if (input.hadNegativeExperience) {
    if (stances.includes("holding")) {
      reasons.push({
        type: "style",
        textDE: "Einfühlsame, haltende Begleitung",
        priority: 1, // High priority for negative experience users
      });
      return reasons; // Return immediately - this is most important
    } else if (stances.includes("validating")) {
      reasons.push({
        type: "style",
        textDE: "Validierende, unterstützende Haltung",
        priority: 1,
      });
      return reasons;
    }
  }

  // Match stance to user preferences
  // Users who want symptom relief typically benefit from structuring/explaining
  if (input.therapyGoal === "symptom_relief") {
    if (stances.includes("structuring")) {
      reasons.push({
        type: "style",
        textDE: STANCE_LABELS.structuring,
        priority: 3,
      });
    } else if (stances.includes("explaining")) {
      reasons.push({
        type: "style",
        textDE: STANCE_LABELS.explaining,
        priority: 3,
      });
    }
  }

  // Users who want deep understanding typically benefit from holding/validating
  if (input.therapyGoal === "deep_understanding") {
    if (stances.includes("holding")) {
      reasons.push({
        type: "style",
        textDE: STANCE_LABELS.holding,
        priority: 3,
      });
    } else if (stances.includes("validating")) {
      reasons.push({
        type: "style",
        textDE: STANCE_LABELS.validating,
        priority: 3,
      });
    }
  }

  // Active engagement users may appreciate challenging stance
  if (input.styleEngagement === "active" && stances.includes("challenging")) {
    reasons.push({
      type: "style",
      textDE: STANCE_LABELS.challenging,
      priority: 3,
    });
  }

  // Receptive users may appreciate validating/holding stance
  if (input.styleEngagement === "receptive") {
    if (stances.includes("validating") && !reasons.some(r => r.textDE === STANCE_LABELS.validating)) {
      reasons.push({
        type: "style",
        textDE: STANCE_LABELS.validating,
        priority: 3,
      });
    }
  }

  // Return max 1 stance reason to avoid overwhelming
  return reasons.slice(0, 1);
}

// ============================================================================
// AVAILABILITY BONUS (0-100 scale, used as small factor)
// ============================================================================

function calculateAvailabilityBonus(
  therapist: TherapistForMatching
): { score: number; reasons: MatchReason[] } {
  const reasons: MatchReason[] = [];
  let score = 50; // Baseline

  if (therapist.availability === "immediately") {
    score = 100;
    reasons.push({
      type: "availability",
      textDE: "Kurzfristig verfügbar",
      priority: 3,
    });
  } else if (therapist.availability === "this_week") {
    score = 80;
    reasons.push({
      type: "availability",
      textDE: "Diese Woche verfügbar",
      priority: 3,
    });
  } else if (therapist.availability === "flexible") {
    score = 60;
  }

  return { score, reasons };
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

export function calculateWizardScore(
  therapist: TherapistForMatching,
  input: WizardMatchInput
): ScoringResult {
  // Check logistics first (hard filter)
  const logisticsResult = checkLogistics(therapist, input);

  if (!logisticsResult.passes) {
    return {
      therapist,
      totalScore: 0,
      topicFitScore: 0,
      styleFitScore: 0,
      matchReasons: [],
      passesLogistics: false,
    };
  }

  // Calculate component scores (all on 0-100 scale)
  const topicResult = calculateTopicFit(therapist, input);
  const styleResult = calculateStyleFit(therapist, input);
  const goalResult = calculateGoalFit(therapist, input);
  const availabilityResult = calculateAvailabilityBonus(therapist);
  const stanceReasons = getTherapeuticStanceReasons(therapist, input);

  // Bonus for negative experience: boost therapists with holding/validating stance
  let negativeExperienceBonus = 0;
  if (input.hadNegativeExperience) {
    const stances = therapist.therapeuticStance || [];
    if (stances.includes("holding") || stances.includes("validating")) {
      negativeExperienceBonus = 10; // +10 points for supportive therapists
    }
  }

  // Evidence-based weights (per Pflichtenheft):
  // - Arbeitsstil & Haltung (Style + Goal): ~45% → Style 20% + Goal 25%
  // - Zieltyp & Methode (Topic): ~35%
  // - Beziehung: ~15% → handled via logistics hard filter + bonus reasons
  // - Praktische Faktoren: ~5% → Availability
  const totalScore =
    topicResult.score * 0.35 +    // Topic: 35%
    styleResult.score * 0.20 +    // Style: 20%
    goalResult.score * 0.25 +     // Goal: 25% (NEW - therapy depth + focus)
    availabilityResult.score * 0.05 + // Availability: 5%
    (logisticsResult.reasons.length > 0 ? 15 : 0) + // Relationship bonus: up to 15%
    negativeExperienceBonus;       // Bonus for supportive therapists if user had negative experiences

  // Combine all reasons and sort by priority
  const allReasons = [
    ...goalResult.reasons,        // Goal reasons first (highest priority)
    ...topicResult.reasons,
    ...styleResult.reasons,
    ...stanceReasons,             // Therapeutic stance reasons (T3)
    ...availabilityResult.reasons,
    ...logisticsResult.reasons,
  ].sort((a, b) => a.priority - b.priority);

  // Ensure we always have at least one reason
  let matchReasons = allReasons.slice(0, 3);

  // If no specific reasons, add a generic one
  if (matchReasons.length === 0) {
    matchReasons = [{
      type: "general" as const,
      textDE: "Qualifizierte Therapeut:in",
      priority: 10,
    }];
  }

  return {
    therapist,
    totalScore,
    topicFitScore: topicResult.score,
    styleFitScore: styleResult.score,
    matchReasons,
    passesLogistics: true,
  };
}

// ============================================================================
// BATCH SCORING & RANKING
// ============================================================================

export function rankTherapists(
  therapists: TherapistForMatching[],
  input: WizardMatchInput,
  limit: number = 3
): MatchedTherapistV2[] {
  // Score all therapists
  const results = therapists.map((t) => calculateWizardScore(t, input));

  // Filter out those who don't pass logistics
  const validResults = results.filter((r) => r.passesLogistics);

  // Sort by total score descending
  validResults.sort((a, b) => b.totalScore - a.totalScore);

  // Take top N and convert to MatchedTherapistV2
  return validResults.slice(0, limit).map((result) => ({
    id: result.therapist.id,
    slug: result.therapist.slug,
    name: result.therapist.name,
    imageUrl: result.therapist.imageUrl,
    shortDescription: result.therapist.shortDescription,
    city: result.therapist.city,
    sessionType: result.therapist.sessionType,
    totalScore: result.totalScore,
    topicFitScore: result.topicFitScore,
    styleFitScore: result.styleFitScore,
    matchReasons: result.matchReasons,
  }));
}
