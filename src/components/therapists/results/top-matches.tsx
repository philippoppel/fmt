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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">
            {t("matching.results.smartMatching")}
          </span>
        </div>
        <h2 className="text-2xl font-bold sm:text-3xl">
          {t("matching.results.topMatches")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("matching.results.topMatchesSubtitle")}
        </p>
        <div className="mt-3">
          <HowMatchingWorksTrigger onClick={() => setShowHowItWorks(true)} />
        </div>
      </div>

      {/* Top 3 Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {topTherapists.map((therapist, index) => (
          <TopMatchCard
            key={therapist.id}
            therapist={therapist}
            rank={(index + 1) as 1 | 2 | 3}
          />
        ))}
      </div>

      {/* Show More Button */}
      {totalCount > 3 && (
        <div className="text-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={onShowMore}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            {t("matching.results.showMore", { count: totalCount - 3 })}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("matching.results.showMoreHint")}
          </p>
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
