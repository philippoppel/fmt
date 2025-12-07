"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types/therapist";

interface ContentTypeFilterProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
}

export function ContentTypeFilter({ value, onChange }: ContentTypeFilterProps) {
  const t = useTranslations("therapists.filters.contentType");

  const options: { value: ContentType; label: string }[] = [
    { value: "all", label: t("all") },
    { value: "therapists", label: t("therapists") },
    { value: "blogs", label: t("blogs") },
  ];

  return (
    <div className="flex rounded-lg border bg-muted p-1" role="radiogroup" aria-label={t("label")}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
