import type {
  Therapist,
  MatchingCriteria,
  MatchedTherapist,
  SessionType,
  TherapyStylePreferences,
  ScoreBreakdown,
  ScoreCategory,
} from "@/types/therapist";
import { getSpecialtiesFromTopics, getTopicById } from "./topics";

/**
 * Score weights (updated for Therapy Style):
 * - Topic match: 40 points (therapist has specialization in selected topic)
 * - Criteria match: 25 points (location, gender, session type, insurance)
 * - Subtopic bonus: 10 points (refinement selections)
 * - Therapy Style: 25 points (communication style, homework, focus, etc.)
 */

const WEIGHTS = {
  topics: 40,
  criteria: 25,
  subtopics: 10,
  therapyStyle: 25,
};

export function calculateMatchScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  // 1. TOPIC MATCH (max 40 points)
  const topicScore = calculateTopicScore(therapist, criteria);

  // 2. CRITERIA MATCH (max 25 points)
  const criteriaScore = calculateCriteriaScore(therapist, criteria);

  // 3. SUBTOPIC BONUS (max 10 points)
  const subTopicScore = calculateSubTopicScore(therapist, criteria);

  // 4. THERAPY STYLE MATCH (max 25 points)
  const styleScore = calculateTherapyStyleScore(therapist, criteria.therapyStyle);

  const total = topicScore + criteriaScore + subTopicScore + styleScore;
  return Math.round(Math.min(100, Math.max(0, total)));
}

/**
 * Calculate match score with detailed breakdown for transparent scoring
 */
