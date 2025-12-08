"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TherapistGrid } from "./therapist-grid";
import { KnowledgeSection } from "./knowledge-section";
import { NoResults } from "./no-results";
import { TopMatches } from "./top-matches";
import { Loader2 } from "lucide-react";
import type { Therapist, BlogPost, ScoreBreakdown, MatchedTherapist } from "@/types/therapist";

interface TherapistResult {
  therapist: Therapist;
  matchScore?: number;
  scoreBreakdown?: ScoreBreakdown;
}

interface ResultsSectionsProps {
  therapists: TherapistResult[];
  articles: BlogPost[];
  onClearFilters: () => void;
  isLoading?: boolean;
  isMatchingMode?: boolean;
}

export function ResultsSections({
  therapists,
  articles,
  onClearFilters,
  isLoading,
  isMatchingMode,
}: ResultsSectionsProps) {
  const [showAllResults, setShowAllResults] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasResults = therapists.length > 0 || articles.length > 0;

  if (!hasResults) {
    return <NoResults onClearFilters={onClearFilters} />;
  }

  // In matching mode: show Top 3 with breakdown, then "show more" for rest
  if (isMatchingMode && therapists.length > 0 && !showAllResults) {
    // Convert to MatchedTherapist format for TopMatches
    const topTherapists: MatchedTherapist[] = therapists.slice(0, 3).map((t) => ({
      ...t.therapist,
      matchScore: t.matchScore ?? 0,
      scoreBreakdown: t.scoreBreakdown,
    }));

    return (
      <div className="space-y-10">
        {/* Top 3 Matches */}
        <TopMatches
          topTherapists={topTherapists}
          onShowMore={() => setShowAllResults(true)}
          totalCount={therapists.length}
        />

        {/* Knowledge Section */}
        <KnowledgeSection articles={articles} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Therapists Section */}
      <TherapistGrid therapists={therapists} />

      {/* Knowledge Section */}
      <KnowledgeSection articles={articles} />
    </div>
  );
}
