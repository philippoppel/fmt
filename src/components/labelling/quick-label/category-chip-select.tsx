"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TOPIC_LABELS } from "./category-card";
import { MATCHING_TOPICS } from "@/lib/matching/topics";

// All available categories (excluding "other")
const CATEGORIES = MATCHING_TOPICS.filter((t) => t.id !== "other").map(
  (t) => t.id
);

interface CategoryChipSelectProps {
  selectedCategories: string[];
  onToggle: (categoryKey: string) => void;
  maxSelections?: number;
  disabled?: boolean;
}

/**
 * Bottom sheet for manual category selection
 * Shows all 12 categories as touchable chips
 */
export function CategoryChipSelect({
  selectedCategories,
  onToggle,
  maxSelections = 3,
  disabled = false,
}: CategoryChipSelectProps) {
  const [open, setOpen] = useState(false);

  const canSelectMore = selectedCategories.length < maxSelections;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={disabled}
          data-testid="manual-select-trigger"
        >
          <Plus className="h-4 w-4" />
          Andere Kategorie wählen
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[70vh] rounded-t-2xl"
        data-testid="category-sheet"
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Kategorie auswählen</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" data-testid="sheet-close">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedCategories.length} von {maxSelections} ausgewählt
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100%-80px)] pr-4">
          <div className="flex flex-wrap gap-2 pb-8">
            {CATEGORIES.map((categoryKey) => {
              const isSelected = selectedCategories.includes(categoryKey);
              const canSelect = canSelectMore || isSelected;
              const label = TOPIC_LABELS[categoryKey] || categoryKey;

              return (
                <button
                  key={categoryKey}
                  type="button"
                  onClick={() => {
                    if (canSelect) {
                      onToggle(categoryKey);
                    }
                  }}
                  disabled={!canSelect && !isSelected}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                    "min-h-[44px] touch-manipulation",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : canSelect
                        ? "bg-muted hover:bg-muted/80 text-foreground"
                        : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                  data-testid={`category-chip-${categoryKey}`}
                >
                  {label}
                  {isSelected && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 rounded-full bg-primary-foreground/20 p-0 text-[10px] text-primary-foreground"
                    >
                      {selectedCategories.indexOf(categoryKey) + 1}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
