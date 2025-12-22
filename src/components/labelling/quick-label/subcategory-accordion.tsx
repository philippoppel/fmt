"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TOPIC_LABELS, SUBTOPIC_LABELS } from "./category-card";
import { MATCHING_TOPICS } from "@/lib/matching/topics";

interface SubcategoryAccordionProps {
  categoryKey: string;
  selectedSubtopics: string[];
  suggestedSubtopics?: string[];
  onToggle: (subtopicId: string) => void;
  defaultOpen?: boolean;
  disabled?: boolean;
}

/**
 * Collapsible subcategory selection for a category
 */
export function SubcategoryAccordion({
  categoryKey,
  selectedSubtopics,
  suggestedSubtopics = [],
  onToggle,
  defaultOpen = false,
  disabled = false,
}: SubcategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Get subtopics for this category
  const topic = MATCHING_TOPICS.find((t) => t.id === categoryKey);
  const subtopics = topic?.subTopics || [];

  if (subtopics.length === 0) {
    return null;
  }

  const categoryLabel = TOPIC_LABELS[categoryKey] || categoryKey;
  const selectedCount = selectedSubtopics.filter((id) =>
    subtopics.some((st) => st.id === id)
  ).length;

  return (
    <div className="rounded-lg border border-border">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between p-3",
          "min-h-[44px] touch-manipulation",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        )}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{categoryLabel}</span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedCount}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-border p-3">
          <div className="flex flex-wrap gap-2">
            {subtopics.map((subtopic) => {
              const isSelected = selectedSubtopics.includes(subtopic.id);
              const isSuggested = suggestedSubtopics.includes(subtopic.id);
              const label = SUBTOPIC_LABELS[subtopic.id] || subtopic.id;

              return (
                <button
                  key={subtopic.id}
                  type="button"
                  onClick={() => onToggle(subtopic.id)}
                  disabled={disabled}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    "min-h-[36px] touch-manipulation",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isSuggested
                        ? "bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/30"
                        : "bg-muted hover:bg-muted/80 text-foreground",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
