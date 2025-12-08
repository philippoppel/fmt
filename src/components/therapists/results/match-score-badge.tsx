"use client";

import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MatchScoreBadge({
  score,
  size = "md",
  className,
}: MatchScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500 text-white border-green-600 shadow-lg";
    if (score >= 60) return "bg-yellow-500 text-white border-yellow-600 shadow-lg";
    if (score >= 40) return "bg-orange-500 text-white border-orange-600 shadow-lg";
    return "bg-gray-500 text-white border-gray-600 shadow-lg";
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        getScoreColor(score),
        sizeClasses[size],
        className
      )}
      aria-label={`${score}% match`}
    >
      <span className="font-bold">{score}%</span>
      <span className="hidden sm:inline">Match</span>
    </span>
  );
}
