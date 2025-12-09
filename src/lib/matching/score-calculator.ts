import type {
  Therapist,
  MatchingCriteria,
  MatchedTherapist,
  SessionType,
  TherapyStylePreferences,
  ScoreBreakdown,
  ScoreCategory,
  ExclusionResult,
  IntensityLevel,
} from "@/types/therapist";
import { getSpecialtiesFromTopics, getTopicById } from "./topics";

/**
 * Enhanced Score Weights:
 * - Topic match: 35 points (with specialization ranking)
 * - Intensity ↔ Experience: 15 points (NEW)
 * - Criteria match: 20 points (location, gender, session type, insurance)
 * - Therapy Style: 20 points (communication style, homework, focus, etc.)
 * - Profile Quality: 10 points (NEW: image, description, verified, account type)
 */

const WEIGHTS = {
  topics: 35,
  intensityExperience: 15,
  criteria: 20,
  therapyStyle: 20,
  profileQuality: 10,
};

// Specialization ranking multipliers
const RANK_MULTIPLIERS = {
  1: 1.0,   // Full points for rank 1
  2: 0.7,   // 70% for rank 2
  3: 0.4,   // 40% for rank 3
  unranked: 0.3, // 30% for unranked
};

// Profile quality bonuses (within 10 points)
const QUALITY_BONUSES = {
  hasImage: 3,
  hasDescription: 2,
  verified: 3,
  premium: 2,
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
  // 1. TOPIC MATCH with ranking (max 35 points)
  const topicScore = calculateTopicScoreWithRanking(therapist, criteria);

  // 2. INTENSITY ↔ EXPERIENCE (max 15 points)
  const intensityScore = calculateIntensityExperienceScore(
    therapist.experienceYears,
    criteria.intensityLevel
  );

  // 3. CRITERIA MATCH (max 20 points)
  const criteriaScore = calculateCriteriaScore(therapist, criteria);

  // 4. THERAPY STYLE MATCH (max 20 points)
  const styleScore = calculateTherapyStyleScore(therapist, criteria.therapyStyle);

  // 5. PROFILE QUALITY (max 10 points)
  const qualityScore = calculateProfileQualityScore(therapist);

  const total = topicScore + intensityScore + criteriaScore + styleScore + qualityScore;
  return Math.round(Math.min(100, Math.max(0, total)));
}

/**
 * Calculate intensity ↔ experience score (max 15 points)
 * Higher intensity prefers more experienced therapists
 */
function calculateIntensityExperienceScore(
  experienceYears: number | undefined | null,
  intensityLevel: IntensityLevel | null | undefined
): number {
  // If no intensity specified, give full points
  if (!intensityLevel || intensityLevel === "low") {
    return WEIGHTS.intensityExperience;
  }

  const exp = experienceYears ?? 0;

  if (intensityLevel === "high") {
    // High intensity strongly prefers experienced therapists
    if (exp >= 10) return 15;
    if (exp >= 5) return 12;
    if (exp >= 2) return 8;
    return 4;
  }

  if (intensityLevel === "medium") {
    // Medium intensity slightly prefers experience
    if (exp >= 5) return 15;
    if (exp >= 2) return 12;
    return 10;
  }

  return WEIGHTS.intensityExperience;
}

/**
 * Calculate profile quality score (max 10 points)
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

  // Premium account bonus
  if (therapist.accountType === "premium") {
    score += QUALITY_BONUSES.premium;
  }

  return Math.min(WEIGHTS.profileQuality, score);
}

/**
 * Calculate topic score with specialization ranking (max 35 points)
 */
function calculateTopicScoreWithRanking(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  if (criteria.selectedTopics.length === 0) {
    return WEIGHTS.topics; // No topics selected = full points
  }

  const selectedSpecialties = getSpecialtiesFromTopics(criteria.selectedTopics);
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
 * Calculate match score with detailed breakdown for transparent scoring
 */
export function calculateMatchScoreWithBreakdown(
  therapist: Therapist,
  criteria: MatchingCriteria
): { score: number; breakdown: ScoreBreakdown } {
  // Calculate individual scores
  const topicScore = calculateTopicScoreWithRanking(therapist, criteria);
  const intensityScore = calculateIntensityExperienceScore(
    therapist.experienceYears,
    criteria.intensityLevel
  );
  const criteriaScore = calculateCriteriaScore(therapist, criteria);
  const styleScore = calculateTherapyStyleScore(therapist, criteria.therapyStyle);
  const qualityScore = calculateProfileQualityScore(therapist);

  const total = Math.round(
    Math.min(100, Math.max(0, topicScore + intensityScore + criteriaScore + styleScore + qualityScore))
  );

  // Generate match reasons
  const matchReasons = generateMatchReasons(therapist, criteria, {
    specialization: topicScore,
    style: styleScore,
    practical: criteriaScore,
  });

  // Build breakdown
  const breakdown: ScoreBreakdown = {
    total,
    categories: {
      specialization: {
        score: topicScore,
        maxScore: WEIGHTS.topics,
        label: "specialization",
        details: getMatchingSpecialtiesText(therapist, criteria),
      },
      intensityExperience: {
        score: intensityScore,
        maxScore: WEIGHTS.intensityExperience,
        label: "intensityExperience",
        details: getIntensityExperienceDetails(therapist, criteria),
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
 * Get details for intensity-experience matching
 */
function getIntensityExperienceDetails(
  therapist: Therapist,
  criteria: MatchingCriteria
): string {
  if (!criteria.intensityLevel) return "";
  const years = therapist.experienceYears ?? 0;
  return `${years} years experience`;
}

/**
 * Get details for profile quality
 */
function getProfileQualityDetails(therapist: Therapist): string {
  const details: string[] = [];
  if (therapist.imageUrl) details.push("image");
  if (therapist.shortDescription && therapist.shortDescription.length > 50) details.push("description");
  if (therapist.isVerified) details.push("verified");
  if (therapist.accountType === "premium") details.push("premium");
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
  scores: { specialization: number; style: number; practical: number }
): string[] {
  const reasons: string[] = [];

  // Specialization reasons (threshold adjusted for new 35 max)
  if (scores.specialization >= 25) {
    const matchingSpecs = getMatchingSpecialtiesText(therapist, criteria);
    if (matchingSpecs) {
      reasons.push(`expertIn:${matchingSpecs}`);
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
  if (criteria.selectedTopics.length === 0) return "";

  const selectedSpecialties = getSpecialtiesFromTopics(criteria.selectedTopics);
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
 * Calculate criteria score (max 20 points)
 */
function calculateCriteriaScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  let score = 0;
  let maxPoints = 0;

  // Location match (6 points)
  if (criteria.location && criteria.location.trim() !== "") {
    maxPoints += 6;
    if (matchesLocation(therapist, criteria.location)) {
      score += 6;
    }
  }

  // Gender match (4 points)
  if (criteria.gender) {
    maxPoints += 4;
    if (therapist.gender === criteria.gender) {
      score += 4;
    }
  }

  // Session type match (6 points)
  if (criteria.sessionType) {
    maxPoints += 6;
    if (matchesSessionType(therapist.sessionType, criteria.sessionType)) {
      score += 6;
    }
  }

  // Insurance match (4 points)
  if (criteria.insurance && criteria.insurance.length > 0) {
    maxPoints += 4;
    if (
      therapist.insurance.some((ins) => criteria.insurance.includes(ins))
    ) {
      score += 4;
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
