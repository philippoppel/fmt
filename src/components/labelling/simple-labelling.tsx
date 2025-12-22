"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, SkipForward, Check, RefreshCw, Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MATCHING_TOPICS, getTopicImageUrl } from "@/lib/matching/topics";
import { generateCaseWithSuggestions } from "@/lib/actions/labelling/suggestions";
import { saveSimpleLabel } from "@/lib/actions/labelling/training";
import { TOPIC_LABELS_DE, SUBTOPIC_LABELS_DE } from "@/lib/labelling/constants";

// Topics without "other"
const AVAILABLE_TOPICS = MATCHING_TOPICS.filter((t) => t.id !== "other");

interface SimpleLabellingProps {
  initialCount?: number;
}

interface Selection {
  topicId: string;
  subtopicIds: string[];
}

export function SimpleLabelling({ initialCount = 0 }: SimpleLabellingProps) {
  // State
  const [caseText, setCaseText] = useState<string>("");
  const [aiSuggestedTopic, setAiSuggestedTopic] = useState<string | null>(null);
  const [aiSuggestedSubtopics, setAiSuggestedSubtopics] = useState<string[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [labelledCount, setLabelledCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);

  // Filter topics and subtopics based on search
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return { topics: AVAILABLE_TOPICS, matchedSubtopics: new Map<string, string[]>() };
    }

    const matchedSubtopics = new Map<string, string[]>();
    const matchedTopicIds = new Set<string>();

    AVAILABLE_TOPICS.forEach((topic) => {
      const topicLabel = TOPIC_LABELS_DE[topic.id] || topic.id;
      const topicMatches = topicLabel.toLowerCase().includes(query);

      if (topicMatches) {
        matchedTopicIds.add(topic.id);
      }

      // Check subtopics
      const matchingSubs: string[] = [];
      topic.subTopics.forEach((sub) => {
        const subLabel = SUBTOPIC_LABELS_DE[sub.id] || sub.id;
        if (subLabel.toLowerCase().includes(query)) {
          matchingSubs.push(sub.id);
          matchedTopicIds.add(topic.id);
        }
      });

      if (matchingSubs.length > 0) {
        matchedSubtopics.set(topic.id, matchingSubs);
      }
    });

    const topics = AVAILABLE_TOPICS.filter((t) => matchedTopicIds.has(t.id));
    return { topics, matchedSubtopics };
  }, [searchQuery]);

  // Auto-expand topics that match search
  useEffect(() => {
    if (searchQuery) {
      const newExpanded = new Set<string>();
      filteredData.matchedSubtopics.forEach((_, topicId) => {
        newExpanded.add(topicId);
      });
      setExpandedTopics(newExpanded);
    }
  }, [searchQuery, filteredData.matchedSubtopics]);

  // Load a new case
  const loadNewCase = useCallback(async () => {
    setIsLoading(true);
    setSelection(null);
    setSearchQuery("");
    setExpandedTopics(new Set());
    setError(null);
    setAiSuggestedTopic(null);
    setAiSuggestedSubtopics([]);

    try {
      const result = await generateCaseWithSuggestions();
      setCaseText(result.text);

      // Extract main suggestion (first one)
      if (result.suggestions.main.length > 0) {
        const mainKey = result.suggestions.main[0].key;
        setAiSuggestedTopic(mainKey);
        const suggestedSubs = result.suggestions.sub[mainKey] || [];
        setAiSuggestedSubtopics(suggestedSubs);
        // Auto-expand the suggested topic
        setExpandedTopics(new Set([mainKey]));
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

  // Toggle topic expansion
  const toggleExpanded = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  // Select topic (and optionally subtopic)
  const selectTopic = (topicId: string, subtopicId?: string) => {
    if (selection?.topicId === topicId) {
      // Same topic - toggle subtopic if provided
      if (subtopicId) {
        const has = selection.subtopicIds.includes(subtopicId);
        setSelection({
          ...selection,
          subtopicIds: has
            ? selection.subtopicIds.filter((id) => id !== subtopicId)
            : [...selection.subtopicIds, subtopicId],
        });
      } else {
        // Click on same topic header - deselect
        setSelection(null);
      }
    } else {
      // Different topic
      setSelection({
        topicId,
        subtopicIds: subtopicId ? [subtopicId] : [],
      });
      // Expand the new topic
      setExpandedTopics((prev) => new Set([...prev, topicId]));
    }
  };

  // Toggle subtopic
  const toggleSubtopic = (topicId: string, subtopicId: string) => {
    if (selection?.topicId !== topicId) {
      // Select this topic with this subtopic
      setSelection({ topicId, subtopicIds: [subtopicId] });
      setExpandedTopics((prev) => new Set([...prev, topicId]));
    } else {
      // Toggle subtopic in current selection
      const has = selection.subtopicIds.includes(subtopicId);
      setSelection({
        ...selection,
        subtopicIds: has
          ? selection.subtopicIds.filter((id) => id !== subtopicId)
          : [...selection.subtopicIds, subtopicId],
      });
    }
  };

  // Accept AI suggestion
  const acceptAiSuggestion = () => {
    if (aiSuggestedTopic) {
      setSelection({
        topicId: aiSuggestedTopic,
        subtopicIds: aiSuggestedSubtopics,
      });
      setExpandedTopics(new Set([aiSuggestedTopic]));
    }
  };

  // Save and continue
  const handleSave = async () => {
    if (!selection?.topicId) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await saveSimpleLabel({
        text: caseText,
        categories: [selection.topicId],
        subtopics: selection.subtopicIds,
        aiSuggested: aiSuggestedTopic ? [aiSuggestedTopic] : [],
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
    selection?.topicId === aiSuggestedTopic &&
    aiSuggestedSubtopics.length === selection?.subtopicIds.length &&
    aiSuggestedSubtopics.every((s) => selection?.subtopicIds.includes(s));

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Labelling</h1>
        <Badge variant="secondary" className="text-sm">
          {labelledCount} gelabelt
        </Badge>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

        {/* AI suggestion */}
        {!isLoading && aiSuggestedTopic && (
          <Button
            variant={isAiSuggestionSelected ? "default" : "outline"}
            className="w-full h-auto py-3 justify-start gap-3"
            onClick={acceptAiSuggestion}
            disabled={isLoading || isSaving}
          >
            <Check className="h-5 w-5 shrink-0" />
            <div className="text-left">
              <span className="font-medium">
                {TOPIC_LABELS_DE[aiSuggestedTopic]}
              </span>
              {aiSuggestedSubtopics.length > 0 && (
                <span className="text-muted-foreground ml-2">
                  ({aiSuggestedSubtopics.map((s) => SUBTOPIC_LABELS_DE[s] || s).join(", ")})
                </span>
              )}
            </div>
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

        {/* Topics with expandable subtopics */}
        <div className="space-y-2">
          {filteredData.topics.map((topic) => {
            const isSelected = selection?.topicId === topic.id;
            const isExpanded = expandedTopics.has(topic.id);
            const imageUrl = getTopicImageUrl(topic.unsplashId, 80, 80);
            const matchingSubtopicIds = filteredData.matchedSubtopics.get(topic.id);

            return (
              <div
                key={topic.id}
                className={cn(
                  "rounded-lg border overflow-hidden transition-all",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                {/* Topic header */}
                <button
                  onClick={() => {
                    if (isExpanded && !isSelected) {
                      // Just toggle expand
                      toggleExpanded(topic.id);
                    } else if (!isExpanded) {
                      // Expand and select
                      selectTopic(topic.id);
                    } else {
                      // Already expanded and selected - deselect
                      selectTopic(topic.id);
                    }
                  }}
                  disabled={isLoading || isSaving}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left",
                    "hover:bg-muted/50 transition-colors",
                    "disabled:opacity-50"
                  )}
                >
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <span className="flex-1 font-medium">
                    {TOPIC_LABELS_DE[topic.id]}
                  </span>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary shrink-0" />
                  )}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                      isExpanded && "rotate-180"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(topic.id);
                    }}
                  />
                </button>

                {/* Subtopics */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {topic.subTopics.map((sub) => {
                        const isSubSelected =
                          isSelected && selection?.subtopicIds.includes(sub.id);
                        const matchesSearch = matchingSubtopicIds?.includes(sub.id);

                        return (
                          <button
                            key={sub.id}
                            onClick={() => toggleSubtopic(topic.id, sub.id)}
                            disabled={isLoading || isSaving}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-sm transition-all",
                              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                              "disabled:opacity-50",
                              isSubSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80",
                              matchesSearch && !isSubSelected && "ring-1 ring-primary"
                            )}
                          >
                            {SUBTOPIC_LABELS_DE[sub.id] || sub.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current selection summary */}
        {selection && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Badge variant="default">
              {TOPIC_LABELS_DE[selection.topicId]}
            </Badge>
            {selection.subtopicIds.map((subId) => (
              <Badge key={subId} variant="secondary">
                {SUBTOPIC_LABELS_DE[subId] || subId}
              </Badge>
            ))}
          </div>
        )}

        {/* Error */}
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
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading || isSaving}
            className="gap-2"
          >
            <SkipForward className="h-4 w-4" />
            <span className="hidden sm:inline">Überspringen</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadNewCase}
            disabled={isLoading || isSaving}
            className="text-muted-foreground"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          <Button
            onClick={handleSave}
            disabled={isLoading || isSaving || !selection?.topicId}
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
