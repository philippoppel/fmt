"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWizardV2 } from "../wizard-context";
import {
  getNonCrisisCategories,
  getCrisisCategory,
  type WizardCategory,
} from "@/lib/matching/wizard-categories";

// Dynamic icon component (fallback)
function CategoryIcon({
  iconName,
  className,
}: {
  iconName: string;
  className?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any;
  const IconComponent = icons[iconName] as LucideIcon | undefined;
  if (!IconComponent) {
    return null;
  }
  return <IconComponent className={className} />;
}

// Category card component with image
function CategoryCard({
  category,
  isSelected,
  onClick,
  isCrisis = false,
}: {
  category: WizardCategory;
  isSelected: boolean;
  onClick: () => void;
  isCrisis?: boolean;
}) {
  const [imageError, setImageError] = useState(false);

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
        "cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden",
        "flex flex-col",
        "min-h-[140px] sm:min-h-[160px]",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/50",
        isCrisis &&
          "border-red-200 hover:border-red-300 dark:border-red-900 dark:hover:border-red-800"
      )}
    >
      {/* Image or Icon fallback */}
      <div className="relative h-20 sm:h-24 w-full bg-gray-100">
        {category.imageUrl && !imageError ? (
          <>
            <img
              src={category.imageUrl}
              alt={category.labelDE}
              className={cn(
                "w-full h-full object-cover transition-all",
                isSelected ? "brightness-90" : "brightness-100 group-hover:brightness-95"
              )}
              onError={() => setImageError(true)}
              loading="lazy"
            />
            {/* Overlay for selected state */}
            {isSelected && (
              <div className="absolute inset-0 bg-primary/20" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategoryIcon
              iconName={category.iconName}
              className={cn(
                "h-8 w-8",
                isSelected
                  ? "text-primary"
                  : isCrisis
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500"
              )}
            />
          </div>
        )}
      </div>

      {/* Label */}
      <div className={cn(
        "px-1.5 py-2 sm:p-3 flex-1 flex items-center justify-center min-h-[48px]",
        isSelected && "bg-primary/5"
      )}>
        <span
          className={cn(
            "text-xs sm:text-sm font-medium leading-tight text-center break-words hyphens-auto",
            isSelected
              ? "text-primary"
              : isCrisis
                ? "text-red-700 dark:text-red-300"
                : "text-gray-900 dark:text-gray-100"
          )}
          lang="de"
        >
          {category.labelDE}
        </span>
      </div>
    </Card>
  );
}

export function CategorySelection() {
  const { state, actions, computed } = useWizardV2();

  const regularCategories = getNonCrisisCategories();
  const crisisCategory = getCrisisCategory();

  const handleCategoryClick = (categoryId: string) => {
    actions.selectCategory(categoryId);
  };

  const handleNext = () => {
    if (state.selectedCategoryId && !state.crisisDetected) {
      actions.goNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Was beschäftigt dich?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Wähle das Thema, das dich am meisten belastet
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {regularCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={state.selectedCategoryId === category.id}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </div>

      {/* Crisis Category - Separate Section */}
      {crisisCategory && (
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500 mb-3 text-center">
            In akuter Not?
          </p>
          <CategoryCard
            category={crisisCategory}
            isSelected={state.selectedCategoryId === crisisCategory.id}
            onClick={() => handleCategoryClick(crisisCategory.id)}
            isCrisis
          />
        </div>
      )}

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
