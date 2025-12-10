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
      {/* Header - single line, very compact */}
      <div className="mb-2 flex items-center justify-between">
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
        <Button
          variant="outline"
          size="sm"
          onClick={actions.switchToFreetext}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          <MessageSquareText className="h-3.5 w-3.5" />
          <span className="sm:hidden">{t("matching.wizard.describe")}</span>
          <span className="hidden sm:inline">{t("matching.wizard.preferToDescribe")}</span>
        </Button>
      </div>

      {/* Topic Grid - 6 columns, 2 rows */}
      <div className="grid flex-1 auto-rows-fr grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
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
