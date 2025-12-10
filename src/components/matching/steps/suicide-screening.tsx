"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, ShieldCheck } from "lucide-react";
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

  const canProceed = responses.question1 === false && responses.question2 === false;
  const crisisDetected = responses.question1 === true || responses.question2 === true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-900/30">
          <ShieldCheck className="h-6 w-6 text-amber-700 dark:text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.screening.title")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          {t("matching.screening.subtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-xl space-y-6">
        {/* Important notice */}
        <div className="rounded-lg border-2 border-amber-400 bg-amber-100 p-4 dark:border-amber-700 dark:bg-amber-950/30">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {t("matching.screening.notice")}
            </p>
          </div>
        </div>

        {/* Question 1 */}
        <div className="space-y-3">
          <p className="text-base font-medium leading-relaxed">
            {t("matching.screening.question1")}
          </p>
          <div className="flex gap-3">
            <ScreeningButton
              isSelected={responses.question1 === true}
              onClick={() => handleResponse("question1", true)}
              label={t("matching.screening.yes")}
              variant="danger"
            />
            <ScreeningButton
              isSelected={responses.question1 === false}
              onClick={() => handleResponse("question1", false)}
              label={t("matching.screening.no")}
              variant="safe"
            />
          </div>
        </div>

        {/* Question 2 */}
        <div className="space-y-3">
          <p className="text-base font-medium leading-relaxed">
            {t("matching.screening.question2")}
          </p>
          <div className="flex gap-3">
            <ScreeningButton
              isSelected={responses.question2 === true}
              onClick={() => handleResponse("question2", true)}
              label={t("matching.screening.yes")}
              variant="danger"
            />
            <ScreeningButton
              isSelected={responses.question2 === false}
              onClick={() => handleResponse("question2", false)}
              label={t("matching.screening.no")}
              variant="safe"
            />
          </div>
        </div>

        {/* Status indicator */}
        {canProceed && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950/20">
            <p className="text-sm text-green-800 dark:text-green-200">
              {t("matching.screening.canProceed")}
            </p>
          </div>
        )}

        {crisisDetected && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950/20">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
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
  variant: "danger" | "safe";
}

function ScreeningButton({ isSelected, onClick, label, variant }: ScreeningButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg border-2 px-6 py-3 text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "danger" && [
          isSelected
            ? "border-red-600 bg-red-600 text-white focus-visible:ring-red-600"
            : "border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100 focus-visible:ring-red-500 dark:border-red-700 dark:bg-red-950/40 dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-950/60",
        ],
        variant === "safe" && [
          isSelected
            ? "border-green-600 bg-green-600 text-white focus-visible:ring-green-600"
            : "border-green-300 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100 focus-visible:ring-green-500 dark:border-green-700 dark:bg-green-950/40 dark:text-green-400 dark:hover:border-green-600 dark:hover:bg-green-950/60",
        ]
      )}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}
