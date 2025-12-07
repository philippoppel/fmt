"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterSection } from "./filter-section";
import { INSURANCE_TYPES, type Insurance } from "@/types/therapist";

interface InsuranceFilterProps {
  selected: Insurance[];
  onChange: (selected: Insurance[]) => void;
}

export function InsuranceFilter({ selected, onChange }: InsuranceFilterProps) {
  const t = useTranslations("therapists.filters.insurance");

  const handleToggle = (type: Insurance, checked: boolean) => {
    if (checked) {
      onChange([...selected, type]);
    } else {
      onChange(selected.filter((t) => t !== type));
    }
  };

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <div className="space-y-2">
        {INSURANCE_TYPES.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`insurance-${type}`}
              checked={selected.includes(type)}
              onCheckedChange={(checked) => handleToggle(type, checked === true)}
            />
            <Label
              htmlFor={`insurance-${type}`}
              className="text-sm font-normal cursor-pointer"
            >
              {t(type)}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
