import type {
  Therapist,
  MatchingCriteria,
  MatchedTherapist,
  SessionType,
  TherapyStylePreferences,
  ScoreBreakdown,
  ScoreCategory,
  ExclusionResult,
  SubSpecialty,
} from "@/types/therapist";
import { getSpecialtiesFromTopics, getTopicById } from "./topics";

/**
 * Score Weights (Fairness Update - No Intensity or Premium Bonus):
 * - Topic match: 30 points (with specialization ranking)
 * - SubTopic match: 15 points (precise sub-specialization matching)
 * - Criteria match: 40 points (location 12, gender 8, session type 12, insurance 8)
 * - Therapy Style: 0 points (REMOVED)
 * - Profile Quality: 15 points (image, description, verified - NO premium bonus)
 *
 * FAIRNESS: Intensity no longer affects scoring (moved to contact inquiry).
 * FAIRNESS: Premium accounts do NOT receive ranking benefits.
 */

const WEIGHTS = {
  topics: 30, // Increased from 25 (fairness redistribution)
  subTopics: 15, // Increased from 10 (fairness redistribution)
  criteria: 40,
  therapyStyle: 0, // Removed - Style Quiz no longer used
  profileQuality: 15, // Increased from 10 (NO premium bonus)
};

// Specialization ranking multipliers
const RANK_MULTIPLIERS = {
  1: 1.0, // Full points for rank 1
  2: 0.7, // 70% for rank 2
  3: 0.4, // 40% for rank 3
  unranked: 0.3, // 30% for unranked
};

// Profile quality bonuses (within 15 points) - NO premium bonus for fairness
const QUALITY_BONUSES = {
  hasImage: 5, // Increased from 3
  hasDescription: 4, // Increased from 2
  verified: 6, // Increased from 3
  // premium: REMOVED - All therapists are treated equally
};

/**
 * Apply hard exclusion filters BEFORE scoring
 * Returns excluded=true if therapist should be filtered out
 */
export function applyHardExclusions(
  therapist: Therapist,
  criteria: MatchingCriteria
): ExclusionResult {
  // 1. Language check (if user specified required languages)
  if (criteria.requiredLanguages && criteria.requiredLanguages.length > 0) {
    const hasLanguage = criteria.requiredLanguages.some((lang) =>
      therapist.languages.includes(lang)
    );
    if (!hasLanguage) {
      return { excluded: true, reason: "language" };
    }
  }

  // 2. Session type conflict (strict mismatch)
  if (criteria.sessionType && criteria.sessionType !== "both") {
    if (
      therapist.sessionType !== criteria.sessionType &&
      therapist.sessionType !== "both"
    ) {
      return { excluded: true, reason: "session_type" };
    }
  }

  // 3. Verified only filter
  if (criteria.verifiedOnly && !therapist.isVerified) {
    return { excluded: true, reason: "unverified" };
  }

  return { excluded: false };
}

export function calculateMatchScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  // 1. TOPIC MATCH with ranking (max 30 points)
  const topicScore = calculateTopicScoreWithRanking(therapist, criteria);

  // 2. SUBTOPIC MATCH with ranking (max 15 points)
  const subTopicScore = calculateSubTopicScore(therapist, criteria);

  // 3. CRITERIA MATCH (max 40 points)
  const criteriaScore = calculateCriteriaScore(therapist, criteria);

  // 4. THERAPY STYLE MATCH (max 0 points - removed)
  const styleScore = calculateTherapyStyleScore(therapist, criteria.therapyStyle);

  // 5. PROFILE QUALITY (max 15 points - NO premium bonus)
  const qualityScore = calculateProfileQualityScore(therapist);

  // NOTE: Intensity score removed for fairness - moved to contact inquiry
  const total = topicScore + subTopicScore + criteriaScore + styleScore + qualityScore;
  return Math.round(Math.min(100, Math.max(0, total)));
}

/**
 * Calculate profile quality score (max 15 points)
 * NOTE: Premium bonus removed for fairness - all therapists treated equally
 */
