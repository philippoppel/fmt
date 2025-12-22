"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  todayLabeled: number;
  totalLabeled: number;
  className?: string;
}

/**
 * Progress indicator showing labeling stats
 */
export function ProgressIndicator({
  todayLabeled,
  totalLabeled,
  className,
}: ProgressIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
    >
      <TrendingUp className="h-4 w-4 text-green-600" />
      <span>
        <span className="font-medium text-foreground">{todayLabeled}</span> heute
        {" · "}
        <span className="font-medium text-foreground">{totalLabeled}</span>{" "}
        insgesamt
      </span>
    </div>
  );
}
