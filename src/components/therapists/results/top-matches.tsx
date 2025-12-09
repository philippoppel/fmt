"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, ChevronDown, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopMatchCard } from "./top-match-card";
import { CompareModal } from "./compare-modal";
import {
  HowMatchingWorksModal,
  HowMatchingWorksTrigger,
} from "./how-matching-works-modal";
import type { MatchedTherapist } from "@/types/therapist";

interface TopMatchesProps {
  topTherapists: Array<MatchedTherapist & {
    videoIntroUrl?: string;
    avgResponseTimeHours?: number;
    nextAvailableSlot?: Date | string;
    offersTrialSession?: boolean;
    trialSessionPrice?: number;
    experienceYears?: number;
    bookingRate?: number;
    therapyMethods?: string[];
  }>;
  onShowMore: () => void;
  totalCount: number;
}

const TOP_COUNT = 6;
const MAX_COMPARE = 3;

export function TopMatches({
  topTherapists,
  onShowMore,
  totalCount,
}: TopMatchesProps) {
  const t = useTranslations();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  if (topTherapists.length === 0) {
    return null;
  }

  const remaining = totalCount - TOP_COUNT;

  const handleCompareToggle = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const compareTherapists = topTherapists.filter((t) => compareIds.includes(t.id));

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
        <div className="flex items-center gap-2">
          {compareIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompare(true)}
              className="gap-2"
            >
              <GitCompare className="h-4 w-4" />
              {t("matching.compare.compareNow")}
              <Badge variant="secondary" className="ml-1">
                {compareIds.length}
              </Badge>
            </Button>
          )}
          <HowMatchingWorksTrigger onClick={() => setShowHowItWorks(true)} />
        </div>
      </div>

      {/* Compare Hint */}
      {compareIds.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Klicke auf <GitCompare className="inline h-3 w-3" /> um Therapeuten zu vergleichen
        </p>
      )}

      {/* Cards - 2 columns grid for compact horizontal cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topTherapists.map((therapist, index) => (
          <TopMatchCard
            key={therapist.id}
            therapist={therapist}
            rank={index + 1}
            onCompareToggle={handleCompareToggle}
            isComparing={compareIds.includes(therapist.id)}
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

      {/* Compare Modal */}
      <CompareModal
        open={showCompare}
        onOpenChange={setShowCompare}
        therapists={compareTherapists}
        onRemove={(id) => setCompareIds((prev) => prev.filter((i) => i !== id))}
      />

      {/* How Matching Works Modal */}
      <HowMatchingWorksModal
        open={showHowItWorks}
        onOpenChange={setShowHowItWorks}
      />
    </div>
  );
}
