"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MessageSquareText, ArrowRight, Sparkles, Loader2, CheckCircle2, AlertCircle, Phone, Heart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { TopicCard } from "./topic-card";
import { cn } from "@/lib/utils";
import { analyzeSituation } from "@/lib/actions/analyze-situation";

export function TopicSelection() {
  const t = useTranslations();
  const locale = useLocale();
  const { state, actions } = useMatching();
  const [freetextValue, setFreetextValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [detectedTopics, setDetectedTopics] = useState<string[]>([]);
  const [topicReasons, setTopicReasons] = useState<string>("");
  const [analysisState, setAnalysisState] = useState<"idle" | "success" | "empty" | "crisis">("idle");
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = () => {
    if (freetextValue.trim().length < 10) return;

    startTransition(async () => {
      const result = await analyzeSituation(freetextValue);

      // IMPORTANT: Check for crisis detection FIRST
      if (result.crisisDetected) {
        setShowCrisisAlert(true);
        setAnalysisState("crisis");
        return;
      }

      const topics = result.suggestedTopics || [];
      const subTopics = result.suggestedSubTopics || [];
      setDetectedTopics(topics);
      setTopicReasons(result.topicReasons || "");

      if (topics.length > 0) {
        setAnalysisState("success");
        // Auto-select detected topics
        topics.forEach(topic => {
          if (!state.selectedTopics.includes(topic)) {
            actions.toggleTopic(topic);
          }
        });
        // Auto-select detected subTopics for precise matching
        subTopics.forEach(subTopic => {
          if (!state.selectedSubTopics.includes(subTopic)) {
            actions.toggleSubTopic(subTopic);
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
    setTopicReasons("");
  };

  // Crisis hotlines
  const crisisHotline = "0800 111 0 111";
  const crisisHotlineAlt = "0800 111 0 222";

  // If crisis detected, show immediate help
  if (showCrisisAlert) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("matching.crisis.notAloneInformal")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {t("matching.crisis.helpAvailable")}
          </p>
        </div>

        <div className="mx-auto max-w-xl space-y-6">
          <div className="rounded-lg border-2 border-red-500 bg-white p-4 dark:border-red-600 dark:bg-red-950/40">
            <div className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                {t("matching.crisis.available247")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-base font-semibold leading-relaxed">
              {t("matching.crisis.callHotline")}
            </p>
            <a
              href={`tel:${crisisHotline.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-600 bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              <Phone className="h-5 w-5" />
              {crisisHotline}
            </a>
            <a
              href={`tel:${crisisHotlineAlt.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-500 bg-white px-6 py-4 text-lg font-bold text-red-700 transition-all hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-600 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950/70"
            >
              <Phone className="h-5 w-5" />
              {crisisHotlineAlt}
            </a>
          </div>

          <div className="space-y-3">
            <p className="text-base font-semibold leading-relaxed">
              {t("matching.crisis.orWritten")}
            </p>
            <a
              href="https://online.telefonseelsorge.de"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-amber-600 bg-white px-6 py-4 text-lg font-bold text-amber-800 transition-all hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-950/70"
            >
              {t("matching.crisis.onlineCounseling")}
            </a>
          </div>

          <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4 text-center dark:border-green-600 dark:bg-green-950/30">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              {t("matching.crisis.availableInfo")}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950/30"
              : analysisState === "empty"
                ? "border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30"
                : isFocused || freetextValue.length > 0
                  ? "border-primary shadow-md bg-card"
                  : "border-border hover:border-primary/50 bg-card"
          )}
        >
          {/* Card Header */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 border-b",
            analysisState === "success" ? "border-green-600/30" : analysisState === "empty" ? "border-amber-600/30" : "border-border"
          )}>
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              analysisState === "success" ? "bg-green-600/20" : analysisState === "empty" ? "bg-amber-600/20" : "bg-primary/15"
            )}>
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              ) : analysisState === "success" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-700 dark:text-green-400" />
              ) : analysisState === "empty" ? (
                <AlertCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
              ) : (
                <MessageSquareText className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <span className={cn(
              "text-xs font-semibold",
              analysisState === "success" ? "text-green-800 dark:text-green-300" : analysisState === "empty" ? "text-amber-800 dark:text-amber-300" : "text-foreground"
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
          <div className="flex-1 p-2 overflow-y-auto">
            {analysisState === "success" ? (
              <div className="flex flex-col gap-2 p-1">
                <div className="flex flex-wrap gap-1">
                  {detectedTopics.map((topic) => {
                    // Convert snake_case to camelCase for translation key
                    const translationKey = topic.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                    return (
                      <Badge key={topic} className="bg-green-600/20 text-green-800 dark:bg-green-500/30 dark:text-green-200 text-[10px] font-medium">
                        {t(`matching.topics.${translationKey}`)}
                      </Badge>
                    );
                  })}
                </div>
                {topicReasons && (
                  <p className="text-xs text-foreground/80 leading-snug">
                    {topicReasons}
                  </p>
                )}
              </div>
            ) : analysisState === "empty" ? (
              <p className="p-1 text-xs text-amber-700 dark:text-amber-400">
                {t("matching.freetext.selectManually")}
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
              analysisState === "success" ? "border-green-600/30" : analysisState === "empty" ? "border-amber-600/30" : "border-border"
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
