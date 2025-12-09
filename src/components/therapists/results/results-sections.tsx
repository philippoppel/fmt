"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TherapistGrid } from "./therapist-grid";
import { KnowledgeSection } from "./knowledge-section";
import { NoResults } from "./no-results";
import { TopMatches } from "./top-matches";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  error?: string;
}

export function ResultsSections({
  therapists,
  articles,
  onClearFilters,
  isLoading,
  isMatchingMode,
  error,
}: ResultsSectionsProps) {
  const t = useTranslations("therapists");
  const [showAllResults, setShowAllResults] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("error.title")}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{t("error.description")}</p>
        <Button onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("error.retry")}
        </Button>
      </div>
    );
  }

  const hasResults = therapists.length > 0 || articles.length > 0;

  if (!hasResults) {
    return <NoResults onClearFilters={onClearFilters} />;
  }

  // In matching mode: show Top 6 with breakdown, then "show more" for rest
  if (isMatchingMode && therapists.length > 0 && !showAllResults) {
    // Convert to MatchedTherapist format for TopMatches
    const topTherapists: MatchedTherapist[] = therapists.slice(0, 6).map((t) => ({
      ...t.therapist,
      matchScore: t.matchScore ?? 0,
      scoreBreakdown: t.scoreBreakdown,
    }));

    return (
      <div className="space-y-0">
        {/* Therapists Section - with subtle background */}
        <section className="rounded-2xl bg-card/50 px-4 py-8 sm:px-6">
          <TopMatches
            topTherapists={topTherapists}
            onShowMore={() => setShowAllResults(true)}
            totalCount={therapists.length}
          />
        </section>

        {/* Knowledge Section - with accent background */}
        {articles.length > 0 && (
          <section className="mt-6 rounded-2xl bg-accent/30 px-4 py-8 sm:px-6">
            <KnowledgeSection articles={articles} />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Therapists Section - with subtle background */}
      <section className="rounded-2xl bg-card/50 px-4 py-8 sm:px-6">
        <TherapistGrid therapists={therapists} />
      </section>

      {/* Knowledge Section - with accent background */}
      {articles.length > 0 && (
        <section className="mt-6 rounded-2xl bg-accent/30 px-4 py-8 sm:px-6">
          <KnowledgeSection articles={articles} />
        </section>
      )}
    </div>
  );
}
