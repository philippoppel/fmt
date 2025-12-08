"use client";

import { useTranslations } from "next-intl";
import { TherapistGrid } from "./therapist-grid";
import { KnowledgeSection } from "./knowledge-section";
import { NoResults } from "./no-results";
import { Loader2 } from "lucide-react";
import type { Therapist, BlogPost } from "@/types/therapist";

interface TherapistResult {
  therapist: Therapist;
  matchScore?: number;
}

interface ResultsSectionsProps {
  therapists: TherapistResult[];
  articles: BlogPost[];
  onClearFilters: () => void;
  isLoading?: boolean;
}

export function ResultsSections({
  therapists,
  articles,
  onClearFilters,
  isLoading,
}: ResultsSectionsProps) {
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

  return (
    <div className="space-y-10">
      {/* Therapists Section */}
      <TherapistGrid therapists={therapists} />

      {/* Knowledge Section */}
      <KnowledgeSection articles={articles} />
    </div>
  );
}
