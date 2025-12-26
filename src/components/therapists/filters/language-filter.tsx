"use client";

import { useTranslations } from "next-intl";
import { FilterSection } from "./filter-section";
import { LanguageMultiSelect } from "@/components/ui/language-multi-select";

interface LanguageFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function LanguageFilter({ selected, onChange }: LanguageFilterProps) {
  const t = useTranslations("therapists.filters.language");

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <LanguageMultiSelect
        selected={selected}
        onChange={onChange}
        placeholder={t("placeholder")}
      />
    </FilterSection>
  );
}
