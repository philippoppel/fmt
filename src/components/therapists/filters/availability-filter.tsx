"use client";

import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FilterSection } from "./filter-section";
import { AVAILABILITY_OPTIONS, type Availability } from "@/types/therapist";

interface AvailabilityFilterProps {
  value: Availability | null;
  onChange: (value: Availability | null) => void;
}

export function AvailabilityFilter({
  value,
  onChange,
}: AvailabilityFilterProps) {
  const t = useTranslations("therapists.filters.availability");
  const tFilters = useTranslations("therapists.filters");

  const handleChange = (newValue: string) => {
    onChange(newValue === "any" ? null : (newValue as Availability));
  };

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <RadioGroup
        value={value || "any"}
        onValueChange={handleChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="any" id="availability-any" />
          <Label
            htmlFor="availability-any"
            className="text-sm font-normal cursor-pointer"
          >
            {tFilters("any")}
          </Label>
        </div>
        {AVAILABILITY_OPTIONS.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`availability-${option}`} />
            <Label
              htmlFor={`availability-${option}`}
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
