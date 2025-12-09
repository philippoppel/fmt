"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching, type WizardStep } from "../matching-context";

const steps: { step: WizardStep; labelKey: string }[] = [
  { step: 1, labelKey: "topics" },
  { step: 2, labelKey: "preferences" },
];

interface StepIndicatorProps {
  labels: {
    topics: string;
    preferences: string;
  };
}

export function StepIndicator({ labels }: StepIndicatorProps) {
  const { state } = useMatching();
  const currentStep = state.currentStep;

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map(({ step, labelKey }, index) => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const label = labels[labelKey as keyof typeof labels];

          return (
            <li key={step} className="flex items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary bg-primary/10 text-primary",
                  !isCompleted &&
                    !isCurrent &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  step
                )}
              </div>

              {/* Step label (hidden on mobile) */}
              <span
                className={cn(
                  "ml-2 hidden text-sm font-medium sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "ml-2 h-0.5 w-8 sm:ml-4 sm:w-12",
                    currentStep > step ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
