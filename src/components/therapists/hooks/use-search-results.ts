"use client";

import { useMemo } from "react";
import { demoTherapists, demoBlogPosts } from "@/lib/data/demo-data";
import type { FilterState, SearchResult } from "@/types/therapist";

export function useSearchResults(filters: FilterState): SearchResult[] {
  return useMemo(() => {
    let therapistResults: SearchResult[] = [];
    let blogResults: SearchResult[] = [];

    // Filter therapists
    if (filters.contentType === "all" || filters.contentType === "therapists") {
      therapistResults = demoTherapists
        .filter((t) => {
          // Text search
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            if (
              !t.name.toLowerCase().includes(query) &&
              !t.shortDescription.toLowerCase().includes(query) &&
              !t.title.toLowerCase().includes(query)
            ) {
              return false;
            }
          }

          // Location filter
          if (filters.location) {
            const loc = filters.location.toLowerCase();
            if (
              !t.location.city.toLowerCase().includes(loc) &&
              !t.location.postalCode.includes(loc)
            ) {
              return false;
            }
          }

          // Specialties filter
          if (filters.specialties.length > 0) {
            if (!filters.specialties.some((s) => t.specializations.includes(s))) {
              return false;
            }
          }

          // Therapy types filter
          if (filters.therapyTypes.length > 0) {
            if (!filters.therapyTypes.some((tt) => t.therapyTypes.includes(tt))) {
              return false;
            }
          }

          // Languages filter
          if (filters.languages.length > 0) {
            if (!filters.languages.some((l) => t.languages.includes(l))) {
              return false;
            }
          }

          // Price range filter
          if (
            t.pricePerSession < filters.priceRange.min ||
            t.pricePerSession > filters.priceRange.max
          ) {
            return false;
          }

          // Session type filter
          if (filters.sessionType !== null) {
            if (filters.sessionType === "both") {
              if (t.sessionType !== "both") {
                return false;
              }
            } else if (
              t.sessionType !== filters.sessionType &&
              t.sessionType !== "both"
            ) {
              return false;
            }
          }

          // Insurance filter
          if (filters.insurance.length > 0) {
            if (!filters.insurance.some((i) => t.insurance.includes(i))) {
              return false;
            }
          }

          // Availability filter
          if (filters.availability !== null) {
            if (t.availability !== filters.availability) {
              return false;
            }
          }

          // Gender filter
          if (filters.gender !== null) {
            if (t.gender !== filters.gender) {
              return false;
            }
          }

          // Rating filter
          if (filters.minRating > 0) {
            if (t.rating < filters.minRating) {
              return false;
            }
          }

          return true;
        })
        .map((t) => ({ type: "therapist" as const, data: t }));
    }

    // Filter blog posts
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

    // Combine results: therapists first, then blogs
    return [...therapistResults, ...blogResults];
  }, [filters]);
}
