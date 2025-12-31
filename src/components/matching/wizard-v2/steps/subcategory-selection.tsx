"use client";

import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWizardV2 } from "../wizard-context";
import type { WizardSubcategory } from "@/lib/matching/wizard-categories";

// Subcategory card component
function SubcategoryCard({
  subcategory,
  isSelected,
  onClick,
}: {
  subcategory: WizardSubcategory;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md p-4",
        "flex items-center justify-between gap-3",
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/5"
          : "hover:border-primary/50"
      )}
    >
      <span
        className={cn(
          "text-sm font-medium",
          isSelected ? "text-primary" : "text-gray-900 dark:text-gray-100"
        )}
      >
        {subcategory.labelDE}
      </span>
      {isSelected && (
        <Check className="h-5 w-5 text-primary shrink-0" />
      )}
    </Card>
  );
}

export function SubcategorySelection() {
  const { state, actions, computed } = useWizardV2();

  const { selectedCategory, availableSubcategories } = computed;

  const handleSubcategoryClick = (subcategoryId: string) => {
    actions.selectSubcategory(subcategoryId);
  };

  const handleNext = () => {
    if (state.selectedSubcategoryId) {
      actions.goNext();
    }
  };

  if (!selectedCategory) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {selectedCategory.labelDE}
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Genauer gesagt...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Welcher Bereich trifft am besten zu?
        </p>
      </div>

      {/* Subcategory List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableSubcategories.map((subcategory) => (
          <SubcategoryCard
            key={subcategory.id}
            subcategory={subcategory}
            isSelected={state.selectedSubcategoryId === subcategory.id}
            onClick={() => handleSubcategoryClick(subcategory.id)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={actions.goBack}
          className="flex-1 sm:flex-none"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <Button
          onClick={handleNext}
          disabled={!computed.canProceed}
          className="flex-1 sm:flex-none sm:ml-auto"
        >
          Weiter
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
