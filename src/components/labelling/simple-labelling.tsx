"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, SkipForward, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATCHING_TOPICS, getTopicImageUrl } from "@/lib/matching/topics";
import { generateCaseWithSuggestions } from "@/lib/actions/labelling/suggestions";
import { saveSimpleLabel } from "@/lib/actions/labelling/training";
import { TOPIC_LABELS_DE } from "@/lib/labelling/constants";

// Topics without "other"
const AVAILABLE_TOPICS = MATCHING_TOPICS.filter((t) => t.id !== "other");

interface SimpleLabellingProps {
  initialCount?: number;
}

export function SimpleLabelling({ initialCount = 0 }: SimpleLabellingProps) {
  // State
  const [caseText, setCaseText] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [labelledCount, setLabelledCount] = useState(initialCount);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load a new case
  const loadNewCase = useCallback(async () => {
    setIsLoading(true);
    setSelectedCategories([]);
    setError(null);

    try {
      const result = await generateCaseWithSuggestions();
      setCaseText(result.text);

      // Extract just the category keys from suggestions
      const suggestedKeys = result.suggestions.main.map((s) => s.key);
      setAiSuggestions(suggestedKeys);
    } catch (err) {
      console.error("Failed to load case:", err);
      setError("Fehler beim Laden. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load first case on mount
  useEffect(() => {
    loadNewCase();
  }, [loadNewCase]);

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((c) => c !== categoryId);
      }
      // Max 3 categories
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, categoryId];
    });
  };

  // Accept AI suggestion with one tap
  const acceptAiSuggestion = () => {
    setSelectedCategories(aiSuggestions);
  };

  // Save and continue
  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await saveSimpleLabel({
        text: caseText,
        categories: selectedCategories,
        aiSuggested: aiSuggestions,
      });

      if (result.success) {
        setLabelledCount((prev) => prev + 1);
        // Load next case
        await loadNewCase();
      } else {
        setError(result.error || "Fehler beim Speichern");
      }
    } catch (err) {
      console.error("Failed to save:", err);
      setError("Fehler beim Speichern. Bitte versuche es erneut.");
    } finally {
      setIsSaving(false);
    }
  };

  // Skip without saving
  const handleSkip = () => {
    loadNewCase();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-24">
      {/* Header with count */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Labelling</h1>
        <Badge variant="secondary" className="text-sm">
          {labelledCount} gelabelt
        </Badge>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Case text */}
        <Card className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="text-base leading-relaxed text-foreground">
              &ldquo;{caseText}&rdquo;
            </p>
          )}
        </Card>

        {/* AI suggestion button */}
        {!isLoading && aiSuggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">KI-Vorschlag:</p>
            <Button
              variant={
                selectedCategories.length > 0 &&
                JSON.stringify(selectedCategories.sort()) ===
                  JSON.stringify(aiSuggestions.sort())
                  ? "default"
                  : "outline"
              }
              className="w-full h-auto py-3 justify-start gap-3"
              onClick={acceptAiSuggestion}
              disabled={isLoading || isSaving}
            >
              <Check className="h-5 w-5 shrink-0" />
              <span className="text-left">
                {aiSuggestions.map((key) => TOPIC_LABELS_DE[key] || key).join(", ")}
              </span>
            </Button>
          </div>
        )}

        {/* Category grid */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Oder wähle selbst:</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = selectedCategories.includes(topic.id);
              const imageUrl = getTopicImageUrl(topic.unsplashId, 150, 150);

              return (
                <button
                  key={topic.id}
                  onClick={() => toggleCategory(topic.id)}
                  disabled={isLoading || isSaving}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:opacity-90"
                  )}
                >
                  {/* Image */}
                  <img
                    src={imageUrl}
                    alt={TOPIC_LABELS_DE[topic.id] || topic.id}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay with label */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-end justify-center pb-1",
                      "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                    )}
                  >
                    <span className="text-white text-xs font-medium px-1 text-center">
                      {TOPIC_LABELS_DE[topic.id] || topic.id}
                    </span>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected categories indicator */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Gewählt:</span>
            {selectedCategories.map((key) => (
              <Badge key={key} variant="default">
                {TOPIC_LABELS_DE[key] || key}
              </Badge>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          "px-4 py-3",
          "pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        )}
      >
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
          {/* Skip button */}
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading || isSaving}
            className="gap-2"
          >
            <SkipForward className="h-4 w-4" />
            <span className="hidden sm:inline">Überspringen</span>
          </Button>

          {/* Reload button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={loadNewCase}
            disabled={isLoading || isSaving}
            className="text-muted-foreground"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={isLoading || isSaving || selectedCategories.length === 0}
            className="gap-2 min-w-[120px]"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Weiter
          </Button>
        </div>
      </div>
    </div>
  );
}
