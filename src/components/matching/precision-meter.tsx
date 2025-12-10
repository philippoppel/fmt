"use client";

import { useMemo, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Target, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching } from "./matching-context";

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

  // Color based on precision level
  const colors = {
    low: {
      stroke: "stroke-orange-500",
      text: "text-orange-600",
      bg: "bg-orange-500/10",
      glow: "shadow-orange-500/20",
    },
    medium: {
      stroke: "stroke-yellow-500",
      text: "text-yellow-600",
      bg: "bg-yellow-500/10",
      glow: "shadow-yellow-500/20",
    },
    high: {
      stroke: "stroke-emerald-500",
      text: "text-emerald-600",
      bg: "bg-emerald-500/10",
      glow: "shadow-emerald-500/20",
    },
    excellent: {
      stroke: "stroke-primary",
      text: "text-primary",
      bg: "bg-primary/10",
      glow: "shadow-primary/20",
    },
  };

  const color = colors[level];

  // SVG parameters
  const size = compact ? 56 : 80;
  const strokeWidth = compact ? 5 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayPrecision / 100) * circumference;

  if (compact) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {t("label")}
          </span>
          <span className={cn("text-sm font-bold tabular-nums", color.text)}>
            {displayPrecision}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              level === "low" && "bg-orange-500",
              level === "medium" && "bg-yellow-500",
              level === "high" && "bg-emerald-500",
              level === "excellent" && "bg-primary"
            )}
            style={{ width: `${displayPrecision}%` }}
          />
        </div>

        {/* Level label */}
        <span className={cn("text-xs font-medium", color.text)}>
          {t(`levels.${level}`)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all duration-300",
      color.bg,
      color.glow,
      "shadow-lg",
      className
    )}>
      <div className="flex items-start gap-4">
        {/* Circular Progress */}
        <div className="relative shrink-0">
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
          {/* Center icon/text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-xl font-bold", color.text)}>
              {displayPrecision}%
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Target className={cn("h-4 w-4 shrink-0", color.text)} />
            <span className="text-sm font-semibold">{t("label")}</span>
          </div>

          <p className={cn("mt-1 text-sm font-medium", color.text)}>
            {t(`levels.${level}`)}
          </p>

          {/* Motivational message */}
          <p className="mt-1 text-xs text-muted-foreground">
            {displayPrecision < 80 ? (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {t("motivation")}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {t("excellent")}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
