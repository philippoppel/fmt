"use client";

import { useEffect, useState } from "react";
import { LanguageMultiSelect } from "./language-multi-select";
import { getAvailableLanguages } from "@/lib/actions/languages";

interface AvailableLanguageSelectProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Language multi-select that only shows languages offered by therapists
 * Use this in matching wizard and filters to prevent selecting unavailable languages
 */
export function AvailableLanguageSelect({
  selected,
  onChange,
  placeholder,
  className,
}: AvailableLanguageSelectProps) {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAvailableLanguages()
      .then(setAvailableLanguages)
      .finally(() => setIsLoading(false));
  }, []);

  // Filter out any selected languages that are no longer available
  useEffect(() => {
    if (!isLoading && availableLanguages.length > 0) {
      const validSelected = selected.filter((s) =>
        availableLanguages.includes(s)
      );
      if (validSelected.length !== selected.length) {
        onChange(validSelected);
      }
    }
  }, [availableLanguages, isLoading, selected, onChange]);

  return (
    <LanguageMultiSelect
      selected={selected}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      availableLanguages={isLoading ? undefined : availableLanguages}
    />
  );
}
