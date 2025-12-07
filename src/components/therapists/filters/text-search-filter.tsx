"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextSearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextSearchFilter({ value, onChange }: TextSearchFilterProps) {
  const t = useTranslations("therapists.filters.search");

  return (
    <div className="space-y-2">
      <Label htmlFor="search-filter" className="text-sm font-medium">
        {t("label")}
      </Label>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="search-filter"
          type="text"
          placeholder={t("placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
