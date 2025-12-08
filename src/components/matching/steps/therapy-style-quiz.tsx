"use client";

import { useTranslations } from "next-intl";
import {
  MessageCircle,
  BookOpen,
  Clock,
  Users,
  Target,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  CommunicationStyle,
  TherapyFocus,
  TherapyDepth,
} from "@/types/therapist";
import { useMatching } from "../matching-context";

export function TherapyStyleQuiz() {
  const t = useTranslations();
  const { state, actions } = useMatching();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.quiz.title")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("matching.quiz.subtitle")}
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-8">
        {/* Question 1: Communication Style */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            {t("matching.quiz.communication.question")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {(["directive", "balanced", "empathetic"] as CommunicationStyle[]).map(
              (style) => (
                <StyleButton
                  key={style}
                  isSelected={state.therapyStyle.communicationStyle === style}
                  onClick={() => actions.setCommunicationStyle(style)}
                  label={t(`matching.quiz.communication.${style}`)}
                  description={t(`matching.quiz.communication.${style}Desc`)}
                />
              )
            )}
          </div>
        </div>

        {/* Question 2: Homework */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {t("matching.quiz.homework.question")}
          </Label>
          <div className="flex flex-wrap gap-2">
            <HomeworkButton
              isSelected={state.therapyStyle.prefersHomework === true}
              onClick={() => actions.setPrefersHomework(true)}
              label={t("matching.quiz.homework.yes")}
            />
            <HomeworkButton
              isSelected={state.therapyStyle.prefersHomework === false}
              onClick={() => actions.setPrefersHomework(false)}
              label={t("matching.quiz.homework.no")}
            />
            <HomeworkButton
              isSelected={state.therapyStyle.prefersHomework === null}
              onClick={() => actions.setPrefersHomework(null)}
              label={t("matching.quiz.homework.noPreference")}
            />
          </div>
        </div>

        {/* Question 3: Therapy Focus */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {t("matching.quiz.focus.question")}
          </Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["past", "present", "future", "holistic"] as TherapyFocus[]).map(
              (focus) => (
                <FocusButton
                  key={focus}
                  isSelected={state.therapyStyle.therapyFocus === focus}
                  onClick={() => actions.setTherapyFocus(focus)}
                  label={t(`matching.quiz.focus.${focus}`)}
                  description={t(`matching.quiz.focus.${focus}Desc`)}
                />
              )
            )}
          </div>
        </div>

        {/* Question 4: Talk Preference */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Users className="h-4 w-4 text-muted-foreground" />
            {t("matching.quiz.talk.question")}
          </Label>
          <div className="flex flex-wrap gap-2">
            <TalkButton
              isSelected={state.therapyStyle.talkPreference === "more_self"}
              onClick={() => actions.setTalkPreference("more_self")}
              label={t("matching.quiz.talk.moreSelf")}
            />
            <TalkButton
              isSelected={state.therapyStyle.talkPreference === "guided"}
              onClick={() => actions.setTalkPreference("guided")}
              label={t("matching.quiz.talk.guided")}
            />
            <TalkButton
              isSelected={state.therapyStyle.talkPreference === null}
              onClick={() => actions.setTalkPreference(null)}
              label={t("matching.quiz.talk.noPreference")}
            />
          </div>
        </div>

        {/* Question 5: Therapy Depth */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <Target className="h-4 w-4 text-muted-foreground" />
            {t("matching.quiz.depth.question")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {(
              ["symptom_relief", "deep_change", "flexible"] as TherapyDepth[]
            ).map((depth) => (
              <DepthButton
                key={depth}
                isSelected={state.therapyStyle.therapyDepth === depth}
                onClick={() => actions.setTherapyDepth(depth)}
                label={t(`matching.quiz.depth.${depth}`)}
              />
            ))}
          </div>
        </div>

        {/* Optional hint */}
        <p className="text-center text-sm text-muted-foreground">
          {t("matching.quiz.allOptional")}
        </p>
      </div>
    </div>
  );
}

// Reusable button components
interface ButtonProps {
  isSelected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}

function StyleButton({ isSelected, onClick, label, description }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-input bg-background hover:bg-accent"
      )}
      aria-pressed={isSelected}
    >
      <span className={cn("font-medium", isSelected && "text-primary")}>
        {label}
      </span>
      {description && (
        <span className="mt-1 text-xs text-muted-foreground">{description}</span>
      )}
    </button>
  );
}

function HomeworkButton({ isSelected, onClick, label }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}

function FocusButton({ isSelected, onClick, label, description }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-input bg-background hover:bg-accent"
      )}
      aria-pressed={isSelected}
    >
      <span className={cn("font-medium", isSelected && "text-primary")}>
        {label}
      </span>
      {description && (
        <span className="mt-1 text-xs text-muted-foreground">{description}</span>
      )}
    </button>
  );
}

function TalkButton({ isSelected, onClick, label }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}

function DepthButton({ isSelected, onClick, label }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
      )}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}
