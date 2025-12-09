"use server";

import { searchTherapists } from "@/lib/data/therapists";
import type { FilterState, Therapist } from "@/types/therapist";

export async function searchTherapistsAction(
  filters: FilterState
): Promise<Therapist[]> {
  try {
    console.log("[searchTherapistsAction] Starting search...");
    const result = await searchTherapists(filters.searchQuery, filters);
    console.log(`[searchTherapistsAction] Found ${result.length} therapists`);
    return result;
  } catch (error) {
    console.error("[searchTherapistsAction] Error:", error);
    throw new Error("Failed to fetch therapists");
  }
}
