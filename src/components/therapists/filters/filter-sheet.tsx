"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import type { FilterState } from "@/types/therapist";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  resultCount: number;
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onReset,
  resultCount,
}: FilterSheetProps) {
  const t = useTranslations("therapists.filters");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>{t("title")}</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onReset}>
              {t("reset")}
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(85vh-10rem)] py-4">
          <div className="space-y-2 pr-4">
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
          </div>
        </ScrollArea>

        <SheetFooter className="border-t pt-4">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            {t("showResults")} ({resultCount})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
