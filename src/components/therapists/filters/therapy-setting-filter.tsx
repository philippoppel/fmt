"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterSection } from "./filter-section";
import { THERAPY_SETTINGS, type TherapySetting } from "@/types/therapist";

interface TherapySettingFilterProps {
  selected: TherapySetting[];
  onChange: (selected: TherapySetting[]) => void;
}

export function TherapySettingFilter({ selected, onChange }: TherapySettingFilterProps) {
  const t = useTranslations("therapists.filters.therapySetting");

  const handleToggle = (setting: TherapySetting, checked: boolean) => {
    if (checked) {
      onChange([...selected, setting]);
    } else {
      onChange(selected.filter((s) => s !== setting));
    }
  };

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <div className="space-y-2">
        {THERAPY_SETTINGS.map((setting) => (
          <div key={setting} className="flex items-center space-x-2">
            <Checkbox
              id={`therapy-setting-${setting}`}
              checked={selected.includes(setting)}
              onCheckedChange={(checked) => handleToggle(setting, checked === true)}
            />
            <Label
              htmlFor={`therapy-setting-${setting}`}
              className="text-sm font-normal cursor-pointer"
            >
              {t(setting)}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
