"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Check, X, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMatching } from "../matching-context";

type ScreeningPhase = "questions" | "support";

export function SuicideScreening() {
  const t = useTranslations();
  const { state, actions } = useMatching();

  const [phase, setPhase] = useState<ScreeningPhase>("questions");
  const [responses, setResponses] = useState<{
    question1: boolean | null;
    question2: boolean | null;
  }>({
    question1: null,
    question2: null,
  });

  const handleResponse = (question: "question1" | "question2", value: boolean) => {
    setResponses({ ...responses, [question]: value });
  };

  const bothAnswered = responses.question1 !== null && responses.question2 !== null;
  const crisisDetected = responses.question1 === true || responses.question2 === true;

  const handleContinue = () => {
    if (crisisDetected) {
      // Show support options first, don't immediately block
      setPhase("support");
    } else {
      // No crisis - complete screening and proceed
      actions.completeScreening(false);
    }
  };

  const handleGetHelp = () => {
    // User chose to get help - show full crisis resources
    actions.completeScreening(true);
  };

  const handleContinueAnyway = () => {
    // User acknowledged but wants to continue with matching
    // We complete screening as "safe" but the resources were shown
    actions.completeScreening(false);
  };

  const handleBack = () => {
    if (phase === "support") {
      setPhase("questions");
    } else {
      actions.goBack();
    }
  };

  // Support phase - show resources but allow continuing
  if (phase === "support") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-4">
          {/* Compassionate Header */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {t("matching.screening.supportTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {t("matching.screening.supportSubtitle")}
            </p>
          </div>

          <div className="mx-auto max-w-lg space-y-4">
            {/* Immediate help card */}
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{t("matching.screening.hotlineTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("matching.screening.hotlineDesc")}
                  </p>
                  <a
                    href="tel:08001110111"
                    className="inline-flex items-center gap-1.5 mt-2 text-lg font-bold text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    0800 111 0 111
                  </a>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {t("matching.screening.available247")}
                  </span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Button
                onClick={handleGetHelp}
                variant="default"
                className="w-full justify-center gap-2 h-12"
              >
                <Heart className="h-4 w-4" />
                {t("matching.screening.showAllResources")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t("matching.screening.or")}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleContinueAnyway}
                variant="outline"
                className="w-full justify-center gap-2 h-12"
              >
                {t("matching.screening.continueMatching")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Reassurance */}
            <p className="text-xs text-center text-muted-foreground">
              {t("matching.screening.noJudgment")}
            </p>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-auto pt-4 flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("matching.wizard.back")}
          </Button>
        </div>
      </div>
    );
  }

  // Questions phase
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
        {/* Compact Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Heart className="h-5 w-5 text-muted-foreground" />
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

          {/* Continue button */}
          {bothAnswered && (
            <Button
              onClick={handleContinue}
              className="w-full justify-center gap-2 h-12"
            >
              {t("matching.wizard.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Back button */}
      <div className="mt-auto pt-4 flex justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("matching.wizard.back")}
        </Button>
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
