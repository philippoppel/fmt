"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LayoutGrid, UserCircle, FileText } from "lucide-react";
import type { ContentType } from "@/types/therapist";

interface ContentTypeFilterProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
}

export function ContentTypeFilter({ value, onChange }: ContentTypeFilterProps) {
  const t = useTranslations("therapists.filters.contentType");

  const options: { value: ContentType; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: t("all"), icon: <LayoutGrid className="h-4 w-4" /> },
    { value: "therapists", label: t("therapists"), icon: <UserCircle className="h-4 w-4" /> },
    { value: "blogs", label: t("blogs"), icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="inline-flex rounded-lg border bg-muted p-1 gap-1" role="radiogroup" aria-label={t("label")}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <span aria-hidden="true">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
