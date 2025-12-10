"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Navigation, Loader2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// German cities for autocomplete suggestions
const GERMAN_CITIES = [
  "Berlin",
  "Hamburg",
  "München",
  "Köln",
  "Frankfurt am Main",
  "Stuttgart",
  "Düsseldorf",
  "Leipzig",
  "Dortmund",
  "Essen",
  "Bremen",
  "Dresden",
  "Hannover",
  "Nürnberg",
  "Duisburg",
  "Bochum",
  "Wuppertal",
  "Bielefeld",
  "Bonn",
  "Münster",
  "Mannheim",
  "Karlsruhe",
  "Augsburg",
  "Wiesbaden",
  "Mönchengladbach",
  "Gelsenkirchen",
  "Aachen",
  "Braunschweig",
  "Kiel",
  "Chemnitz",
  "Halle",
  "Magdeburg",
  "Freiburg",
  "Krefeld",
  "Mainz",
  "Lübeck",
  "Erfurt",
  "Oberhausen",
  "Rostock",
  "Kassel",
  "Hagen",
  "Potsdam",
  "Saarbrücken",
  "Hamm",
  "Ludwigshafen",
  "Oldenburg",
  "Mülheim",
  "Osnabrück",
  "Leverkusen",
  "Heidelberg",
  "Darmstadt",
  "Solingen",
  "Regensburg",
  "Herne",
  "Paderborn",
  "Neuss",
  "Ingolstadt",
  "Offenbach",
  "Würzburg",
  "Ulm",
  "Heilbronn",
  "Pforzheim",
  "Wolfsburg",
  "Göttingen",
  "Bottrop",
  "Reutlingen",
  "Koblenz",
  "Bremerhaven",
  "Bergisch Gladbach",
  "Jena",
  "Erlangen",
  "Trier",
  "Remscheid",
  "Salzgitter",
  "Moers",
  "Siegen",
  "Hildesheim",
  "Cottbus",
];

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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasAutoLocated, setHasAutoLocated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (value.length >= 2) {
      const filtered = GERMAN_CITIES.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && !hasAutoLocated);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [value, hasAutoLocated]);

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

  // Auto-locate on mount if no value
  useEffect(() => {
    if (!value && !hasAutoLocated && "geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const city = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          if (city) {
            onChange(city);
            setHasAutoLocated(true);
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 5000, maximumAge: 300000 }
      );
    }
  }, [value, hasAutoLocated, onChange, reverseGeocode]);

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
          onChange(suggestions[selectedIndex]);
          setShowSuggestions(false);
          setHasAutoLocated(true);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const handleSelectSuggestion = (city: string) => {
    onChange(city);
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
      <div className="relative flex items-center gap-2">
        {/* Input with icon */}
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
              "h-12 pl-10 pr-10",
              hasAutoLocated && value && "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
            )}
            autoComplete="off"
          />
          {/* Success indicator or clear button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors",
                hasAutoLocated
                  ? "text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {hasAutoLocated ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
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
          className="h-12 w-12 shrink-0"
          title={t("useMyLocation")}
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Error message */}
      {locationError && (
        <p className="mt-2 text-sm text-destructive">{locationError}</p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg">
          <ul className="py-1" role="listbox">
            {suggestions.map((city, index) => (
              <li
                key={city}
                role="option"
                aria-selected={index === selectedIndex}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleSelectSuggestion(city)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {city}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
