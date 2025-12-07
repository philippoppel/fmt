"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterSection } from "./filter-section";
import { SPECIALTIES, type Specialty } from "@/types/therapist";

interface SpecialtyFilterProps {
  selected: Specialty[];
  onChange: (selected: Specialty[]) => void;
}

export function SpecialtyFilter({ selected, onChange }: SpecialtyFilterProps) {
  const t = useTranslations("therapists.filters.specialty");
  const tSpec = useTranslations("therapists.specialties");

  const handleToggle = (specialty: Specialty, checked: boolean) => {
    if (checked) {
      onChange([...selected, specialty]);
    } else {
      onChange(selected.filter((s) => s !== specialty));
    }
  };

  return (
    <FilterSection title={t("label")}>
      <div className="space-y-2">
        {SPECIALTIES.map((specialty) => (
          <div key={specialty} className="flex items-center space-x-2">
            <Checkbox
              id={`specialty-${specialty}`}
              checked={selected.includes(specialty)}
              onCheckedChange={(checked) =>
                handleToggle(specialty, checked === true)
              }
            />
            <Label
              htmlFor={`specialty-${specialty}`}
              className="text-sm font-normal cursor-pointer"
            >
              {tSpec(specialty)}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
