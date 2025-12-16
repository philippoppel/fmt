"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareText, ArrowRight, Sparkles, Loader2, CheckCircle2, AlertCircle, Phone, Heart, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { TopicCard } from "./topic-card";
import { cn } from "@/lib/utils";
import { analyzeSituation, type ConfidenceLevel } from "@/lib/actions/analyze-situation";

export function TopicSelection() {
  const t = useTranslations();
  const { state, actions } = useMatching();
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [understandingSummary, setUnderstandingSummary] = useState<string>("");
  const [recommendation, setRecommendation] = useState<string>("");
  const [confidence, setConfidence] = useState<ConfidenceLevel>("medium");
  const [autoSelectedTopics, setAutoSelectedTopics] = useState<string[]>([]);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use global state for freetext
  const freetextValue = state.inlineFreetextValue;
  const analysisState = state.inlineFreetextAnalysisState;

  const handleAnalyze = () => {
    if (freetextValue.trim().length < 10) return;

    actions.setInlineFreetextAnalysisState("pending");
    startTransition(async () => {
      const result = await analyzeSituation(freetextValue);

      // IMPORTANT: Check for crisis detection FIRST
      if (result.crisisDetected) {
        setShowCrisisAlert(true);
        actions.setInlineFreetextAnalysisState("crisis");
        return;
      }

      const summary = result.understandingSummary || "";
      const rec = result.recommendation || "";
      const conf = result.confidence || "medium";
      const topics = result.suggestedTopics || [];

      setUnderstandingSummary(summary);
      setRecommendation(rec);
      setConfidence(conf);

      // HIGH CONFIDENCE: Auto-select topics
      if (conf === "high" && topics.length > 0) {
        // Select the suggested topics
        topics.forEach(topicId => {
          if (!state.selectedTopics.includes(topicId)) {
            actions.toggleTopic(topicId);
          }
        });
        setAutoSelectedTopics(topics);
        actions.setInlineFreetextAnalysisState("success");
      }
      // MEDIUM CONFIDENCE: Show summary, no auto-select
      else if (conf === "medium" && topics.length > 0) {
        setAutoSelectedTopics(topics); // Store for display only
        actions.setInlineFreetextAnalysisState("success");
      }
      // LOW CONFIDENCE or no topics: Off-topic / unclear
      else if (summary.length > 0) {
        actions.setInlineFreetextAnalysisState("empty"); // Will show off-topic message
      }
      // Nothing found at all
      else {
        actions.setInlineFreetextAnalysisState("empty");
      }
    });
  };

  const handleCardClick = () => {
    textareaRef.current?.focus();
  };

  const resetAnalysis = () => {
    actions.setInlineFreetextAnalysisState("idle");
    setUnderstandingSummary("");
    setRecommendation("");
    setConfidence("medium");
    setAutoSelectedTopics([]);
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

      {/* Topic Grid */}
      <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
        {/* All Topic Cards */}
        {MATCHING_TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            label={t(topic.labelKey)}
            isSelected={state.selectedTopics.includes(topic.id)}
            onToggle={() => actions.toggleTopic(topic.id)}
          />
        ))}

        {/* Freetext Card - styled like topic cards with gradient background */}
        <div
          onClick={handleCardClick}
          className={cn(
            "group relative col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-4 lg:col-start-2 aspect-[4/3] sm:aspect-[6/2] cursor-text overflow-hidden rounded-lg transition-all duration-200",
            analysisState === "success"
              ? "ring-4 ring-success/40 shadow-lg shadow-success/25"
              : analysisState === "empty"
                ? "ring-4 ring-warning/40 shadow-lg shadow-warning/25"
                : isFocused || freetextValue.length > 0
                  ? "ring-4 ring-primary/40 shadow-lg shadow-primary/25"
                  : "hover:ring-2 hover:ring-primary/30"
          )}
        >
          {/* Gradient Background - matching the visual style of topic cards */}
          <div className={cn(
            "absolute inset-0 transition-all duration-200",
            analysisState === "success"
              ? "bg-gradient-to-br from-success/20 via-success/10 to-success/5"
              : analysisState === "empty"
                ? "bg-gradient-to-br from-warning/20 via-warning/10 to-warning/5"
                : "bg-gradient-to-br from-primary/15 via-primary/8 to-muted/50"
          )} />

          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          <div className="relative flex h-full flex-col p-4">
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
                analysisState === "success"
                  ? "bg-success text-white"
                  : analysisState === "empty"
                    ? "bg-warning text-white"
                    : "bg-primary/90 text-primary-foreground"
              )}>
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : analysisState === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : analysisState === "empty" ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <MessageSquareText className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <span className={cn(
                  "text-sm font-bold",
                  analysisState === "success" ? "text-success-foreground" : analysisState === "empty" ? "text-warning-foreground" : "text-foreground"
                )}>
                  {isPending
                    ? t("matching.freetext.analyzing")
                    : analysisState === "success"
                      ? t("matching.freetext.understood")
                      : analysisState === "empty"
                        ? t("matching.freetext.couldNotUnderstand")
                        : t("matching.wizard.preferToDescribe")}
                </span>
                {analysisState === "idle" && !isPending && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("matching.freetext.aiHelpsYou")}
                  </p>
                )}
              </div>
              {freetextValue.length >= 10 && analysisState === "idle" && !isPending && (
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto">
            {analysisState === "success" ? (
              <div className="flex flex-col gap-2 p-1">
                {/* Understanding summary - short and direct */}
                {understandingSummary && (
                  <p className="text-sm text-foreground leading-relaxed">
                    {understandingSummary}
                  </p>
                )}
                {/* Show what was auto-selected (high confidence) or suggested (medium) */}
                {autoSelectedTopics.length > 0 && (
                  <div className={cn(
                    "rounded-md p-2 text-xs",
                    confidence === "high"
                      ? "bg-success-muted text-success-foreground"
                      : "bg-primary/10 text-primary"
                  )}>
                    {confidence === "high" ? (
                      <span>{t("matching.freetext.autoSelected")}: {autoSelectedTopics.map(id => {
                        const topic = MATCHING_TOPICS.find(t => t.id === id);
                        return topic ? t(topic.labelKey) : id;
                      }).join(", ")}</span>
                    ) : (
                      <span>{t("matching.freetext.suggested")}: {autoSelectedTopics.map(id => {
                        const topic = MATCHING_TOPICS.find(t => t.id === id);
                        return topic ? t(topic.labelKey) : id;
                      }).join(", ")}</span>
                    )}
                  </div>
                )}
                {/* Recommendation (only for high confidence) */}
                {recommendation && confidence === "high" && (
                  <p className="text-xs text-muted-foreground">
                    {recommendation}
                  </p>
                )}
              </div>
            ) : analysisState === "empty" ? (
              <div className="flex flex-col gap-2 p-1">
                {/* Show the understanding even for off-topic */}
                {understandingSummary && (
                  <p className="text-sm text-warning-foreground">
                    {understandingSummary}
                  </p>
                )}
                <p className="text-xs text-warning-foreground">
                  {t("matching.freetext.selectManually")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <Textarea
                  ref={textareaRef}
                  value={freetextValue}
                  onChange={(e) => {
                    actions.setInlineFreetext(e.target.value);
                    resetAnalysis();
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={t("matching.freetext.placeholderWithPrivacy")}
                  disabled={isPending}
                  className="flex-1 min-h-0 resize-none rounded-lg border-0 bg-white/60 dark:bg-black/20 p-3 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:bg-white/80 dark:focus-visible:bg-black/30"
                />
              </div>
            )}
            </div>

            {/* Action Footer */}
            {(freetextValue.length > 0 || analysisState !== "idle") && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-foreground/10">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {freetextValue.length}/500
                </span>
                {analysisState !== "idle" && analysisState !== "pending" ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.setInlineFreetext("");
                      resetAnalysis();
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-black/30 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white dark:hover:bg-black/50"
                  >
                    {t("matching.freetext.resetInput")}
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnalyze();
                    }}
                    disabled={freetextValue.trim().length < 10 || isPending}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                      freetextValue.trim().length >= 10 && !isPending
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                        : "bg-white/60 dark:bg-black/30 text-muted-foreground"
                    )}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("matching.freetext.analyzing")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t("matching.freetext.analyze")}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
