"use server";

import { db } from "@/lib/db";

export interface MatchCountCriteria {
  selectedTopics: string[];
  selectedSubTopics: string[];
  location?: string;
  gender?: string | null;
  sessionType?: string | null;
  insurance?: string[];
}

export interface MatchCountResult {
  count: number;
  /** Total available therapists (for fallback display when count is 0) */
  totalAvailable: number;
}

export async function countMatchingTherapists(
  criteria: MatchCountCriteria
): Promise<MatchCountResult> {
  try {
    const whereClause: Record<string, unknown> = {
      isPublished: true,
    };

    // IMPORTANT: Topics and SubTopics do NOT filter the count!
    // They only affect ranking/scoring in the search results.
    // This ensures the count stays the same or increases as users add more topics
    // (more topics = broader match potential, not narrower).
    // Only hard criteria (location, gender, session type, insurance) affect the count.

    // Location filter
    if (criteria.location && criteria.location.trim() !== "") {
      whereClause.OR = [
        { city: { contains: criteria.location, mode: "insensitive" } },
        { postalCode: { contains: criteria.location } },
      ];
    }

    // Gender filter
    if (criteria.gender) {
      whereClause.gender = criteria.gender;
    }

    // Session type filter
    if (criteria.sessionType) {
      if (criteria.sessionType === "online") {
        whereClause.sessionType = { in: ["online", "both"] };
      } else if (criteria.sessionType === "in_person") {
        whereClause.sessionType = { in: ["in_person", "both"] };
      } else {
        whereClause.sessionType = criteria.sessionType;
      }
    }

    // Insurance filter
    if (criteria.insurance && criteria.insurance.length > 0) {
      whereClause.insurance = { hasSome: criteria.insurance };
    }

    // Get both exact count and total available (for fallback display)
    const [count, totalAvailable] = await Promise.all([
      db.therapistProfile.count({ where: whereClause }),
      db.therapistProfile.count({ where: { isPublished: true } }),
    ]);

    return { count, totalAvailable };
  } catch (error) {
    console.error("[countMatchingTherapists] Error:", error);
    // Return a fallback estimate on error
    return { count: 0, totalAvailable: 20 };
  }
}
