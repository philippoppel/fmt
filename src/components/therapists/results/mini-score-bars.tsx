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
  matchReasons?: string[];
  previousScore?: number; // Score of the previous ranked therapist
}

export function MiniScoreBars({
  scoreBreakdown,
  onClick,
  therapistName,
  rank,
  matchScore,
  matchReasons,
  previousScore
}: MiniScoreBarsProps) {
  const t = useTranslations("matching");
  const tSpec = useTranslations("therapists.specialties");

  if (!scoreBreakdown?.categories) {
    return null;
  }

  // Check if this therapist has the same score as the previous one
  const isTied = previousScore !== undefined && previousScore === matchScore;

  // Generate a unique explanation based on available data
  const getUniqueExplanation = (): string => {
    // If tied, show that explicitly
    if (isTied) {
      return `Gleichwertig mit ${matchScore}% – unterschiedliche Stärken`;
    }

    const reasons = matchReasons || scoreBreakdown.matchReasons || [];

    // Priority 1: Use specific match reasons
    for (const reason of reasons) {
      if (reason.startsWith("expertIn:")) {
        const specs = reason.replace("expertIn:", "").split(", ");
        const translatedSpecs = specs.slice(0, 2).map(s => tSpec(s.trim())).join(" & ");
        return `Expert:in für ${translatedSpecs}`;
      }
    }

    // Priority 2: Check for specific practical criteria
    if (reasons.includes("availableNow")) {
      return "Kurzfristig Termine verfügbar";
    }
    if (reasons.includes("nearLocation")) {
      return "In deiner Nähe";
    }
    if (reasons.includes("offersOnline")) {
      return "Flexible Online-Termine";
    }

    // Priority 3: Highlight the category with highest absolute score
    const sortedByScore = Object.entries(scoreBreakdown.categories)
      .filter(([, cat]) => cat && cat.maxScore > 0)
      .map(([key, cat]) => ({
        key,
        score: cat.score,
        maxScore: cat.maxScore,
        percentage: Math.round((cat.score / cat.maxScore) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const top = sortedByScore[0];
    if (top) {
      // Show percentage for variety
      if (top.percentage === 100) {
        return `Perfekte ${t(`scoreBreakdown.${top.key}`)}`;
      }
      return `${top.percentage}% bei ${t(`scoreBreakdown.${top.key}`)}`;
    }

    return `${matchScore}% Übereinstimmung`;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border p-3 text-left transition-all",
        "border-info-border bg-info-muted hover:border-info/40 hover:bg-info-muted/80"
      )}
    >
      <div className="flex gap-2">
        <Info className="h-4 w-4 shrink-0 text-info mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-info-foreground">
            {t("transparency.whyThisRank", { name: therapistName, rank })}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getUniqueExplanation()}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-blue-500/50 self-center transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
