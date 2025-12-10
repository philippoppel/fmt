"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Navigation, Loader2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface LocationSuggestion {
  name: string;
  displayName: string;
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationInput({
  value,
  onChange,
  placeholder,
  className,
}: LocationInputProps) {
  const t = useTranslations("matching.location");
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasAutoLocated, setHasAutoLocated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the search query
  const debouncedValue = useDebounce(value, 300);

  // Search for cities using Nominatim API
  useEffect(() => {
    const searchCities = async () => {
      if (debouncedValue.length < 2 || hasAutoLocated) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q: debouncedValue,
              format: "json",
              addressdetails: "1",
              limit: "5",
              featuretype: "city",
              "accept-language": "de",
            }),
          {
            headers: {
              "User-Agent": "TherapyMatchingApp/1.0",
            },
          }
        );

        if (!response.ok) throw new Error("Search failed");

        const data = await response.json();

        const cityResults: LocationSuggestion[] = data
          .filter((item: any) => {
            // Filter for cities, towns, villages
            const type = item.type;
            return ["city", "town", "village", "municipality", "administrative"].includes(type);
          })
          .map((item: any) => {
            const city =
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.address?.municipality ||
              item.name;
            const country = item.address?.country || "";
            const state = item.address?.state || "";

            return {
              name: city,
              displayName: state ? `${city}, ${state}` : `${city}, ${country}`,
            };
          })
          // Remove duplicates by name
          .filter(
            (item: LocationSuggestion, index: number, self: LocationSuggestion[]) =>
              index === self.findIndex((t) => t.name === item.name)
          );

        setSuggestions(cityResults);
        setShowSuggestions(cityResults.length > 0);
      } catch (error) {
        console.error("City search error:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchCities();
  }, [debouncedValue, hasAutoLocated]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reverse geocode coordinates to city name
  const reverseGeocode = useCallback(
    async (lat: number, lon: number): Promise<string> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "de",
              "User-Agent": "TherapyMatchingApp/1.0",
            },
          }
        );
        const data = await response.json();
        return (
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.municipality ||
          ""
        );
      } catch {
        return "";
      }
    },
    []
  );

  // Manual locate button
  const handleLocate = async () => {
    if (!("geolocation" in navigator)) {
      setLocationError(t("notSupported"));
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const city = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
        if (city) {
          onChange(city);
          setHasAutoLocated(true);
        } else {
          setLocationError(t("notFound"));
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(t("denied"));
        } else {
          setLocationError(t("error"));
        }
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          onChange(suggestions[selectedIndex].name);
          setShowSuggestions(false);
          setHasAutoLocated(true);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.name);
    setShowSuggestions(false);
    setHasAutoLocated(true);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange("");
    setHasAutoLocated(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative flex items-center gap-1.5">
        {/* Input with icon */}
        <div className="relative flex-1">
          <MapPin className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setHasAutoLocated(false);
            }}
            onFocus={() => {
              if (suggestions.length > 0 && !hasAutoLocated) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t("placeholder")}
            className={cn(
              "h-9 pl-8 pr-8 text-sm",
              hasAutoLocated && value && "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
            )}
            autoComplete="off"
          />
          {/* Loading, success indicator or clear button */}
          {(value || isSearching) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isSearching}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors",
                hasAutoLocated
                  ? "text-emerald-600"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {isSearching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : hasAutoLocated ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Locate button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleLocate}
          disabled={isLocating}
          className="h-9 w-9 shrink-0"
          title={t("useMyLocation")}
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Navigation className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Error message */}
      {locationError && (
        <p className="mt-1 text-xs text-destructive">{locationError}</p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <ul className="py-0.5" role="listbox">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.name}-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-sm transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{suggestion.displayName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
