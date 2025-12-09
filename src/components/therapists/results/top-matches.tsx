"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopMatchCard } from "./top-match-card";
import {
  HowMatchingWorksModal,
  HowMatchingWorksTrigger,
} from "./how-matching-works-modal";
import type { MatchedTherapist } from "@/types/therapist";

interface TopMatchesProps {
  topTherapists: MatchedTherapist[];
  onShowMore: () => void;
  totalCount: number;
}

const TOP_COUNT = 6;

export function TopMatches({
  topTherapists,
  onShowMore,
  totalCount,
}: TopMatchesProps) {
  const t = useTranslations();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  if (topTherapists.length === 0) {
    return null;
  }

  const remaining = totalCount - TOP_COUNT;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">
              {t("matching.results.smartMatching")}
            </span>
          </div>
          <h2 className="text-xl font-bold sm:text-2xl">
            {t("matching.results.topMatches")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("matching.results.topMatchesSubtitle")}
          </p>
        </div>
        <HowMatchingWorksTrigger onClick={() => setShowHowItWorks(true)} />
      </div>

      {/* Cards - 2 columns grid for compact horizontal cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topTherapists.map((therapist, index) => (
          <TopMatchCard
            key={therapist.id}
            therapist={therapist}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Show More Button */}
      {remaining > 0 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={onShowMore}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            {t("matching.results.showMore", { count: remaining })}
          </Button>
        </div>
      )}

      {/* How Matching Works Modal */}
      <HowMatchingWorksModal
        open={showHowItWorks}
        onOpenChange={setShowHowItWorks}
      />
    </div>
  );
}
