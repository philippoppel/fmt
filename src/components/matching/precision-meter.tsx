"use client";

import { useMemo, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Target, TrendingUp, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching } from "./matching-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1 shrink-0 rounded-full px-1.5 py-0.5 transition-colors hover:bg-muted/50",
              className
            )}
          >
            {/* Tiny circular progress */}
            <div className="relative" style={{ width: 24, height: 24 }}>
              <svg width={24} height={24} className="transform -rotate-90">
                <circle
                  cx={12}
                  cy={12}
                  r={9}
                  fill="none"
                  strokeWidth={2.5}
                  className="stroke-muted/30"
                />
                <circle
                  cx={12}
                  cy={12}
                  r={9}
                  fill="none"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray={56.5}
                  strokeDashoffset={56.5 - (displayPrecision / 100) * 56.5}
                  className={cn(color.stroke, "transition-all duration-500")}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-[9px] font-bold tabular-nums", color.text)}>
                  {displayPrecision}
                </span>
              </div>
            </div>
            <Info className="h-3 w-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t("tooltip.title")}</h4>
            <p className="text-xs text-muted-foreground">
              {t("tooltip.description")}
            </p>
            {displayPrecision < 80 && (
              <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                {t("tooltip.tip")}
              </p>
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
