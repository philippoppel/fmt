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

  const getTopContributorLabel = () => {
    const first = topTherapists[0];
    const categories = first?.scoreBreakdown?.categories;
    if (!first || !categories) return null;

    const sorted = Object.entries(categories)
      .filter(([, cat]) => cat && cat.maxScore > 0)
      .sort(
        ([, a], [, b]) => (b.score / b.maxScore) - (a.score / a.maxScore)
      );

    const top = sorted[0];
    if (!top) return null;
    return t(`matching.scoreBreakdown.${top[0]}`);
  };

  const aiSummaryText = (() => {
    const first = topTherapists[0];
    if (!first) return "";

    const topCategory = getTopContributorLabel();
    const score = first.matchScore ?? 0;

    if (topCategory) {
      return t("matching.results.aiSummaryDescription", {
        rank: 1,
        name: first.name,
        category: topCategory,
        score,
      });
    }

    return t("matching.results.aiSummaryDescriptionFallback", {
      rank: 1,
      name: first.name,
      score,
    });
  })();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - more compact on mobile */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 sm:mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              {t("matching.results.smartMatching")}
            </span>
          </div>
          <h2 className="text-lg font-bold sm:text-xl md:text-2xl">
            {t("matching.results.topMatches")}
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            {t("matching.results.topMatchesSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HowMatchingWorksTrigger onClick={() => setShowHowItWorks(true)} />
        </div>
      </div>

      {/* Compare Hint - more prominent on mobile */}
      <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2">
        <GitCompare className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm text-muted-foreground">
          {compareIds.length === 0
            ? t("matching.compare.hint")
            : t("matching.compare.selected", { count: compareIds.length })}
        </span>
        {compareIds.length > 0 && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowCompare(true)}
            className="ml-auto gap-1.5 h-7 px-2.5 text-xs"
          >
            {t("matching.compare.compareNow")}
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
              {compareIds.length}
            </Badge>
          </Button>
        )}
      </div>

      {/* Cards - Responsive grid for vertical cards with large photos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topTherapists.map((therapist, index) => (
          <TopMatchCard
            key={therapist.id}
            therapist={therapist}
            rank={index + 1}
            onCompareToggle={handleCompareToggle}
            isComparing={compareIds.includes(therapist.id)}
            previousScore={index > 0 ? topTherapists[index - 1].matchScore : undefined}
          />
        ))}
      </div>

      {/* AI ordering hint */}
      {aiSummaryText && (
        <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-3 sm:px-4 sm:py-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              {t("matching.results.aiSummaryTitle")}
            </p>
            <p className="text-sm text-foreground">{aiSummaryText}</p>
            <p className="text-xs font-medium text-primary">
              {t("matching.results.aiSummaryCta", {
                name: topTherapists[0]?.name,
                rank: 1,
              })}
            </p>
          </div>
        </div>
      )}

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
