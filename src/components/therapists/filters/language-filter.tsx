"use client";

import { useTranslations } from "next-intl";
import { FilterSection } from "./filter-section";
import { AvailableLanguageSelect } from "@/components/ui/available-language-select";

interface LanguageFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function LanguageFilter({ selected, onChange }: LanguageFilterProps) {
  const t = useTranslations("therapists.filters.language");

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <AvailableLanguageSelect
        selected={selected}
        onChange={onChange}
        placeholder={t("placeholder")}
      />
    </FilterSection>
  );
}
