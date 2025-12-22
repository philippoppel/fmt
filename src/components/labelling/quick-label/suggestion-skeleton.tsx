"use client";

import { cn } from "@/lib/utils";

interface SuggestionSkeletonProps {
  className?: string;
}

/**
 * Loading skeleton for AI suggestions
 * Shows 3 animated placeholder cards
 */
export function SuggestionSkeleton({ className }: SuggestionSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} data-testid="suggestion-skeleton">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-border bg-muted/30 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {/* Rank badge skeleton */}
                <div className="h-6 w-6 rounded-full bg-muted" />
                {/* Title skeleton */}
                <div className="h-5 w-24 rounded bg-muted" />
              </div>
              {/* Subtitle skeleton */}
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
            {/* Confidence chip skeleton */}
            <div className="h-6 w-12 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
