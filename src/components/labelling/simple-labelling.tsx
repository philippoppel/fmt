"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, SkipForward, Check, RefreshCw, Search, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MATCHING_TOPICS,
  TOPICS_BY_SECTION,
  SECTION_LABELS,
  getTopicImageUrl,
  type TopicSection
} from "@/lib/matching/topics";
import { generateCaseWithSuggestions } from "@/lib/actions/labelling/suggestions";
import { saveSimpleLabel } from "@/lib/actions/labelling/training";
import { TOPIC_LABELS_DE } from "@/lib/labelling/constants";

interface SimpleLabellingProps {
  initialCount?: number;
}

const SECTION_ORDER: TopicSection[] = ["clinical", "life", "flags", "meta"];

export function SimpleLabelling({ initialCount = 0 }: SimpleLabellingProps) {
  // State
  const [caseText, setCaseText] = useState<string>("");
  const [aiSuggestedTopics, setAiSuggestedTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [labelledCount, setLabelledCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);

  // Filter topics based on search
  const filteredTopicsBySection = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const result: Record<TopicSection, typeof MATCHING_TOPICS> = {
      flags: [],
      clinical: [],
      life: [],
      meta: [],
    };

    MATCHING_TOPICS.forEach((topic) => {
      const label = TOPIC_LABELS_DE[topic.id] || topic.id;
      if (!query || label.toLowerCase().includes(query)) {
        result[topic.section].push(topic);
      }
    });

    return result;
  }, [searchQuery]);

  // Load a new case
  const loadNewCase = useCallback(async () => {
    setIsLoading(true);
    setSelectedTopics([]);
    setSearchQuery("");
    setError(null);
    setAiSuggestedTopics([]);

    try {
      const result = await generateCaseWithSuggestions();
      setCaseText(result.text);

      // Extract main suggestions
      if (result.suggestions.main.length > 0) {
        const suggested = result.suggestions.main.map((s) => s.key);
        setAiSuggestedTopics(suggested);
      }
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

  // Toggle topic selection
  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      }
      if (prev.length >= 3) {
        // Max 3 topics
        return prev;
      }
      return [...prev, topicId];
    });
  };

  // Accept AI suggestion
  const acceptAiSuggestion = () => {
    if (aiSuggestedTopics.length > 0) {
      setSelectedTopics(aiSuggestedTopics.slice(0, 3));
    }
  };

  // Save and continue
  const handleSave = async () => {
    if (selectedTopics.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await saveSimpleLabel({
        text: caseText,
        categories: selectedTopics,
        aiSuggested: aiSuggestedTopics,
      });

      if (result.success) {
        setLabelledCount((prev) => prev + 1);
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

  const handleSkip = () => {
    loadNewCase();
  };

  const isAiSuggestionSelected =
    aiSuggestedTopics.length > 0 &&
    aiSuggestedTopics.length === selectedTopics.length &&
    aiSuggestedTopics.every((t) => selectedTopics.includes(t));

  return (
    <div className="flex flex-col h-full overflow-x-hidden min-w-0 w-full">
      {/* Header - with padding-left for mobile hamburger button */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 pl-16 lg:pl-4 border-b min-w-0">
        <h1 className="text-lg font-semibold">Labelling</h1>
        <Badge variant="secondary" className="text-sm">
          {labelledCount} gelabelt
        </Badge>
      </div>

      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0">
        {/* Case text */}
        <Card className="p-4 min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="text-base leading-relaxed text-foreground break-words">
              &ldquo;{caseText}&rdquo;
            </p>
          )}
        </Card>

        {/* AI suggestion */}
        {!isLoading && aiSuggestedTopics.length > 0 && (
          <Button
            variant={isAiSuggestionSelected ? "default" : "outline"}
            className="w-full h-auto py-3 justify-start gap-3 text-left"
            onClick={acceptAiSuggestion}
            disabled={isLoading || isSaving}
          >
            <Check className="h-5 w-5 shrink-0" />
            <span className="font-medium break-words min-w-0 flex-1">
              {aiSuggestedTopics.map((t) => TOPIC_LABELS_DE[t]).join(", ")}
            </span>
          </Button>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
            disabled={isLoading || isSaving}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Topics by section */}
        {SECTION_ORDER.map((section) => {
          const topics = filteredTopicsBySection[section];
          if (topics.length === 0) return null;

          const isFlags = section === "flags";

          return (
            <div key={section} className="space-y-2">
              <h2 className={cn(
                "text-sm font-medium flex items-center gap-2",
                isFlags && "text-destructive"
              )}>
                {isFlags && <AlertTriangle className="h-4 w-4" />}
                {SECTION_LABELS[section]}
              </h2>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.id);
                  const isAiSuggested = aiSuggestedTopics.includes(topic.id);
                  const imageUrl = getTopicImageUrl(topic.unsplashId, 40, 40);

                  return (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      disabled={isLoading || isSaving || (!isSelected && selectedTopics.length >= 3)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all min-h-[44px]",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1 touch-manipulation",
                        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
                        isSelected
                          ? isFlags
                            ? "bg-destructive text-destructive-foreground ring-destructive"
                            : "bg-primary text-primary-foreground ring-primary"
                          : isFlags
                            ? "bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30"
                            : "bg-muted hover:bg-muted/80 border border-border",
                        isAiSuggested && !isSelected && "ring-2 ring-primary"
                      )}
                    >
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-6 h-6 rounded object-cover shrink-0"
                      />
                      <span className="font-medium">
                        {TOPIC_LABELS_DE[topic.id] || topic.id}
                      </span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Current selection summary */}
        {selectedTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Auswahl:</span>
            {selectedTopics.map((topicId) => {
              const topic = MATCHING_TOPICS.find((t) => t.id === topicId);
              const isFlag = topic?.isFlag;
              return (
                <Badge
                  key={topicId}
                  variant={isFlag ? "destructive" : "default"}
                >
                  {TOPIC_LABELS_DE[topicId] || topicId}
                </Badge>
              );
            })}
            <span className="text-xs text-muted-foreground ml-auto">
              {selectedTopics.length}/3
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Footer - sticky at bottom with safe area */}
      <div
        className={cn(
          "flex-shrink-0 border-t border-border bg-background",
          "px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading || isSaving}
            className="gap-2 min-h-[44px] touch-manipulation"
          >
            <SkipForward className="h-4 w-4" />
            <span className="hidden sm:inline">Überspringen</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadNewCase}
            disabled={isLoading || isSaving}
            className="text-muted-foreground min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          <Button
            onClick={handleSave}
            disabled={isLoading || isSaving || selectedTopics.length === 0}
            className="gap-2 min-w-[100px] sm:min-w-[120px] min-h-[44px] touch-manipulation flex-1 sm:flex-none max-w-[160px]"
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
