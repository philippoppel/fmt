"use client";

import { useTranslations } from "next-intl";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { TopicCard } from "./topic-card";

export function TopicSelection() {
  const t = useTranslations();
  const { state, actions } = useMatching();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.wizard.step1Title")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("matching.wizard.step1Subtitle")}
        </p>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
        {MATCHING_TOPICS.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            label={t(topic.labelKey)}
            isSelected={state.selectedTopics.includes(topic.id)}
            onToggle={() => actions.toggleTopic(topic.id)}
          />
        ))}
      </div>

      {/* Selection hint */}
      {state.selectedTopics.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {t("matching.wizard.selectAtLeastOne")}
        </p>
      )}

      {/* Selected count */}
      {state.selectedTopics.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {t("matching.wizard.selectedCount", {
            count: state.selectedTopics.length,
          })}
        </p>
      )}
    </div>
  );
}
