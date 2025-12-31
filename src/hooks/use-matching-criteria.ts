"use client";

import { useState, useEffect } from "react";
import type {
  MatchingCriteria,
  WizardSymptomAnswers,
  WizardStyleStructure,
  WizardStyleEngagement,
  WizardRelationshipVsMethod,
  WizardTempo,
  WizardSafetyVsChallenge,
} from "@/types/therapist";

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

  // Check for any matching data (legacy or wizard V2)
  const hasMatchingData = criteria !== null && (
    (criteria.selectedTopics?.length ?? 0) > 0 ||
    (criteria.selectedSubTopics?.length ?? 0) > 0 ||
    !!criteria.location ||
    !!criteria.gender ||
    !!criteria.sessionType ||
    (criteria.insurance?.length ?? 0) > 0 ||
    // Wizard V2 fields
    !!criteria.wizardCategoryId ||
    !!criteria.wizardSubcategoryId ||
    !!criteria.wizardStyleStructure ||
    !!criteria.wizardStyleEngagement
  );

  // Check specifically for wizard V2 data
  const hasWizardV2Data = criteria !== null && (
    !!criteria.wizardCategoryId ||
    !!criteria.wizardSubcategoryId ||
    !!criteria.wizardStyleStructure ||
    !!criteria.wizardStyleEngagement ||
    (criteria.wizardSeverityScore ?? 0) > 0
  );

  return {
    criteria,
    hasMatchingData,
    hasWizardV2Data,

    // Legacy fields for backwards compatibility
    selectedTopics: criteria?.selectedTopics ?? [],
    selectedSubTopics: criteria?.selectedSubTopics ?? [],
    location: criteria?.location ?? null,
    gender: criteria?.gender ?? null,
    sessionType: criteria?.sessionType ?? null,
    insurance: criteria?.insurance ?? [],
    requiredLanguages: criteria?.requiredLanguages ?? [],

    // Wizard V2 specific fields
    wizardCategoryId: criteria?.wizardCategoryId ?? null,
    wizardSubcategoryId: criteria?.wizardSubcategoryId ?? null,
    wizardSymptomAnswers: criteria?.wizardSymptomAnswers ?? null,
    wizardSeverityScore: criteria?.wizardSeverityScore ?? null,
    wizardStyleStructure: (criteria?.wizardStyleStructure ?? null) as WizardStyleStructure,
    wizardStyleEngagement: (criteria?.wizardStyleEngagement ?? null) as WizardStyleEngagement,
    wizardRelationshipVsMethod: (criteria?.wizardRelationshipVsMethod ?? null) as WizardRelationshipVsMethod,
    wizardTempo: (criteria?.wizardTempo ?? null) as WizardTempo,
    wizardSafetyVsChallenge: (criteria?.wizardSafetyVsChallenge ?? null) as WizardSafetyVsChallenge,

    // Wizard V2 logistics fields
    wizardGenderPreference: criteria?.wizardGenderPreference ?? null,
    wizardLocation: criteria?.wizardLocation ?? null,
    wizardSearchRadius: criteria?.wizardSearchRadius ?? null,
    wizardLanguages: criteria?.wizardLanguages ?? [],
  };
}
