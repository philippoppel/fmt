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
      <div className="flex items-center gap-0.5">
        {steps.map(({ step, label }, index) => {
          const isCurrent = currentStep === step;
          const isCompleted = currentStep > step;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex flex-1 items-center gap-0.5">
              {/* Step pill - very compact */}
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all",
                  isCompleted && "bg-primary/10 text-primary",
                  isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-current/20 text-[9px]">
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
