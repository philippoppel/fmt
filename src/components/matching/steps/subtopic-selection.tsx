"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Check, Sparkles, Loader2, MessageSquareText, ArrowRight, CheckCircle2, RefreshCw, Phone, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTopicImageUrl, type SubTopic } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { analyzeSituation } from "@/lib/actions/analyze-situation";

interface SubTopicCardProps {
  subTopic: SubTopic;
  label: string;
  isSelected: boolean;
  isAiSuggested?: boolean;
  onToggle: () => void;
}

function SubTopicCard({ subTopic, label, isSelected, isAiSuggested, onToggle }: SubTopicCardProps) {
  const imageUrl = subTopic.unsplashId
    ? getTopicImageUrl(subTopic.unsplashId, 200, 150)
    : null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative aspect-[4/3] h-full w-full overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isSelected
          ? "border-primary shadow-md"
          : isAiSuggested
            ? "border-cyan-400 ring-2 ring-cyan-400/30"
            : "border-transparent hover:border-primary/40"
      )}
      aria-pressed={isSelected}
    >
      {/* Background Image or Fallback */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
      )}

      {/* Gradient Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent",
          isSelected && "from-primary/80 via-primary/20",
          isAiSuggested && !isSelected && "from-cyan-600/70 via-cyan-600/10"
        )}
        aria-hidden="true"
      />

      {/* AI Suggested Badge */}
      {isAiSuggested && !isSelected && (
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
          <Sparkles className="h-2.5 w-2.5" />
          <span>AI</span>
        </div>
      )}

      {/* Selected Checkmark */}
      {isSelected && (
        <div
          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </div>
      )}

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-2">
        <span className="text-xs font-semibold text-white drop-shadow-md sm:text-sm">
          {label}
        </span>
      </div>
    </button>
  );
}

