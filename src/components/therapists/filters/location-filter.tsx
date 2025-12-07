"use client";

import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterSection } from "./filter-section";

interface LocationFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocationFilter({ value, onChange }: LocationFilterProps) {
  const t = useTranslations("therapists.filters.location");

  return (
    <FilterSection title={t("label")}>
      <div className="relative">
        <MapPin
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="text"
          placeholder={t("placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
          aria-label={t("label")}
        />
      </div>
    </FilterSection>
  );
}
