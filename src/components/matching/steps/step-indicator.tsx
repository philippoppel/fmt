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

export function StepIndicator({ labels, optionalLabel }: StepIndicatorProps) {
  const { state } = useMatching();
  const steps: { step: WizardStep; label: string; optional?: boolean }[] = [
    { step: 1, label: labels.topics },
    { step: 1.5, label: labels.intensity, optional: true },
    { step: 2, label: labels.preferences },
  ];

  const currentStep = state.currentStep;

  return (
    <nav aria-label="Progress" className="w-full">
      <div className="flex items-center justify-between">
        {steps.map(({ step, label, optional }, index) => {
          const isCurrent = currentStep === step;
          const isCompleted = currentStep > step;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex flex-1 items-center">
              {/* Step with label */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground shadow-sm",
                    isCurrent && !isCompleted && "bg-primary/10 text-primary ring-2 ring-primary",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="hidden flex-col sm:flex">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                  {optional && (
                    <span className="text-[10px] text-muted-foreground/70">
                      {optionalLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="mx-4 h-px flex-1 bg-border">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      isCompleted ? "bg-primary" : "bg-transparent"
                    )}
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
