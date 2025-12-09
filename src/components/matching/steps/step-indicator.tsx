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
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.step === currentStep)
  );
  const progress = Math.round(((currentIndex + 1) / steps.length) * 100);
  const optionalText = optionalLabel ?? "Optional";

  return (
    <nav aria-label="Progress" className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-2 text-[11px] font-semibold text-muted-foreground">
            {steps.map(({ step }, index) => {
              const isCurrent = currentStep === step;
              const isCompleted = currentStep > step;
              const displayNumber = index + 1;
              return (
                <div
                  key={step}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && !isCompleted && "border-primary bg-primary/10 text-primary",
                    !isCompleted && !isCurrent && "border-muted-foreground/40 text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : displayNumber}
                </div>
              );
            })}
          </div>
        </div>
        <span className="text-[11px] font-semibold text-primary tabular-nums">
          {progress}%
        </span>
      </div>
    </nav>
  );
}