function calculateProfileQualityScore(therapist: Therapist): number {
  let score = 0;

  // Image bonus
  if (therapist.imageUrl && therapist.imageUrl.trim() !== "") {
    score += QUALITY_BONUSES.hasImage;
  }

  // Description bonus
  if (therapist.shortDescription && therapist.shortDescription.length > 50) {
    score += QUALITY_BONUSES.hasDescription;
  }

  // Verified bonus
  if (therapist.isVerified) {
    score += QUALITY_BONUSES.verified;
  }

  // NOTE: Premium bonus REMOVED for fairness - all therapists treated equally

  return Math.min(WEIGHTS.profileQuality, score);
}

/**
 * Calculate topic score with specialization ranking (max 35 points)
 * Also considers otherTopicSpecialties from "unsureOther" freetext analysis
 */
function calculateTopicScoreWithRanking(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  if (criteria.selectedTopics.length === 0 && (!criteria.otherTopicSpecialties || criteria.otherTopicSpecialties.length === 0)) {
    return WEIGHTS.topics; // No topics selected = full points
  }

  // Get specialties from selected topics
  const topicSpecialties = getSpecialtiesFromTopics(criteria.selectedTopics);

  // Merge with otherTopicSpecialties from "unsureOther" freetext analysis
  const otherSpecs = (criteria.otherTopicSpecialties || []) as typeof topicSpecialties;
  const selectedSpecialties = [...new Set([...topicSpecialties, ...otherSpecs])];

  if (selectedSpecialties.length === 0) {
    return WEIGHTS.topics;
  }

  let totalScore = 0;
  const ranks = therapist.specializationRanks ?? {};

  for (const specialty of selectedSpecialties) {
    if (therapist.specializations.includes(specialty)) {
      const rank = ranks[specialty] as 1 | 2 | 3 | undefined;
      const multiplier = rank
        ? RANK_MULTIPLIERS[rank]
        : RANK_MULTIPLIERS.unranked;
      totalScore += multiplier;
    }
  }

  const maxScore = selectedSpecialties.length;
  if (maxScore === 0) return WEIGHTS.topics;

  const ratio = totalScore / maxScore;
  return Math.round(ratio * WEIGHTS.topics);
}

/**
 * Calculate sub-topic score with ranking (max 10 points)
 * Provides bonus points for precise sub-specialization matches
 */
function calculateSubTopicScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  // If user didn't select any subTopics, give full points (no penalty)
  if (!criteria.selectedSubTopics || criteria.selectedSubTopics.length === 0) {
    return WEIGHTS.subTopics;
  }

  // If therapist has no sub-specializations, give half points
  if (!therapist.subSpecializations || therapist.subSpecializations.length === 0) {
    return Math.round(WEIGHTS.subTopics * 0.5);
  }

  let totalScore = 0;
  const ranks = therapist.subSpecializationRanks ?? {};

  for (const subTopic of criteria.selectedSubTopics) {
    if (therapist.subSpecializations.includes(subTopic as SubSpecialty)) {
      const rank = ranks[subTopic] as 1 | 2 | 3 | undefined;
      const multiplier = rank
        ? RANK_MULTIPLIERS[rank]
        : RANK_MULTIPLIERS.unranked;
      totalScore += multiplier;
    }
  }

  const maxScore = criteria.selectedSubTopics.length;
  if (maxScore === 0) return WEIGHTS.subTopics;

  const ratio = totalScore / maxScore;
  return Math.round(ratio * WEIGHTS.subTopics);
}

/**
 * Get details for sub-topic matching
 */
function getSubTopicMatchDetails(
  therapist: Therapist,
  criteria: MatchingCriteria
): string {
  if (!criteria.selectedSubTopics || criteria.selectedSubTopics.length === 0) {
    return "";
  }
  if (!therapist.subSpecializations || therapist.subSpecializations.length === 0) {
    return "no sub-specs";
  }

  const matching = therapist.subSpecializations.filter((sub) =>
    criteria.selectedSubTopics?.includes(sub)
  );

  return matching.slice(0, 3).join(", ");
}

/**
 * Calculate match score with detailed breakdown for transparent scoring
 * NOTE: Intensity score removed for fairness - moved to contact inquiry
 */
