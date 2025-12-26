"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Navigation, Loader2, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationInput } from "./location-input";
import { cn } from "@/lib/utils";
import { countMatchingTherapists } from "@/lib/actions/count-matches";

interface LocationHeroProps {
  location: string;
  onLocationChange: (location: string) => void;
  selectedTopics: string[];
  selectedSubTopics: string[];
  className?: string;
}

export function LocationHero({
  location,
  onLocationChange,
  selectedTopics,
  selectedSubTopics,
  className,
}: LocationHeroProps) {
  const t = useTranslations("matching.location");
  const [isAutoLocating, setIsAutoLocating] = useState(false);
  const [autoLocationError, setAutoLocationError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [isCountingMatches, setIsCountingMatches] = useState(false);
  const [hasAttemptedAutoLocation, setHasAttemptedAutoLocation] = useState(false);

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

  // Auto-detect location on mount (user decision: automatic)
  useEffect(() => {
    // Only attempt once and only if no location is set
    if (hasAttemptedAutoLocation || location) return;
    setHasAttemptedAutoLocation(true);

    if (!("geolocation" in navigator)) return;

    setIsAutoLocating(true);
    setAutoLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const city = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
        if (city) {
          onLocationChange(city);
        }
        setIsAutoLocating(false);
      },
      (error) => {
        setIsAutoLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          // Don't show error for permission denied - user chose not to share
          setAutoLocationError(null);
        } else {
          setAutoLocationError(t("error"));
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [hasAttemptedAutoLocation, location, onLocationChange, reverseGeocode, t]);

  // Fetch match count when location changes
  useEffect(() => {
    const fetchMatchCount = async () => {
      if (!location) {
        setMatchCount(null);
        return;
      }

      setIsCountingMatches(true);
      try {
        const result = await countMatchingTherapists({
          selectedTopics,
          selectedSubTopics,
          location,
          gender: null,
          sessionType: null,
          insurance: [],
        });
        setMatchCount(result.count);
      } catch (error) {
        console.error("Failed to count matches:", error);
        setMatchCount(null);
      } finally {
        setIsCountingMatches(false);
      }
    };

    // Debounce the fetch
    const timer = setTimeout(fetchMatchCount, 300);
    return () => clearTimeout(timer);
  }, [location, selectedTopics, selectedSubTopics]);

  // Manual locate button handler
  const handleDetectLocation = async () => {
    if (!("geolocation" in navigator)) {
      setAutoLocationError(t("notSupported"));
      return;
    }

    setIsAutoLocating(true);
    setAutoLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const city = await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
        if (city) {
          onLocationChange(city);
        } else {
          setAutoLocationError(t("notFound"));
        }
        setIsAutoLocating(false);
      },
      (error) => {
        setIsAutoLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setAutoLocationError(t("denied"));
        } else {
          setAutoLocationError(t("error"));
        }
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-base sm:text-lg">{t("heroTitle")}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("heroSubtitle")}
          </p>
        </div>
      </div>

      {/* Auto-detect button */}
      <Button
        variant="outline"
        size="lg"
        className="w-full mb-3 h-11 sm:h-12 border-primary/30 hover:bg-primary/5 hover:border-primary/50"
        onClick={handleDetectLocation}
        disabled={isAutoLocating}
      >
        {isAutoLocating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            <span className="text-sm sm:text-base">{t("detecting")}</span>
          </>
        ) : (
          <>
            <Navigation className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">{t("detectButton")}</span>
          </>
        )}
      </Button>

      {/* Error message */}
      {autoLocationError && (
        <p className="mb-3 text-xs text-destructive">{autoLocationError}</p>
      )}

      {/* Divider */}
      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-gradient-to-br from-primary/5 to-primary/10 px-2 text-muted-foreground">
            {t("orEnterManually")}
          </span>
        </div>
      </div>

      {/* Manual input */}
      <LocationInput
        value={location}
        onChange={onLocationChange}
        className="[&_input]:h-11 [&_input]:sm:h-12 [&_input]:text-sm [&_input]:sm:text-base"
      />

      {/* Live feedback */}
      {location && (
        <div className="mt-3 flex items-center gap-2">
          {isCountingMatches ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("counting")}</span>
            </div>
          ) : matchCount !== null ? (
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1">
                <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                <Users className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                <span className="text-emerald-800 dark:text-emerald-200">
                  {t("foundNearby", { count: matchCount, location })}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
