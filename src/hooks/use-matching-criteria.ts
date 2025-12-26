"use client";

import { useState, useEffect } from "react";
import type { MatchingCriteria } from "@/types/therapist";

/**
 * Hook to read matching criteria from sessionStorage
 * Used to pass matching context to contact dialogs/forms
 */
export function useMatchingCriteria() {
  const [criteria, setCriteria] = useState<MatchingCriteria | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("matchingCriteria");
      if (stored) {
        const parsed = JSON.parse(stored) as MatchingCriteria;
        setCriteria(parsed);
      }
    } catch {
      // Ignore parsing errors - sessionStorage might not be available or data might be invalid
    }
  }, []);

  const hasMatchingData = criteria !== null && (
    (criteria.selectedTopics?.length ?? 0) > 0 ||
    (criteria.selectedSubTopics?.length ?? 0) > 0 ||
    !!criteria.location ||
    !!criteria.gender ||
    !!criteria.sessionType ||
    (criteria.insurance?.length ?? 0) > 0
  );

  return {
    criteria,
    hasMatchingData,
    // Individual fields for convenience
    selectedTopics: criteria?.selectedTopics ?? [],
    selectedSubTopics: criteria?.selectedSubTopics ?? [],
    location: criteria?.location ?? null,
    gender: criteria?.gender ?? null,
    sessionType: criteria?.sessionType ?? null,
    insurance: criteria?.insurance ?? [],
    requiredLanguages: criteria?.requiredLanguages ?? [],
  };
}
