"use client";

import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoResultsProps {
  onClearFilters: () => void;
}

export function NoResults({ onClearFilters }: NoResultsProps) {
  const t = useTranslations("therapists.results");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{t("noResults")}</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        {t("noResultsDescription")}
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        {t("clearFilters")}
      </Button>
    </div>
  );
}
