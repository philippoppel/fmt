"use client";

import { useTranslations } from "next-intl";
import { FilterSection } from "./filter-section";
import { LocationInput } from "@/components/matching/steps/location-input";

interface LocationFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocationFilter({ value, onChange }: LocationFilterProps) {
  const t = useTranslations("therapists.filters.location");

  return (
    <FilterSection title={t("label")}>
      <LocationInput
        value={value}
        onChange={onChange}
        placeholder={t("placeholder")}
      />
    </FilterSection>
  );
}
