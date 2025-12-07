"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { FilterSection } from "./filter-section";

interface PriceRangeFilterProps {
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
}

export function PriceRangeFilter({ value, onChange }: PriceRangeFilterProps) {
  const t = useTranslations("therapists.filters.priceRange");

  const handleSliderChange = (values: number[]) => {
    onChange({ min: values[0], max: values[1] });
  };

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <div className="space-y-4">
        <Slider
          value={[value.min, value.max]}
          onValueChange={handleSliderChange}
          min={0}
          max={300}
          step={10}
          aria-label={t("label")}
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t("min")}: {value.min}€
          </span>
          <span>
            {t("max")}: {value.max}€
          </span>
        </div>
      </div>
    </FilterSection>
  );
}
