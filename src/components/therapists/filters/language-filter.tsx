"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FilterSection } from "./filter-section";
import { LANGUAGES, type Language } from "@/types/therapist";

interface LanguageFilterProps {
  selected: Language[];
  onChange: (selected: Language[]) => void;
}

export function LanguageFilter({ selected, onChange }: LanguageFilterProps) {
  const t = useTranslations("therapists.filters.language");
  const tLang = useTranslations("therapists.languages");

  const handleToggle = (language: Language, checked: boolean) => {
    if (checked) {
      onChange([...selected, language]);
    } else {
      onChange(selected.filter((l) => l !== language));
    }
  };

  return (
    <FilterSection title={t("label")} defaultOpen={false}>
      <div className="space-y-2">
        {LANGUAGES.map((language) => (
          <div key={language} className="flex items-center space-x-2">
            <Checkbox
              id={`language-${language}`}
              checked={selected.includes(language)}
              onCheckedChange={(checked) =>
                handleToggle(language, checked === true)
              }
            />
            <Label
              htmlFor={`language-${language}`}
              className="text-sm font-normal cursor-pointer"
            >
              {tLang(language)}
            </Label>
          </div>
        ))}
      </div>
    </FilterSection>
  );
}