export function calculateMatchScoreWithBreakdown(
  therapist: Therapist,
  criteria: MatchingCriteria
): { score: number; breakdown: ScoreBreakdown } {
  // Calculate individual scores
  const topicScore = calculateTopicScore(therapist, criteria);
  const subTopicScore = calculateSubTopicScore(therapist, criteria);
  const criteriaScore = calculateCriteriaScore(therapist, criteria);
  const styleScore = calculateTherapyStyleScore(therapist, criteria.therapyStyle);

  // Combined specialization score (topics + subtopics)
  const specializationScore = topicScore + subTopicScore;

  const total = Math.round(
    Math.min(100, Math.max(0, topicScore + criteriaScore + subTopicScore + styleScore))
  );

  // Generate match reasons
  const matchReasons = generateMatchReasons(therapist, criteria, {
    specialization: specializationScore,
    style: styleScore,
    practical: criteriaScore,
  });

  // Build breakdown
  const breakdown: ScoreBreakdown = {
    total,
    categories: {
      specialization: {
        score: specializationScore,
        maxScore: WEIGHTS.topics + WEIGHTS.subtopics,
        label: "specialization",
        details: getMatchingSpecialtiesText(therapist, criteria),
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
    },
    matchReasons,
  };

  return { score: total, breakdown };
}

/**
 * Calculate therapy style score (max 25 points)
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

  // Communication style (7 points)
  if (preferences.communicationStyle !== null) {
    maxPoints += 7;
    if (therapist.communicationStyle) {
      if (
        preferences.communicationStyle === therapist.communicationStyle ||
        therapist.communicationStyle === "balanced"
      ) {
        score += 7;
      } else if (preferences.communicationStyle === "balanced") {
        score += 5; // Partial points
      }
    } else {
      // Therapist has no preference set, give partial points
      score += 4;
    }
  }

  // Homework preference (5 points)
  if (preferences.prefersHomework !== null) {
    maxPoints += 5;
    if (therapist.usesHomework !== undefined) {
      if (preferences.prefersHomework === therapist.usesHomework) {
        score += 5;
      }
    } else {
      // Therapist has no preference set, give partial points
      score += 3;
    }
  }

  // Therapy focus (6 points)
  if (preferences.therapyFocus !== null) {
    maxPoints += 6;
    if (therapist.therapyFocus) {
      if (
        preferences.therapyFocus === therapist.therapyFocus ||
        therapist.therapyFocus === "holistic"
      ) {
        score += 6;
      } else if (preferences.therapyFocus === "holistic") {
        score += 4; // Partial points
      }
    } else {
      score += 3;
    }
  }

  // Talk preference (4 points)
  if (preferences.talkPreference !== null) {
    maxPoints += 4;
    if (therapist.clientTalkRatio !== undefined) {
      const prefersMoreTalk = preferences.talkPreference === "more_self";
      const therapistHighRatio = therapist.clientTalkRatio >= 50;
      if (prefersMoreTalk === therapistHighRatio) {
        score += 4;
      }
    } else {
      score += 2;
    }
  }

  // Therapy depth (3 points)
  if (preferences.therapyDepth !== null) {
    maxPoints += 3;
    if (therapist.therapyDepth) {
      if (
        preferences.therapyDepth === therapist.therapyDepth ||
        therapist.therapyDepth === "flexible"
      ) {
        score += 3;
      } else if (preferences.therapyDepth === "flexible") {
        score += 2;
      }
    } else {
      score += 2;
    }
  }

  // Scale to 25 points
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

  // Specialization reasons
  if (scores.specialization >= 35) {
    const matchingSpecs = getMatchingSpecialtiesText(therapist, criteria);
    if (matchingSpecs) {
      reasons.push(`expertIn:${matchingSpecs}`);
    }
  }

  // Therapy style reasons
  if (scores.style >= 20) {
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

function calculateTopicScore(
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

  const matchingSpecialties = therapist.specializations.filter((spec) =>
    selectedSpecialties.includes(spec)
  );

  // Calculate ratio of matching specialties
  const matchRatio = matchingSpecialties.length / selectedSpecialties.length;
  return Math.round(matchRatio * WEIGHTS.topics);
}

function calculateCriteriaScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  let score = 0;
  let maxPoints = 0;

  // Location match (8 points)
  if (criteria.location && criteria.location.trim() !== "") {
    maxPoints += 8;
    if (matchesLocation(therapist, criteria.location)) {
      score += 8;
    }
  }

  // Gender match (5 points)
  if (criteria.gender) {
    maxPoints += 5;
    if (therapist.gender === criteria.gender) {
      score += 5;
    }
  }

  // Session type match (7 points)
  if (criteria.sessionType) {
    maxPoints += 7;
    if (matchesSessionType(therapist.sessionType, criteria.sessionType)) {
      score += 7;
    }
  }

  // Insurance match (5 points)
  if (criteria.insurance && criteria.insurance.length > 0) {
    maxPoints += 5;
    if (
      therapist.insurance.some((ins) => criteria.insurance.includes(ins))
    ) {
      score += 5;
    }
  }

  // If no criteria selected, give full points
  if (maxPoints === 0) {
    return WEIGHTS.criteria;
  }

  // Scale to WEIGHTS.criteria points based on selected criteria
  return Math.round((score / maxPoints) * WEIGHTS.criteria);
}

function calculateSubTopicScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  if (criteria.selectedSubTopics.length === 0) {
    return WEIGHTS.subtopics; // No refinement = full points
  }

  // Get the specialties for selected subtopics through their parent topics
  const subTopicParentTopics = new Map<string, string>();
  for (const topicId of criteria.selectedTopics) {
    const topic = getTopicById(topicId);
    if (topic) {
      for (const subTopic of topic.subTopics) {
        subTopicParentTopics.set(subTopic.id, topicId);
      }
    }
  }

  let totalWeight = 0;
  let matchedWeight = 0;

  for (const subTopicId of criteria.selectedSubTopics) {
    const parentTopicId = subTopicParentTopics.get(subTopicId);
    if (!parentTopicId) continue;

    const parentTopic = getTopicById(parentTopicId);
    if (!parentTopic) continue;

    const subTopic = parentTopic.subTopics.find((st) => st.id === subTopicId);
    if (!subTopic) continue;

    totalWeight += subTopic.weight;

    // Check if therapist has the parent topic's specialty
    if (
      therapist.specializations.some((spec) =>
        parentTopic.mappedSpecialties.includes(spec)
      )
    ) {
      matchedWeight += subTopic.weight;
    }
  }

  if (totalWeight === 0) {
    return WEIGHTS.subtopics;
  }

  return Math.round((matchedWeight / totalWeight) * WEIGHTS.subtopics);
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
  const matched = therapists.map((therapist) => ({
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
  const matched = therapists.map((therapist) => {
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
