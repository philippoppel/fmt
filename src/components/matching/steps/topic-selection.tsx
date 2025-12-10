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
    <div className="flex h-full flex-col">
      {/* Header - compact */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">
            {t("matching.wizard.step1Title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {state.selectedTopics.length === 0
              ? t("matching.wizard.selectAtLeastOne")
              : t("matching.wizard.selectedCount", { count: state.selectedTopics.length })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.switchToFreetext}
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <MessageSquareText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("matching.wizard.preferToDescribe")}</span>
        </Button>
      </div>

      {/* Topic Grid - compact 4x3 or 6x2 */}
      <div className="grid flex-1 auto-rows-fr grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
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
    </div>
  );
}
