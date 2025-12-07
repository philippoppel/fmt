"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSidebar, FilterSheet } from "./filters";
import { ResultsHeader, ResultsGrid } from "./results";
import { useFilters, useSearchResults } from "./hooks";

export function SearchPage() {
  const t = useTranslations("therapists");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { filters, updateFilters, resetFilters, activeFilterCount } =
    useFilters();
  const { results, isLoading } = useSearchResults(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

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
          <div className="mb-4 lg:hidden">
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

          <ResultsHeader
            resultCount={results.length}
            contentType={filters.contentType}
            onContentTypeChange={(contentType) =>
              updateFilters({ contentType })
            }
          />

          <ResultsGrid results={results} onClearFilters={resetFilters} isLoading={isLoading} />
        </main>
      </div>

      {/* Mobile Filter Sheet */}
      <FilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
        resultCount={results.length}
      />
    </div>
  );
}
