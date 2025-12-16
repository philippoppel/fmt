"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Target, TrendingUp, Sparkles, Users, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching } from "./matching-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countMatchingTherapists } from "@/lib/actions/count-matches";

// Calculate precision based on filled information
// Aligned with score weights: Topics 35, Intensity 15, Criteria 40 (no Style Quiz)
function calculatePrecision(state: ReturnType<typeof useMatching>["state"]): number {
  let precision = 0;

  // Topics selected: base 35%
  if (state.selectedTopics.length > 0) {
    precision += 35;
  }

  // SubTopics add refinement: up to 10%
  if (state.selectedSubTopics.length > 0) {
    precision += Math.min(state.selectedSubTopics.length * 3, 10);
  }

  // Intensity assessment: 15%
  if (state.intensityLevel !== null) {
    precision += 15;
  }

  // Location: 15%
  if (state.criteria.location.trim().length > 0) {
    precision += 15;
  }

  // Gender preference: 8%
  if (state.criteria.gender !== null) {
    precision += 8;
  }

  // Session type: 12%
  if (state.criteria.sessionType !== null) {
    precision += 12;
  }

  // Insurance: 5%
  if (state.criteria.insurance.length > 0) {
    precision += 5;
  }

  return Math.min(precision, 100);
}

// Get precision level category
function getPrecisionLevel(precision: number): "low" | "medium" | "high" | "excellent" {
  if (precision < 35) return "low";
  if (precision < 55) return "medium";
  if (precision < 80) return "high";
  return "excellent";
}

interface PrecisionMeterProps {
  className?: string;
  compact?: boolean;
}

