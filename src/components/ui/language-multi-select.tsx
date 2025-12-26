"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { Check, ChevronsUpDown, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getLanguageOptions,
  getLanguageName,
  getLanguageFlag,
  COMMON_LANGUAGES,
} from "@/lib/languages";

interface LanguageMultiSelectProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
  className?: string;
  /** If provided, only these language codes will be shown */
  availableLanguages?: string[];
}

export function LanguageMultiSelect({
  selected,
  onChange,
  placeholder = "Sprachen auswählen...",
  maxDisplay = 5,
  className,
  availableLanguages,
}: LanguageMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const locale = useLocale() as "de" | "en";

  const allOptions = useMemo(() => getLanguageOptions(locale), [locale]);

  // Filter to only available languages if specified
  const options = useMemo(() => {
    if (!availableLanguages) return allOptions;
    return allOptions.filter((o) => availableLanguages.includes(o.code));
  }, [allOptions, availableLanguages]);

  const commonOptions = options.filter((o) => o.isCommon);
  const otherOptions = options.filter((o) => !o.isCommon);

  // Filter based on search
  const filteredCommon = useMemo(() => {
    if (!search) return commonOptions;
    const lower = search.toLowerCase();
    return commonOptions.filter(
      (o) =>
        o.name.toLowerCase().includes(lower) ||
        o.code.toLowerCase().includes(lower)
    );
  }, [commonOptions, search]);

  const filteredOther = useMemo(() => {
    if (!search) return otherOptions;
    const lower = search.toLowerCase();
    return otherOptions.filter(
      (o) =>
        o.name.toLowerCase().includes(lower) ||
        o.code.toLowerCase().includes(lower)
    );
  }, [otherOptions, search]);

  const handleSelect = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const handleRemove = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((c) => c !== code));
  };

  const displayedSelected = selected.slice(0, maxDisplay);
  const remainingCount = selected.length - maxDisplay;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[44px] h-auto",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayedSelected.map((code) => (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    <span>{getLanguageFlag(code)}</span>
                    <span>{getLanguageName(code, locale)}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemove(code, e)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge variant="outline">+{remainingCount}</Badge>
                )}
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Sprache suchen..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Keine Sprache gefunden.</CommandEmpty>

            {/* Common Languages */}
            {filteredCommon.length > 0 && (
              <CommandGroup heading="Häufige Sprachen">
                {filteredCommon.map((option) => (
                  <CommandItem
                    key={option.code}
                    value={option.code}
                    onSelect={() => handleSelect(option.code)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.code)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="mr-2">{getLanguageFlag(option.code)}</span>
                    <span>{option.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground uppercase">
                      {option.code}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Separator */}
            {filteredCommon.length > 0 && filteredOther.length > 0 && (
              <CommandSeparator />
            )}

            {/* Other Languages */}
            {filteredOther.length > 0 && (
              <CommandGroup heading="Weitere Sprachen">
                {filteredOther.map((option) => (
                  <CommandItem
                    key={option.code}
                    value={option.code}
                    onSelect={() => handleSelect(option.code)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.code)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{option.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground uppercase">
                      {option.code}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
