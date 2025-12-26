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

  return {
    criteria,
    selectedTopics: criteria?.selectedTopics ?? [],
    selectedSubTopics: criteria?.selectedSubTopics ?? [],
    intensityLevel: criteria?.intensityLevel ?? null,
    hasMatchingData: criteria !== null,
  };
}
