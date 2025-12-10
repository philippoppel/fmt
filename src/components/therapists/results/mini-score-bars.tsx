"use client";

import { useTranslations } from "next-intl";
import { Info, ChevronRight } from "lucide-react";
import type { ScoreBreakdown } from "@/types/therapist";
import { cn } from "@/lib/utils";

interface MiniScoreBarsProps {
  scoreBreakdown?: ScoreBreakdown;
  onClick?: () => void;
  therapistName: string;
  rank: number;
  matchScore: number;
}

export function MiniScoreBars({
  scoreBreakdown,
  onClick,
  therapistName,
  rank,
  matchScore
}: MiniScoreBarsProps) {
  const t = useTranslations("matching");

  if (!scoreBreakdown?.categories) {
    return null;
  }

  // Find the top contributing category
  const sortedCategories = Object.entries(scoreBreakdown.categories)
    .filter(([, cat]) => cat && cat.maxScore > 0)
    .map(([key, cat]) => ({
      key,
      percentage: Math.round((cat.score / cat.maxScore) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const topCategory = sortedCategories[0]?.key || "practicalCriteria";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border p-3 text-left transition-all",
        "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 hover:bg-blue-500/10"
      )}
    >
      <div className="flex gap-2">
        <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
            {t("transparency.whyThisRank", { name: therapistName, rank })}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("transparency.rankExplanation", {
              score: matchScore,
              category: t(`scoreBreakdown.${topCategory}`),
            })}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-blue-500/50 self-center transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
