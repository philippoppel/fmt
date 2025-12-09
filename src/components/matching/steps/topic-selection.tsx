"use client";

import { useTranslations } from "next-intl";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
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

      {/* Footer with count and alternative */}
      <div className="mt-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="text-center text-sm text-muted-foreground sm:text-left">
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

        {/* Alternative: Describe instead */}
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.switchToFreetext}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <MessageSquareText className="h-4 w-4" />
          {t("matching.wizard.preferToDescribe")}
        </Button>
      </div>
    </div>
  );
}
