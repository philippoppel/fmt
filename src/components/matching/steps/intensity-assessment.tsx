"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Activity, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMatching } from "../matching-context";
import {
  getIntensityStatementsForTopics,
  calculateIntensityScore,
  type IntensityStatement,
} from "@/lib/matching/intensity";
import { getTopicById } from "@/lib/matching/topics";

export function IntensityAssessment() {
  const t = useTranslations();
  const { state, actions } = useMatching();
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  // Get statements for selected topics
  const statements = getIntensityStatementsForTopics(state.selectedTopics);

  // Group statements by topic for better UX
  const statementsByTopic = state.selectedTopics.reduce(
    (acc, topicId) => {
      const topic = getTopicById(topicId);
      const topicStatements = statements.filter((s) => s.topicId === topicId);
      if (topic && topicStatements.length > 0) {
        acc.push({
          topicId,
          topicLabel: t(topic.labelKey),
          statements: topicStatements,
        });
      }
      return acc;
    },
    [] as { topicId: string; topicLabel: string; statements: IntensityStatement[] }[]
  );

  // Calculate and update intensity score when selections change
  useEffect(() => {
    const { score, level } = calculateIntensityScore(
      state.selectedIntensityStatements,
      state.selectedTopics
    );
    actions.setIntensity(score, level);
  }, [state.selectedIntensityStatements, state.selectedTopics, actions]);

  useEffect(() => {
    if (!openTopic && statementsByTopic.length > 0) {
      setOpenTopic(statementsByTopic[0].topicId);
    }
    if (openTopic && !statementsByTopic.find((t) => t.topicId === openTopic)) {
      setOpenTopic(statementsByTopic[0]?.topicId ?? null);
    }
  }, [statementsByTopic, openTopic]);

  const handleToggleStatement = (statementId: string) => {
    actions.toggleIntensityStatement(statementId);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.intensity.title")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-balance text-muted-foreground sm:mx-0">
          {t("matching.intensity.subtitle")}
        </p>
      </div>

      {/* Statement groups by topic */}
      <div className="mx-auto flex-1 max-w-4xl space-y-3">
        {statementsByTopic.map(({ topicId, topicLabel, statements }) => {
          const isOpen = openTopic === topicId;
          const selectedCount = statements.filter((s) =>
            state.selectedIntensityStatements.includes(s.id)
          ).length;

          return (
            <div key={topicId} className="rounded-xl border bg-card/70">
              <button
                type="button"
                onClick={() => setOpenTopic(isOpen ? null : topicId)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                      isOpen ? "border-primary text-primary" : "border-muted-foreground/40 text-muted-foreground"
                    )}
                  >
                    {selectedCount > 0 ? selectedCount : "•"}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{topicLabel}</div>
                    <p className="text-xs text-muted-foreground">
                      {t("matching.intensity.optional")}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="grid gap-2 border-t px-4 py-3 md:grid-cols-2">
                  {statements.map((statement) => {
                    const isSelected = state.selectedIntensityStatements.includes(
                      statement.id
                    );
                    return (
                      <StatementCheckbox
                        key={statement.id}
                        label={t(statement.labelKey)}
                        isSelected={isSelected}
                        onClick={() => handleToggleStatement(statement.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Current intensity indicator */}
        {state.intensityLevel && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("matching.intensity.currentLevel")}
              </span>
              <IntensityBadge level={state.intensityLevel} />
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
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
          </div>
        )}

        {/* Optional hint */}
      </div>

      <p className="mt-auto text-center text-sm text-muted-foreground">
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
        level === "low" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        level === "medium" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        level === "high" && "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      )}
    >
      {t(`matching.intensity.level.${level}`)}
    </span>
  );
}
