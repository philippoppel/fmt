"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, ChevronDown, GitCompare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

  const getTopContributorLabel = (therapist: MatchedTherapist) => {
    const categories = therapist?.scoreBreakdown?.categories;
    if (!categories) return null;

    const sorted = Object.entries(categories)
      .filter(([, cat]) => cat && cat.maxScore > 0)
      .sort(
        ([, a], [, b]) => (b.score / b.maxScore) - (a.score / a.maxScore)
      );

    const top = sorted[0];
    if (!top) return null;
    return { key: top[0], label: t(`matching.scoreBreakdown.${top[0]}`) };
  };

  const buildAiSummary = () => {
    if (topTherapists.length === 0) return null;

    const summaryParts: string[] = [];
    const top3 = topTherapists.slice(0, 3);

    // First therapist - why they're #1
    const first = top3[0];
    if (first) {
      const topCat = getTopContributorLabel(first);
      if (topCat) {
        summaryParts.push(
          t("matching.results.aiDetailedFirst", {
            name: first.name,
            score: first.matchScore,
            category: topCat.label,
          })
        );
      }
    }

    // Second therapist - what differentiates them
    const second = top3[1];
    if (second) {
      const secondCat = getTopContributorLabel(second);
      const scoreDiff = (first?.matchScore ?? 0) - (second.matchScore ?? 0);
      if (secondCat && scoreDiff > 0) {
        summaryParts.push(
          t("matching.results.aiDetailedSecond", {
            name: second.name,
            score: second.matchScore,
            diff: scoreDiff,
            category: secondCat.label,
          })
        );
      } else if (secondCat) {
        summaryParts.push(
          t("matching.results.aiDetailedSecondEqual", {
            name: second.name,
            score: second.matchScore,
            category: secondCat.label,
          })
        );
      }
    }

    // Third therapist - brief mention
    const third = top3[2];
    if (third) {
      const thirdCat = getTopContributorLabel(third);
      if (thirdCat) {
        summaryParts.push(
          t("matching.results.aiDetailedThird", {
            name: third.name,
            score: third.matchScore,
            category: thirdCat.label,
          })
        );
      }
    }

    return summaryParts;
  };

  const aiSummaryParts = buildAiSummary();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* AI summary - prominent at top */}
      {aiSummaryParts && aiSummaryParts.length > 0 && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold text-primary">
                {t("matching.results.aiSummaryTitle")}
              </p>
              <div className="space-y-1.5">
                {aiSummaryParts.map((part, i) => (
                  <p key={i} className="text-sm text-foreground leading-relaxed">
                    {part}
                  </p>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {t("matching.results.aiSummaryHint")}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Compare Hint - only show when nothing selected */}
      {compareIds.length === 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2">
          <GitCompare className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {t("matching.compare.hint")}
          </span>
        </div>
      )}

      {/* Cards - Responsive grid for vertical cards with large photos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Floating Compare Bar - appears when therapists selected */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-300 ease-out",
          compareIds.length > 0
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="mx-auto max-w-3xl px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            {/* Selected count with avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {compareTherapists.slice(0, 3).map((therapist) => (
                  <div
                    key={therapist.id}
                    className="h-8 w-8 overflow-hidden rounded-full border-2 border-background"
                  >
                    <img
                      src={therapist.imageUrl}
                      alt={therapist.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  {t("matching.compare.selected", { count: compareIds.length })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {compareIds.length < 2
                    ? t("matching.compare.selectMore")
                    : t("matching.compare.readyToCompare")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCompareIds([])}
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">{t("matching.compare.clear")}</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCompare(true)}
                disabled={compareIds.length < 2}
                className="h-9 gap-1.5 px-4"
              >
                <GitCompare className="h-4 w-4" />
                {t("matching.compare.compareNow")}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
