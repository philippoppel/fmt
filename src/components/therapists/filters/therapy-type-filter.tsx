"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterSection } from "./filter-section";
import { THERAPY_TYPES, type TherapyType } from "@/types/therapist";

interface TherapyTypeFilterProps {
  selected: TherapyType[];
  onChange: (selected: TherapyType[]) => void;
}

export function TherapyTypeFilter({
  selected,
  onChange,
}: TherapyTypeFilterProps) {
  const t = useTranslations("therapists.filters.therapyType");
  const tTypes = useTranslations("therapists.therapyTypes");

  const handleToggle = (type: TherapyType, checked: boolean) => {
    if (checked) {
      onChange([...selected, type]);
    } else {
      onChange(selected.filter((t) => t !== type));
    }
  };

  return (
    <FilterSection title={t("label")}>
      <div className="space-y-2">
        {THERAPY_TYPES.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`therapy-${type}`}
              checked={selected.includes(type)}
              onCheckedChange={(checked) => handleToggle(type, checked === true)}
            />
            <Label
              htmlFor={`therapy-${type}`}
              className="text-sm font-normal cursor-pointer"
            >
              {tTypes(type)}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
