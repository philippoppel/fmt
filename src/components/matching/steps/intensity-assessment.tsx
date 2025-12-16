"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Activity, CheckCircle2, MessageSquare, Bot, Loader2, ChevronDown, Check, Sparkles, RefreshCw, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching, type TopicIntensity, type IntensityLevel } from "../matching-context";
import {
  getIntensityStatementsForTopics,
  calculateIntensityScore,
  findStatement,
  type IntensityStatement,
} from "@/lib/matching/intensity";
import { getTopicById } from "@/lib/matching/topics";
import { Textarea } from "@/components/ui/textarea";
import { findClosestIntensity } from "@/lib/actions/analyze-situation";

export function IntensityAssessment() {
  const t = useTranslations();
  const { state, actions } = useMatching();
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // Per-topic freetext state
  const [topicFreetexts, setTopicFreetexts] = useState<Record<string, string>>({});
  const [analyzingTopicId, setAnalyzingTopicId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Get topics in priority order
  const orderedTopics = state.topicPriorityOrder.length > 0
    ? state.topicPriorityOrder
    : state.selectedTopics;

  // Get statements for selected topics
  const statements = getIntensityStatementsForTopics(state.selectedTopics);

  // Group statements by topic for better UX
  const statementsByTopic = orderedTopics
    .filter(topicId => topicId !== "other") // Exclude "other" topic
    .map((topicId) => {
      const topic = getTopicById(topicId);
      const topicStatements = statements.filter((s) => s.topicId === topicId);
      if (topic) {
        return {
          topicId,
          topicLabel: t(topic.labelKey),
          statements: topicStatements,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Auto-expand first topic on mount
  useEffect(() => {
    if (!expandedTopicId && statementsByTopic.length > 0) {
      setExpandedTopicId(statementsByTopic[0].topicId);
    }
  }, [statementsByTopic.length]);

  // Calculate statement-based intensity for a topic
  const calculateTopicIntensityFromStatements = (topicId: string): { score: number; level: IntensityLevel } | null => {
    const topicStatements = statements.filter(s => s.topicId === topicId);
    if (topicStatements.length === 0) return null;

    const selectedForTopic = state.selectedIntensityStatements.filter(id => {
      const stmt = findStatement(id);
      return stmt?.topicId === topicId;
    });

    if (selectedForTopic.length === 0) return null;

    const maxWeight = topicStatements.reduce((sum, s) => sum + s.weight, 0);
    let selectedWeight = 0;
    for (const stmtId of selectedForTopic) {
      const stmt = findStatement(stmtId);
      if (stmt) selectedWeight += stmt.weight;
    }

    const score = Math.round((selectedWeight / maxWeight) * 100);
    let level: IntensityLevel;
    if (score < 30) level = "low";
    else if (score < 70) level = "medium";
    else level = "high";

    return { score, level };
  };

  // Handle statement toggle - update per-topic intensity
  const handleToggleStatement = (statementId: string, topicId: string) => {
    actions.toggleIntensityStatement(statementId);

    // Check if this topic has AI-determined intensity - if so, clear it
    if (state.topicIntensities[topicId]?.source === "ai") {
      actions.clearTopicIntensity(topicId);
    }

    // Calculate and set statement-based intensity for this topic
    // (needs to be done in next tick after state update)
    setTimeout(() => {
      const newIntensity = calculateTopicIntensityFromStatements(topicId);
      if (newIntensity) {
        actions.setTopicIntensity(topicId, {
          ...newIntensity,
          source: "statements",
        });
      }
    }, 0);
  };

  // Handle AI analysis for a specific topic
  const handleAnalyzeTopicIntensity = (topicId: string) => {
    const text = topicFreetexts[topicId];
    if (!text?.trim() || text.trim().length < 10) return;

    setAnalyzingTopicId(topicId);
    startTransition(async () => {
      try {
        const result = await findClosestIntensity(text);
        const scoreMap: Record<IntensityLevel, number> = { low: 25, medium: 55, high: 85 };

        actions.setTopicIntensity(topicId, {
          level: result.level,
          score: scoreMap[result.level],
          source: "ai",
          aiDescription: result.explanation,
        });

        // Clear the freetext after successful analysis
        setTopicFreetexts(prev => ({ ...prev, [topicId]: "" }));
      } finally {
        setAnalyzingTopicId(null);
      }
    });
  };

  // Check if topic has intensity set
  const getTopicIntensity = (topicId: string): TopicIntensity | null => {
    return state.topicIntensities[topicId] || null;
  };

  // Count completed topics (have intensity set)
  const completedTopicsCount = statementsByTopic.filter(
    ({ topicId }) => getTopicIntensity(topicId) !== null
  ).length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {t("matching.intensity.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("matching.intensity.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {statementsByTopic.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          {statementsByTopic.map(({ topicId }) => (
            <div
              key={topicId}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                getTopicIntensity(topicId)
                  ? "bg-green-500"
                  : expandedTopicId === topicId
                    ? "bg-primary"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      )}

      {/* Topic sections */}
      <div className="flex-1 space-y-3 overflow-auto">
        {statementsByTopic.map(({ topicId, topicLabel, statements: topicStatements }, index) => {
          const isExpanded = expandedTopicId === topicId;
          const topicIntensity = getTopicIntensity(topicId);
          const selectedCount = topicStatements.filter(s =>
            state.selectedIntensityStatements.includes(s.id)
          ).length;
          const freetextValue = topicFreetexts[topicId] || "";
          const isAnalyzing = analyzingTopicId === topicId;

          return (
            <div
              key={topicId}
              className={cn(
                "rounded-xl border-2 transition-all duration-300 overflow-hidden",
                isExpanded
                  ? "border-primary bg-card shadow-lg"
                  : topicIntensity
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : "border-muted bg-muted/30"
              )}
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => setExpandedTopicId(isExpanded ? null : topicId)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 text-left transition-colors",
                  isExpanded ? "bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                {/* Priority number */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                    isExpanded
                      ? "bg-primary text-primary-foreground"
                      : topicIntensity
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {topicIntensity ? <Check className="h-4 w-4" /> : index + 1}
                </div>

                {/* Topic info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      "font-semibold truncate",
                      isExpanded
                        ? "text-primary"
                        : topicIntensity
                          ? "text-green-700 dark:text-green-400"
                          : "text-foreground"
                    )}>
                      {topicLabel}
                    </h3>
                    {topicIntensity && (
                      <div className="flex items-center gap-1">
                        <IntensityBadge level={topicIntensity.level} />
                        {topicIntensity.source === "ai" && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                            <Bot className="h-2.5 w-2.5" />
                            AI
                          </span>
                        )}
                      </div>
                    )}
                    {!topicIntensity && selectedCount > 0 && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {selectedCount} {t("matching.wizard.selected")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {topicStatements.length > 0
                      ? `${topicStatements.length} ${t("matching.intensity.statementsAvailable")}`
                      : t("matching.intensity.describeOnly")}
                  </p>
                </div>

                {/* Expand icon */}
                <div className={cn(
                  "shrink-0 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </button>

              {/* Content */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="p-4 pt-0 space-y-4">
                    <div className="border-t border-border pt-4" />

                    {/* AI Result if present */}
                    {topicIntensity?.source === "ai" && topicIntensity.aiDescription && (
                      <div className={cn(
                        "rounded-lg p-3 text-sm",
                        topicIntensity.level === "low"
                          ? "bg-success-muted border border-success-border"
                          : topicIntensity.level === "medium"
                            ? "bg-warning-muted border border-warning-border"
                            : "bg-accent-orange-muted border border-accent-orange/30"
                      )}>
                        <div className="flex items-start gap-2">
                          <Bot className={cn(
                            "h-4 w-4 mt-0.5 shrink-0",
                            topicIntensity.level === "low" ? "text-success" :
                            topicIntensity.level === "medium" ? "text-warning" : "text-accent-orange"
                          )} />
                          <div>
                            <p className="font-medium">{t("matching.intensity.aiAssessment")}</p>
                            <p className="mt-1 text-muted-foreground text-xs">
                              {topicIntensity.aiDescription}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => actions.clearTopicIntensity(topicId)}
                          className="mt-2 flex items-center gap-1 rounded-full bg-white/50 dark:bg-black/20 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-white/80"
                        >
                          <RefreshCw className="h-3 w-3" />
                          {t("matching.intensity.reassess")}
                        </button>
                      </div>
                    )}

                    {/* Statement checkboxes */}
                    {topicStatements.length > 0 && !topicIntensity?.source?.startsWith("ai") && (
                      <div className="grid gap-2 md:grid-cols-2">
                        {topicStatements.map((statement) => {
                          const isSelected = state.selectedIntensityStatements.includes(statement.id);
                          return (
                            <StatementCheckbox
                              key={statement.id}
                              label={t(statement.labelKey)}
                              isSelected={isSelected}
                              onClick={() => handleToggleStatement(statement.id, topicId)}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Freetext option */}
                    {!topicIntensity?.source?.startsWith("ai") && (
                      <div className="border-t border-dashed border-border pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {t("matching.intensity.describeInstead")}
                          </span>
                        </div>
                        <Textarea
                          value={freetextValue}
                          onChange={(e) => setTopicFreetexts(prev => ({
                            ...prev,
                            [topicId]: e.target.value
                          }))}
                          placeholder={t("matching.intensity.describePlaceholder")}
                          className="min-h-[80px] resize-none text-sm"
                          disabled={isAnalyzing}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                            <Info className="h-3 w-3" />
                            <span>{t("matching.freetext.privacyHint")}</span>
                          </div>
                          <button
                            onClick={() => handleAnalyzeTopicIntensity(topicId)}
                            disabled={!freetextValue.trim() || freetextValue.trim().length < 10 || isAnalyzing}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                              freetextValue.trim().length >= 10 && !isAnalyzing
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isAnalyzing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                            {t("matching.intensity.analyzeButton")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall intensity indicator */}
      {state.intensityLevel && (
        <div className="mt-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {t("matching.intensity.overallLevel")}
            </span>
            <IntensityBadge level={state.intensityLevel} />
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all duration-300",
                state.intensityLevel === "low" && "bg-green-500",
                state.intensityLevel === "medium" && "bg-yellow-500",
                state.intensityLevel === "high" && "bg-orange-500"
              )}
              style={{ width: `${state.intensityScore}%` }}
            />
          </div>
          {statementsByTopic.length > 1 && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              {t("matching.intensity.weightedExplanation")}
            </p>
          )}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {t("matching.intensity.optional")}
      </p>
    </div>
  );
}

interface StatementCheckboxProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function StatementCheckbox({ label, isSelected, onClick }: StatementCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-input bg-background hover:bg-accent"
      )}
      aria-pressed={isSelected}
    >
      <div
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input"
        )}
      >
        {isSelected && <CheckCircle2 className="h-4 w-4" />}
      </div>
      <span className={cn("text-sm", isSelected && "text-primary font-medium")}>
        {label}
      </span>
    </button>
  );
}

function IntensityBadge({ level }: { level: "low" | "medium" | "high" }) {
  const t = useTranslations();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        level === "low" && "bg-success-muted text-success-foreground",
        level === "medium" && "bg-warning-muted text-warning-foreground",
        level === "high" && "bg-accent-orange-muted text-accent-orange-foreground"
      )}
    >
      {t(`matching.intensity.level.${level}`)}
    </span>
  );
}
