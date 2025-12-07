"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TextSearchFilter } from "./text-search-filter";
import { LocationFilter } from "./location-filter";
import { SpecialtyFilter } from "./specialty-filter";
import { TherapyTypeFilter } from "./therapy-type-filter";
import { LanguageFilter } from "./language-filter";
import { PriceRangeFilter } from "./price-range-filter";
import { SessionTypeFilter } from "./session-type-filter";
import { InsuranceFilter } from "./insurance-filter";
import { AvailabilityFilter } from "./availability-filter";
import { GenderFilter } from "./gender-filter";
import { RatingFilter } from "./rating-filter";
import type { FilterState } from "@/types/therapist";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
}: FilterSidebarProps) {
  const t = useTranslations("therapists.filters");

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          {t("reset")}
        </Button>
      </div>

      <div className="space-y-2">
        <TextSearchFilter
          value={filters.searchQuery}
          onChange={(searchQuery) => onFilterChange({ searchQuery })}
        />

        <LocationFilter
          value={filters.location}
          onChange={(location) => onFilterChange({ location })}
        />

        <SpecialtyFilter
          selected={filters.specialties}
          onChange={(specialties) => onFilterChange({ specialties })}
        />

        <TherapyTypeFilter
          selected={filters.therapyTypes}
          onChange={(therapyTypes) => onFilterChange({ therapyTypes })}
        />

        <LanguageFilter
          selected={filters.languages}
          onChange={(languages) => onFilterChange({ languages })}
        />

        <PriceRangeFilter
          value={filters.priceRange}
          onChange={(priceRange) => onFilterChange({ priceRange })}
        />

        <SessionTypeFilter
          value={filters.sessionType}
          onChange={(sessionType) => onFilterChange({ sessionType })}
        />

        <InsuranceFilter
          selected={filters.insurance}
          onChange={(insurance) => onFilterChange({ insurance })}
        />

        <AvailabilityFilter
          value={filters.availability}
          onChange={(availability) => onFilterChange({ availability })}
        />

        <GenderFilter
          value={filters.gender}
          onChange={(gender) => onFilterChange({ gender })}
        />

        <RatingFilter
          value={filters.minRating}
          onChange={(minRating) => onFilterChange({ minRating })}
        />
      </div>
    </div>
  );
}
