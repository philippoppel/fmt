"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { demoBlogPosts } from "@/lib/data/demo-data";
import { searchTherapistsAction } from "@/lib/actions/search";
import type { FilterState, SearchResult, Therapist } from "@/types/therapist";

export function useSearchResults(filters: FilterState): {
  results: SearchResult[];
  isLoading: boolean;
} {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isPending, startTransition] = useTransition();

  // Fetch therapists from database when filters change
  useEffect(() => {
    if (filters.contentType === "blogs") {
      setTherapists([]);
      return;
    }

    startTransition(async () => {
      const data = await searchTherapistsAction(filters);
      setTherapists(data);
    });
  }, [
    filters.contentType,
    filters.searchQuery,
    filters.location,
    JSON.stringify(filters.specialties),
    JSON.stringify(filters.therapyTypes),
    JSON.stringify(filters.languages),
    filters.priceRange.min,
    filters.priceRange.max,
    filters.sessionType,
    JSON.stringify(filters.insurance),
    filters.availability,
    filters.gender,
    filters.minRating,
  ]);

  // Build results
  const results = useMemo(() => {
    const therapistResults: SearchResult[] =
      filters.contentType === "blogs"
        ? []
        : therapists.map((t) => ({ type: "therapist" as const, data: t }));

    // Keep blog filtering client-side (demo data for now)
    let blogResults: SearchResult[] = [];
    if (filters.contentType === "all" || filters.contentType === "blogs") {
      blogResults = demoBlogPosts
        .filter((b) => {
          // Text search
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            if (
              !b.title.toLowerCase().includes(query) &&
              !b.excerpt.toLowerCase().includes(query) &&
              !b.author.name.toLowerCase().includes(query)
            ) {
              return false;
            }
          }

          // Specialties filter (matches blog category)
          if (filters.specialties.length > 0) {
            if (!filters.specialties.includes(b.category)) {
              return false;
            }
          }

          return true;
        })
        .map((b) => ({ type: "blog" as const, data: b }));
    }

    return [...therapistResults, ...blogResults];
  }, [therapists, filters.contentType, filters.searchQuery, filters.specialties]);

  return { results, isLoading: isPending };
}