export function SubTopicSelection() {
  const t = useTranslations();
  const locale = useLocale();
  const { state, actions, computed } = useMatching();
  const [freetextValue, setFreetextValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [detectedTopics, setDetectedTopics] = useState<string[]>([]);
  const [detectedSubTopics, setDetectedSubTopics] = useState<string[]>([]);
  const [topicReasons, setTopicReasons] = useState<string>("");
  const [analysisState, setAnalysisState] = useState<"idle" | "success" | "empty" | "crisis">("idle");
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Group subtopics by their parent topic
  const groupedSubTopics = computed.selectedTopicDetails.map((topic) => ({
    topic,
    subTopics: topic.subTopics,
  }));

  const totalSubTopics = groupedSubTopics.reduce(
    (acc, g) => acc + g.subTopics.length,
    0
  );

  const handleAnalyze = () => {
    if (freetextValue.trim().length < 10) return;

    startTransition(async () => {
      const result = await analyzeSituation(freetextValue);

      // Check for crisis detection
      if (result.crisisDetected) {
        setShowCrisisAlert(true);
        setAnalysisState("crisis");
        return;
      }

      const topics = result.suggestedTopics || [];
      const subTopics = result.suggestedSubTopics || [];
      setDetectedTopics(topics);
      setDetectedSubTopics(subTopics);
      setTopicReasons(result.topicReasons || "");

      if (topics.length > 0 || subTopics.length > 0) {
        setAnalysisState("success");
        // Auto-select detected topics
        topics.forEach(topic => {
          if (!state.selectedTopics.includes(topic)) {
            actions.toggleTopic(topic);
          }
        });
        // Auto-select detected subTopics
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
    setDetectedSubTopics([]);
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
            {locale === "de" ? "Du bist nicht allein" : "You're not alone"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            {locale === "de"
              ? "Bitte wende dich an professionelle Hilfe."
              : "Please reach out to professional help."}
          </p>
        </div>

        <div className="mx-auto max-w-xl space-y-6">
          <div className="rounded-lg border-2 border-red-500 bg-white p-4 dark:border-red-600 dark:bg-red-950/40">
            <div className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                {locale === "de"
                  ? "Kostenlose & anonyme Hilfe, rund um die Uhr erreichbar."
                  : "Free & anonymous help, available 24/7."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`tel:${crisisHotline.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-600 bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-red-700"
            >
              <Phone className="h-5 w-5" />
              {crisisHotline}
            </a>
            <a
              href={`tel:${crisisHotlineAlt.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-500 bg-white px-6 py-4 text-lg font-bold text-red-700 transition-all hover:bg-red-50 dark:border-red-600 dark:bg-red-950/50 dark:text-red-300"
            >
              <Phone className="h-5 w-5" />
              {crisisHotlineAlt}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (totalSubTopics === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {t("matching.wizard.step1_25Title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {state.selectedSubTopics.length === 0
                ? t("matching.wizard.subtopicHint")
                : t("matching.wizard.selectedSubTopics", {
                    count: state.selectedSubTopics.length,
                  })}
            </p>
          </div>
        </div>
      </div>

      {/* SubTopics grouped by parent topic */}
      <div className="flex-1 space-y-4 overflow-auto">
        {groupedSubTopics.map(({ topic, subTopics }) => (
          <div key={topic.id}>
            {/* Topic Header */}
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {t(topic.labelKey)}
              </span>
            </div>

            {/* SubTopic Grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {subTopics.map((subTopic) => (
                <SubTopicCard
                  key={subTopic.id}
                  subTopic={subTopic}
                  label={t(subTopic.labelKey)}
                  isSelected={state.selectedSubTopics.includes(subTopic.id)}
                  isAiSuggested={detectedSubTopics.includes(subTopic.id) && !state.selectedSubTopics.includes(subTopic.id)}
                  onToggle={() => actions.toggleSubTopic(subTopic.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* AI Re-Analysis Card - Prominent */}
        <div
          onClick={handleCardClick}
          className={cn(
            "cursor-text rounded-lg border-2 transition-all",
            analysisState === "success"
              ? "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950/30"
              : analysisState === "empty"
                ? "border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/30"
                : isFocused || freetextValue.length > 0
                  ? "border-primary shadow-md bg-card"
                  : "border-dashed border-muted-foreground/40 hover:border-primary/50 bg-muted/30"
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
              ) : (
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <span className={cn(
              "text-sm font-semibold",
              analysisState === "success" ? "text-green-800 dark:text-green-300" : analysisState === "empty" ? "text-amber-800 dark:text-amber-300" : "text-foreground"
            )}>
              {isPending
                ? (locale === "de" ? "Analysiere..." : "Analyzing...")
                : analysisState === "success"
                  ? (locale === "de" ? "Neue Themen erkannt" : "New topics detected")
                  : (locale === "de" ? "Nicht das richtige dabei?" : "Can't find what you're looking for?")}
            </span>
            {freetextValue.length >= 10 && analysisState === "idle" && !isPending && (
              <Sparkles className="ml-auto h-3.5 w-3.5 text-primary animate-pulse" />
            )}
          </div>

          {/* Content Area */}
          <div className="p-3">
            {analysisState === "success" ? (
              <div className="space-y-2">
                {detectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {detectedTopics.map((topic) => {
                      const translationKey = topic.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                      return (
                        <Badge key={topic} className="bg-green-600/20 text-green-800 dark:bg-green-500/30 dark:text-green-200 text-[10px] font-medium">
                          {t(`matching.topics.${translationKey}`)}
                        </Badge>
                      );
                    })}
                    {detectedSubTopics.map((subTopic) => {
                      const translationKey = subTopic.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                      return (
                        <Badge key={subTopic} variant="outline" className="border-green-600/50 text-green-700 dark:text-green-300 text-[10px] font-medium">
                          {t(`matching.subtopics.${translationKey}`)}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {topicReasons && (
                  <p className="text-xs text-foreground/80 leading-snug">
                    {topicReasons}
                  </p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetAnalysis();
                    textareaRef.current?.focus();
                  }}
                  className="mt-2 flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted/80"
                >
                  <RefreshCw className="h-3 w-3" />
                  {locale === "de" ? "Nochmal versuchen" : "Try again"}
                </button>
              </div>
            ) : analysisState === "empty" ? (
              <div className="space-y-2">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {locale === "de"
                    ? "Keine neuen Themen erkannt. Beschreibe deine Situation genauer oder wähle manuell aus."
                    : "No new topics detected. Describe your situation in more detail or select manually."}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetAnalysis();
                    textareaRef.current?.focus();
                  }}
                  className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted/80"
                >
                  <RefreshCw className="h-3 w-3" />
                  {locale === "de" ? "Nochmal versuchen" : "Try again"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {locale === "de"
                    ? "Beschreibe deine Situation nochmal und wir finden passende Themen."
                    : "Describe your situation again and we'll find matching topics."}
                </p>
                <Textarea
                  ref={textareaRef}
                  value={freetextValue}
                  onChange={(e) => {
                    setFreetextValue(e.target.value);
                    resetAnalysis();
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={locale === "de" ? "z.B. Ich habe Angst vor Menschenmengen..." : "e.g. I'm afraid of crowds..."}
                  disabled={isPending}
                  className="min-h-[60px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
                />
              </div>
            )}
          </div>

          {/* Action Footer */}
          {freetextValue.length > 0 && analysisState === "idle" && (
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-[10px] text-muted-foreground">
                {freetextValue.length}/500
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnalyze();
                }}
                disabled={freetextValue.trim().length < 10 || isPending}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  freetextValue.trim().length >= 10 && !isPending
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <MessageSquareText className="h-3 w-3" />
                    {locale === "de" ? "Analysieren" : "Analyze"}
                    <ArrowRight className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-3 rounded-lg bg-muted/50 p-2 text-center">
        <p className="text-xs text-muted-foreground">
          {t("matching.wizard.subtopicBenefit")}
        </p>
      </div>
    </div>
  );
}
