"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TherapistResult {
  id: string;
  slug: string | null;
  name: string;
  title: string | null;
  city: string | null;
  imageUrl: string | null;
}

export function HeaderSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TherapistResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Search therapists
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);

    const searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/therapists/search?q=${encodeURIComponent(query)}`, {
          signal: abortController.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.therapists || []);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(searchTimeout);
      abortController.abort();
    };
  }, [query]);

  const handleSelectTherapist = (therapist: TherapistResult) => {
    const profileUrl = therapist.slug ? `/p/${therapist.slug}` : `/therapists/${therapist.id}`;
    router.push(profileUrl);
    setIsOpen(false);
    setQuery("");
  };

  const handleGuidedSearch = () => {
    router.push("/therapists/matching");
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9"
        aria-label="Suche öffnen"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-white/95 backdrop-blur-xl border border-black/10 shadow-2xl overflow-hidden z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-black/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Therapeut:in suchen..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-8 h-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="p-4 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Suche...
              </div>
            )}

            {!isLoading && query.length >= 2 && results.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Keine Therapeut:innen gefunden
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <ul className="py-1">
                {results.slice(0, 5).map((therapist) => (
                  <li key={therapist.id}>
                    <button
                      onClick={() => handleSelectTherapist(therapist)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {therapist.imageUrl ? (
                          <img
                            src={therapist.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-primary font-medium text-sm">
                            {therapist.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{therapist.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {therapist.title || "Psychotherapeut:in"}
                          {therapist.city && ` · ${therapist.city}`}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Guided Search CTA */}
          <div className="p-3 border-t border-black/5 bg-muted/30">
            <button
              onClick={handleGuidedSearch}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "text-sm font-medium transition-colors"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Geführte Suche starten
            </button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Finde die passende Therapie mit unserem Matching
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
