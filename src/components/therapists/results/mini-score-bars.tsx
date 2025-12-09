"use client";

import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { Target, Briefcase, Brain, TrendingUp, BadgeCheck, HelpCircle } from "lucide-react";
import type { ScoreBreakdown } from "@/types/therapist";
import { cn } from "@/lib/utils";

interface MiniScoreBarsProps {
  scoreBreakdown?: ScoreBreakdown;
  onClick?: () => void;
  maxBars?: number;
}

const categoryConfig = {
  specialization: { icon: Target, label: "specialization", color: "bg-blue-500" },
  practicalCriteria: { icon: Briefcase, label: "practicalCriteria", color: "bg-green-500" },
  therapyStyle: { icon: Brain, label: "therapyStyle", color: "bg-pink-500" },
  intensityExperience: { icon: TrendingUp, label: "intensityExperience", color: "bg-purple-500" },
  profileQuality: { icon: BadgeCheck, label: "profileQuality", color: "bg-amber-500" },
};

function getBarColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-orange-500";
}

export function MiniScoreBars({ scoreBreakdown, onClick, maxBars = 2 }: MiniScoreBarsProps) {
  const t = useTranslations("matching.scoreBreakdown");

  if (!scoreBreakdown?.categories) {
    return null;
  }

  // Get top categories by percentage score
  const sortedCategories = Object.entries(scoreBreakdown.categories)
    .filter(([, cat]) => cat && cat.maxScore > 0)
    .map(([key, cat]) => ({
      key,
      ...cat,
      percentage: Math.round((cat.score / cat.maxScore) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, maxBars);

  if (sortedCategories.length === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-lg border border-border/50 bg-muted/30 p-3 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {t("matchDetails")}
        </span>
        <HelpCircle className="h-3 w-3 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="space-y-2">
        {sortedCategories.map((category) => {
          const config = categoryConfig[category.key as keyof typeof categoryConfig];
          const Icon = config?.icon || Target;

          return (
            <div key={category.key} className="flex items-center gap-2">
              <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="mb-0.5 flex items-center justify-between text-[10px]">
                  <span className="truncate text-muted-foreground">
                    {t(category.key)}
                  </span>
                  <span className="ml-2 font-medium tabular-nums">
                    {category.percentage}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", getBarColor(category.percentage))}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </button>
  );
}
