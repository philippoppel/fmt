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
        <div className="flex-1 rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] font-semibold text-primary tabular-nums">
          {progress}%
        </span>
      </div>

      <ol className="flex flex-wrap gap-2">
        {steps.map(({ step, label, optional }, index) => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;
          const displayNumber = index + 1;

          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                isCompleted && "border-primary/30 bg-primary/5",
                isCurrent && "border-primary bg-primary/10 shadow-sm",
                !isCurrent && !isCompleted && "border-border bg-card/60"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary bg-primary/10 text-primary",
                  !isCompleted &&
                    !isCurrent &&
                    "border-muted-foreground/40 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  displayNumber
                )}
              </div>
              <div className="min-w-0">
                <div
                  className={cn(
                    "text-sm font-semibold leading-tight",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </div>
                {optional && (
                  <p className="text-[11px] text-muted-foreground">
                    {optionalText}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
