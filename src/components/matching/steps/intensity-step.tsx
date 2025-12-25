"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Heart, MessageCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMatching, type IntensityLevel } from "../matching-context";
import { getTopicById } from "@/lib/matching/topics";
import {
  getIntensityStatements,
  getIntensityIntro,
  intensityToScore,
  type IntensityStatement,
} from "@/lib/matching/intensity-statements";
import { analyzeSituation, type SituationAnalysis } from "@/lib/actions/analyze-situation";

interface TopicIntensityCardProps {
  topicId: string;
  topicLabel: string;
  statements: IntensityStatement[];
  intro: string;
  selectedLevel: IntensityLevel | null;
  freetextValue: string;
  isFreetextMode: boolean;
  isAnalyzing: boolean;
  onSelectStatement: (level: IntensityLevel) => void;
  onFreetextChange: (value: string) => void;
  onToggleFreetext: () => void;
  onAnalyzeFreetext: () => void;
  locale: "de" | "en";
}

function TopicIntensityCard({
  topicId,
  topicLabel,
  statements,
  intro,
  selectedLevel,
  freetextValue,
  isFreetextMode,
  isAnalyzing,
  onSelectStatement,
  onFreetextChange,
  onToggleFreetext,
  onAnalyzeFreetext,
  locale,
}: TopicIntensityCardProps) {
  const t = useTranslations("matching.intensity");
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Topic Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{topicLabel}</h3>
            {selectedLevel && !isExpanded && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("answered")}
              </p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Empathic Intro */}
          <p className="text-sm text-muted-foreground italic">{intro}</p>

          {/* Statement Options - Radio Style */}
          <div className="space-y-2">
            {statements.map((statement) => {
              const isSelected = selectedLevel === statement.level && !isFreetextMode;
              return (
                <button
                  key={statement.id}
                  onClick={() => onSelectStatement(statement.level)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border-2 transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-muted bg-muted/30"
                  )}
                >
                  <p className="text-sm text-foreground leading-relaxed">
                    {statement.text[locale]}
                  </p>
                </button>
              );
            })}

            {/* Freetext Option */}
            <button
              onClick={onToggleFreetext}
              className={cn(
                "w-full text-left p-3 rounded-lg border-2 transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                isFreetextMode
                  ? "border-primary bg-primary/10"
                  : "border-muted bg-muted/30"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("describeOwn")}
                </span>
              </div>
            </button>
          </div>

          {/* Freetext Textarea (shown when freetext mode active) */}
          {isFreetextMode && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Textarea
                value={freetextValue}
                onChange={(e) => onFreetextChange(e.target.value)}
                placeholder={t("freetextPlaceholder")}
                className="min-h-[80px] text-sm resize-none"
              />
              {freetextValue.length >= 20 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAnalyzeFreetext}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("analyzing")}
                    </>
                  ) : (
                    t("analyze")
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function IntensityStep() {
  const t = useTranslations("matching.intensity");
  const tAll = useTranslations(); // For full labelKey paths like "matching.topics.sleep"
  const locale = useLocale() as "de" | "en";
  const { state, actions } = useMatching();

  // Local state for freetext mode per topic
  const [freetextModes, setFreetextModes] = useState<Record<string, boolean>>({});
  const [freetextValues, setFreetextValues] = useState<Record<string, string>>({});
  const [analyzingTopics, setAnalyzingTopics] = useState<Record<string, boolean>>({});

  // Get non-flag topics (exclude crisis topics)
  const topicsToShow = state.selectedTopics.filter((topicId) => {
    const topic = getTopicById(topicId);
    return topic && !topic.isFlag;
  });

  const handleSelectStatement = useCallback(
    (topicId: string, level: IntensityLevel) => {
      // Clear freetext mode for this topic
      setFreetextModes((prev) => ({ ...prev, [topicId]: false }));

      // Set the intensity
      actions.setTopicIntensity(topicId, {
        level,
        score: intensityToScore(level),
        source: "statements",
      });
    },
    [actions]
  );

  const handleToggleFreetext = useCallback((topicId: string) => {
    setFreetextModes((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  }, []);

  const handleFreetextChange = useCallback((topicId: string, value: string) => {
    setFreetextValues((prev) => ({ ...prev, [topicId]: value }));
  }, []);

  const handleAnalyzeFreetext = useCallback(
    async (topicId: string) => {
      const text = freetextValues[topicId];
      if (!text || text.length < 20) return;

      setAnalyzingTopics((prev) => ({ ...prev, [topicId]: true }));

      try {
        const result: SituationAnalysis = await analyzeSituation(text);

        const level = result.suggestedIntensityLevel || "medium";
        actions.setTopicIntensity(topicId, {
          level,
          score: intensityToScore(level),
          source: "ai",
          aiDescription: text,
        });
      } catch (error) {
        console.error("Error analyzing freetext:", error);
        // Fallback to medium intensity
        actions.setTopicIntensity(topicId, {
          level: "medium",
          score: 60,
          source: "ai",
          aiDescription: text,
        });
      } finally {
        setAnalyzingTopics((prev) => ({ ...prev, [topicId]: false }));
      }
    },
    [freetextValues, actions]
  );

  // Count how many topics have been answered
  const answeredCount = Object.keys(state.topicIntensities).length;
  const totalTopics = topicsToShow.length;

  return (
    <div className="space-y-6">
      {/* Caring Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-900/30 mx-auto">
          <Heart className="h-7 w-7 text-rose-500" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Progress indicator */}
      {totalTopics > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>
            {answeredCount} / {totalTopics} {t("topicsAnswered")}
          </span>
        </div>
      )}

      {/* Topic Cards */}
      <div className="space-y-4">
        {topicsToShow.map((topicId) => {
          const topic = getTopicById(topicId);
          if (!topic) return null;

          const statements = getIntensityStatements(topicId);
          const intro = getIntensityIntro(topicId, locale);
          const topicIntensity = state.topicIntensities[topicId];

          return (
            <TopicIntensityCard
              key={topicId}
              topicId={topicId}
              topicLabel={tAll(topic.labelKey)}
              statements={statements}
              intro={intro}
              selectedLevel={topicIntensity?.level || null}
              freetextValue={freetextValues[topicId] || ""}
              isFreetextMode={freetextModes[topicId] || false}
              isAnalyzing={analyzingTopics[topicId] || false}
              onSelectStatement={(level) => handleSelectStatement(topicId, level)}
              onFreetextChange={(value) => handleFreetextChange(topicId, value)}
              onToggleFreetext={() => handleToggleFreetext(topicId)}
              onAnalyzeFreetext={() => handleAnalyzeFreetext(topicId)}
              locale={locale}
            />
          );
        })}
      </div>

      {/* Optional Note */}
      <p className="text-center text-xs text-muted-foreground">
        {t("optional")}
      </p>
    </div>
  );
}
