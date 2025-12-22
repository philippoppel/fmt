"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TOPIC_LABELS } from "./category-card";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import type { RelatedTopic, RelatedTopicSuggestion } from "@/types/labelling";

// All available categories (excluding "other")
const ALL_CATEGORIES = MATCHING_TOPICS.filter((t) => t.id !== "other").map(
  (t) => t.id
);

interface RelatedTopicsChipsProps {
  selectedPrimaryCategories: string[];
  selectedRelated: RelatedTopic[];
  suggestedRelated?: RelatedTopicSuggestion[];
  onToggle: (topicKey: string) => void;
  disabled?: boolean;
}

/**
 * Chip-based related topics selection
 * Shows topics that often co-occur with primary categories
 */
export function RelatedTopicsChips({
  selectedPrimaryCategories,
  selectedRelated,
  suggestedRelated = [],
  onToggle,
  disabled = false,
}: RelatedTopicsChipsProps) {
  // Get available topics (exclude primary categories)
  const availableTopics = ALL_CATEGORIES.filter(
    (key) => !selectedPrimaryCategories.includes(key)
  );

  // Get suggested topics that are not primary
  const suggestedKeys = suggestedRelated
    .map((r) => r.key)
    .filter((key) => !selectedPrimaryCategories.includes(key));

  // Selected related topic keys
  const selectedKeys = selectedRelated.map((r) => r.key);

  if (availableTopics.length === 0) {
    return null;
  }

  // Show suggested first, then selected, then rest
  const sortedTopics = [
    ...suggestedKeys.filter((k) => !selectedKeys.includes(k)),
    ...selectedKeys,
    ...availableTopics.filter(
      (k) => !suggestedKeys.includes(k) && !selectedKeys.includes(k)
    ),
  ].filter((k, i, arr) => arr.indexOf(k) === i); // Dedupe

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Hängt oft zusammen mit (optional)
      </p>
      <div className="flex flex-wrap gap-2">
        {sortedTopics.slice(0, 8).map((topicKey) => {
          const isSelected = selectedKeys.includes(topicKey);
          const isSuggested = suggestedKeys.includes(topicKey);
          const suggestedStrength = suggestedRelated.find(
            (r) => r.key === topicKey
          )?.strength;
          const label = TOPIC_LABELS[topicKey] || topicKey;

          return (
            <button
              key={topicKey}
              type="button"
              onClick={() => onToggle(topicKey)}
              disabled={disabled}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                "min-h-[36px] touch-manipulation",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : isSuggested
                    ? "bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 ring-1 ring-secondary"
                    : "bg-muted hover:bg-muted/80 text-foreground",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
              {isSuggested && !isSelected && suggestedStrength && (
                <Badge
                  variant="outline"
                  className="ml-1.5 text-[10px] px-1 py-0"
                >
                  {suggestedStrength === "OFTEN" ? "oft" : "manchmal"}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
