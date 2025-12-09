"use client";

import { useTranslations } from "next-intl";
import { MATCHING_TOPICS } from "@/lib/matching/topics";
import { useMatching } from "../matching-context";
import { TopicCard } from "./topic-card";

export function TopicSelection() {
  const t = useTranslations();
  const { state, actions } = useMatching();

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("matching.wizard.step1Title")}
        </h2>
        <p className="mt-2 text-muted-foreground text-balance">
          {t("matching.wizard.step1Subtitle")}
        </p>
      </div>

      {/* Topic Grid - 4x3 for 12 topics */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-3">
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

      <div className="mt-auto text-center text-sm text-muted-foreground">
        {state.selectedTopics.length === 0 ? (
          <p>{t("matching.wizard.selectAtLeastOne")}</p>
        ) : (
          <p>
            {t("matching.wizard.selectedCount", {
              count: state.selectedTopics.length,
            })}
          </p>
        )}
      </div>
    </div>
  );
}
