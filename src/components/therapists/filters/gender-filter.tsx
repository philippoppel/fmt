"use client";

import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FilterSection } from "./filter-section";
import { GENDER_OPTIONS, type Gender } from "@/types/therapist";

interface GenderFilterProps {
  value: Gender | null;
  onChange: (value: Gender | null) => void;
}

export function GenderFilter({ value, onChange }: GenderFilterProps) {
  const t = useTranslations("therapists.filters.gender");

  const handleChange = (newValue: string) => {
    onChange(newValue === "any" ? null : (newValue as Gender));
  };

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <RadioGroup
        value={value || "any"}
        onValueChange={handleChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="any" id="gender-any" />
          <Label htmlFor="gender-any" className="text-sm font-normal cursor-pointer">
            Alle
          </Label>
        </div>
        {GENDER_OPTIONS.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`gender-${option}`} />
            <Label
              htmlFor={`gender-${option}`}
              className="text-sm font-normal cursor-pointer"
            >
              {t(option)}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FilterSection>
  );
}
