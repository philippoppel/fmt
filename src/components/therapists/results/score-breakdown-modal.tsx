"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Brain,
  Briefcase,
  BadgeCheck,
  Sparkles,
  CheckCircle2,
  Info,
  TrendingUp,
} from "lucide-react";
import type { ScoreBreakdown, MatchedTherapist } from "@/types/therapist";
import { cn } from "@/lib/utils";
import { useScoreDetailsFormatter } from "./use-score-details";

interface ScoreBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapist: MatchedTherapist & {
    experienceYears?: number;
  };
  rank: number;
}

const categoryIcons = {
  specialization: Target,
  subSpecialization: Sparkles,
  intensityExperience: TrendingUp,
  therapyStyle: Brain,
  practicalCriteria: Briefcase,
  profileQuality: BadgeCheck,
};

const categoryColors = {
  specialization: "text-blue-500",
  subSpecialization: "text-cyan-500",
  intensityExperience: "text-purple-500",
  therapyStyle: "text-pink-500",
  practicalCriteria: "text-green-500",
  profileQuality: "text-amber-500",
};

function getFitLevel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "excellent", color: "text-green-500 bg-green-500/10" };
  if (score >= 70) return { label: "high", color: "text-emerald-500 bg-emerald-500/10" };
  if (score >= 50) return { label: "good", color: "text-blue-500 bg-blue-500/10" };
  return { label: "moderate", color: "text-muted-foreground bg-muted" };
}

export function ScoreBreakdownModal({
  open,
  onOpenChange,
  therapist,
  rank,
}: ScoreBreakdownModalProps) {
  const t = useTranslations();
  const tSpec = useTranslations("therapists.specialties");
  const formatDetails = useScoreDetailsFormatter();

  const breakdown = therapist.scoreBreakdown;
  const fitLevel = getFitLevel(therapist.matchScore);

  if (!breakdown) {
    return null;
  }

  const categories = Object.entries(breakdown.categories).filter(
    ([, cat]) => cat && cat.maxScore > 0
  );

  // Calculate what contributed most
  const sortedCategories = [...categories].sort(
    ([, a], [, b]) => (b.score / b.maxScore) - (a.score / a.maxScore)
  );
  const topContributor = sortedCategories[0]?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background pb-2 z-10">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("matching.transparency.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Overall Score */}
          <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("matching.transparency.overallFit")}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold">{therapist.matchScore}%</span>
                  <Badge className={cn("text-[10px] sm:text-xs", fitLevel.color)}>
                    {t(`matching.fitLevel.${fitLevel.label}`)}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-muted-foreground">Rang</p>
                <span className="text-xl sm:text-2xl font-bold text-primary">#{rank}</span>
              </div>
            </div>
          </div>

          {/* Why this rank explanation */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2.5 sm:p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">
                  {t("matching.transparency.whyThisRank", { name: therapist.name, rank })}
                </p>
                <p className="mt-0.5 sm:mt-1 text-muted-foreground">
                  {t("matching.transparency.rankExplanation", {
                    score: therapist.matchScore,
                    category: t(`matching.scoreBreakdown.${topContributor}`),
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Score Breakdown by Category */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t("matching.transparency.breakdown")}
            </h4>

            {categories.map(([key, category]) => {
              const Icon = categoryIcons[key as keyof typeof categoryIcons] || Target;
              const color = categoryColors[key as keyof typeof categoryColors] || "text-primary";
              const percentage = Math.round((category.score / category.maxScore) * 100);
              const isTopContributor = key === topContributor;
              const formattedDetails = formatDetails(category.details);

              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-lg border p-2.5 sm:p-3 transition-colors",
                    isTopContributor && "border-primary/30 bg-primary/5"
                  )}
                >
                  <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                      <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0", color)} />
                      <span className="font-medium text-xs sm:text-sm">
                        {t(`matching.scoreBreakdown.${key}`)}
                      </span>
                      {isTopContributor && (
                        <Badge variant="secondary" className="text-[9px] sm:text-[10px] gap-0.5 sm:gap-1 px-1.5 py-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="hidden xs:inline">{t("matching.transparency.topFactor")}</span>
                          <span className="xs:hidden">Top</span>
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold shrink-0 tabular-nums">
                      {category.score}/{category.maxScore}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-1.5 sm:h-2" />
                  {formattedDetails && (
                    <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
                      {formattedDetails}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Match Reasons */}
          {breakdown.matchReasons && breakdown.matchReasons.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t("matching.transparency.reasons")}
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {breakdown.matchReasons.map((reason, i) => {
                  // Parse reason format like "expertIn:anxiety, depression"
                  let displayReason = reason;
                  if (reason.startsWith("expertIn:")) {
                    const specs = reason.replace("expertIn:", "").split(", ");
                    displayReason = t("matching.results.reasons.expertIn", {
                      specialties: specs.map(s => tSpec(s.trim())).join(", ")
                    });
                  } else if (t.has(`matching.results.reasons.${reason}`)) {
                    displayReason = t(`matching.results.reasons.${reason}`);
                  }

                  return (
                    <Badge key={i} variant="outline" className="gap-1 text-[10px] sm:text-xs">
                      <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
                      {displayReason}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* How we calculate */}
          <div className="rounded-lg border bg-muted/30 p-2.5 sm:p-3">
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 text-xs sm:text-sm font-medium">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                {t("matching.transparency.howWeCalculate")}
              </summary>
              <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-muted-foreground">
                <p>{t("matching.transparency.calcExplanation1")}</p>
                <ul className="list-inside list-disc space-y-0.5 sm:space-y-1 pl-2">
                  <li>{t("matching.transparency.calcFactor1")}</li>
                  <li>{t("matching.transparency.calcFactor2")}</li>
                  <li>{t("matching.transparency.calcFactor3")}</li>
                  <li>{t("matching.transparency.calcFactor4")}</li>
                </ul>
                <p>{t("matching.transparency.calcExplanation2")}</p>
              </div>
            </details>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
