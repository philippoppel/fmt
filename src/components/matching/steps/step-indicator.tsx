"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching, type WizardStep } from "../matching-context";

interface StepIndicatorProps {
  labels: {
    topics: string;
    intensity: string;
    preferences: string;
  };
  optionalLabel?: string;
}

export function StepIndicator({ labels }: StepIndicatorProps) {
  const { state } = useMatching();
  const steps: { step: WizardStep; label: string }[] = [
    { step: 1, label: labels.topics },
    { step: 1.5, label: labels.intensity },
    { step: 2, label: labels.preferences },
  ];

  const currentStep = state.currentStep;

  return (
    <nav aria-label="Progress" className="w-full">
      <div className="flex items-center gap-1">
        {steps.map(({ step, label }, index) => {
          const isCurrent = currentStep === step;
          const isCompleted = currentStep > step;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex flex-1 items-center gap-1">
              {/* Step pill */}
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                  isCompleted && "bg-primary/10 text-primary",
                  isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-current/20 text-[10px]">
                    {index + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{label}</span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={cn(
                    "h-px flex-1",
                    isCompleted ? "bg-primary/50" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
