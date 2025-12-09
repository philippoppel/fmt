"use client";

import { useTranslations } from "next-intl";
import { Check, Target, Heart, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScoreBreakdown } from "@/types/therapist";

interface ScoreBreakdownCardProps {
  breakdown: ScoreBreakdown;
  therapistName: string;
  compact?: boolean;
}

const categoryIcons = {
  specialization: Target,
  therapyStyle: Heart,
  practicalCriteria: Settings,
};

export function ScoreBreakdownCard({
  breakdown,
  therapistName,
  compact = false,
}: ScoreBreakdownCardProps) {
  const t = useTranslations();

  // Get reason translations
  const getReasonLabel = (reason: string): string => {
    if (reason.startsWith("expertIn:")) {
      const specs = reason.replace("expertIn:", "");
      return t("matching.results.expertIn", { specialties: specs });
    }

    const reasonKeys: Record<string, string> = {
      styleMatches: "matching.results.reasons.styleMatches",
      offersOnline: "matching.results.reasons.offersOnline",
      offersInPerson: "matching.results.reasons.offersInPerson",
      availableNow: "matching.results.reasons.availableNow",
      nearLocation: "matching.results.reasons.nearLocation",
    };

    const key = reasonKeys[reason];
    if (key) {
      return t(key);
    }
    return reason;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact progress bars */}
        {Object.entries(breakdown.categories)
          .filter(([, category]) => category.maxScore > 0) // Skip categories with 0 max score
          .map(([key, category]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons];
          const percentage = Math.round((category.score / category.maxScore) * 100);

          return (
            <div key={key} className="flex items-center gap-2">
              {Icon && <Icon className="h-3 w-3 text-muted-foreground shrink-0" />}
              <div className="flex-1">
                <Progress value={percentage} className="h-1.5" />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-sm font-medium text-muted-foreground">
        {t("matching.results.matchBecause", { name: therapistName })}
      </div>

      {/* Category progress bars */}
      <div className="space-y-3">
        {Object.entries(breakdown.categories)
          .filter(([, category]) => category.maxScore > 0) // Skip categories with 0 max score
          .map(([key, category]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons];
          const percentage = Math.round((category.score / category.maxScore) * 100);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  {t(`matching.scoreBreakdown.${key}`)}
                </span>
                <span className="font-medium">
                  {category.score}/{category.maxScore}
                </span>
              </div>
              <Progress
                value={percentage}
                className={cn(
                  "h-2",
                  percentage >= 80 && "[&>div]:bg-green-500",
                  percentage >= 50 && percentage < 80 && "[&>div]:bg-yellow-500",
                  percentage < 50 && "[&>div]:bg-orange-500"
                )}
              />
              {category.details && (
                <p className="text-xs text-muted-foreground pl-6">
                  {category.details}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Match reasons as badges */}
      {breakdown.matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {breakdown.matchReasons.map((reason, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              {getReasonLabel(reason)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
