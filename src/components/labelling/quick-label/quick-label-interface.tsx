"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, RefreshCw, Loader2, PenLine, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

import { AISuggestionsDisplay } from "./ai-suggestions-display";
import { CategoryChipSelect } from "./category-chip-select";
import { SubcategoryAccordion } from "./subcategory-accordion";
import { IntensityAccordion } from "./intensity-accordion";
import { RelatedTopicsChips } from "./related-topics-chips";
import { StickyFooterActions } from "./sticky-footer-actions";
import { SuggestionSkeleton } from "./suggestion-skeleton";

import type {
  LabelSuggestion,
  CategorySuggestion,
  SubcategoriesMap,
  IntensityMap,
  RelatedTopic,
  PrimaryCategory,
} from "@/types/labelling";

interface QuickLabelInterfaceProps {
  userId: string;
  userName: string;
  stats: {
    todayLabeled: number;
    totalLabeled: number;
  } | null;
}

type Mode = "ai-generated" | "custom";

export function QuickLabelInterface({
  userId,
  userName,
  stats,
}: QuickLabelInterfaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode state
  const [mode, setMode] = useState<Mode>("ai-generated");

  // Case state
  const [caseText, setCaseText] = useState("");
  const [customText, setCustomText] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);

  // AI suggestion state
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestion, setSuggestion] = useState<LabelSuggestion | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  // Label state
  const [selectedCategories, setSelectedCategories] = useState<
    CategorySuggestion[]
  >([]);
  const [subcategories, setSubcategories] = useState<SubcategoriesMap>({});
  const [intensity, setIntensity] = useState<IntensityMap>({});
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [isUncertain, setIsUncertain] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [labelCount, setLabelCount] = useState(stats?.todayLabeled || 0);

  // Generate a new case
  const generateNewCase = useCallback(async () => {
    setIsGenerating(true);
    setSuggestion(null);
    setSuggestionError(null);
    setSelectedCategories([]);
    setSubcategories({});
    setIntensity({});
    setRelatedTopics([]);
    setIsUncertain(false);

    try {
      const { generateCaseWithSuggestions } = await import(
        "@/lib/actions/labelling/suggestions"
      );

      const result = await generateCaseWithSuggestions();

      setCaseText(result.text);
      setSuggestion(result.suggestions);

      // Auto-apply suggestions
      if (result.suggestions.main.length > 0) {
        setSelectedCategories(result.suggestions.main);
        setSubcategories(result.suggestions.sub);
        setIntensity(result.suggestions.intensity);
        setRelatedTopics(
          result.suggestions.related.map((r) => ({
            key: r.key,
            strength: r.strength,
          }))
        );
        setIsUncertain(result.suggestions.uncertainSuggested);
      }
    } catch (error) {
      console.error("Generation error:", error);
      setSuggestionError("Fall konnte nicht generiert werden");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Fetch suggestions for custom text
  const fetchSuggestions = useCallback(async (inputText: string) => {
    if (inputText.trim().length < 20) {
      setSuggestion(null);
      return;
    }

    setIsLoadingSuggestions(true);
    setSuggestionError(null);

    try {
      const response = await fetch("/api/labelling/suggest-labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Vorschläge konnten nicht geladen werden");
      }

      const data = (await response.json()) as LabelSuggestion;
      setSuggestion(data);

      // Auto-apply suggestions
      if (data.main.length > 0 && selectedCategories.length === 0) {
        setSelectedCategories(data.main);
        setSubcategories(data.sub);
        setIntensity(data.intensity);
        setRelatedTopics(
          data.related.map((r) => ({ key: r.key, strength: r.strength }))
        );
        setIsUncertain(data.uncertainSuggested);
      }
    } catch (err) {
      console.error("Suggestion fetch error:", err);
      setSuggestionError(
        err instanceof Error ? err.message : "Unbekannter Fehler"
      );
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [selectedCategories.length]);

  // Load first case on mount
  useEffect(() => {
    generateNewCase();
  }, [generateNewCase]);

  // Handle mode switch
  const handleSwitchToCustom = useCallback(() => {
    setMode("custom");
    setCaseText("");
    setCustomText("");
    setSuggestion(null);
    setSelectedCategories([]);
    setSubcategories({});
    setIntensity({});
    setRelatedTopics([]);
    setIsUncertain(false);
  }, []);

  const handleSwitchToAI = useCallback(() => {
    setMode("ai-generated");
    setCustomText("");
    generateNewCase();
  }, [generateNewCase]);

  // Handle custom text change
  const handleCustomTextChange = useCallback(
    (newText: string) => {
      setCustomText(newText);
      if (newText.trim().length >= 20) {
        // Debounce: wait a bit before fetching
        const timer = setTimeout(() => fetchSuggestions(newText), 600);
        return () => clearTimeout(timer);
      } else {
        setSuggestion(null);
      }
    },
    [fetchSuggestions]
  );

  // Accept all AI suggestions
  const handleAcceptAll = useCallback(() => {
    if (!suggestion) return;

    setSelectedCategories(suggestion.main);
    setSubcategories(suggestion.sub);
    setIntensity(suggestion.intensity);
    setRelatedTopics(
      suggestion.related.map((r) => ({ key: r.key, strength: r.strength }))
    );
    setIsUncertain(suggestion.uncertainSuggested);
  }, [suggestion]);

  // Toggle category selection
  const handleToggleCategory = useCallback(
    (categoryKey: string) => {
      setSelectedCategories((prev) => {
        const existing = prev.find((c) => c.key === categoryKey);
        if (existing) {
          // Remove category
          const filtered = prev.filter((c) => c.key !== categoryKey);
          // Re-rank remaining categories
          return filtered.map((c, index) => ({
            ...c,
            rank: (index + 1) as 1 | 2 | 3,
          }));
        } else if (prev.length < 3) {
          // Add category with next rank
          const suggestionCat = suggestion?.main.find(
            (c) => c.key === categoryKey
          );
          const newCat: CategorySuggestion = {
            key: categoryKey,
            rank: (prev.length + 1) as 1 | 2 | 3,
            confidence: suggestionCat?.confidence || 0.5,
          };
          return [...prev, newCat];
        }
        return prev; // Max 3 reached
      });

      // Clean up subcategories and intensity for removed categories
      setSubcategories((prev) => {
        const newSubs = { ...prev };
        const selectedKeys = selectedCategories.map((c) => c.key);
        if (!selectedKeys.includes(categoryKey)) {
          delete newSubs[categoryKey];
        }
        return newSubs;
      });

      setIntensity((prev) => {
        const newInt = { ...prev };
        const selectedKeys = selectedCategories.map((c) => c.key);
        if (!selectedKeys.includes(categoryKey)) {
          delete newInt[categoryKey];
        }
        return newInt;
      });
    },
    [suggestion, selectedCategories]
  );

  // Toggle subcategory
  const handleToggleSubcategory = useCallback(
    (categoryKey: string, subtopicId: string) => {
      setSubcategories((prev) => {
        const current = prev[categoryKey] || [];
        if (current.includes(subtopicId)) {
          return {
            ...prev,
            [categoryKey]: current.filter((id) => id !== subtopicId),
          };
        }
        return {
          ...prev,
          [categoryKey]: [...current, subtopicId],
        };
      });
    },
    []
  );

  // Toggle intensity
  const handleToggleIntensity = useCallback(
    (categoryKey: string, intensityId: string) => {
      setIntensity((prev) => {
        const current = prev[categoryKey] || [];
        if (current.includes(intensityId)) {
          return {
            ...prev,
            [categoryKey]: current.filter((id) => id !== intensityId),
          };
        }
        return {
          ...prev,
          [categoryKey]: [...current, intensityId],
        };
      });
    },
    []
  );

  // Toggle related topic
  const handleToggleRelated = useCallback((topicKey: string) => {
    setRelatedTopics((prev) => {
      const existing = prev.find((r) => r.key === topicKey);
      if (existing) {
        return prev.filter((r) => r.key !== topicKey);
      }
      return [...prev, { key: topicKey, strength: "OFTEN" as const }];
    });
  }, []);

  // Save and get next case
  const handleSaveAndNext = useCallback(async () => {
    const text = mode === "ai-generated" ? caseText : customText;
    if (selectedCategories.length === 0 || text.trim().length < 20) return;

    setIsSaving(true);

    try {
      // Build primary categories with proper ranks
      const primaryCategories: PrimaryCategory[] = selectedCategories.map(
        (c, index) => ({
          key: c.key,
          rank: (index + 1) as 1 | 2 | 3,
        })
      );

      // Filter subcategories and intensity to only include selected categories
      const selectedKeys = selectedCategories.map((c) => c.key);
      const filteredSubs: SubcategoriesMap = {};
      const filteredInt: IntensityMap = {};

      for (const key of selectedKeys) {
        if (subcategories[key]?.length) {
          filteredSubs[key] = subcategories[key];
        }
        if (intensity[key]?.length) {
          filteredInt[key] = intensity[key];
        }
      }

      // Filter related topics to exclude primary categories
      const filteredRelated = relatedTopics.filter(
        (r) => !selectedKeys.includes(r.key)
      );

      // Import saveLabelWithAudit dynamically to avoid SSR issues
      const { saveLabelWithAudit } = await import(
        "@/lib/actions/labelling/training"
      );

      const result = await saveLabelWithAudit({
        text: text,
        aiSuggestion: suggestion,
        finalLabel: {
          primaryCategories,
          subcategories: filteredSubs,
          intensity: filteredInt,
          relatedTopics: filteredRelated,
          uncertain: isUncertain,
        },
      });

      if (result.success) {
        setSaved(true);
        setLabelCount((prev) => prev + 1);

        // Hide success message after 2 seconds
        setTimeout(() => setSaved(false), 2000);

        // Load next case
        if (mode === "ai-generated") {
          generateNewCase();
        } else {
          // Reset custom form
          setCustomText("");
          setSuggestion(null);
          setSelectedCategories([]);
          setSubcategories({});
          setIntensity({});
          setRelatedTopics([]);
          setIsUncertain(false);
        }

        startTransition(() => {
          router.refresh();
        });
      } else {
        console.error("Save failed:", result.error);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    mode,
    caseText,
    customText,
    selectedCategories,
    subcategories,
    intensity,
    relatedTopics,
    isUncertain,
    suggestion,
    generateNewCase,
    router,
  ]);

  // Skip current case and load next
  const handleSkip = useCallback(() => {
    if (mode === "ai-generated") {
      generateNewCase();
    } else {
      setCustomText("");
      setSuggestion(null);
      setSelectedCategories([]);
      setSubcategories({});
      setIntensity({});
      setRelatedTopics([]);
      setIsUncertain(false);
    }
  }, [mode, generateNewCase]);

  const text = mode === "ai-generated" ? caseText : customText;
  const canSave =
    selectedCategories.length > 0 && text.trim().length >= 20 && !isSaving;
  const selectedKeys = selectedCategories.map((c) => c.key);
  const isLoading = isGenerating || isLoadingSuggestions;

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Fall labeln</h1>
          <p className="text-sm text-muted-foreground">
            {labelCount} heute · {(stats?.totalLabeled || 0) + labelCount - (stats?.todayLabeled || 0)} insgesamt
          </p>
        </div>
        <Link href="/de/labelling/stats">
          <Button variant="outline" size="sm" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistik</span>
          </Button>
        </Link>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "ai-generated" ? "default" : "outline"}
          size="sm"
          onClick={handleSwitchToAI}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          KI-generiert
        </Button>
        <Button
          variant={mode === "custom" ? "default" : "outline"}
          size="sm"
          onClick={handleSwitchToCustom}
          className="gap-2"
        >
          <PenLine className="h-4 w-4" />
          Eigener Fall
        </Button>
      </div>

      {/* Loading state */}
      {isGenerating && mode === "ai-generated" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generiere neuen Fall...</span>
              </div>
            </CardContent>
          </Card>
          <SuggestionSkeleton />
        </div>
      )}

      {/* Main content */}
      {!isGenerating && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column: Case text */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                {mode === "ai-generated" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Fallbeschreibung
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateNewCase}
                        disabled={isSaving}
                        className="gap-1 h-7 text-xs"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Neuer Fall
                      </Button>
                    </div>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {caseText}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Eigene Fallbeschreibung eingeben
                    </span>
                    <Textarea
                      value={customText}
                      onChange={(e) => handleCustomTextChange(e.target.value)}
                      placeholder="Beschreibe den Fall aus der Ich-Perspektive der hilfesuchenden Person..."
                      className="min-h-[120px] resize-none"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {customText.length} Zeichen
                      {customText.length < 20 && customText.length > 0 && (
                        <span className="text-amber-600">
                          {" "}
                          · mind. 20 Zeichen
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions (mobile only - shown below text) */}
            <div className="lg:hidden">
              <AISuggestionsDisplay
                isLoading={isLoadingSuggestions}
                suggestion={suggestion}
                error={suggestionError}
                selectedCategories={selectedCategories}
                onAcceptAll={handleAcceptAll}
                onToggleCategory={handleToggleCategory}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Right column: Categories and options */}
          <div className="space-y-4">
            {/* AI Suggestions (desktop - shown in right column) */}
            <div className="hidden lg:block">
              <AISuggestionsDisplay
                isLoading={isLoadingSuggestions}
                suggestion={suggestion}
                error={suggestionError}
                selectedCategories={selectedCategories}
                onAcceptAll={handleAcceptAll}
                onToggleCategory={handleToggleCategory}
                disabled={isSaving}
              />
            </div>

            {/* Manual category selection */}
            <div className="flex justify-center lg:justify-start">
              <CategoryChipSelect
                selectedCategories={selectedKeys}
                onToggle={handleToggleCategory}
                maxSelections={3}
                disabled={isSaving}
              />
            </div>

            {/* Subcategories for selected categories */}
            {selectedCategories.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Subkategorien (optional)
                </p>
                {selectedCategories.map((cat) => (
                  <SubcategoryAccordion
                    key={cat.key}
                    categoryKey={cat.key}
                    selectedSubtopics={subcategories[cat.key] || []}
                    suggestedSubtopics={suggestion?.sub[cat.key] || []}
                    onToggle={(subtopicId) =>
                      handleToggleSubcategory(cat.key, subtopicId)
                    }
                    disabled={isSaving}
                  />
                ))}
              </div>
            )}

            {/* Intensity questions for selected categories */}
            {selectedCategories.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Intensität (optional)
                </p>
                {selectedCategories.map((cat) => (
                  <IntensityAccordion
                    key={cat.key}
                    categoryKey={cat.key}
                    selectedIntensity={intensity[cat.key] || []}
                    suggestedIntensity={suggestion?.intensity[cat.key] || []}
                    onToggle={(intensityId) =>
                      handleToggleIntensity(cat.key, intensityId)
                    }
                    disabled={isSaving}
                  />
                ))}
              </div>
            )}

            {/* Related topics */}
            {selectedCategories.length > 0 && (
              <RelatedTopicsChips
                selectedPrimaryCategories={selectedKeys}
                selectedRelated={relatedTopics}
                suggestedRelated={suggestion?.related}
                onToggle={handleToggleRelated}
                disabled={isSaving}
              />
            )}
          </div>
        </div>
      )}

      {/* Success message */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          Gespeichert! Nächster Fall wird geladen...
        </div>
      )}

      {/* Sticky footer */}
      <StickyFooterActions
        isUncertain={isUncertain}
        onUncertainChange={setIsUncertain}
        onSaveAndNext={handleSaveAndNext}
        onDiscard={handleSkip}
        isSaving={isSaving}
        canSave={canSave}
        showDiscardButton={true}
        discardLabel="Überspringen"
      />
    </div>
  );
}