export function PrecisionMeter({ className, compact = false }: PrecisionMeterProps) {
  const t = useTranslations("matching.precision");
  const { state } = useMatching();

  const targetPrecision = useMemo(() => calculatePrecision(state), [state]);
  const [displayPrecision, setDisplayPrecision] = useState(0);

  // Animate precision changes
  useEffect(() => {
    const duration = 600;
    const startTime = Date.now();
    const startValue = displayPrecision;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetPrecision - startValue) * eased);

      setDisplayPrecision(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetPrecision]);

  const level = getPrecisionLevel(displayPrecision);

  // Real match count from database
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch real match count when criteria change
  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchCount = async () => {
      setIsLoading(true);
      try {
        const result = await countMatchingTherapists({
          selectedTopics: state.selectedTopics,
          selectedSubTopics: state.selectedSubTopics,
          location: state.criteria.location || undefined,
          gender: state.criteria.gender,
          sessionType: state.criteria.sessionType,
          insurance: state.criteria.insurance,
        });

        if (!controller.signal.aborted) {
          setMatchCount(result.count);
          setTotalAvailable(result.totalAvailable);
        }
      } catch {
        // Ignore abort errors
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    // Debounce the fetch
    const timeoutId = setTimeout(fetchCount, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    state.selectedTopics,
    state.selectedSubTopics,
    state.criteria.location,
    state.criteria.gender,
    state.criteria.sessionType,
    state.criteria.insurance,
  ]);

  // If no exact matches, we'll show suggestions instead
  const hasNoExactMatches = matchCount === 0 && totalAvailable > 0;
  const displayCount = matchCount !== null ? (hasNoExactMatches ? totalAvailable : matchCount) : null;

  // Color based on precision level
  const colors = {
    low: {
      stroke: "stroke-accent-orange",
      text: "text-accent-orange-foreground",
      bg: "bg-accent-orange-muted",
      glow: "shadow-accent-orange/20",
    },
    medium: {
      stroke: "stroke-warning",
      text: "text-warning-foreground",
      bg: "bg-warning-muted",
      glow: "shadow-warning/20",
    },
    high: {
      stroke: "stroke-accent-emerald",
      text: "text-accent-emerald-foreground",
      bg: "bg-accent-emerald-muted",
      glow: "shadow-accent-emerald/20",
    },
    excellent: {
      stroke: "stroke-primary",
      text: "text-primary",
      bg: "bg-primary/10",
      glow: "shadow-primary/20",
    },
  };

  const color = colors[level];

  // SVG parameters - larger sizes for better visibility
  const size = compact ? 72 : 100;
  const strokeWidth = compact ? 6 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayPrecision / 100) * circumference;

  // Determine quality indicator based on percentage of matching therapists
  // - Suggestions mode (no exact matches) = orange/info
  // - High percentage (>=50%) = green/good (broad match)
  // - Medium percentage (25-50%) = yellow/moderate (moderate filtering)
  // - Low percentage (<25%) = gray/narrow (highly filtered)
  const getCountQuality = (): "good" | "moderate" | "narrow" | "suggestion" => {
    if (displayCount === null || totalAvailable === 0) return "moderate";
    if (hasNoExactMatches) return "suggestion";

    const percentage = (displayCount / totalAvailable) * 100;

    if (percentage >= 50) return "good";      // Green - broad match
    if (percentage >= 25) return "moderate";  // Yellow - moderate filtering
    return "narrow";                          // Gray - highly filtered
  };

  const countQuality = getCountQuality();

  const qualityColors = {
    good: {
      text: "text-accent-emerald-foreground",
      bg: "bg-accent-emerald/10",
      border: "border-accent-emerald/30",
      dot: "bg-accent-emerald",
    },
    moderate: {
      text: "text-warning-foreground",
      bg: "bg-warning/10",
      border: "border-warning/30",
      dot: "bg-warning",
    },
    narrow: {
      text: "text-muted-foreground",
      bg: "bg-muted/50",
      border: "border-muted",
      dot: "bg-muted-foreground",
    },
    suggestion: {
      text: "text-accent-orange-foreground",
      bg: "bg-accent-orange/10",
      border: "border-accent-orange/30",
      dot: "bg-accent-orange",
    },
  };

  const qColor = qualityColors[countQuality];

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1.5 shrink-0 rounded-lg border px-2 py-1 transition-all hover:bg-muted/50",
              qColor.border,
              qColor.bg,
              className
            )}
          >
            {/* Color dot indicator */}
            <span className={cn("h-2 w-2 rounded-full", qColor.dot)} />
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <span className={cn("text-sm font-semibold tabular-nums", qColor.text)}>
                {displayCount !== null
                  ? hasNoExactMatches
                    ? displayCount
                    : `${displayCount} ${t("compact.of")} ${totalAvailable}`
                  : "–"}
              </span>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="space-y-3">
            {/* Header with count and quality */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", qColor.dot)} />
                <span className={cn("font-semibold", qColor.text)}>
                  {displayCount !== null
                    ? hasNoExactMatches
                      ? `${displayCount} ${t("compact.suggestions")}`
                      : `${displayCount} ${t("compact.of")} ${totalAvailable} ${t("compact.matches")}`
                    : "–"}
                </span>
              </div>
            </div>

            {/* Explanation based on quality */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {hasNoExactMatches
                ? t("compact.noExactMatches")
                : t("compact.description")}
            </p>

            {/* Tip if precision is low and has exact matches */}
            {displayPrecision < 50 && !hasNoExactMatches && displayCount !== null && displayCount > 0 && (
              <div className="flex items-start gap-2 pt-1 border-t border-muted">
                <TrendingUp className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-primary">
                  {t("compact.tip")}
                </p>
              </div>
            )}

            {/* Suggestion to adjust filters */}
            {hasNoExactMatches && (
              <div className="flex items-start gap-2 pt-1 border-t border-muted">
                <TrendingUp className="h-3.5 w-3.5 text-accent-orange mt-0.5 shrink-0" />
                <p className="text-xs text-accent-orange-foreground">
                  {t("compact.adjustFilters")}
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border-2 p-5 transition-all duration-300",
      color.bg,
      color.glow,
      "shadow-xl",
      className
    )}>
      <div className="flex items-center gap-5">
        {/* Circular Progress - much larger */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              className="stroke-muted/30"
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(color.stroke, "transition-all duration-500")}
            />
          </svg>
          {/* Center percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold tabular-nums", color.text)}>
              {displayPrecision}%
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Target className={cn("h-5 w-5 shrink-0", color.text)} />
            <span className="text-base font-semibold">{t("label")}</span>
          </div>

          <p className={cn("mt-1.5 text-lg font-bold", color.text)}>
            {t(`levels.${level}`)}
          </p>

          {/* Motivational message */}
          <p className="mt-1 text-sm text-muted-foreground">
            {displayPrecision < 80 ? (
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                {t("motivation")}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                {t("excellent")}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