export function calculateMatchScoreWithBreakdown(
  therapist: Therapist,
  criteria: MatchingCriteria
): { score: number; breakdown: ScoreBreakdown } {
  // Calculate individual scores (NO intensity score for fairness)
  const topicScore = calculateTopicScoreWithRanking(therapist, criteria);
  const subTopicScore = calculateSubTopicScore(therapist, criteria);
  const criteriaScore = calculateCriteriaScore(therapist, criteria);
  const styleScore = calculateTherapyStyleScore(therapist, criteria.therapyStyle);
  const qualityScore = calculateProfileQualityScore(therapist);

  const total = Math.round(
    Math.min(100, Math.max(0, topicScore + subTopicScore + criteriaScore + styleScore + qualityScore))
  );

  // Generate match reasons
  const matchReasons = generateMatchReasons(therapist, criteria, {
    specialization: topicScore,
    subSpecialization: subTopicScore,
    style: styleScore,
    practical: criteriaScore,
  });

  // Build breakdown (NO intensityExperience for fairness)
  const breakdown: ScoreBreakdown = {
    total,
    categories: {
      specialization: {
        score: topicScore,
        maxScore: WEIGHTS.topics,
        label: "specialization",
        details: getMatchingSpecialtiesText(therapist, criteria),
      },
      subSpecialization: {
        score: subTopicScore,
        maxScore: WEIGHTS.subTopics,
        label: "subSpecialization",
        details: getSubTopicMatchDetails(therapist, criteria),
      },
      therapyStyle: {
        score: styleScore,
        maxScore: WEIGHTS.therapyStyle,
        label: "therapyStyle",
        details: getStyleMatchDetails(therapist, criteria.therapyStyle),
      },
      practicalCriteria: {
        score: criteriaScore,
        maxScore: WEIGHTS.criteria,
        label: "practicalCriteria",
        details: getCriteriaMatchDetails(therapist, criteria),
      },
      profileQuality: {
        score: qualityScore,
        maxScore: WEIGHTS.profileQuality,
        label: "profileQuality",
        details: getProfileQualityDetails(therapist),
      },
    },
    matchReasons,
  };

  return { score: total, breakdown };
}

/**
 * Get details for profile quality
 * NOTE: Premium removed for fairness - all therapists treated equally
 */
function getProfileQualityDetails(therapist: Therapist): string {
  const details: string[] = [];
  if (therapist.imageUrl) details.push("image");
  if (therapist.shortDescription && therapist.shortDescription.length > 50) details.push("description");
  if (therapist.isVerified) details.push("verified");
  // NOTE: premium removed for fairness
  return details.join(", ");
}

/**
 * Calculate therapy style score (max 20 points)
 */
function calculateTherapyStyleScore(
  therapist: Therapist,
  preferences?: TherapyStylePreferences
): number {
  // If no preferences set, give full points
  if (!preferences) {
    return WEIGHTS.therapyStyle;
  }

  // Check if all preferences are null
  const allNull = Object.values(preferences).every((v) => v === null);
  if (allNull) {
    return WEIGHTS.therapyStyle;
  }

  let score = 0;
  let maxPoints = 0;

  // Communication style (6 points)
  if (preferences.communicationStyle !== null) {
    maxPoints += 6;
    if (therapist.communicationStyle) {
      if (
        preferences.communicationStyle === therapist.communicationStyle ||
        therapist.communicationStyle === "balanced"
      ) {
        score += 6;
      } else if (preferences.communicationStyle === "balanced") {
        score += 4; // Partial points
      }
    } else {
      // Therapist has no preference set, give partial points
      score += 3;
    }
  }

  // Homework preference (4 points)
  if (preferences.prefersHomework !== null) {
    maxPoints += 4;
    if (therapist.usesHomework !== undefined) {
      if (preferences.prefersHomework === therapist.usesHomework) {
        score += 4;
      }
    } else {
      // Therapist has no preference set, give partial points
      score += 2;
    }
  }

  // Therapy focus (5 points)
  if (preferences.therapyFocus !== null) {
    maxPoints += 5;
    if (therapist.therapyFocus) {
      if (
        preferences.therapyFocus === therapist.therapyFocus ||
        therapist.therapyFocus === "holistic"
      ) {
        score += 5;
      } else if (preferences.therapyFocus === "holistic") {
        score += 3; // Partial points
      }
    } else {
      score += 2;
    }
  }

  // Talk preference (3 points)
  if (preferences.talkPreference !== null) {
    maxPoints += 3;
    if (therapist.clientTalkRatio !== undefined) {
      const prefersMoreTalk = preferences.talkPreference === "more_self";
      const therapistHighRatio = therapist.clientTalkRatio >= 50;
      if (prefersMoreTalk === therapistHighRatio) {
        score += 3;
      }
    } else {
      score += 1;
    }
  }

  // Therapy depth (2 points)
  if (preferences.therapyDepth !== null) {
    maxPoints += 2;
    if (therapist.therapyDepth) {
      if (
        preferences.therapyDepth === therapist.therapyDepth ||
        therapist.therapyDepth === "flexible"
      ) {
        score += 2;
      } else if (preferences.therapyDepth === "flexible") {
        score += 1;
      }
    } else {
      score += 1;
    }
  }

  // Scale to 20 points
  if (maxPoints === 0) {
    return WEIGHTS.therapyStyle;
  }

  return Math.round((score / maxPoints) * WEIGHTS.therapyStyle);
}

