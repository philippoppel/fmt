"use server";

import { db } from "@/lib/db";
import { getSpecialtiesFromTopics } from "@/lib/matching";

export interface MatchCountCriteria {
  selectedTopics: string[];
  selectedSubTopics: string[];
  location?: string;
  gender?: string | null;
  sessionType?: string | null;
  insurance?: string[];
}

export async function countMatchingTherapists(
  criteria: MatchCountCriteria
): Promise<number> {
  try {
    const whereClause: Record<string, unknown> = {
      isPublished: true,
    };

    // Filter by specialties from topics
    if (criteria.selectedTopics.length > 0) {
      const specialties = getSpecialtiesFromTopics(criteria.selectedTopics);
      if (specialties.length > 0) {
        whereClause.specializations = { hasSome: specialties };
      }
    }

    // Filter by sub-specializations
    if (criteria.selectedSubTopics.length > 0) {
      whereClause.subSpecializations = { hasSome: criteria.selectedSubTopics };
    }

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

    const count = await db.therapistProfile.count({
      where: whereClause,
    });

    return count;
  } catch (error) {
    console.error("[countMatchingTherapists] Error:", error);
    // Return a fallback estimate on error
    return 50;
  }
}
