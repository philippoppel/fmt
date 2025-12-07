"use client";

import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FilterSection } from "./filter-section";
import { SESSION_TYPES, type SessionType } from "@/types/therapist";

interface SessionTypeFilterProps {
  value: SessionType | null;
  onChange: (value: SessionType | null) => void;
}

export function SessionTypeFilter({ value, onChange }: SessionTypeFilterProps) {
  const t = useTranslations("therapists.filters.sessionType");
  const tFilters = useTranslations("therapists.filters");

  const handleChange = (newValue: string) => {
    onChange(newValue === "any" ? null : (newValue as SessionType));
  };

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <RadioGroup
        value={value || "any"}
        onValueChange={handleChange}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="any" id="session-any" />
          <Label htmlFor="session-any" className="text-sm font-normal cursor-pointer">
            {tFilters("any")}
          </Label>
        </div>
        {SESSION_TYPES.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <RadioGroupItem value={type} id={`session-${type}`} />
            <Label
              htmlFor={`session-${type}`}
              className="text-sm font-normal cursor-pointer"
            >
              {t(type)}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FilterSection>
  );
}
