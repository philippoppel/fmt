"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  count?: number;
  variant?: "primary" | "accent";
  className?: string;
}

export function SectionHeader({
  title,
  count,
  variant = "primary",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-6", className)}>
      <div
        className={cn(
          "h-8 w-1 rounded-full",
          variant === "primary" ? "bg-primary" : "bg-accent-foreground/50"
        )}
      />
      <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
      {count !== undefined && (
        <span className="text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
