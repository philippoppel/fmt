"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FilterSidebar, FilterSheet } from "./filters";
import { ResultsSections } from "./results/results-sections";
import { useFilters, useSearchResults } from "./hooks";
import type { MatchingCriteria } from "@/types/therapist";

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
          // Apply basic filters from matching criteria
          if (criteria.location) {
            updateFilters({ location: criteria.location });
          }
          if (criteria.gender) {
            updateFilters({ gender: criteria.gender });
          }
          if (criteria.sessionType) {
            updateFilters({ sessionType: criteria.sessionType });
          }
          if (criteria.insurance && criteria.insurance.length > 0) {
            updateFilters({ insurance: criteria.insurance });
          }
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
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link href="/therapists/matching">
            <Sparkles className="h-4 w-4" />
            {tMatching("startButton")}
          </Link>
        </Button>
      </div>

      {/* Matching Mode Banner */}
      {matchingCriteria && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary">
              {tMatching("results.matchingActive")}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearMatching}>
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
    </div>
  );
}
