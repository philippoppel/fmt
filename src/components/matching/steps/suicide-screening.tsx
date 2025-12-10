"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching } from "../matching-context";

export function SuicideScreening() {
  const t = useTranslations();
  const { actions } = useMatching();

  const [responses, setResponses] = useState<{
    question1: boolean | null;
    question2: boolean | null;
  }>({
    question1: null,
    question2: null,
  });

  const handleResponse = (question: "question1" | "question2", value: boolean) => {
    const newResponses = { ...responses, [question]: value };
    setResponses(newResponses);

    // Check if any response is "yes" (crisis detected)
    const crisisDetected = newResponses.question1 === true || newResponses.question2 === true;

    // If both questions answered
    if (newResponses.question1 !== null && newResponses.question2 !== null) {
      actions.completeScreening(crisisDetected);
    }
  };

  const crisisDetected = responses.question1 === true || responses.question2 === true;

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          {t("matching.screening.title")}
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {t("matching.screening.subtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-4">
        {/* Privacy notice - compact */}
        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-center text-muted-foreground">
            {t("matching.screening.notice")}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {/* Question 1 */}
          <div className="rounded-xl border-2 border-border bg-card p-4">
            <p className="text-sm font-medium leading-relaxed mb-3 text-card-foreground">
              {t("matching.screening.question1")}
            </p>
            <div className="flex gap-2">
              <ScreeningButton
                isSelected={responses.question1 === true}
                onClick={() => handleResponse("question1", true)}
                label={t("matching.screening.yes")}
                variant="yes"
              />
              <ScreeningButton
                isSelected={responses.question1 === false}
                onClick={() => handleResponse("question1", false)}
                label={t("matching.screening.no")}
                variant="no"
              />
            </div>
          </div>

          {/* Question 2 */}
          <div className="rounded-xl border-2 border-border bg-card p-4">
            <p className="text-sm font-medium leading-relaxed mb-3 text-card-foreground">
              {t("matching.screening.question2")}
            </p>
            <div className="flex gap-2">
              <ScreeningButton
                isSelected={responses.question2 === true}
                onClick={() => handleResponse("question2", true)}
                label={t("matching.screening.yes")}
                variant="yes"
              />
              <ScreeningButton
                isSelected={responses.question2 === false}
                onClick={() => handleResponse("question2", false)}
                label={t("matching.screening.no")}
                variant="no"
              />
            </div>
          </div>
        </div>

        {/* Crisis warning - only show if crisis detected */}
        {crisisDetected && (
          <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-center dark:border-red-500 dark:bg-red-950/50">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {t("matching.screening.crisisDetected")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ScreeningButtonProps {
  isSelected: boolean;
  onClick: () => void;
  label: string;
  variant: "yes" | "no";
}

function ScreeningButton({ isSelected, onClick, label, variant }: ScreeningButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "yes" && [
          isSelected
            ? "border-red-600 bg-red-600 text-white shadow-md focus-visible:ring-red-600"
            : "border-border bg-card text-foreground hover:border-red-400 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-300",
        ],
        variant === "no" && [
          isSelected
            ? "border-emerald-600 bg-emerald-600 text-white shadow-md focus-visible:ring-emerald-600"
            : "border-border bg-card text-foreground hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-emerald-500 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300",
        ]
      )}
      aria-pressed={isSelected}
    >
      {isSelected && (
        variant === "yes" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
