"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MatchingWizard } from "./matching-wizard";
import type { MatchingState } from "./matching-context";
import { getTopicById } from "@/lib/matching/topics";

interface MatchingWizardWrapperProps {
  initialTopic?: string;
}

/**
 * Client wrapper for MatchingWizard that handles resuming state from sessionStorage.
 * When ?resume=true is in the URL, it loads the matching criteria from sessionStorage.
 */
export function MatchingWizardWrapper({ initialTopic }: MatchingWizardWrapperProps) {
  const searchParams = useSearchParams();
  const shouldResume = searchParams.get("resume") === "true";
  const [resumeState, setResumeState] = useState<Partial<MatchingState> | undefined>(undefined);
  const [isReady, setIsReady] = useState(!shouldResume);

  useEffect(() => {
    if (shouldResume) {
      try {
        const stored = sessionStorage.getItem("matchingCriteria");
        if (stored) {
          const parsed = JSON.parse(stored);

          // SECURITY: Filter out crisis flag topics - they should NOT be restored
          // User must explicitly select them again and see crisis resources
          const safeTopics = (parsed.selectedTopics || []).filter((topicId: string) => {
            const topic = getTopicById(topicId);
            return !topic?.isFlag; // Exclude flag topics (crisis, suicidal, etc.)
          });

          // Map sessionStorage format to MatchingState format
          const state: Partial<MatchingState> = {
            selectedTopics: safeTopics,
            selectedSubTopics: parsed.selectedSubTopics || [],
            criteria: {
              location: parsed.location || "",
              gender: parsed.gender || null,
              sessionType: parsed.sessionType || null,
              insurance: parsed.insurance || [],
              languages: parsed.languages || [],
              therapyTypes: parsed.therapyTypes || [],
              therapySettings: parsed.therapySettings || [],
              availability: parsed.availability || null,
              maxPrice: parsed.maxPrice || null,
            },
          };
          setResumeState(state);
        }
      } catch (error) {
        console.error("Failed to parse matching criteria from sessionStorage:", error);
      }
      setIsReady(true);
    }
  }, [shouldResume]);

  // Wait for resume state to be loaded before rendering
  if (!isReady) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <MatchingWizard initialTopic={initialTopic} resumeState={resumeState} />;
}
