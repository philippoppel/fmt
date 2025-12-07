"use client";

import { useTranslations } from "next-intl";
import { ContentTypeFilter } from "../filters/content-type-filter";
import type { ContentType } from "@/types/therapist";

interface ResultsHeaderProps {
  resultCount: number;
  contentType: ContentType;
  onContentTypeChange: (type: ContentType) => void;
}

export function ResultsHeader({
  resultCount,
  contentType,
  onContentTypeChange,
}: ResultsHeaderProps) {
  const t = useTranslations("therapists.results");

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t("count", { count: resultCount })}
      </p>
      <div className="sm:w-auto">
        <ContentTypeFilter value={contentType} onChange={onContentTypeChange} />
      </div>
    </div>
  );
}