/**
 * Generate human-readable match reasons
 */
function generateMatchReasons(
  therapist: Therapist,
  criteria: MatchingCriteria,
  scores: { specialization: number; subSpecialization?: number; style: number; practical: number }
): string[] {
  const reasons: string[] = [];

  // Specialization reasons (threshold adjusted for new 25 max)
  if (scores.specialization >= 18) {
    const matchingSpecs = getMatchingSpecialtiesText(therapist, criteria);
    if (matchingSpecs) {
      reasons.push(`expertIn:${matchingSpecs}`);
    }
  }

  // Sub-specialization reasons (threshold: 8 of 10)
  if (scores.subSpecialization && scores.subSpecialization >= 8) {
    const matchingSubSpecs = getSubTopicMatchDetails(therapist, criteria);
    if (matchingSubSpecs && matchingSubSpecs !== "no sub-specs") {
      reasons.push(`preciseMatch:${matchingSubSpecs}`);
    }
  }

  // Therapy style reasons (threshold adjusted for new 20 max)
  if (scores.style >= 15) {
    reasons.push("styleMatches");
  }

  // Practical criteria reasons
  if (criteria.sessionType && matchesSessionType(therapist.sessionType, criteria.sessionType)) {
    if (therapist.sessionType === "online" || criteria.sessionType === "online") {
      reasons.push("offersOnline");
    } else if (therapist.sessionType === "in_person" || criteria.sessionType === "in_person") {
      reasons.push("offersInPerson");
    }
  }

  if (therapist.availability === "immediately") {
    reasons.push("availableNow");
  }

  if (criteria.location && matchesLocation(therapist, criteria.location)) {
    reasons.push("nearLocation");
  }

  return reasons.slice(0, 4); // Max 4 reasons
}

function getMatchingSpecialtiesText(
  therapist: Therapist,
  criteria: MatchingCriteria
): string {
  if (criteria.selectedTopics.length === 0 && (!criteria.otherTopicSpecialties || criteria.otherTopicSpecialties.length === 0)) {
    return "";
  }

  // Get specialties from selected topics + otherTopicSpecialties
  const topicSpecialties = getSpecialtiesFromTopics(criteria.selectedTopics);
  const otherSpecs = (criteria.otherTopicSpecialties || []) as typeof topicSpecialties;
  const selectedSpecialties = [...new Set([...topicSpecialties, ...otherSpecs])];

  const matching = therapist.specializations.filter((spec) =>
    selectedSpecialties.includes(spec)
  );

  return matching.slice(0, 3).join(", ");
}

function getStyleMatchDetails(
  therapist: Therapist,
  preferences?: TherapyStylePreferences
): string {
  if (!preferences) return "";

  const details: string[] = [];

  if (preferences.communicationStyle && therapist.communicationStyle) {
    if (
      preferences.communicationStyle === therapist.communicationStyle ||
      therapist.communicationStyle === "balanced"
    ) {
      details.push(therapist.communicationStyle);
    }
  }

  if (preferences.prefersHomework !== null && therapist.usesHomework !== undefined) {
    if (preferences.prefersHomework === therapist.usesHomework) {
      details.push(therapist.usesHomework ? "homework" : "noHomework");
    }
  }

  return details.join(", ");
}

