"use client";

import { Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "./category-card";
import { SuggestionSkeleton } from "./suggestion-skeleton";
import type { LabelSuggestion, CategorySuggestion } from "@/types/labelling";

interface AISuggestionsDisplayProps {
  isLoading: boolean;
  suggestion: LabelSuggestion | null;
  error?: string | null;
  selectedCategories: CategorySuggestion[];
  onAcceptAll: () => void;
  onToggleCategory: (categoryKey: string) => void;
  disabled?: boolean;
}

/**
 * Display AI-suggested categories with accept/modify options
 */
export function AISuggestionsDisplay({
  isLoading,
  suggestion,
  error,
  selectedCategories,
  onAcceptAll,
  onToggleCategory,
  disabled = false,
}: AISuggestionsDisplayProps) {
  const selectedKeys = selectedCategories.map((c) => c.key);
  const hasSuggestions = suggestion && suggestion.main.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 animate-pulse text-primary" />
          <span>KI analysiert Text...</span>
        </div>
        <SuggestionSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">
              Vorschläge nicht verfügbar
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {error}. Du kannst die Kategorien manuell auswählen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No suggestions yet (waiting for input)
  if (!suggestion) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
        <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          Gib mindestens 20 Zeichen ein, um KI-Vorschläge zu erhalten.
        </p>
      </div>
    );
  }

  // No categories suggested (uncertain)
  if (!hasSuggestions) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Keine klaren Kategorien</p>
            <p className="text-sm text-amber-700 mt-1">
              Der Text konnte keiner Kategorie eindeutig zugeordnet werden.
              Bitte wähle manuell aus.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show suggestions
  const allSelected = suggestion.main.every((s) => selectedKeys.includes(s.key));

  return (
    <div className="space-y-4">
      {/* Header with accept all button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>KI-Vorschläge</span>
        </div>
        {!allSelected && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAcceptAll}
            disabled={disabled}
            data-testid="accept-suggestion-btn"
          >
            Alle übernehmen
          </Button>
        )}
      </div>

      {/* Category cards */}
      <div className="space-y-3">
        {suggestion.main.map((cat) => (
          <CategoryCard
            key={cat.key}
            categoryKey={cat.key}
            rank={cat.rank}
            confidence={cat.confidence}
            suggestedSubtopics={suggestion.sub[cat.key] || []}
            isSelected={selectedKeys.includes(cat.key)}
            onToggle={() => onToggleCategory(cat.key)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Rationale */}
      {suggestion.rationaleShort && (
        <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
          {suggestion.rationaleShort}
        </p>
      )}
    </div>
  );
}
