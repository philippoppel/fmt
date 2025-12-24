"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Search, AlertTriangle, Loader2, ChevronDown, MapPin, User2, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching } from "./matching-context";
import { countMatchingTherapists } from "@/lib/actions/count-matches";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MatchCounterProps {
  className?: string;
  /** Compact mode for inline header display */
  compact?: boolean;
}

/**
 * Match counter that shows real-time therapist count
 * Updates on every criteria change with debounced API calls
 * Supports both floating and compact (inline) modes
 */
export function MatchCounter({ className, compact = false }: MatchCounterProps) {
  const t = useTranslations("matching.counter");
  const { state } = useMatching();

  const [count, setCount] = useState<number | null>(null);
  const [prevCount, setPrevCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch match count when criteria change
  useEffect(() => {
    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchCount = async () => {
      setIsLoading(true);
      try {
        const result = await countMatchingTherapists({
          selectedTopics: state.selectedTopics,
          selectedSubTopics: state.selectedSubTopics,
          location: state.criteria.location || undefined,
          gender: state.criteria.gender,
          sessionType: state.criteria.sessionType,
          insurance: state.criteria.insurance,
        });

        if (!controller.signal.aborted) {
          setPrevCount(count);
          setCount(result.count);
        }
      } catch {
        // Ignore errors
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    // Debounce 300ms
    const timeout = setTimeout(fetchCount, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    state.selectedTopics,
    state.selectedSubTopics,
    state.criteria.location,
    state.criteria.gender,
    state.criteria.sessionType,
    state.criteria.insurance,
  ]);

  // Scroll to results button when clicked
  const scrollToResults = () => {
    const resultsBtn = document.getElementById("results-button");
    if (resultsBtn) {
      resultsBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const isZeroMatches = count === 0;
  const countChanged = prevCount !== null && prevCount !== count;

  // Get summary of current criteria
  const criteriaPreview = [];
  if (state.selectedTopics.length > 0) {
    criteriaPreview.push(`${state.selectedTopics.length} ${t("topics")}`);
  }
  if (state.criteria.location) {
    criteriaPreview.push(state.criteria.location);
  }
  if (state.criteria.sessionType) {
    criteriaPreview.push(t(`sessionTypes.${state.criteria.sessionType}`));
  }

  // Compact mode: simple inline badge for header
  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-all",
              "border shrink-0",
              isZeroMatches
                ? "bg-warning/10 text-warning border-warning/30"
                : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
              className
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isZeroMatches ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            <span
              className={cn(
                "font-semibold tabular-nums",
                countChanged && "animate-pulse"
              )}
            >
              {count ?? "..."}
            </span>
            <span className="hidden sm:inline text-xs opacity-80">
              {t("matchingTherapistsShort")}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-3">
          <div className="space-y-2">
            <h4 className="font-medium text-xs">{t("currentCriteria")}</h4>
            <div className="flex flex-wrap gap-1.5">
              {state.selectedTopics.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                  {state.selectedTopics.length} {t("topics")}
                </span>
              )}
              {state.criteria.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  <MapPin className="h-3 w-3" />
                  {state.criteria.location}
                </span>
              )}
            </div>
            {isZeroMatches && (
              <p className="text-xs text-warning">{t("noMatchesHint")}</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Full floating mode
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={scrollToResults}
          className={cn(
            "fixed top-20 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg transition-all duration-300",
            "backdrop-blur-sm border",
            isZeroMatches
              ? "bg-warning/90 text-warning-foreground border-warning/50 animate-pulse"
              : "bg-primary/90 text-primary-foreground border-primary/50 hover:bg-primary",
            className
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isZeroMatches ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span
            key={count}
            className={cn(
              "font-semibold tabular-nums min-w-[2ch] transition-all duration-200",
              countChanged && "animate-pulse"
            )}
          >
            {count ?? "..."}
          </span>
          <span className="hidden sm:inline">{t("matchingTherapists")}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{t("currentCriteria")}</h4>

          {criteriaPreview.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {state.selectedTopics.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs">
                  <Search className="h-3 w-3" />
                  {state.selectedTopics.length} {t("topics")}
                </span>
              )}
              {state.criteria.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                  <MapPin className="h-3 w-3" />
                  {state.criteria.location}
                </span>
              )}
              {state.criteria.gender && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                  <User2 className="h-3 w-3" />
                  {t(`genders.${state.criteria.gender}`)}
                </span>
              )}
              {state.criteria.sessionType && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                  <Monitor className="h-3 w-3" />
                  {t(`sessionTypes.${state.criteria.sessionType}`)}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t("noCriteriaYet")}</p>
          )}

          {isZeroMatches && (
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
              <p className="text-xs text-warning-foreground">
                {t("noMatchesHint")}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
