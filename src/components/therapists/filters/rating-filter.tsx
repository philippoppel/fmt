"use client";

import { useTranslations } from "next-intl";
import { StarRating } from "@/components/ui/star-rating";
import { FilterSection } from "./filter-section";

interface RatingFilterProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingFilter({ value, onChange }: RatingFilterProps) {
  const t = useTranslations("therapists.filters.rating");

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <StarRating
            rating={value}
            size="md"
            interactive
            onRatingChange={onChange}
          />
          {value > 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              (Reset)
            </button>
          )}
        </div>
        {value > 0 && (
          <p className="text-sm text-muted-foreground">
            {value}+ {t("stars")}
          </p>
        )}
      </div>
    </FilterSection>
  );
}