function getCriteriaMatchDetails(
  therapist: Therapist,
  criteria: MatchingCriteria
): string {
  const details: string[] = [];

  if (criteria.sessionType && matchesSessionType(therapist.sessionType, criteria.sessionType)) {
    details.push(therapist.sessionType);
  }

  if (criteria.gender && therapist.gender === criteria.gender) {
    details.push(therapist.gender);
  }

  if (
    criteria.insurance.length > 0 &&
    therapist.insurance.some((ins) => criteria.insurance.includes(ins))
  ) {
    const matchingIns = therapist.insurance.filter((ins) =>
      criteria.insurance.includes(ins)
    );
    details.push(...matchingIns);
  }

  return details.join(", ");
}

/**
 * Calculate criteria score (max 40 points)
 * Points distributed: Location 12, Gender 8, Session Type 12, Insurance 8
 */
function calculateCriteriaScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  let score = 0;
  let maxPoints = 0;

  // Location match (12 points)
  if (criteria.location && criteria.location.trim() !== "") {
    maxPoints += 12;
    if (matchesLocation(therapist, criteria.location)) {
      score += 12;
    }
  }

  // Gender match (8 points)
  if (criteria.gender) {
    maxPoints += 8;
    if (therapist.gender === criteria.gender) {
      score += 8;
    }
  }

  // Session type match (12 points)
  if (criteria.sessionType) {
    maxPoints += 12;
    if (matchesSessionType(therapist.sessionType, criteria.sessionType)) {
      score += 12;
    }
  }

  // Insurance match (8 points)
  if (criteria.insurance && criteria.insurance.length > 0) {
    maxPoints += 8;
    if (
      therapist.insurance.some((ins) => criteria.insurance.includes(ins))
    ) {
      score += 8;
    }
  }

  // If no criteria selected, give full points
  if (maxPoints === 0) {
    return WEIGHTS.criteria;
  }

  // Scale to WEIGHTS.criteria points based on selected criteria
  return Math.round((score / maxPoints) * WEIGHTS.criteria);
}

function matchesLocation(therapist: Therapist, query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return true;

  const city = therapist.location.city.toLowerCase();
  const postalCode = therapist.location.postalCode.toLowerCase();

  return city.includes(lowerQuery) || postalCode.includes(lowerQuery);
}

function matchesSessionType(
  therapistType: SessionType,
  wantedType: SessionType
): boolean {
  if (therapistType === "both") return true;
  if (wantedType === "both") return true;
  return therapistType === wantedType;
}

export function sortByMatchScore(
  therapists: MatchedTherapist[]
): MatchedTherapist[] {
  return [...therapists].sort((a, b) => b.matchScore - a.matchScore);
}

export function calculateMatchScoreForAll(
  therapists: Therapist[],
  criteria: MatchingCriteria
): MatchedTherapist[] {
  // Filter out therapists that fail hard exclusion criteria
  const eligible = therapists.filter((therapist) => {
    const exclusion = applyHardExclusions(therapist, criteria);
    return !exclusion.excluded;
  });

  // Calculate scores for eligible therapists
  const matched = eligible.map((therapist) => ({
    ...therapist,
    matchScore: calculateMatchScore(therapist, criteria),
  }));

  return sortByMatchScore(matched);
}

/**
 * Calculate match scores with breakdown for all therapists
 * Used for transparent scoring display
 */
export function calculateMatchScoreForAllWithBreakdown(
  therapists: Therapist[],
  criteria: MatchingCriteria
): MatchedTherapist[] {
  // Filter out therapists that fail hard exclusion criteria
  const eligible = therapists.filter((therapist) => {
    const exclusion = applyHardExclusions(therapist, criteria);
    return !exclusion.excluded;
  });

  // Calculate scores with breakdown for eligible therapists
  const matched = eligible.map((therapist) => {
    const { score, breakdown } = calculateMatchScoreWithBreakdown(
      therapist,
      criteria
    );
    return {
      ...therapist,
      matchScore: score,
      scoreBreakdown: breakdown,
    };
  });

  return sortByMatchScore(matched);
}
