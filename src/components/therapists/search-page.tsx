"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Sparkles, RotateCcw, Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FilterSidebar, FilterSheet } from "./filters";
import { ResultsSections } from "./results/results-sections";
import { useFilters, useSearchResults } from "./hooks";
import type { MatchingCriteria, Specialty } from "@/types/therapist";
import { getSpecialtiesFromTopics } from "@/lib/matching/topics";

export function SearchPage() {
  const t = useTranslations("therapists");
  const tMatching = useTranslations("matching");
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriteria | null>(null);
  const { filters, updateFilters, resetFilters, activeFilterCount } =
    useFilters();
  const { therapists, articles, isLoading, error, alternativeTherapists } = useSearchResults(filters, matchingCriteria);

  // Check for matching mode from URL and sessionStorage
  useEffect(() => {
    const isMatching = searchParams.get("matching") === "true";
    if (isMatching) {
      try {
        const stored = sessionStorage.getItem("matchingCriteria");
        if (stored) {
          const criteria = JSON.parse(stored) as MatchingCriteria;
          setMatchingCriteria(criteria);

          // Apply all filters from matching criteria (including specialties from topics)
          const filtersToApply: Parameters<typeof updateFilters>[0] = {};

          if (criteria.location) {
            filtersToApply.location = criteria.location;
          }
          if (criteria.gender) {
            filtersToApply.gender = criteria.gender;
          }
          if (criteria.sessionType) {
            filtersToApply.sessionType = criteria.sessionType;
          }
          if (criteria.insurance && criteria.insurance.length > 0) {
            filtersToApply.insurance = criteria.insurance;
          }
          // Map selected topics to specialties for filter sidebar
          if (criteria.selectedTopics && criteria.selectedTopics.length > 0) {
            const specialties = getSpecialtiesFromTopics(criteria.selectedTopics);
            if (specialties.length > 0) {
              filtersToApply.specialties = specialties as Specialty[];
            }
          }

          updateFilters(filtersToApply);
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, [searchParams]);

  const clearMatching = () => {
    setMatchingCriteria(null);
    sessionStorage.removeItem("matchingCriteria");
    resetFilters();
  };

  const totalResults = therapists.length + articles.length;

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Page Header - more compact on mobile */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">{t("subtitle")}</p>
        </div>
        {/* Show different button based on matching mode */}
        {matchingCriteria ? (
          <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
            <Link href="/therapists/matching">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tMatching("results.restart")}</span>
              <span className="sm:hidden">{tMatching("results.restartShort")}</span>
            </Link>
          </Button>
        ) : (
          <Button asChild className="gap-2 shrink-0">
            <Link href="/therapists/matching">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">{tMatching("startButton")}</span>
              <span className="sm:hidden">{tMatching("startButtonShort")}</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Matching Mode Banner - more compact */}
      {matchingCriteria && (
        <div className="mb-4 sm:mb-6 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 sm:p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {tMatching("results.matchingActive")}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearMatching} className="h-7 px-2 text-xs">
            {tMatching("results.clearMatching")}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <FilterSidebar
            filters={filters}
            onFilterChange={updateFilters}
            onReset={resetFilters}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1" id="search-results">
          {/* Mobile Filter Button */}
          <div className="mb-6 lg:hidden">
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(true)}
              className="w-full justify-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {t("filters.showFilters")}
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          <ResultsSections
            therapists={therapists}
            articles={articles}
            onClearFilters={resetFilters}
            isLoading={isLoading}
            isMatchingMode={!!matchingCriteria}
            error={error}
            filters={filters}
            alternativeTherapists={alternativeTherapists}
          />
        </main>
      </div>

      {/* Mobile Filter Sheet */}
      <FilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
        resultCount={totalResults}
      />

      {/* Floating Edit Filters Button - only shows in matching mode */}
      {matchingCriteria && (
        <Link
          href="/therapists/matching?resume=true"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Pencil className="h-4 w-4" />
          <span className="font-medium">{tMatching("editFilters")}</span>
        </Link>
      )}
    </div>
  );
}
