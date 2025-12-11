"use client";

import { Check, Heart, Sparkles, Star, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useMatching, type WizardStep } from "../matching-context";

interface StepIndicatorProps {
  labels: {
    topics: string;
    subtopics: string;
    intensity: string;
    preferences: string;
  };
  optionalLabel?: string;
}

export function StepIndicator({ labels }: StepIndicatorProps) {
  const { state } = useMatching();
  const t = useTranslations("matching.wizard");

  // All 4 wizard steps
  const steps: { step: WizardStep; label: string }[] = [
    { step: 1, label: labels.topics },
    { step: 1.25, label: labels.subtopics },
    { step: 1.5, label: labels.intensity },
    { step: 2, label: labels.preferences },
  ];

  const currentStep = state.currentStep;

  // Determine if a step is active or completed
  const isStepActive = (step: WizardStep) => {
    // Step 1 is active for both 0.75 (freetext) and 1 (topic selection)
    if (step === 1) return currentStep === 0.75 || currentStep === 1;
    return currentStep === step;
  };

  const isStepCompleted = (step: WizardStep) => {
    // Step 1 is completed when we're past topic selection
    if (step === 1) return currentStep > 1;
    return currentStep > step;
  };

  // Get emotional motivational message based on step and progress
  const getMotivation = () => {
    // Context-aware encouragement based on user progress
    const hasTopics = state.selectedTopics.length > 0;
    const hasSubtopics = state.selectedSubTopics.length > 0;
    const hasIntensity = state.intensityLevel !== null;

    switch (currentStep) {
      case 0.75:
      case 1:
        if (hasTopics) {
          return {
            icon: <Star className="h-3.5 w-3.5 text-amber-500" />,
            text: t("encouragement.topicsSelected"),
          };
        }
        return {
          icon: <Sun className="h-3.5 w-3.5 text-amber-500" />,
          text: t("motivation.topics"),
        };
      case 1.25:
        if (hasSubtopics) {
          return {
            icon: <Heart className="h-3.5 w-3.5 text-rose-500" />,
            text: t("encouragement.detailsAdded"),
          };
        }
        return {
          icon: <Heart className="h-3.5 w-3.5 text-rose-400" />,
          text: t("motivation.subtopics"),
        };
      case 1.5:
        if (hasIntensity) {
          return {
            icon: <Star className="h-3.5 w-3.5 text-amber-500" />,
            text: t("encouragement.progress"),
          };
        }
        return {
          icon: <Heart className="h-3.5 w-3.5 text-rose-500" />,
          text: t("motivation.intensity"),
        };
      case 2:
        return {
          icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
          text: t("motivation.preferences"),
        };
      default:
        return null;
    }
  };

  const motivation = getMotivation();

  return (
    <nav aria-label="Progress" className="w-full space-y-2">
      <ol className="flex items-center">
        {steps.map(({ step, label }, index) => {
          const isActive = isStepActive(step);
          const isCompleted = isStepCompleted(step);
          const isLast = index === steps.length - 1;

          return (
            <li key={step} className={cn("flex items-center", !isLast && "flex-1")}>
              {/* Step Circle + Label */}
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && !isCompleted && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:inline",
                    isActive && "text-foreground",
                    isCompleted && "text-primary",
                    !isCompleted && !isActive && "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="mx-2 flex-1">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded-full transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Motivational message */}
      {motivation && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-300">
          {motivation.icon}
          <span>{motivation.text}</span>
        </div>
      )}
    </nav>
  );
}
