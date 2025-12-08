import type {
  Therapist,
  MatchingCriteria,
  MatchedTherapist,
  SessionType,
} from "@/types/therapist";
import { getSpecialtiesFromTopics, getTopicById } from "./topics";

/**
 * Score weights:
 * - Topic match: 50% (therapist has specialization in selected topic)
 * - Criteria match: 35% (location, gender, session type, insurance)
 * - Subtopic bonus: 15% (refinement selections)
 */

export function calculateMatchScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  let score = 0;

  // 1. TOPIC MATCH (max 50 points)
  const topicScore = calculateTopicScore(therapist, criteria);
  score += topicScore;

  // 2. CRITERIA MATCH (max 35 points)
  const criteriaScore = calculateCriteriaScore(therapist, criteria);
  score += criteriaScore;

  // 3. SUBTOPIC BONUS (max 15 points)
  const subTopicScore = calculateSubTopicScore(therapist, criteria);
  score += subTopicScore;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function calculateTopicScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  if (criteria.selectedTopics.length === 0) {
    return 50; // No topics selected = full points
  }

  const selectedSpecialties = getSpecialtiesFromTopics(criteria.selectedTopics);
  if (selectedSpecialties.length === 0) {
    return 50;
  }

  const matchingSpecialties = therapist.specializations.filter((spec) =>
    selectedSpecialties.includes(spec)
  );

  // Calculate ratio of matching specialties
  const matchRatio = matchingSpecialties.length / selectedSpecialties.length;
  return Math.round(matchRatio * 50);
}

function calculateCriteriaScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  let score = 0;
  let maxPoints = 0;

  // Location match (10 points)
  if (criteria.location && criteria.location.trim() !== "") {
    maxPoints += 10;
    if (matchesLocation(therapist, criteria.location)) {
      score += 10;
    }
  }

  // Gender match (8 points)
  if (criteria.gender) {
    maxPoints += 8;
    if (therapist.gender === criteria.gender) {
      score += 8;
    }
  }

  // Session type match (9 points)
  if (criteria.sessionType) {
    maxPoints += 9;
    if (matchesSessionType(therapist.sessionType, criteria.sessionType)) {
      score += 9;
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

  // If no criteria selected, give full 35 points
  if (maxPoints === 0) {
    return 35;
  }

  // Scale to 35 points based on selected criteria
  return Math.round((score / maxPoints) * 35);
}

function calculateSubTopicScore(
  therapist: Therapist,
  criteria: MatchingCriteria
): number {
  if (criteria.selectedSubTopics.length === 0) {
    return 15; // No refinement = full points
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
    return 15;
  }

  return Math.round((matchedWeight / totalWeight) * 15);
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
