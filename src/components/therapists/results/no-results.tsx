"use client";

import { useTranslations } from "next-intl";
import { SearchX, MapPin, User, Video, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { FilterState, Therapist } from "@/types/therapist";

interface NoResultsProps {
  onClearFilters: () => void;
  filters?: Partial<FilterState>;
  alternativeTherapists?: Therapist[];
}

export function NoResults({ onClearFilters, filters, alternativeTherapists }: NoResultsProps) {
  const t = useTranslations("therapists.results");
  const tFilters = useTranslations("therapists.filters");
  const tMatching = useTranslations("matching");

  // Collect active filter descriptions
  const activeFilters: { icon: React.ReactNode; label: string }[] = [];

  if (filters?.location) {
    activeFilters.push({
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: filters.location,
    });
  }

  if (filters?.gender) {
    activeFilters.push({
      icon: <User className="h-3.5 w-3.5" />,
      label: tFilters(`gender.${filters.gender}`),
    });
  }

  if (filters?.sessionType) {
    activeFilters.push({
      icon: <Video className="h-3.5 w-3.5" />,
      label: tFilters(`sessionType.${filters.sessionType}`),
    });
  }

  if (filters?.insurance && filters.insurance.length > 0) {
    activeFilters.push({
      icon: <Shield className="h-3.5 w-3.5" />,
      label: filters.insurance.map((i) => tFilters(`insurance.${i}`)).join(", "),
    });
  }

  if (filters?.specialties && filters.specialties.length > 0) {
    activeFilters.push({
      icon: <Sparkles className="h-3.5 w-3.5" />,
      label: filters.specialties.map((s) => tFilters(`specialty.${s}`)).join(", "),
    });
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>

      <h3 className="mb-2 text-lg font-semibold">{t("noResults")}</h3>

      {/* Show which filters caused no results */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {t("noResultsWithFilters")}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {activeFilters.map((filter, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium"
              >
                {filter.icon}
                {filter.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        {t("noResultsDescription")}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onClearFilters}>
          {t("clearFilters")}
        </Button>
        <Button asChild className="gap-2">
          <Link href="/therapists/matching">
            <Sparkles className="h-4 w-4" />
            {tMatching("startButton")}
          </Link>
        </Button>
      </div>

      {/* Alternative therapists suggestion */}
      {alternativeTherapists && alternativeTherapists.length > 0 && (
        <div className="mt-10 w-full max-w-2xl">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("alternativeSuggestions")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {alternativeTherapists.slice(0, 4).map((therapist) => (
              <Link
                key={therapist.id}
                href={`/p/${therapist.slug || therapist.id}`}
                className="group flex items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {therapist.imageUrl && (
                    <img
                      src={therapist.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium group-hover:text-primary">
                    {therapist.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {therapist.location.city}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
