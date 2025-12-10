"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Check, Sparkles, MessageSquare, Loader2, Bot, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTopicImageUrl, type SubTopic } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { findClosestSubTopics, type ClosestMatchResult } from "@/lib/actions/analyze-situation";

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
          <Bot className="h-2.5 w-2.5" />
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
  const { state, actions, computed } = useMatching();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMatch, setAiMatch] = useState<ClosestMatchResult | null>(null);

  // Group subtopics by their parent topic
  const groupedSubTopics = computed.selectedTopicDetails.map((topic) => ({
    topic,
    subTopics: topic.subTopics,
  }));

  const allSubTopics = groupedSubTopics.flatMap(g => g.subTopics);

  const totalSubTopics = groupedSubTopics.reduce(
    (acc, g) => acc + g.subTopics.length,
    0
  );

  const handleAnalyze = async () => {
    if (!customText.trim()) return;

    setIsAnalyzing(true);
    try {
      const availableSubTopics = allSubTopics.map(st => ({
        id: st.id,
        label: t(st.labelKey),
      }));

      const result = await findClosestSubTopics(customText, availableSubTopics);
      setAiMatch(result);

      // Auto-select the matched subtopics
      for (const id of result.matchedIds) {
        if (!state.selectedSubTopics.includes(id)) {
          actions.toggleSubTopic(id);
        }
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

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
                  isAiSuggested={aiMatch?.matchedIds.includes(subTopic.id) && !state.selectedSubTopics.includes(subTopic.id)}
                  onToggle={() => actions.toggleSubTopic(subTopic.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Custom Input Section */}
        <div className="mt-4 rounded-lg border border-dashed border-muted-foreground/30 p-3">
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              {t("matching.wizard.customSubtopicPrompt")}
            </button>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={t("matching.wizard.customSubtopicPlaceholder")}
                className="min-h-[80px] resize-none text-sm"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={!customText.trim() || isAnalyzing}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                  {t("matching.wizard.findClosestMatch")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomText("");
                    setAiMatch(null);
                  }}
                >
                  {t("matching.wizard.cancel")}
                </Button>
              </div>

              {/* AI Match Result */}
              {aiMatch && (
                <div className={cn(
                  "rounded-lg p-3 text-sm",
                  aiMatch.confidence === "high"
                    ? "bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-800"
                    : aiMatch.confidence === "medium"
                      ? "bg-cyan-50 border border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800"
                      : "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                )}>
                  <div className="flex items-start gap-2">
                    <Bot className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      aiMatch.confidence === "high" ? "text-green-600" :
                      aiMatch.confidence === "medium" ? "text-cyan-600" : "text-amber-600"
                    )} />
                    <div>
                      <p className="font-medium">
                        {aiMatch.confidence === "low"
                          ? t("matching.wizard.aiMatchLow")
                          : t("matching.wizard.aiMatchFound")}
                      </p>
                      {aiMatch.explanation && (
                        <p className="mt-1 text-muted-foreground text-xs">
                          {aiMatch.explanation}
                        </p>
                      )}
                      {aiMatch.confidence === "low" && (
                        <p className="mt-1 text-xs flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          {t("matching.wizard.aiMatchLowHint")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
