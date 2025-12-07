"use server";

import { searchTherapists } from "@/lib/data/therapists";
import type { FilterState, Therapist } from "@/types/therapist";

export async function searchTherapistsAction(
  filters: FilterState
): Promise<Therapist[]> {
  return searchTherapists(filters.searchQuery, filters);
}
