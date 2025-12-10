"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareText, ArrowRight, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { TopicCard } from "./topic-card";
import { cn } from "@/lib/utils";
import { analyzeSituation } from "@/lib/actions/analyze-situation";

export function TopicSelection() {
  const t = useTranslations();
  const { state, actions } = useMatching();
  const [freetextValue, setFreetextValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [detectedTopics, setDetectedTopics] = useState<string[]>([]);
  const [analysisState, setAnalysisState] = useState<"idle" | "success" | "empty">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = () => {
    if (freetextValue.trim().length < 10) return;

    startTransition(async () => {
      const result = await analyzeSituation(freetextValue);

      if (result.crisisDetected) {
        // Handle crisis - go to screening
        actions.goNext();
        return;
      }

      const topics = result.suggestedTopics || [];
      setDetectedTopics(topics);

      if (topics.length > 0) {
        setAnalysisState("success");
        // Auto-select detected topics
        topics.forEach(topic => {
          if (!state.selectedTopics.includes(topic)) {
            actions.toggleTopic(topic);
          }
        });
      } else {
        setAnalysisState("empty");
      }
    });
  };

  const handleCardClick = () => {
    textareaRef.current?.focus();
  };

  const resetAnalysis = () => {
    setAnalysisState("idle");
    setDetectedTopics([]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header - compact */}
      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold">
            {t("matching.wizard.step1Title")}
          </h2>
          <span className="text-xs text-muted-foreground">
            {state.selectedTopics.length === 0
              ? t("matching.wizard.selectAtLeastOne")
              : t("matching.wizard.selectedCount", { count: state.selectedTopics.length })}
          </span>
        </div>
      </div>

      {/* Topic Grid + Freetext Card */}
      <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
        {/* First 4 Topic Cards */}
        {MATCHING_TOPICS.slice(0, 4).map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            label={t(topic.labelKey)}
            isSelected={state.selectedTopics.includes(topic.id)}
            onToggle={() => actions.toggleTopic(topic.id)}
          />
        ))}

        {/* Freetext Card - positioned after first 4 topics */}
        <div
          onClick={handleCardClick}
          className={cn(
            "col-span-2 row-span-1 flex cursor-text flex-col overflow-hidden rounded-lg border-2 transition-all",
            analysisState === "success"
              ? "border-green-500 bg-gradient-to-br from-green-500/5 via-green-500/10 to-green-500/5"
              : analysisState === "empty"
                ? "border-amber-500 bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-amber-500/5"
                : isFocused || freetextValue.length > 0
                  ? "border-primary shadow-md bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"
                  : "border-primary/30 hover:border-primary/50 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"
          )}
        >
          {/* Card Header */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 border-b",
            analysisState === "success" ? "border-green-500/20" : analysisState === "empty" ? "border-amber-500/20" : "border-primary/10"
          )}>
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              analysisState === "success" ? "bg-green-500/20" : analysisState === "empty" ? "bg-amber-500/20" : "bg-primary/20"
            )}>
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              ) : analysisState === "success" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              ) : analysisState === "empty" ? (
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
              ) : (
                <MessageSquareText className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <span className={cn(
              "text-xs font-semibold",
              analysisState === "success" ? "text-green-700 dark:text-green-400" : analysisState === "empty" ? "text-amber-700 dark:text-amber-400" : "text-primary"
            )}>
              {isPending
                ? t("matching.freetext.analyzing")
                : analysisState === "success"
                  ? `${detectedTopics.length} ${detectedTopics.length === 1 ? "Thema" : "Themen"} erkannt`
                  : analysisState === "empty"
                    ? "Kein Thema erkannt"
                    : t("matching.wizard.preferToDescribe")}
            </span>
            {freetextValue.length >= 10 && analysisState === "idle" && !isPending && (
              <Sparkles className="ml-auto h-3.5 w-3.5 text-primary animate-pulse" />
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-2">
            {analysisState === "success" ? (
              <div className="flex flex-wrap gap-1 p-1">
                {detectedTopics.map((topic) => (
                  <Badge key={topic} className="bg-green-500/20 text-green-700 dark:text-green-300 text-[10px]">
                    {t(`matching.topics.${topic}`)}
                  </Badge>
                ))}
              </div>
            ) : analysisState === "empty" ? (
              <p className="p-1 text-xs text-amber-700 dark:text-amber-400">
                Bitte wähle manuell Themen aus oder beschreibe genauer.
              </p>
            ) : (
              <Textarea
                ref={textareaRef}
                value={freetextValue}
                onChange={(e) => {
                  setFreetextValue(e.target.value);
                  resetAnalysis();
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t("matching.freetext.shortPlaceholder")}
                disabled={isPending}
                className="h-full min-h-0 resize-none border-0 bg-transparent p-1 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
              />
            )}
          </div>

          {/* Action Footer */}
          {(freetextValue.length > 0 || analysisState !== "idle") && (
            <div className={cn(
              "flex items-center justify-between border-t px-3 py-1.5",
              analysisState === "success" ? "border-green-500/20" : analysisState === "empty" ? "border-amber-500/20" : "border-primary/10"
            )}>
              <span className="text-[10px] text-muted-foreground">
                {freetextValue.length}/500
              </span>
              {analysisState !== "idle" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetAnalysis();
                    textareaRef.current?.focus();
                  }}
                  className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted/80"
                >
                  Neu eingeben
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnalyze();
                  }}
                  disabled={freetextValue.trim().length < 10 || isPending}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all",
                    freetextValue.trim().length >= 10 && !isPending
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      {t("matching.freetext.analyze")}
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Remaining Topic Cards */}
        {MATCHING_TOPICS.slice(4).map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            label={t(topic.labelKey)}
            isSelected={state.selectedTopics.includes(topic.id)}
            onToggle={() => actions.toggleTopic(topic.id)}
          />
        ))}
      </div>
    </div>
  );
}
