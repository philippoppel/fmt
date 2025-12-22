"use client";

import { cn } from "@/lib/utils";
import type { CaseStatus } from "@prisma/client";

interface FilterTabsProps {
  activeFilter: CaseStatus | "ALL" | "CALIBRATION";
  onFilterChange: (filter: CaseStatus | "ALL" | "CALIBRATION") => void;
  counts: {
    all: number;
    new: number;
    labeled: number;
    review: number;
    calibration: number;
  };
}

const TABS = [
  { key: "ALL" as const, label: "Alle", countKey: "all" as const },
  { key: "NEW" as const, label: "Neu", countKey: "new" as const },
  { key: "LABELED" as const, label: "Gelabelt", countKey: "labeled" as const },
  { key: "REVIEW" as const, label: "Review", countKey: "review" as const },
  {
    key: "CALIBRATION" as const,
    label: "Calibration",
    countKey: "calibration" as const,
  },
];

/**
 * Filter tabs for inbox - shows case counts per status
 */
export function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: FilterTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {TABS.map((tab) => {
        const count = counts[tab.countKey];
        const isActive = activeFilter === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              "min-h-[36px] touch-manipulation",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "text-xs",
                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
